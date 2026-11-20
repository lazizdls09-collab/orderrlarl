export const LANGUAGES = [
  { code: "uz", label: "O‘zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const LANG_KEY = "lazzat_lang";
export const LANG_EVENT = "lazzat-lang-changed";

export function readLang(): LangCode {
  if (typeof window === "undefined") return "uz";
  try {
    const stored = window.localStorage.getItem(LANG_KEY);
    return (LANGUAGES.find((l) => l.code === stored)?.code ?? "uz") as LangCode;
  } catch {
    return "uz";
  }
}

export function saveLang(code: LangCode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_KEY, code);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = code;
  // Barcha komponentlar (useT) darhol yangi tilga o'tishi uchun
  window.dispatchEvent(new Event(LANG_EVENT));
}
