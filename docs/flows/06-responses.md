# Flow: Responses (incoming)

**Goal:** As host, **accept** or **decline** people who responded; after accept, **open Telegram chat** safely.

## Entry

- From **My activities** by tapping an activity with responses.

## Exit

- Back to **My activities**; user may leave app to Telegram chat.

## Steps

1. Load all `responses` for `activityId` where the current user is the activity author.
2. For each pending response, show responder **avatar**, **name**, optional message, time.
3. **Decline** → set `status: declined`.
4. **Accept** → set `status: accepted` (others can remain pending or be declined—MVP: keep simple; optionally auto-decline others).
5. For **accepted** row, show **Open Telegram Chat** using `https://t.me/<username>` via WebApp `openTelegramLink` / `openLink`.
6. If responder has no `username`, show an alert with explanation (MVP fallback).

## UI elements

- List of response rows with **Accept** / **Decline**
- Primary link button for accepted state

## State / data

- `acceptResponse`, `declineResponse` mutators on `responses[]`

## Safety

- Chat only after explicit **Accept** by host.

## MVP limits

- No in-app messaging; Telegram handles chat.
