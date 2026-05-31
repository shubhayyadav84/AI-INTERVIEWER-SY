# AI Interviewer

Full-stack AI mock interview app (React + Vite frontend, Express API, **Neon PostgreSQL**).

## Deploy on Vercel

1. Import repo on [vercel.com/new](https://vercel.com/new)
2. Add environment variables:
   - `DATABASE_URL` — Neon connection string (`postgresql://...?sslmode=require`)
   - `JWT_SECRET`
   - `OPENROUTER_API_KEY`
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (optional)
   - `FRONTEND_URL` — your live URL
3. Deploy

Tables are created automatically on first API request.

### Health check

`https://YOUR-APP.vercel.app/api/health` → `{ "ok": true, "db": true, "hasJwt": true, "hasDb": true }`

## Run locally

```bash
npm install
```

Copy `.env.example` to `api/.env` and set `DATABASE_URL`, `JWT_SECRET`, etc.

```bash
# Terminal 1 — API (port 5000)
npm run server

# Terminal 2 — frontend
npm run dev
```

Open http://localhost:5173
