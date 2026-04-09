# Nearby Now — Documentation

Telegram Mini App for creating and discovering **nearby activity requests** (not dating). Frontend talks **directly to Supabase** (Postgres + Realtime); no custom Node server.

## Flow docs (read in any order)

| Doc | Flow |
|-----|------|
| [first-launch.md](./first-launch.md) | First open: Telegram SDK, auth, location, profile upsert → feed |
| [create-activity.md](./create-activity.md) | Publish an activity; fields and exclusions |
| [discover-feed.md](./discover-feed.md) | Main feed: matching, 10 km, filters, cards, realtime |
| [my-activities.md](./my-activities.md) | Creator’s active vs expired activities |
| [profile.md](./profile.md) | Edit age/gender; Telegram fields read-only |
| [activity-details.md](./activity-details.md) | Read-only detail screen opened from a feed card |

## Reference

| Doc | Purpose |
|-----|---------|
| [database.md](./database.md) | Tables, enums, RLS overview |
| [api.md](./api.md) | Supabase usage by flow (queries, subscriptions) |

## Product constraints (MVP)

- No Express / NestJS / Fastify; no Redis; no separate caching layer.
- **Default radius 10 km** — fixed in system logic, **no distance control in UI**.
- No time chips (Now / Later / Today), no reset filters, **no description** on create.
- Feed filters are only: **Male / Female / Non-binary** (see [discover-feed.md](./discover-feed.md) for interpretation).
- One role: regular user (create, discover, manage own activities, edit profile).

## Tech stack

- React, TypeScript, Vite, Tailwind CSS, Zustand.
- Telegram WebApp SDK.
- Supabase: PostgreSQL, Auth (or session via Edge Function), Realtime.
