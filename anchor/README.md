BadgerPassUW Anchor Program
===========================

This directory will contain the Solana Anchor program `badgerpass` as described in the root `README.md`.

Next actions (run after pasting the super‑prompt in Cursor):
1. Initialize workspace:
   - `anchor init badgerpass`
2. Implement accounts and instructions:
   - Event PDA and Attendance PDA
   - `create_event` and `check_in`
3. Add tests (create event, check-in once, double-check-in fails)
4. Build and deploy to devnet:
   - `anchor build`
   - `anchor deploy`
5. Export PROGRAM_ID and IDL to the frontend (`app/lib/solana/idl.json`).


