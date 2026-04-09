# Safety & privacy

## What we do **not** show (MVP)

- Exact GPS coordinates or address strings derived from precise geolocation
- Live location trails or continuous tracking UI
- A map that pinpoints another user’s position

## What we **do** show

- **Approximate distance** as a human-readable label (e.g. “800 m away”, “1.2 km away”)
- **Neighborhood / district** or rough area labels (e.g. “Arabkir”, “City Center”, “Near Cascade”)
- Activity text authored by the user (title, description, category)

## Mock geolocation (MVP)

- In development or when the user denies browser geolocation, the app uses a **fixed mock reference point** and demo data so the product remains testable.
- Internal numeric distance may exist **only** for sorting/filtering; it must not be exposed as raw coordinates in the UI.

## Contact after matching

- Telegram chat opens **only** after the activity owner **accepts** a response (or equivalent mutual confirmation in future versions).
- Until then, avoid exposing phone numbers or external identifiers beyond what Telegram already provides in-profile.

## Copy tone

- Emphasize **intent**, **spontaneity**, and **public-ish meetups** (café, walk, gym)—not dating language.
