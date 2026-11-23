import { useState } from "react";
import { ChevronDown, Download, FileBarChart } from "lucide-react";
import { formatSum } from "@/lib/format";
import { buildMonthCsv, downloadCsv, monthDetails, type MonthClosing } from "@/lib/closings";

export function ReportsSection({ closings }: { closings: MonthClosing[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="mt-6 rounded-3xl glass p-5">
      <header className="mb-4 flex items-center gap-2">
        <FileBarChart className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-base font-extrabold">Oylik hisobotlar</h2>
          <p className="text-xs text-muted-foreground">
            Yopilgan oylar. Ko'rish yoki CSV formatda yuklab olish mumkin.
          </p>
        </div>
      </header>

      {closings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Hali birorta oy yopilmagan.</p>
      ) : (
        <div className="space-y-2">
          {closings.map((m) => {
            const isOpen = open === m.month;
            const d = monthDetails(m);
            return (
              <div key={m.month} className="rounded-2xl bg-secondary p-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : m.month)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                  >
                    <span className="font-extrabold text-foreground">{m.month}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      Foyda: <b className="text-primary">{formatSum(Number(m.profit))}</b>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="CSV yuklab olish"
                    onClick={() => downloadCsv(`lazzat-${m.month}.csv`, buildMonthCsv(m))}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background press"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                {isOpen ? (
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <Mini label="Tushum" value={Number(m.revenue)} />
                      <Mini label="Tannarx" value={Number(m.cost)} />
                      <Mini label="Xarajat" value={Number(m.expenses)} />
                      <Mini label="Maosh" value={Number(m.salary)} />
                      <Mini label="Sof foyda" value={Number(m.profit)} />
                    </div>

                    {d.days.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl bg-background">
                        <table className="w-full text-xs">
                          <thead className="text-muted-foreground">
                            <tr>
                              <th className="p-2 text-left">Sana</th>
                              <th className="p-2 text-right">Buyurtma</th>
                              <th className="p-2 text-right">Tushum</th>
                              <th className="p-2 text-right">Foyda</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.days.map((x) => (
                              <tr key={x.day} className="border-t border-border">
                                <td className="p-2">{x.day}</td>
                                <td className="p-2 text-right">{x.orders_count}</td>
                                <td className="p-2 text-right">{formatSum(x.revenue)}</td>
                                <td className="p-2 text-right font-bold">{formatSum(x.profit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Bu oyda yopilgan kunlar yo'q.</p>
                    )}

                    {d.employees.length > 0 ? (
                      <ul className="space-y-1 text-xs">
                        {d.employees.map((e) => (
                          <li key={e.name} className="flex flex-wrap justify-between gap-2">
                            <span className="font-semibold">{e.name}</span>
                            <span className="text-muted-foreground">
                              hisoblangan {formatSum(e.accrued)} · to'langan {formatSum(e.paid)} · qoldiq{" "}
                              {formatSum(e.outstanding)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-background p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-extrabold text-foreground">{formatSum(value)}</p>
    </div>
  );
}
