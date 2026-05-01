# AI Todo Planner — Frontend

React + Vite frontend for the AI Todo Planner application.

## Local Setup

```bash
npm install
cp .env.example .env.local   # set VITE_API_URL to your backend URL
npm run dev                  # starts on http://localhost:5173
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g. `https://your-backend.up.railway.app/api`) |

## Deploy to Vercel

1. Push this folder to GitHub
2. Import repo in Vercel
3. Set `VITE_API_URL` in Vercel Environment Variables
4. Deploy — Vercel auto-detects Vite

## Tech Stack
- React 18 + Vite
- React Router v6
- Axios
- date-fns
- Vanilla CSS (custom design system)
