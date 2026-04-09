# Supabase (Nearby Now)

## Migrations

Apply SQL in [`migrations/`](./migrations/) via Supabase CLI (`supabase db push`) or the SQL editor.

The migration enables **Realtime** on `public.activities`. If `ALTER PUBLICATION` errors because the table is already in the publication, remove that line or run once.

## Edge Function: `telegram-auth`

Deploy:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token
supabase functions deploy telegram-auth --no-verify-jwt
```

`--no-verify-jwt` allows the Mini App to call the function with only the anon key; the function validates Telegram `initData` instead.

Required secrets (auto-provided on hosted Supabase): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

**You must set `TELEGRAM_BOT_TOKEN`** for the function (Dashboard → Project Settings → Edge Functions → Secrets, or `supabase secrets set`). Without it, the function returns `server_misconfigured` (HTTP 500).

If the client shows **“Failed to send a request to the Edge Function”**, that usually means the browser could not complete `fetch` (function missing, wrong `VITE_SUPABASE_URL`, ad blocker, or offline). After deploy, a clearer message may include the underlying network error.

## Manual QA (Telegram)

1. Host the Vite build (HTTPS) and set the URL in BotFather as the Mini App URL.
2. Open the bot in Telegram, launch the Mini App.
3. Confirm theme, viewport, back button, and that **Continue** completes sign-in and location.
4. Create an activity from a second test account (second device or colleague) and confirm it appears in the feed with **Realtime** (no refresh).
