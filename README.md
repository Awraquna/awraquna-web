# Awraquna - public website

Next.js (App Router, TypeScript, Tailwind 4) re-make of awraquna.com. All content is read from the Awraquna REST API (`docs/API_CONTRACT.md`). Every page degrades to an empty state when the API is unreachable, so the site builds and runs without the API.

## Requirements

- Node 22, npm 10
- The API running on `http://localhost:5200` (optional while developing)

## Run

```bash
npm install
npm run dev                          # http://localhost:3000, API on :5200
```

Production:

```bash
npm run build
npm start
```

## Environment

| Variable              | Dev                     | Production                    | Purpose                                            |
| --------------------- | ----------------------- | ----------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5200` | `https://awraquna.runasp.net` | API base URL; relative `/uploads/..` images use it  |
| `REVALIDATE_SECONDS`  | `0` (always fresh)      | `60`                          | How long API responses are cached                  |

Both files are committed: `.env.development` (loaded by `next dev`) and
`.env.production` (loaded by `next build` / `next start`). Neither holds a secret.

Personal overrides go in `.env.local`, which stays gitignored — but note that Next
loads it in **every** environment and it outranks `.env.production`. Do not pin
`NEXT_PUBLIC_API_URL` to localhost there: a production build on that machine would
silently ship localhost to the browser. Use `.env.development` for dev defaults.

`NEXT_PUBLIC_API_URL` is inlined into the client bundle at **build** time, so it
has to be correct when `npm run build` runs, not when the server starts.

## Structure

```
src/app
  layout.tsx            html lang/dir from `locale` cookie, header, footer, WhatsApp button
  page.tsx              home         GET /api/public/home
  products/page.tsx     catalogue    GET /api/public/products?search&category&subCategory&area&page
  products/[slug]       product      GET /api/public/products/{slug}
  about-us/page.tsx     about        GET /api/public/pages/about (renders by sectionKey)
  news/page.tsx         news list    GET /api/public/news?page
  news/[slug]           article      GET /api/public/news/{slug}
  contact/page.tsx      contact form POST /api/public/contact  (prefill with ?subject=)
  jobs/page.tsx         jobs         GET /api/public/pages/jobs
  api/locale/route.ts   POST { locale } -> sets the `locale` cookie
  not-found.tsx         404
src/lib/api.ts          apiGet/apiFetch (never throw), imageUrl(), buildQuery()
src/lib/utils.ts        pick(obj, "name", locale), formatDate/Price, section helpers
src/i18n/{en,ar}.ts     UI strings
src/components          Header, Footer, Icon (inline SVG set), ProductCard, NewsCard, ...
```

## i18n

Cookie-based: `locale` = `en` (default) | `ar`. The `LanguageToggle` posts to `/api/locale` and refreshes. Arabic renders RTL (`<html dir="rtl">`) with the Tajawal font; English uses Inter. Bilingual API fields are resolved with `pick(obj, "name", locale)` (`nameAr || nameEn`).
