BadgerPassUW Web App (Next.js)
==============================

This directory will contain the Next.js 14 (App Router) frontend for BadgerPassUW as defined in the root `README.md`.

Routes to implement:
- `/` overview
- `/organizer` create event
- `/event/[eventPubkey]` event detail + QR
- `/checkin/[eventPubkey]` attendee check-in
- `/me` my badges
- `/verify` attendance verification

Setup (after generation):
1. Install deps: `npm i` (or `pnpm i`)
2. Copy environment:
   - Create `app/.env.local` with:
     - `NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com`
     - `NEXT_PUBLIC_PROGRAM_ID=<your_program_id>`
3. Run dev server: `npm run dev` then open `http://localhost:3000`.


