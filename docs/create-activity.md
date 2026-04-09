# Create activity flow

Maps to product doc **4.2 Create Activity Flow** and **5.3 Create Activity**.

## Goal

Let the user publish an activity in **few taps**, with **no extra fields** beyond the spec.

## Steps (ordered)

1. User opens **Create Activity** screen.
2. User selects **category** (e.g. Coffee, Walk, Sport, Work Together — align enum with UI).
3. User enters **title** (required).
4. User chooses **valid until** date/time (`timestamptz` in DB).
5. User selects **preferred responder gender**: Male, Female, Non-binary, or **Any**.
6. User sets **min age** and **max age** (inclusive range for viewers).
7. User taps **Publish**.
8. App inserts row into `activities` with:
   - `creator_id` = current profile id
   - `latitude` / `longitude` = creator’s **current** location at publish time (same source as profile location unless product later splits “meeting point”)
   - `is_active` = true
9. Matching users see it via **initial query + Realtime** (see [discover-feed.md](./discover-feed.md)).

## Allowed fields (UI)

| Field | Notes |
|--------|--------|
| Category | Fixed set; no free-form type in MVP unless spec extends |
| Title | Required text |
| Valid until | Date/time picker |
| Preferred responder gender | `male` \| `female` \| `non_binary` \| `any` |
| Min age / Max age | Integers; validate min ≤ max |

## Fields that must not exist

- Description / long text
- Distance selector or visibility radius (system uses **10 km** only)
- Now / Later / Today or similar time filters
- Reset filters
- Approximate visibility toggle
- Any optional clutter not listed above

## Validation (client)

- Title non-empty (reasonable max length optional).
- `valid_until` > now.
- Age bounds consistent and within acceptable limits (e.g. 13–120).
- User must have usable **lat/lng** before publish (or block with message).

## Data written

- Single insert into `activities` as in [database.md](./database.md).

## Realtime impact

- `INSERT` on `activities` triggers feed subscription handlers for clients that pass matching rules after merge.

## Related docs

- [discover-feed.md](./discover-feed.md) — who sees the new activity.
- [database.md](./database.md) — `activities` columns.
- [api.md](./api.md) — insert policy and client call.
