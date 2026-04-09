# Overview

## Positioning

Nearby Now helps people **near each other** connect for **short, intent-based real-world plans**—grab coffee, take a walk, cowork from a café, play games, get quick help, discuss a business idea—not romantic matching.

## Core idea

The app shows **who is nearby and what they want to do right now** (or today), not a generic map of people.

## MVP scope

- Telegram Mini App (WebApp SDK), React, TypeScript, Zustand, **mock data** and **mock geolocation**
- Screens: onboarding, nearby feed with filters, create activity, activity detail, my activities, responses, profile
- **Respond** → host **Accept** / **Decline** → after accept, **Open Telegram Chat** (deep link to `t.me/username`)
- Client-side filters: category, distance, optional gender, **Now** / **Today**
- Categories (MVP): Coffee, Walk, Sport, Work Together, Games, Help, Business / Networking, Other

## UX principles

- Mobile-first, large tap targets, minimal steps
- Feels fast and social, not “creepy”—no exact location
- Default styling aligned with Telegram theme variables (light/dark friendly)

## Non-goals (MVP)

- No backend, no `initData` verification, no cross-device persistence (refresh resets mock state unless extended later)
- No live location sharing, no map pin of exact user position
- No push notifications
