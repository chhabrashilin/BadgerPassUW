\"use client\";
import { AnchorProvider, BN } from \"@project-serum/anchor\";
import { useMemo } from \"react\";
import { Connection, PublicKey } from \"@solana/web3.js\";
import { useConnection, useWallet } from \"@solana/wallet-adapter-react\";
import { getProgram } from \"./program\";

export function useAnchor() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection as Connection, wallet as any, {
      commitment: \"confirmed\",
    });
  }, [connection, wallet]);
  const program = useMemo(() => {
    if (!provider) return null;
    return getProgram(provider);
  }, [provider]);
  return { provider, program, wallet };
}

export async function createEvent(
  organizer: PublicKey,
  title: string,
  timestamp: number,
  location: string,
  eventId: BN,
  program: any
) {
  const eventPda = await program.methods
    .createEvent(title, new BN(timestamp), location, eventId)
    .accounts({
      organizer,
    })
    .pubkeys();
  await program.methods
    .createEvent(title, new BN(timestamp), location, eventId)
    .accounts({
      organizer,
      event: eventPda.event,
    })
    .rpc();
  return eventPda.event as PublicKey;
}

export async function checkIn(attendee: PublicKey, event: PublicKey, program: any) {
  const accounts = await program.methods.checkIn().accounts({ attendee, event }).pubkeys();
  await program.methods.checkIn().accounts({ attendee, event, attendance: accounts.attendance }).rpc();
  return accounts.attendance as PublicKey;
}


