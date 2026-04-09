# Activity details (screen)

Maps to product doc **5.4 Activity Details**. Reached from **main feed** (see [discover-feed.md](./discover-feed.md)).

## Purpose

Read-only detail view of a single activity; same facts as the card, expanded for clarity.

## Show

- Creator **avatar**
- Creator **name**
- **Category**
- **Title**
- **Valid until**
- **Distance** (from current user location to activity coordinates)
- **Preferred responder gender**
- **Age range** (min–max)

## Behavior

- No long description field (product excludes description on create).
- Keep layout simple and scannable on mobile Telegram WebApp.

## Data

- Single activity row + creator profile (join or separate fetch); same identifiers as feed item.

## Related docs

- [discover-feed.md](./discover-feed.md) — navigation source and matching context
- [api.md](./api.md) — fetch by `id` if deep-linked later
