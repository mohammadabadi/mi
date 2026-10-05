# MiFin

MiFin is a Nuxt full-stack personal finance app for Persian RTL users. It tracks accounts, income, expenses, transfers, categories, balances, dashboard summaries, and reports.

Money is stored as integer minor units in `IRR` and formatted in the UI as ریال. Transaction dates are stored as Gregorian `YYYY-MM-DD`; the UI displays Persian/Jalali dates.

The UI is mobile-first and includes PWA support, so the app can be installed on supported mobile browsers as a standalone app.

## Installation

```bash
npm install
```

## Environment

```bash
cp .env.example .env
```

Variables:

- `DATABASE_URL`: Supabase PostgreSQL connection string, including SSL.
- `AUTH_SECRET`: long random secret reserved for auth/session hardening.

Supabase example:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
```

## Database

```bash
npm run db:generate
npm run db:migrate
```

For quick development against an empty database you can also run:

```bash
npm run db:push
npm run db:seed
```

Demo credentials after seeding:

```text
demo@mifin.local
password123
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run typecheck
npm run test
npm run build
```

The production build generates the PWA manifest and service worker under the Vercel output.

## Deployment

1. Create a Supabase project and copy the PostgreSQL connection string.
2. Add `DATABASE_URL` and `AUTH_SECRET` to the Vercel project environment variables.
3. Deploy this repository to Vercel.
4. Run Drizzle migrations against the Supabase database before production traffic.

The app uses Nuxt server routes under `server/api/*`; no VPS, PM2, Nginx, Docker server, or separate backend service is required.
