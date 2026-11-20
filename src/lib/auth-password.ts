/**
 * Admin xohlagan parolni qo'ya olishi uchun (masalan "parol123"),
 * auth tizimiga deterministik ravishda uzaytirilgan parol yuboriladi.
 * Foydalanuvchi baribir o'zi kiritgan parolni yozadi.
 */
export function toAuthPassword(raw: string) {
  const p = raw ?? "";
  return p.length >= 6 ? p : `${p}#Lazzat${p.length}`;
}
