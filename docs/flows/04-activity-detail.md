# Flow: Activity detail

**Goal:** Read full context for one activity and send a **response** request to the host.

## Entry

- From feed **Respond** (or card tap).

## Exit

- Back to **Feed**, or to **My activities** / **Responses** if navigating from owner context.

## Steps

1. Show **avatar**, **name**, **category**, **description**, **distance label**, **district**, **time posted** / validity.
2. User taps **Respond**.
3. Create a `Response` with `status: pending`, `activityId`, `fromUserId` (current user).
4. Optional: short message field in MVP (if implemented, store on `Response.message`).
5. Confirm with inline state or toast (MVP: simple text “Request sent”).

## UI elements

- Header with back
- Detail layout + **Respond** CTA

## State / data

- `responses[]` append; prevent duplicate respond from same user to same activity (optional guard)

## Safety / copy

- No exact address; encourage neutral public meetup wording in tips (optional).

## MVP limits

- No real-time “typing”; host sees list on **Responses** screen.
