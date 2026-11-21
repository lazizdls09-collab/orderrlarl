import { useMemo, useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatSum } from "@/lib/format";

type Unit = "kg" | "l" | "dona";
type Row = { id: number; name: string; price: string; amount: string; unit: Unit };

let nextId = 1;
const newRow = (): Row => ({ id: nextId++, name: "", price: "", amount: "", unit: "kg" });

/** 1 porsiya uchun shu xomashyoning narxi. kg/l: narx 1 kg/1 l uchun, miqdor gramm/ml. dona: narx 1 dona uchun. */
function rowCost(r: Row) {
  const price = Number(r.price) || 0;
  const amount = Number(r.amount) || 0;
  return r.unit === "dona" ? price * amount : (price * amount) / 1000;
}

const AMOUNT_HINT: Record<Unit, string> = { kg: "gramm", l: "ml", dona: "dona" };

export function CostCalculator() {
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);
  const [extra, setExtra] = useState("");
  const [sale, setSale] = useState("");
  const [margin, setMargin] = useState("40");

  const ingredients = useMemo(() => rows.reduce((s, r) => s + rowCost(r), 0), [rows]);
  const cost = ingredients + (Number(extra) || 0);
  const price = Number(sale) || 0;
  const profit = price - cost;
  const profitPct = price > 0 ? (profit / price) * 100 : 0;
  const target = Number(margin) || 0;
  const suggested = target > 0 && target < 100 ? Math.ceil(cost / (1 - target / 100)) : 0;

  function update(id: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <header className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-base font-extrabold">Tannarx kalkulyatori</h2>
          <p className="text-xs text-muted-foreground">
            1 porsiya (masalan, 1 ta somsa) uchun xomashyo miqdorini kiriting.
          </p>
        </div>
      </header>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-2">
            <Input
              className="col-span-4"
              placeholder="Mahsulot"
              value={r.name}
              onChange={(e) => update(r.id, { name: e.target.value })}
            />
            <Input
              className="col-span-3"
              inputMode="decimal"
              placeholder="Narxi (so'm)"
              value={r.price}
              onChange={(e) => update(r.id, { price: e.target.value })}
            />
            <select
              className="col-span-2 rounded-md border border-input bg-background px-2 text-sm"
              value={r.unit}
              onChange={(e) => update(r.id, { unit: e.target.value as Unit })}
              aria-label="Birlik"
            >
              <option value="kg">1 kg</option>
              <option value="l">1 litr</option>
              <option value="dona">1 dona</option>
            </select>
            <Input
              className="col-span-2"
              inputMode="decimal"
              placeholder={`1 porsiyaga (${AMOUNT_HINT[r.unit]})`}
              value={r.amount}
              onChange={(e) => update(r.id, { amount: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((x) => x.id !== r.id) : prev))}
              className="col-span-1 grid place-items-center rounded-md text-muted-foreground hover:text-destructive"
              aria-label="O'chirish"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, newRow()])}
        className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Plus className="h-4 w-4" /> Xomashyo qo'shish
      </button>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Qo'shimcha xarajat (so'm, 1 porsiya)">
          <Input inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
        <Field label="Sotuv narxi (so'm)">
          <Input inputMode="decimal" value={sale} onChange={(e) => setSale(e.target.value)} />
        </Field>
        <Field label="Kerakli foyda (%)">
          <Input inputMode="decimal" value={margin} onChange={(e) => setMargin(e.target.value)} />
        </Field>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="1 porsiya tannarxi" value={formatSum(cost)} />
        <Stat
          label="Foyda"
          value={price > 0 ? `${formatSum(profit)} (${profitPct.toFixed(1)}%)` : "—"}
          tone={price > 0 ? (profit >= 0 ? "good" : "bad") : undefined}
        />
        <Stat label={`Tavsiya narx (${target}% foyda)`} value={suggested > 0 ? formatSum(suggested) : "—"} />
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | undefined }) {
  const color = tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
