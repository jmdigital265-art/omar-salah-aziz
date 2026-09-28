# عومەر ساڵح عەزیز — Omar Salah Aziz

ماڵپەری کەسی بە ئینتەرفیسی کوردی سۆرانی (RTL) — پانێڵی بەڕێوەبەری تەواو سەلامەت، دۆخی تاریک، ئەنیمەیشنی 3D و شاشەی بارکردن.

Personal website for **Omar Salah Aziz** — Kurdish Sorani UI (RTL), fully
editable through a hidden secure admin panel, dark mode, 3D animated
transitions, and a loading screen. Developed by **J&M Digital**.

## Features

- **Kurdish Sorani, RTL** — Noto Kufi (headings) + Noto Naskh (body)
- **Everything editable** — name, titles, description, contact info,
  profile picture and social links, all from the admin panel
- **Hidden admin door** — click **“J&M Digital”** in the footer **5×**
  to open the login modal (the panel itself is password-protected)
- **Dark / light mode** — persisted per visitor, no flash on load
- **3D animations** — tilt cards with spring physics, rotating conic
  portrait ring, perspective grid floor, depth-parallax particles,
  3D section entrances, animated preloader cube
- **Secure by design**
  - scrypt password hashing (timing-safe verification)
  - DB-backed sessions — only HMAC-SHA256 token hashes stored
  - brute-force lockout (5 tries / 15 min / IP)
  - CSRF protection (JSON-only writes + custom token header + origin checks)
  - strict security headers incl. CSP, HSTS, X-Frame-Options
  - zod validation on every input; uploads auto-compressed client-side
    and size-capped server-side

## Tech

Next.js 14 (App Router) · Tailwind CSS · framer-motion · Prisma +
PostgreSQL (Neon/Supabase) · deployed on Netlify.

## Admin access

Click **Developed by J&M Digital** in the footer **5 times** (quickly),
then enter the admin password.

- First-boot password comes from `INITIAL_ADMIN_PASSWORD` in `.env`
  (hashed into the DB on first login attempt — never stored in source).
- Change it anytime from **ڕێکخستن** inside the panel (rotating it
  revokes every other session).

## Environment

Copy `.env.example` to `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | random 32-byte secret (`openssl rand -base64 32`) |
| `INITIAL_ADMIN_PASSWORD` | first-boot admin password (≥ 8 chars) |
| `ADMIN_SESSION_TTL_HOURS` | session lifetime (default 12) |
| `SITE_URL` | canonical URL for SEO |

## Run locally

```bash
npm install
npx prisma db push   # creates omar_* tables
npm run dev          # http://localhost:3100
```

## Deploy (Netlify)

The repo ships with `netlify.toml` (`@netlify/plugin-nextjs`). Set the
env vars above in Netlify → Site settings → Environment variables, then
deploy from the GitHub repo.

---

Developed by **J&M Digital** — بە پەرۆشەوە دروستکراوە 🤍
