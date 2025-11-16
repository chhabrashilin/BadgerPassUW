"use client";
import { useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import QRCode from "react-qr-code";
import Link from "next/link";

export default function EventDetail({ params }: { params: { eventPubkey: string } }) {
  const { connection } = useConnection();
  const eventKey = useMemo(() => new PublicKey(params.eventPubkey), [params.eventPubkey]);
  const [attendees, setAttendees] = useState<string[]>([]);

  useEffect(() => {
    // naive scan by memcmp on account data; in a real app, use Anchor getProgramAccounts with IDL
    let cancelled = false;
    (async () => {
      const programId = process.env.NEXT_PUBLIC_PROGRAM_ID!;
      const programKey = new PublicKey(programId);
      const accounts = await connection.getProgramAccounts(programKey, {
        filters: [
          { dataSize: 8 + (32 + 32 + 8 + 1) }, // Attendance size
          {
            memcmp: {
              offset: 8, // after discriminator
              bytes: eventKey.toBase58(),
            },
          },
        ],
      });
      const addrs = accounts.map((a) => {
        // attendee pubkey is next 32 bytes after event pubkey (32 bytes)
        const attendeeBytes = a.account.data.slice(8 + 32, 8 + 32 + 32);
        return new PublicKey(attendeeBytes).toBase58();
      });
      if (!cancelled) setAttendees(addrs);
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, eventKey]);

  const checkinUrl = `/checkin/${eventKey.toBase58()}`;

  return (
    <main className="space-y-6">
      <h2 className="text-xl font-semibold break-all">Event: {eventKey.toBase58()}</h2>
      <div className="flex gap-8 flex-col md:flex-row">
        <div className="border rounded p-4 w-fit bg-white">
          <QRCode value={typeof window !== "undefined" ? window.location.origin + checkinUrl : checkinUrl} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">Share this QR to attendees.</p>
          <Link className="underline" href={checkinUrl}>
            Open check-in page
          </Link>
          <div className="mt-6">
            <h3 className="font-semibold">Attendees ({attendees.length})</h3>
            <ul className="text-sm mt-2 space-y-1">
              {attendees.map((a) => (
                <li key={a} className="break-all">{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}


