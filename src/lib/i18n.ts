import { useEffect, useState } from "react";
import { LANG_EVENT, readLang, type LangCode } from "@/lib/prefs";

const dict = {
  uz: {
    nav_home: "Bosh sahifa",
    nav_orders: "Buyurtmalar",
    nav_receipts: "Cheklar",
    nav_settings: "Sozlamalar",
    status_delivering: "Yetkazilmoqda",
    status_delivered: "Yetkazildi",
    status_cancelled: "Bekor qilindi",
    settings_language: "Ilova tili",
    language_saved: "Til saqlandi",
  },
  ru: {
    nav_home: "Главная",
    nav_orders: "Заказы",
    nav_receipts: "Чеки",
    nav_settings: "Настройки",
    status_delivering: "Доставляется",
    status_delivered: "Доставлено",
    status_cancelled: "Отменено",
    settings_language: "Язык приложения",
    language_saved: "Язык сохранён",
  },
  en: {
    nav_home: "Home",
    nav_orders: "Orders",
    nav_receipts: "Receipts",
    nav_settings: "Settings",
    status_delivering: "On the way",
    status_delivered: "Delivered",
    status_cancelled: "Cancelled",
    settings_language: "App language",
    language_saved: "Language saved",
  },
} as const;

export type TKey = keyof (typeof dict)["uz"];

/** Tanlangan til bo'yicha matn. Til o'zgarganda komponent avtomatik yangilanadi. */
export function useT() {
  const [lang, setLang] = useState<LangCode>("uz");

  useEffect(() => {
    const sync = () => setLang(readLang());
    sync();
    window.addEventListener(LANG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LANG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const t = (key: TKey): string => dict[lang][key] ?? dict.uz[key];
  return { lang, t };
}
