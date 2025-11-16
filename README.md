### BadgerPassUW — Cursor “super-prompt” + step-by-step plan to ship a winning MVP

Below is a single, copy-paste-ready prompt for Cursor that will scaffold and implement the full project (on-chain program + Next.js app) with QR check-in, wallet signatures, devnet deployment, and clean UX. After the prompt, we’ve included the exact steps to get it running on Windows, plus a demo script and Devpost deliverables checklist.

Copy everything inside the following code block and paste it into Cursor as your master instruction:

```markdown
You are building a production-grade, hackathon-ready MVP named “BadgerPassUW” that records verifiable event attendance on Solana. Optimize for clarity, reliability, and ease of running on Windows. Keep code readable and typed. Keep the setup simple, use devnet. Deliver a polished UI, a clean README, and a demo script.

Project Goals
- Problem: Messy, untrusted attendance tracking; students can’t prove attendance later; manual admin work; no standard across campus.
- Solution: One Solana program that stores events and one attendance record per (event, attendee) as PDAs. Frontend provides QR-based check-in and read-only proof pages. Everything open and verifiable on-chain.

Tech Stack
- Chain: Solana devnet
- Program: Anchor (Rust)
- Client: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- Wallets: @solana/wallet-adapter (Phantom required), optional Gemini Wallet SDK toggle
- QR: qrcode (generate), next-qrcode or react-qr-code for rendering
- State: lightweight client state with SWR or React Query
- No off-chain DB; rely on on-chain data and simple caches in memory
- Tooling: Prettier + ESLint, zod for input validation
- CI: simple GitHub Actions (lint & type-check), optional

On-Chain Program (Anchor)
- Program name: badgerpass
- Accounts:
  1) Event account
     - organizer: Pubkey
     - title: String (<= 64)
     - timestamp: i64
     - location: String (<= 64)
     - bump: u8
     - PDA seeds: ["event", organizer_pubkey, event_id: [u8; 8]] — event_id is a u64
  2) Attendance account
     - event: Pubkey
     - attendee: Pubkey
     - checked_in_at: i64
     - bump: u8
     - PDA seeds: ["attendance", event_pubkey, attendee_pubkey]
- Instructions:
  - create_event(organizer, title, timestamp, location) → initializes Event PDA
  - check_in(attendee, event) → initializes Attendance PDA; fails if already exists (double check-in prevention by PDA)
- Constraints/Validation:
  - title/location max length; timestamp must be non-negative; only organizer signs create_event
  - check_in must be signed by attendee; uses Clock::get() for checked_in_at
- Events:
  - EventCreated { event: Pubkey, organizer: Pubkey, title: String, timestamp: i64 }
  - CheckedIn { event: Pubkey, attendee: Pubkey, checked_in_at: i64 }
- Tests (Anchor mocha or Rust):
  - Can create event
  - Can check in once
  - Double check-in fails
  - Query by program logs or by PDA derivations

Frontend UX (Next.js)
- Pages/Routes:
  - /: Marketing/overview with “How it works”
  - /organizer: Connect wallet; create event form (title, date-time, location); after creation, show event detail + QR
  - /event/[eventPubkey]: Public event detail; shows organizer address, time, location, total check-ins; includes QR to /checkin/[eventPubkey]
  - /checkin/[eventPubkey]: Student flow; wallet connect + “Check In” button; show success state with on-chain link
  - /me: “My Badges”—list attendance by scanning program accounts for current wallet
  - /verify: Simple verifier form: paste wallet address + event pubkey, show attendance proof (exists or not)
- Components:
  - WalletConnectButton
  - EventForm (zod validated)
  - EventCard
  - QRDisplay (renders QR for /checkin/{eventPubkey})
  - BadgeList (lists events attended)
  - ProofStatus (check + result)
- Data layer:
  - Small TS SDK wrapping @project-serum/anchor client for:
    - createEvent
    - checkIn
    - findEventByPubkey
    - listAttendanceByEvent(eventPubkey)
    - listMyAttendance(attendeePubkey)
    - isAttended(eventPubkey, attendeePubkey)
  - Config via env: NEXT_PUBLIC_SOLANA_RPC (default devnet), PROGRAM_ID
- Wallets:
  - Default wallet adapters: Phantom
  - Optional toggle to enable Gemini wallet SDK (simple provider switch + CTA button)
- QR format:
  - Encode a minimal deep link to /checkin/[eventPubkey] (works on laptops and phones)
- Styling:
  - Tailwind + shadcn/ui (Card, Button, Badge, Alert, Dialog, Input)
  - UW red style accent variant (accessible)

Dev Experience
- Scripts:
  - anchor: build, test, deploy to devnet
  - web: dev, build, start
  - tool: generate QR locally and save PNG
- README with Windows steps clearly documented
- Demo script included in README; copyable CLI calls
- Minimal CI for lint + type

Acceptance Criteria (MVP)
- Organizer creates event with their wallet; receives event pubkey and QR
- Student scans QR, connects wallet, presses “Check In”; on-chain account created exactly once
- Public event page displays real-time count and attendee list (addresses only)
- “My Badges” shows all attended events for connected wallet
- Verifier page confirms attendance by wallet + event pubkey; links to Solana Explorer
- Works on Solana devnet; deploy guide and environment clearly explained

Repository Structure
- anchor/
  - programs/badgerpass/src/lib.rs
  - tests/badgerpass.ts (or Rust tests)
- app/ (Next.js 14)
  - app/(routes) [...]
  - components/ [...]
  - lib/solana/{idl.json, client.ts, program.ts}
  - lib/utils/{format.ts, validation.ts}
  - styles/
- scripts/
  - generate-qr.ts
  - seed-demo.ts (optional: create sample events)
- README.md
- .env.example
- .prettierrc, .eslintrc.js, tsconfig.json

Implementation Tasks (do these end-to-end)
1) Scaffold Anchor workspace “anchor init badgerpass”
2) Implement program per spec with PDAs, constraints, events
3) Write program tests (create event, check-in, double-check-in fail)
4) Build and deploy to devnet; export PROGRAM_ID and IDL
5) Create Next.js app in /app with Tailwind and shadcn/ui
6) Implement wallet connect and Solana client wrapper (AnchorProvider, PROGRAM_ID, IDL)
7) Build organizer flow (/organizer → create event → redirect to /event/[pubkey] with QR)
8) Build check-in flow (/checkin/[eventPubkey] → sign and call check_in)
9) Build “My Badges” (/me) by listing attendance PDAs where attendee == wallet
10) Build /verify form: attendee + event pubkey → boolean + explorer link
11) Polish UI, loading states, toasts, and error messages
12) Add README, demo script, screenshots; ensure Windows steps are clean

Constraints & Quality
- Strong TypeScript types; no any
- Guard clauses; no deep nesting
- Zod for form input validation
- Helpful user-facing errors for common failures (already checked in; wallet not connected; network error)
- Accessibility: aria labels, focus states, sufficient contrast

Env & Versions (pin)
- Node LTS (v18+)
- Rust stable (latest), Solana CLI v1.18+, Anchor 0.29+
- Next.js 14
- @solana/web3.js ^1.95
- @project-serum/anchor ^0.29
- @solana/wallet-adapter-react ^0.9
- tailwindcss ^3
- zod ^3

Deliverables
- Deployed program on devnet; PROGRAM_ID in README
- App runs with “pnpm dev” or “npm run dev”
- README: setup, run, deploy, verify, demo script
- 3-5 screenshots + short Loom link (recording)
- Devpost copy: problem, solution, architecture, screenshots, links

Stretch (optional, only if time allows)
- Gemini wallet SDK toggle (clear instructions)
- Points or raffle airdrop script for attendees
- Simple organizer CSV export
- ENS-like reverse lookup via SNS if trivial

Now implement the full repository. Ensure the README lets anyone on Windows clone, configure .env, run the web app, and interact with devnet. Prefer simplicity and reliability over fancy extras.
```

