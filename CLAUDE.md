# VENU — Claude Code Guide

## What is VENU?
A live music platform connecting **Artists**, **Locations** (venues), **Promoters**, and **Fans**.
Core transaction: Location posts gig → Artist applies → Fan buys ticket.

## Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Express, MongoDB + Mongoose, Socket.io (real-time)
- **Auth**: JWT stored in localStorage via `authUtils` in `src/lib/utils.ts`
- **API layer**: `src/lib/api.ts` — all HTTP calls go through `apiRequest()` with auth headers

## Repo layout
```
src/
  app/              # Next.js routes (artist/, fan/, location/, promoter/)
  components/
    artist-dashboard/
    fan-dashboard/
    location-dashboard/   ← venue-side UI
    promoter-dashboard/
    ui/                   ← shadcn primitives
  hooks/            # useLocation, useNotifications, useArtistRealTime, etc.
  lib/              # api.ts, utils.ts, socket.ts
backend/
  src/
    models/         # Mongoose: User, Artist, Gig, Location, Promoter, Fan, Ticket
    routes/         # gigs.routes.ts, artist.routes.ts, location.routes.ts, etc.
    services/       # socketService.ts (real-time notifications)
```

## Key conventions
- **Purple theme**: primary buttons use `bg-purple-600 hover:bg-purple-700 text-white`
- **Time format**: 12-hour clock everywhere
- **IDs**: MongoDB documents use `_id`, not `id`
- **No image uploads**: removed; keep architecture image-free
- **No push notifications**: Socket.io real-time only (no service workers / FCM)
- **Notifications**: `socketService.sendNotificationToUser(userId, payload)` from backend routes

## Core data shapes (abbreviated)
```ts
// GigProfile (frontend)
{ _id, eventName, eventDate, eventGenre, status, numberOfBands,
  bands: [{ name, email, genre, confirmed, setTime, percentage }],
  selectedLocation, ticketPrice, ticketsSold, createdBy }

// Status flow: draft → pending-confirmation → posted → live → completed
// Artist self-apply adds band with confirmed: false
// Location accepts via POST /gigs/:id/confirm-band
```

## Running locally
```bash
npm run dev          # starts Next.js + backend concurrently
npm run type-check   # TS errors
npm run lint         # ESLint
```
Backend runs on port 5000, frontend on 3000.

## Door scanner
- Route: `/door?gigId=<id>` — gigId param required
- Uses `jsqr` to decode camera frames in real-time
- Auth: user must be signed in; backend enforces `doorPersonEmail` matches JWT email
- Backend: `POST /gigs/:id/scan-ticket` validates QR token, marks ticket `used`, returns fan name
- Share `/door?gigId=<_id>` with the designated door person when a gig is created

## v1 remaining gaps
1. **Stripe keys** — everything is wired; add `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to env files to activate
