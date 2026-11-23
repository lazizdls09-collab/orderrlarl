import { CalendarCheck, CalendarRange, Lock } from "lucide-react";

export function ClosingPanel({
  todayKey,
  todayClosed,
  monthKey,
  monthClosed,
  busy,
  onCloseDay,
  onCloseMonth,
}: {
  todayKey: string;
  todayClosed: boolean;
  monthKey: string;
  monthClosed: boolean;
  busy: boolean;
  onCloseDay: () => void;
  onCloseMonth: () => void;
}) {
  return (
    <section className="mt-6 rounded-3xl glass p-5">
      <header className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-base font-extrabold">Yopish</h2>
          <p className="text-xs text-muted-foreground">
            Yopilgan kun yoki oy raqamlari saqlanadi va keyin o'zgarmaydi.
          </p>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-secondary p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarCheck className="h-4 w-4" /> Kun: {todayKey}
          </p>
          <button
            type="button"
            onClick={onCloseDay}
            disabled={busy || todayClosed}
            className="mt-3 w-full rounded-xl gradient-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground press disabled:opacity-50"
          >
            {todayClosed ? "Kun yopilgan" : "Kunni tugatish"}
          </button>
        </div>
        <div className="rounded-2xl bg-secondary p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarRange className="h-4 w-4" /> Oy: {monthKey}
          </p>
          <button
            type="button"
            onClick={onCloseMonth}
            disabled={busy || monthClosed}
            className="mt-3 w-full rounded-xl gradient-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground press disabled:opacity-50"
          >
            {monthClosed ? "Oy yopilgan" : "Oyni tugatish"}
          </button>
        </div>
      </div>
    </section>
  );
}
