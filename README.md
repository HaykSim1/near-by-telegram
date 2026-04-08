# Nearby Now

Telegram Mini App MVP: find people nearby for a **specific purpose right now** (coffee, walk, coworking, sport, help, etc.)—**not** a dating app.

- **Stack:** Vite, React 19, TypeScript, Zustand, [`@twa-dev/sdk`](https://github.com/twa-dev/sdk)
- **Data:** in-memory only (refresh resets). **Demo seed** (sample people + activities) runs in `vite dev` only; **`npm run build` / production has an empty feed** unless you opt in.
- **Docs:** product and flows live in [`docs/`](docs/README.md)

### Demo data (env)

| Environment | Default |
|---------------|---------|
| `npm run dev` | Demo feed **on** |
| `npm run build` / Vercel production | Demo feed **off** (empty until users post) |

Override:

- `VITE_USE_DEMO_DATA=true` — show demo activities (e.g. staging on Vercel).
- `VITE_USE_DEMO_DATA=false` — hide demo activities even in dev.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). Outside Telegram, the app uses a **dev user** and mock location so you can exercise every screen.

## Build

```bash
npm run build
npm run preview
```

## Try inside Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather) and attach a **Mini App** URL.
2. Serve this app over **HTTPS** (e.g. Cloudflare Tunnel, ngrok) and set that URL in BotFather.
3. Open the mini app from the bot; `initDataUnsafe.user` will populate the profile header.

Approximate distance and neighborhood labels are **never** replaced with exact coordinates in the UI (see [`docs/safety-privacy.md`](docs/safety-privacy.md)).

## Project layout

- `src/screens/` — onboarding, feed, create, detail, my activities, responses, profile
- `src/store/appStore.ts` — navigation, filters, activities, responses
- `src/data/seed.ts` — demo people and activities
- `docs/flows/` — one markdown file per user flow
