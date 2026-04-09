# Flow: Create activity

**Goal:** Publish a short-lived activity so others nearby can respond.

## Entry

- From feed **Create** button.

## Exit

- Back to **Feed** (or **My activities**) after publish.

## Steps

1. User picks **category** (one of eight MVP categories).
2. Enters **title** and **short description**.
3. Sets **district / neighborhood** (dropdown or free text for MVP).
4. Sets **time validity**: **Now**, **Today**, or a simple duration (MVP-level).
5. Sees **approximate distance** as read-only text derived from mock viewer location (label only).
6. Optionally sets **gender preference** and **age range** (simple fields).
7. Taps **Publish** → append `Activity` with `authorId = currentUser.id`, `status: active`.

## UI elements

- Form fields listed above + **Publish** primary button
- Validation: require title, category, district; minimal length optional

## State / data

- `publishActivity(payload)` pushes to `activities[]`
- `expiresAt` / `validUntil` computed from time choice

## Safety / copy

- Remind that only approximate area is shown to others.

## MVP limits

- No moderation queue; no duplicate detection.
