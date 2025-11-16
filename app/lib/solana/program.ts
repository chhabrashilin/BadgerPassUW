import { AnchorProvider, BN, Idl, Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./idl.json";

export type EventAccount = {
  organizer: string;
  title: string;
  timestamp: number;
  location: string;
  bump: number;
  eventId: string;
};

export type AttendanceAccount = {
  event: string;
  attendee: string;
  checkedInAt: number;
  bump: number;
};

export function getProgram(provider: AnchorProvider) {
  const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programIdStr) throw new Error("Missing NEXT_PUBLIC_PROGRAM_ID");
  const programId = new PublicKey(programIdStr);
  return new Program(idl as Idl, programId, provider);
}

export function getProvider(connection: Connection, wallet: any) {
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

export function deriveEventPda(organizer: PublicKey, eventId: BN, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("event"), organizer.toBuffer(), eventId.toArrayLike(Buffer, "le", 8)],
    programId
  )[0];
}

export function deriveAttendancePda(event: PublicKey, attendee: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("attendance"), event.toBuffer(), attendee.toBuffer()],
    programId
  )[0];
}


