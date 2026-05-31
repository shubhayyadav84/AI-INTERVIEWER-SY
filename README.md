# AI Interviewer

Full-stack AI mock interview app (React + Vite frontend, Express API in `/api`).

Deploy **frontend and backend together** on [Vercel](https://vercel.com) — no separate Render server needed.

## Deploy on Vercel (recommended)

1. Push this repo to GitHub: [AI-INTERVIEWER-MY](https://github.com/shubhayyadav84/AI-INTERVIEWER-MY)
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** the repository
3. Framework preset: **Vite** (auto-detected)
4. Add **Environment Variables** from [`.env.example`](.env.example):
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `OPENROUTER_API_KEY`
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (if using payments)
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://ai-interviewer-my.vercel.app`)
5. Deploy

The API runs at `/api/*` on the same domain as the UI (`vercel.json` routes are already configured).

### Troubleshooting signup / login

1. **Health check:** open `https://YOUR-APP.vercel.app/api/health`  
   - `db: true` and `hasJwt: true` → backend env is OK  
   - `db: false` → set `MONGODB_URL` in Vercel and allow `0.0.0.0/0` in MongoDB Atlas → Network Access  
   - `hasJwt: false` → set `JWT_SECRET` in Vercel  
2. **Do not set** `VITE_SERVER_URL` on Vercel (leave it unset).  
3. Set `FRONTEND_URL` to your live URL (e.g. `https://your-app.vercel.app` or your custom domain).

## Run locally

```bash
npm install
```

Create `api/.env` from `.env.example`, then in **two terminals**:

```bash
# Terminal 1 — API
npm run server

# Terminal 2 — frontend
npm run dev
```

Open http://localhost:5173 (API default: http://localhost:8000).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Vite dev server          |
| `npm run server` | Express API (port 8000) |
| `npm run build` | Production frontend build |
| `npm start`    | API only (local/production server) |
