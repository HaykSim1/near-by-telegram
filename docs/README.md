# Nearby Now — documentation

**Nearby Now** is a Telegram Mini App for finding people nearby for a specific purpose right now (coffee, walk, work session, help, etc.). It is **not** a dating app.

## Product docs

- [Overview](overview.md) — positioning, MVP scope, non-goals
- [Safety & privacy](safety-privacy.md) — what location data we show and what we never show

## User flows

| # | Flow | Doc |
|---|------|-----|
| 1 | First open, explanation, geolocation | [01-onboarding](flows/01-onboarding.md) |
| 2 | Nearby feed, filters, cards, create | [02-nearby-feed](flows/02-nearby-feed.md) |
| 3 | Publish a new activity | [03-create-activity](flows/03-create-activity.md) |
| 4 | Activity detail and respond | [04-activity-detail](flows/04-activity-detail.md) |
| 5 | My activities (active / past) | [05-my-activities](flows/05-my-activities.md) |
| 6 | Incoming responses, accept, open chat | [06-responses](flows/06-responses.md) |
| 7 | Profile and privacy | [07-profile](flows/07-profile.md) |

## Safety summary

We never show exact coordinates or live pinpoint maps in the MVP. Users see **approximate distance** (e.g. “1.2 km away”) and **neighborhood / district labels** only. See [safety-privacy.md](safety-privacy.md).

## Future backend docs

Place API and database specs here when added, for example `api.md` and `database.md`.
