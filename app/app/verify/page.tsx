"use client";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { FormEvent, useState } from "react";

export default function VerifyPage() {
  const { connection } = useConnection();
  const [eventKey, setEventKey] = useState("");
  const [attendee, setAttendee] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const programId = process.env.NEXT_PUBLIC_PROGRAM_ID!;
      const programKey = new PublicKey(programId);
      const eventPubkey = new PublicKey(eventKey);
      const attendeeKey = new PublicKey(attendee);
      const [attendancePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("attendance"), eventPubkey.toBuffer(), attendeeKey.toBuffer()],
        programKey
      );
      const acct = await connection.getAccountInfo(attendancePda);
      setResult(!!acct);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <h2 className="text-xl font-semibold">Verify attendance</h2>
      <form onSubmit={onVerify} className="space-y-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Event Pubkey"
          value={eventKey}
          onChange={(e) => setEventKey(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Attendee Wallet Address"
          value={attendee}
          onChange={(e) => setAttendee(e.target.value)}
        />
        <button className="px-4 py-2 bg-uw-red text-white rounded" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
      {result !== null && (
        <p className={result ? "text-green-700" : "text-red-600"}>
          {result ? "Attendance found (on-chain)" : "No attendance record"}
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </main>
  );
}


