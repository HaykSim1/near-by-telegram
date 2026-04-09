# Discover feed flow

Maps to product doc **4.3 Discover Feed Flow**, **5.2 Main Feed**, **6 Matching**, **7 Location**, and **8 Realtime**.

## Goal

Show a **live** list of activities that **match** the current user and are **within 10 km**, with minimal filters.

## Steps (ordered)

1. User opens **main feed**.
2. App loads activities from Supabase (see [api.md](./api.md) for query vs RPC).
3. App applies **matching** (and optionally relies on server-side pre-filtering — see below).
4. Renders **feed cards**; opens **activity details** on tap.
5. **Realtime:** new/updated/deleted activities update the list without manual refresh.

## Feed visibility rules (all must be true)

1. Activity **`is_active`** is true.
2. **Current time** \< **`valid_until`**.
3. User is within **10 km** of activity **`latitude` / `longitude`** (haversine or PostGIS — same constant **10 km** everywhere).
4. Viewer **age** ∈ \[**min_age**, **max_age**\].
5. **Gender match:** `preferred_responder_gender` is **`any`**, or equals viewer’s **`gender`**.

Implement the same predicate in:

- Initial fetch merge
- Realtime event handling (re-run matcher on affected rows)

## Feed UI filters (only these)

- **Male**
- **Female**
- **Non-binary**

**Product ambiguity:** The spec does not state whether tabs filter **creator gender** or **activity.preferred_responder_gender**. Recommendation: treat tabs as **creator gender** among activities that already pass matching (otherwise tabs are redundant with the viewer’s own gender). Confirm with product owner and document the chosen rule in code comments.

**Explicitly excluded:** Distance slider, time filters, reset-filters control.

## Feed card fields

- Creator **avatar**
- Creator **name**
- **Category**
- **Title**
- **Valid until**
- **Distance** (computed; display only — not a filter)
- **Preferred responder gender**
- **Age range** (min–max)

## Actions

- Tap card → **Activity details** (see product doc **5.4**).

## Location

- **Input:** viewer’s latest **`profiles.latitude` / `profiles.longitude`** and each activity’s coordinates.
- **Rule:** hide activities farther than **10 km** (system-driven; user cannot change radius).

## Realtime behavior

- Subscribe to **`activities`** changes (`INSERT`, `UPDATE`, `DELETE`).
- On each event: upsert/remove in local state, then **re-apply** full matching (and tab filter) so:
  - New matching activities **appear**
  - Updates reflect immediately
  - Expired or inactive activities **disappear**

Optional: subscribe to **`profiles`** for creators currently visible if avatars/names update.

## Related docs

- [database.md](./database.md) — RLS and performance notes for “nearby” reads.
- [api.md](./api.md) — select/subscribe patterns.
- [create-activity.md](./create-activity.md) — what gets inserted.