### What you do locally (Windows, step-by-step)

1) Install prerequisites
- Node.js LTS (18+), Git
- Rust and Cargo: `winget install Rustlang.Rustup` then `rustup default stable`
- Solana CLI: follow docs, then `solana --version` (target 1.18+)
- Anchor CLI: `cargo install --git https://github.com/coral-xyz/anchor avm --locked` then `avm install latest && avm use latest && anchor --version`
- A wallet extension (Phantom). Optionally Gemini wallet.

2) Configure Solana devnet
- PowerShell:
  - `solana config set --url https://api.devnet.solana.com`
  - `solana-keygen new` (or use existing)
  - `solana airdrop 2` (repeat if needed)
  - `solana balance`

3) Bootstrap the repo
- Open this folder in Cursor (or create new `BadgerPassUW`)
- Paste the master prompt above into Cursor; let it scaffold everything
- If asked for inputs (PROGRAM_ID), proceed to deploy first, then update .env

4) Build and deploy the Anchor program (devnet)
- From `anchor/`:
  - `anchor build`
  - `anchor keys list` (note program keypair path)
  - `anchor deploy` (or `anchor upgrade` if redeploying)
- Capture the resulting PROGRAM_ID; add to `.env` and frontend config
- Export IDL JSON to `app/lib/solana/idl.json` (Cursor prompt should handle this)

