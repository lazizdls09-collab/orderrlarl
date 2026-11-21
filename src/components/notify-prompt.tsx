import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useT } from "@/lib/i18n";
import { ensureServiceWorker, notificationsSupported } from "@/lib/delivery-notify";

const DISMISS_KEY = "lazzat_notify_dismissed_v1";

export function NotifyPrompt() {
  const { t } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!notificationsSupported()) return;
    if (Notification.permission !== "default") return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }
    setShow(true);
  }, []);

  if (!show) return null;

  async function allow() {
    setShow(false);
    try {
      await Notification.requestPermission();
    } catch {
      /* ignore */
    }
    void ensureServiceWorker();
  }

  function later() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl glass p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground">
          <Bell className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{t("notify_title")}</p>
          <p className="text-xs text-muted-foreground">{t("notify_text")}</p>
        </div>
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <button
          type="button"
          onClick={later}
          className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground press"
        >
          {t("notify_later")}
        </button>
        <button
          type="button"
          onClick={() => void allow()}
          className="rounded-xl gradient-primary px-4 py-2 text-xs font-extrabold text-primary-foreground press"
        >
          {t("notify_allow")}
        </button>
      </div>
    </div>
  );
}
