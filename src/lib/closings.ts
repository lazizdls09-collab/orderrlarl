import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Employee } from "@/lib/employees";

export type SalaryPayment = Tables<"salary_payments">;
export type DayClosing = Tables<"day_closings">;
export type MonthClosing = Tables<"month_closings">;

const DAY_MS = 86400000;

export const salaryPaymentsQuery = queryOptions({
  queryKey: ["salary_payments"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("salary_payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const dayClosingsQuery = queryOptions({
  queryKey: ["day_closings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("day_closings")
      .select("*")
      .order("day", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const monthClosingsQuery = queryOptions({
  queryKey: ["month_closings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("month_closings")
      .select("*")
      .order("month", { ascending: false });
    if (error) throw error;
    return data;
  },
});

/** Mahalliy sana kaliti: YYYY-MM-DD */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Oy kaliti: YYYY-MM */
export function monthKeyOf(d: Date) {
  return dayKey(d).slice(0, 7);
}

function startOf(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dailyShare(e: Employee) {
  return e.salary_period === "daily" ? Number(e.salary_amount) : Number(e.salary_amount) / 30;
}

/** from dan to gacha (ikkalasi ham kiradi) kunlar soni */
function daysBetween(from: Date, to: Date) {
  return Math.max(0, Math.round((startOf(to).getTime() - startOf(from).getTime()) / DAY_MS) + 1);
}

/** Ishga kirgan kundan `to` gacha hisoblangan jami maosh */
export function accruedSince(e: Employee, to: Date) {
  return dailyShare(e) * daysBetween(new Date(e.created_at), to);
}

/** Oy ichida (oy boshi yoki ishga kirgan kundan) `to` gacha hisoblangan maosh */
export function accruedInMonth(e: Employee, monthStart: Date, to: Date) {
  const hired = startOf(new Date(e.created_at));
  const from = hired > monthStart ? hired : monthStart;
  return dailyShare(e) * daysBetween(from, to);
}

/** To'lanmagan qoldiq: ishga kirgandan beri hisoblangan - to'langan. Kechikkan kunlar shu yerda yig'iladi. */
export function outstandingOf(e: Employee, payments: SalaryPayment[], to: Date) {
  const paid = payments
    .filter((p) => p.employee_id === e.id)
    .reduce((s, p) => s + Number(p.amount), 0);
  return Math.max(0, Math.round(accruedSince(e, to) - paid));
}

/** Berilgan oyda to'langan summa */
export function paidInMonth(employeeId: string, payments: SalaryPayment[], monthKey: string) {
  return payments
    .filter((p) => p.employee_id === employeeId && p.paid_on.startsWith(monthKey))
    .reduce((s, p) => s + Number(p.amount), 0);
}

export interface DayRow {
  day: string;
  orders_count: number;
  revenue: number;
  cost: number;
  expenses: number;
  salary: number;
  profit: number;
}

export interface EmployeeRow {
  name: string;
  period: string;
  amount: number;
  accrued: number;
  paid: number;
  outstanding: number;
}

export interface MonthDetails {
  days: DayRow[];
  employees: EmployeeRow[];
}

export function monthDetails(m: MonthClosing): MonthDetails {
  const d = m.details as unknown as Partial<MonthDetails> | null;
  return { days: d?.days ?? [], employees: d?.employees ?? [] };
}

function esc(v: string | number) {
  const s = String(v);
  return /[",;\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Oy hisobotini CSV matnga aylantiradi (Excel uchun UTF-8 BOM bilan) */
export function buildMonthCsv(m: MonthClosing) {
  const { days, employees } = monthDetails(m);
  const rows: (string | number)[][] = [
    ["Oy", m.month],
    [],
    ["Tushum", Number(m.revenue)],
    ["Tannarx", Number(m.cost)],
    ["Xarajat", Number(m.expenses)],
    ["Maosh", Number(m.salary)],
    ["Sof foyda", Number(m.profit)],
    [],
    ["Sana", "Buyurtmalar", "Tushum", "Tannarx", "Xarajat", "Maosh", "Foyda"],
    ...days.map((x) => [x.day, x.orders_count, x.revenue, x.cost, x.expenses, x.salary, x.profit]),
    [],
    ["Xodim", "Maosh turi", "Maosh", "Oy davomida hisoblangan", "Oy davomida to'langan", "Qoldiq"],
    ...employees.map((e) => [
      e.name,
      e.period === "daily" ? "kunlik" : "oylik",
      e.amount,
      e.accrued,
      e.paid,
      e.outstanding,
    ]),
  ];
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
