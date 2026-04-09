# First launch flow

Maps to product doc **4.1 First Launch Flow** and **5.1 Onboarding**.

## Goal

Get a signed-in user with a persisted profile and **current coordinates**, then land on the **main feed**.

## Steps (ordered)

1. User opens the Telegram Mini App.
2. Initialize **Telegram WebApp SDK** (expand viewport, theme, back button behavior as needed).
3. Read **Telegram user** info from `initData` / `initDataUnsafe` (display names, avatar — see [profile.md](./profile.md)).
4. **Authenticate** with Supabase using verified `initData` (typically via Supabase Edge Function; see [api.md](./api.md)).
5. Request **browser / WebApp location** permission and read `latitude` / `longitude`.
6. **Upsert** user row in `profiles` (Telegram fields + coords + any existing gender/age).
7. Navigate to **main feed** (or onboarding shell if you keep a one-screen explainer before location).

## Onboarding screen (minimal)

**Purpose:** Very light first-time framing, not a long tutorial.

**Elements:**

- App title and one short line of explanation (nearby activities, not dating).
- **Continue** (or equivalent) to trigger location permission and profile sync.
- Location permission is requested in this flow (may be same screen or immediately after tap).

**Out of scope for MVP:** Multi-step tours, account types, email/password.

## Data written

- `profiles`: `telegram_user_id`, `first_name`, `username`, `avatar_url`, `latitude`, `longitude`, `updated_at`; `gender` / `age` if already collected elsewhere or defaults until profile edit.

## Errors and edge cases

- **Location denied:** Define UX: block with explanation and retry, or allow entering feed with stale coords (product choice). Document decision in app copy.
- **Auth failure:** Show retry; do not persist a fake identity.
- **Offline:** Show offline state; retry Supabase when connectivity returns.

## Related docs

- [profile.md](./profile.md) — field ownership (Telegram vs editable).
- [database.md](./database.md) — `profiles` shape.
- [api.md](./api.md) — auth exchange and `profiles` upsert.
