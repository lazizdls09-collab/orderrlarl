import { Link } from "@tanstack/react-router";
import { Home, ClipboardList, ReceiptText, Settings } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { useDeliveryNotifications } from "@/lib/delivery-notify";

const items: { to: string; key: TKey; icon: typeof Home }[] = [
  { to: "/", key: "nav_home", icon: Home },
  { to: "/buyurtmalar", key: "nav_orders", icon: ClipboardList },
  { to: "/cheklar", key: "nav_receipts", icon: ReceiptText },
  { to: "/sozlamalar", key: "nav_settings", icon: Settings },
];

export function BottomNav() {
  const { t } = useT();
  useDeliveryNotifications((n) => ({
    title: t("notify_delivered_title"),
    body: t("notify_delivered_body").replace("{n}", String(n)),
  }));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 glass-strong border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-semibold press"
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{t(item.key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
