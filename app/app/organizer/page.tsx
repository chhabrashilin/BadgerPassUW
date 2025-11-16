"use client";
import { useAnchor } from "../../lib/solana/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";

export default function OrganizerPage() {
  const { program } = useAnchor();
  const { publicKey, connected } = useWallet();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [eventPubkey, setEventPubkey] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!connected || !publicKey) throw new Error("Connect your wallet");
      if (!program) throw new Error("Program not ready");
      if (!title || !location || !date) throw new Error("All fields required");
      if (title.length > 64 || location.length > 64) throw new Error("Keep fields ≤ 64 chars");
      const ts = Math.floor(new Date(date).getTime() / 1000);
      const eventId = new BN(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
      const sig = await program.methods
        .createEvent(title, new BN(ts), location, eventId)
        .accounts({
          organizer: publicKey,
        })
        .rpc();
      // Derive PDA as program returns only tx; re-derive client-side
      const [eventPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), publicKey.toBuffer(), eventId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      setEventPubkey(eventPda);
    } catch (e: any) {
      setError(e.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <h2 className="text-xl font-semibold">Create an event</h2>
      <div className="space-y-4">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Title (≤ 64)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Location (≤ 64)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-full"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={onCreate}
          className="px-4 py-2 bg-uw-red text-white rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        {eventPubkey && (
          <div className="p-3 border rounded">
            <p className="text-sm">Event created:</p>
            <code className="break-all text-xs">{eventPubkey.toBase58()}</code>
            <div className="mt-3 flex gap-3">
              <Link className="underline" href={`/event/${eventPubkey.toBase58()}`}>
                View event
              </Link>
              <Link className="underline" href={`/checkin/${eventPubkey.toBase58()}`}>
                Open check-in page
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


