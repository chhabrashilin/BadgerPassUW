"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function MyBadges() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [events, setEvents] = useState<string[]>([]);
  const attendee = publicKey;

  useEffect(() => {
    if (!attendee) return;
    let cancelled = false;
    (async () => {
      const programId = process.env.NEXT_PUBLIC_PROGRAM_ID!;
      const programKey = new PublicKey(programId);
      const accounts = await connection.getProgramAccounts(programKey, {
        filters: [
          { dataSize: 8 + (32 + 32 + 8 + 1) }, // Attendance size
          {
            memcmp: {
              offset: 8 + 32, // attendee after event pubkey
              bytes: attendee.toBase58(),
            },
          },
        ],
      });
      const eventKeys = accounts.map((a) => {
        const eventBytes = a.account.data.slice(8, 8 + 32);
        return new PublicKey(eventBytes).toBase58();
      });
      if (!cancelled) setEvents(eventKeys);
    })();
    return () => {
      cancelled = true;
    };
  }, [attendee, connection]);

  if (!attendee) {
    return <p>Connect your wallet to view your badges.</p>;
  }

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">My Badges</h2>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e} className="p-3 border rounded break-all">
            <div className="flex items-center justify-between">
              <span className="text-xs">{e}</span>
              <Link className="underline text-sm" href={`/event/${e}`}>
                View
              </Link>
            </div>
          </li>
        ))}
        {events.length === 0 && <li className="text-sm text-gray-600">No badges yet.</li>}
      </ul>
    </main>
  );
}


