# Flow: Nearby feed

**Goal:** Browse nearby **activity requests** with filters and jump to create, detail, or skip.

## Entry

- After onboarding, or via bottom nav **Feed** tab.

## Exit

- **Create activity** screen, **Activity detail** (from Respond), **My activities**, or **Profile** via nav.

## Steps

1. Load and display a list of **activity cards** from Zustand (seed + user-published).
2. Apply **filters**: categories (multi-select), max distance, optional gender, **Now** / **Today**.
3. Exclude current user’s own activities from the feed (optional product choice; implemented in store).
4. **Skip** removes/hides the card for this session (`skippedActivityIds`).
5. **Respond** navigates to **Activity detail** (or creates flow that ends with a pending response—detail first is fine).
6. Tap **Create** (FAB or header) → **Create activity**.

## UI elements

- `FilterBar`: category chips, distance control, gender, Now/Today toggle
- `ActivityCard`: avatar, name, distance label, district, category, time validity, short description, **Respond**, **Skip**
- Button to **Create** new activity

## State / data

- `activities[]`, `feedFilters`, `skippedActivityIds`
- Selector `selectVisibleActivities` applies filters + sort (distance, then recency)

## Safety / copy

- Card shows only **labels** (`distanceLabel`, `districtLabel`), never lat/long.

## MVP limits

- All data in memory; refresh resets unless persistence is added later.
