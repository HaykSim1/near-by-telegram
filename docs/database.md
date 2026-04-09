# Database (Supabase PostgreSQL)

Overview for agents and implementers. Exact SQL lives in migrations in the repo when added.

## Tables

### `profiles`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `uuid` | PK; aligned with auth user id if using Supabase Auth |
| `telegram_user_id` | `bigint` | Unique, not null |
| `first_name` | `text` | From Telegram |
| `username` | `text` | From Telegram, nullable |
| `avatar_url` | `text` | Nullable |
| `gender` | enum or `text` | `male` \| `female` \| `non_binary` |
| `age` | `int` | For matching |
| `latitude` | `double precision` | Last known |
| `longitude` | `double precision` | Last known |
| `updated_at` | `timestamptz` | |

### `activities`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `creator_id` | `uuid` | FK → `profiles.id` |
| `category` | `text` or enum | coffee, walk, sport, work_together, … |
| `title` | `text` | Not null |
| `valid_until` | `timestamptz` | Not null |
| `preferred_responder_gender` | enum or `text` | `male` \| `female` \| `non_binary` \| `any` |
| `min_age` | `int` | |
| `max_age` | `int` | |
| `latitude` | `double precision` | At publish time |
| `longitude` | `double precision` | At publish time |
| `is_active` | `boolean` | Default true |
| `created_at` | `timestamptz` | Default now |

## Indexes

- `activities (valid_until)`, `activities (creator_id)`.
- Optional **PostGIS** `geography` + GiST for scalable nearby reads.

## Row Level Security (outline)

- **`profiles`:** Owner can insert/update own row; selective read for creator fields on feed (view or policy — avoid exposing sensitive columns if any are added later).
- **`activities`:** Owner insert/update/delete own rows; **select** must not expose all rows globally — use **ST_DWithin** / bbox against reader’s profile location and time/active checks where possible; mirror age/gender rules in SQL or accept client enforcement with understanding of leakage risk.

## Realtime

- Enable **Realtime** for `public.activities` (and optionally `profiles` if subscribing to creator updates).

## Related flow docs

- [first-launch.md](./first-launch.md) — profile upsert
- [create-activity.md](./create-activity.md) — insert activity
- [discover-feed.md](./discover-feed.md) — read + match
- [my-activities.md](./my-activities.md) — list by creator
- [profile.md](./profile.md) — profile update
