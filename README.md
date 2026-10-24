# MiFin

MiFin is a Nuxt full-stack personal finance app for Persian RTL users. It tracks accounts, income, expenses, transfers, categories, balances, dashboard summaries, and reports.

Money is stored as integer minor units in `IRR` and formatted in the UI as ریال. Transaction dates are stored as Gregorian `YYYY-MM-DD`; the UI displays Persian/Jalali dates.

The UI is mobile-first and includes PWA support, so the app can be installed on supported mobile browsers as a standalone app.

## Installation

```bash
npm install
cp .env.example .env
# Edit .env and set a real DATABASE_URL
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

Production output is a Node server under `.output/` (`nitro` preset: `node-server`).

## Deployment (VPS)

### Requirements

- Node.js 20+ (LTS recommended)
- PostgreSQL 14+
- Reverse proxy with HTTPS (Nginx or Caddy)

### 1. PostgreSQL

```bash
sudo -u postgres createuser -P mifin
sudo -u postgres createdb -O mifin mifin
```

### 2. App setup

```bash
git clone <your-repo-url> mifin
cd mifin
npm ci
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://mifin:YOUR_PASSWORD@127.0.0.1:5432/mifin
ADMIN_EMAILS=you@example.com
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
```

For localhost Postgres, SSL is disabled automatically. For a remote DB that needs TLS, set `DATABASE_SSL=require` or use `?sslmode=require` in the URL.

### 3. Migrate and build

```bash
npm run db:migrate
npm run build
```

Optional demo data:

```bash
npm run db:seed
```

### 4. Run with PM2

```bash
npm i -g pm2
pm2 start npm --name mifin -- start
pm2 save
pm2 startup
```

Or directly:

```bash
HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

### 5. Nginx (example)

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then enable HTTPS (e.g. Certbot). Session cookies require HTTPS in production (`secure: true`).

### Notes

- Keep PostgreSQL bound to localhost; do not expose port 5432 publicly.
- After pulling updates: `npm ci && npm run db:migrate && npm run build && pm2 restart mifin`
