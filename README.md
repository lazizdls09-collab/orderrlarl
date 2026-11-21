# Orderly Orders

Restoran / fastfood uchun buyurtma, ombor, xodimlar va hisobot tizimi.
Stek: TanStack Start (React 19), Vite, Tailwind CSS, Supabase, Groq (AI tahlil).

## Ishga tushirish

```sh
cp .env.example .env     # qiymatlarni to'ldiring
npm install
npm run dev
```

## Muhit o'zgaruvchilari (.env)

| Nom | Vazifasi |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Brauzer uchun Supabase ulanishi |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Server uchun Supabase ulanishi |
| `ROOT_ADMIN_USERNAME` | Super admin login (standart: `lazizbek`) |
| `ROOT_ADMIN_PASSWORD` | Super admin paroli (kodda saqlanmaydi) |

Muhim: `.env` fayli `.gitignore` ro'yxatida. Kalitlarni hech qachon GitHub'ga yuklamang.
Deploy qilganda (Vercel, Netlify, VPS va h.k.) shu o'zgaruvchilarni hosting panelida kiriting.

## Skriptlar

- `npm run dev` — lokal ishga tushirish
- `npm run build` — production build
- `npm run lint` — kodni tekshirish
- `npm run format` — Prettier bilan formatlash

## Keyingi o'zgarishlar (TODO)

- "Yetkazib berish" tugmasini olib tashlash; stolda o'tirib buyurtma berilsa "stolga yetkazish", bo'limiga kirilganda "manzilga yetkazib berish" variantini qo'shish
- Telefon versiyasida (+1-) mahsulot narxi ustini qoplab qolayotgan joyni tuzatish
- Ortiqcha qizil yozuvlarni olib tashlash
- Admin o'zi istagan parolni qo'ya olishi (xodimlar bo'limi)
- Buyurtmalar bo'limi va cheklar bo'limini ajratish; admin "yetkazildi" tugmasini bosganda holat o'zgarishi