5) Run the web app
- From `app/`:
  - `npm install` (or `pnpm i`)
  - Copy `.env.example` to `.env.local` and set:
    - `NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com`
    - `NEXT_PUBLIC_PROGRAM_ID=<your PROGRAM_ID>`
  - `npm run dev`
  - Open `http://localhost:3000`

6) Demo flow
- Organizer:
  - Go to `/organizer`, connect wallet, create an event
  - You’re redirected to `/event/[pubkey]` with a QR
- Student:
  - Open `/checkin/[eventPubkey]` on laptop or scan the QR on phone
  - Connect Phantom, click “Check In”
  - See success + link to Solana Explorer
- Verify:
  - Go to `/verify`, paste attendee address + event pubkey → see verification result
- My Badges:
  - Go to `/me` to see all attended events for your wallet

7) Optional: Gemini wallet SDK
- If time allows, enable toggle in settings or navbar
- Confirm check-in works via Gemini wallet as well

8) Ship the polish
- Take screenshots of:
  - Organizer create event
  - Event page with QR
  - Check-in success
  - My Badges
  - Verifier confirmation
- Record a 60–120s Loom walking through the above

### Devpost and judging checkboxes
- Problem statement clearly articulated in README
- Architecture diagram in README (program + PDAs + routes)
- Links: GitHub repo, devnet PROGRAM_ID, Loom demo, screenshots
- Explain verifiability: show PDA seeds and explorer links
- Show double check-in prevention by PDA derivation
- Document how to reproduce locally on Windows in < 10 minutes

### Stretch bounties (only if you’re ahead)
- College.xyz (Solana smart contract): You already use Solana + PDAs. Highlight your Anchor design, PDA model, and tests.
- Gemini: Add Gemini wallet SDK toggle and document it. Run check-in via Gemini.
- Turtle.xyz: If their SDK is simple to drop in (analytics or attestations), add a tiny integration behind a feature flag.

### Tips to keep it simple and 100% working
- Stick to devnet
- Keep strings short (<= 64) to avoid account size pitfalls
- Use explicit PDAs and clear seeds exactly as listed
- Surface helpful UI errors (already checked in; program not found; wallet not connected)
- Pin versions and include an `.env.example`

---

Quick Start (scaffold placeholders)
- `anchor/` and `app/` folders are created as placeholders. After pasting the super-prompt into Cursor, it will implement the full Anchor program and Next.js app as specified.
- See `.env.example` for environment variables to copy into `app/.env.local` when the web app is generated.


