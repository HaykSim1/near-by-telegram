# Profile flow

Maps to product doc **4.5 Profile Flow** and **5.6 Profile**.

## Goal

User can set **demographics used for matching**; **Telegram-sourced** identity stays read-only in UI.

## Steps (ordered)

1. User opens **Profile**.
2. User edits **gender** and **age**.
3. App saves to **`profiles`** in Supabase.
4. **First name**, **username**, **avatar** are shown from Telegram and refreshed on launch / when WebApp provides updates; not editable in-app (per spec).

## Editable fields

| Field | Notes |
|--------|--------|
| Gender | `male` \| `female` \| `non_binary` — must align with matching in [discover-feed.md](./discover-feed.md) |
| Age | Integer; used for feed eligibility |

## Read-only / Telegram-filled

- First name
- Username
- Avatar

Sync these during **first launch** and optionally when returning to app (see [first-launch.md](./first-launch.md)).

## Impact on feed

After profile update, **re-run** feed matching (or invalidate feed query) so age/gender changes immediately affect which activities appear.

## Related docs

- [database.md](./database.md) — `profiles` columns.
- [api.md](./api.md) — update profile.
