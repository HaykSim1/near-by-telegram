# Flow: Onboarding

**Goal:** Explain Nearby Now in one glance, get the user to tap **Start**, and request location permission (with a safe fallback).

## Entry

- User opens the Mini App from Telegram (or local dev in a browser).

## Exit

- User lands on the **Nearby feed** after completing onboarding.

## Steps

1. Show a short headline and 2–3 bullets: intent-based meetups nearby, not dating; approximate distance and neighborhood only.
2. User taps **Start**.
3. App calls Telegram WebApp `ready()` and `expand()` (see `src/lib/telegram.ts`).
4. App requests **browser geolocation** once (`navigator.geolocation`).
5. On success: store a coarse representation for mock filtering (no exact coords in UI).
6. On deny / error / non-HTTPS: use **mock location** (default district) and continue.
7. Set `onboardingDone` in Zustand and navigate to **Feed**.

## UI elements

- App name / logo area (optional)
- Short explanation + safety line (“approximate distance & area only”)
- Primary **Start** button (large tap target)

## State / data

- `onboardingDone: boolean`
- `mockLocation` or equivalent: district label + internal distance helper only
- `telegramUser` from `WebApp.initDataUnsafe.user` or dev fallback

## Safety / copy

- Explicitly state we do **not** show exact location on a map.

## MVP limits

- No server-side consent log; no re-prompt rules beyond a simple first run.
