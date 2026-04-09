# My activities flow

Maps to product doc **4.4 My Activities Flow** and **5.5 My Activities**.

## Goal

Let the **creator** see everything they posted, split into **active** vs **expired**, independent of the discover feed matching rules.

## Steps (ordered)

1. User opens **My Activities**.
2. App loads activities where **`creator_id`** = current user’s profile id.
3. UI splits into two sections:
   - **Active:** `is_active` and `valid_until` > now (define edge case at exact expiry consistently with feed).
   - **Expired:** everything else (past `valid_until` and/or `is_active` false).

## Card fields

- Category
- Title
- Valid until
- Created at
- Status (derive from `is_active` + `valid_until` for clarity)

## Actions (MVP scope)

Product text focuses on **viewing** lists. If MVP includes cancel/delete, use `is_active = false` or delete row and rely on Realtime for other clients.

## Data access

- Filter: `activities.creator_id = auth.uid()` (or equivalent subject) under RLS.

## Related docs

- [database.md](./database.md) — `activities` table.
- [api.md](./api.md) — query by `creator_id`.
