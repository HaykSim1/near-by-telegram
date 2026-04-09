# Flow: My activities

**Goal:** See **my** published activities split into **active** vs **expired / completed** and open **incoming responses**.

## Entry

- Bottom nav or header entry **My activities**.

## Exit

- **Responses** screen for a chosen activity, or back to **Feed**.

## Steps

1. List activities where `authorId === currentUser.id`.
2. Section **Active**: `status === 'active'` and not past expiry.
3. Section **Expired / completed**: past expiry or manually completed (MVP: mostly expiry).
4. Each row shows title, category, time window, and **count of pending responses** (and optionally accepted).
5. Tap row → **Responses** with `activityId` param.

## UI elements

- Two sections with headers
- List rows + chevron or “Responses (N)” badge

## State / data

- Read from `activities[]` + aggregate `responses[]` by `activityId`

## MVP limits

- No edit/delete activity in MVP unless trivial to add; plan allows focus on read + responses.
