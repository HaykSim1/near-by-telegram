# Flow: Profile

**Goal:** Show **who I am** to others (within MVP mock system) and control **privacy toggles**.

## Entry

- Bottom nav **Profile** tab.

## Exit

- Stay on profile or navigate back to previous screen.

## Steps

1. Display **Telegram** name and photo from `initDataUnsafe.user` (or dev fallback).
2. Editable fields (stored in Zustand for MVP): **age**, **short bio**, **interests** (tags or comma-separated).
3. **Privacy** toggles, e.g. “show approximate distance to others”, “show my district label”.
4. Changes apply to how **my** cards or profile previews render in mock logic (where implemented).

## UI elements

- Avatar, name
- Inputs for age, bio, interests
- Toggle switches for privacy flags

## State / data

- `profile` slice merged with Telegram user id
- No server sync in MVP

## MVP limits

- Privacy flags affect display only in mock UI; full enforcement needs a backend later.
