# API — Supabase usage by flow

Client uses **`@supabase/supabase-js`** with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. **No** Express/Nest/Fastify backend.

**Auth note:** For production, avoid trusting `telegram_user_id` from the client alone. Use a **Supabase Edge Function** (or equivalent) to verify Telegram WebApp `initData` and return a session; implementation detail stays outside this doc.

---

## First launch — [first-launch.md](./first-launch.md)

| Action | Supabase |
|--------|-----------|
| Sign in / session | Edge Function → `supabase.auth.setSession` or supported sign-in method |
| Upsert profile | `from('profiles').upsert({ ... }, { onConflict: 'telegram_user_id' })` or upsert on `id` depending on schema |

Payload includes Telegram fields + `latitude`, `longitude` after permission.

---

## Create activity — [create-activity.md](./create-activity.md)

| Action | Supabase |
|--------|-----------|
| Insert activity | `from('activities').insert({ creator_id, category, title, valid_until, preferred_responder_gender, min_age, max_age, latitude, longitude, is_active: true })` |

RLS must allow insert only for `creator_id = auth.uid()` (or your subject).

---

## Discover feed — [discover-feed.md](./discover-feed.md)

| Action | Supabase |
|--------|-----------|
| Initial load | `from('activities').select('*, profiles!creator_id(...)')` with filters, **or** RPC e.g. `get_feed_activities()` returning pre-narrowed rows |
| Realtime | `channel().on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, handler)` |

Client (or RPC) applies: active, not expired, **10 km**, age range, preferred gender, then UI tab filter.

---

## My activities — [my-activities.md](./my-activities.md)

| Action | Supabase |
|--------|-----------|
| List mine | `from('activities').select('*').eq('creator_id', profileId).order('created_at', { ascending: false })` |

Split active vs expired in UI or query.

---

## Profile — [profile.md](./profile.md)

| Action | Supabase |
|--------|-----------|
| Update demographics | `from('profiles').update({ gender, age, updated_at }).eq('id', userId)` |

Telegram display fields updated via upsert in first launch, not this form.

---

## Realtime contract

- **Table:** `activities`
- **Events:** `INSERT`, `UPDATE`, `DELETE`
- **Handler:** merge into store, re-apply same matcher as initial load; prune when row no longer matches.

See [discover-feed.md](./discover-feed.md) for matching rules.
