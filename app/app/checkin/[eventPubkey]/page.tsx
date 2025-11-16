"use client";
import { useAnchor } from "../../../lib/solana/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";

export default function CheckInPage({ params }: { params: { eventPubkey: string } }) {
  const { program } = useAnchor();
  const { publicKey, connected } = useWallet();
  const eventKey = useMemo(() => new PublicKey(params.eventPubkey), [params.eventPubkey]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const onCheckIn = async () => {
    try {
      setError(null);
      setStatus("Checking in...");
      if (!connected || !publicKey) throw new Error("Connect your wallet");
      if (!program) throw new Error("Program not ready");
      await program.methods
        .checkIn()
        .accounts({
          attendee: publicKey,
          event: eventKey,
        })
        .rpc();
      setStatus("Success! Your attendance is on-chain.");
    } catch (e: any) {
      setError(e.message || "Failed to check in");
      setStatus("");
    }
  };

  return (
    <main className="space-y-6">
      <h2 className="text-xl font-semibold break-all">Check in for event</h2>
      <p className="text-xs break-all">{eventKey.toBase58()}</p>
      <button onClick={onCheckIn} className="px-4 py-2 bg-uw-red text-white rounded">
        Check In
      </button>
      {status && <p className="text-green-700">{status}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </main>
  );
}


