import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("badgerpass", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.Badgerpass as Program;

  const organizer = provider.wallet as anchor.Wallet;
  const attendee = anchor.web3.Keypair.generate();

  it("creates event and checks in once", async () => {
    // Airdrop to attendee
    const sig = await provider.connection.requestAirdrop(attendee.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig);

    const eventId = new anchor.BN(1);
    const [eventPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.publicKey.toBuffer(), eventId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .createEvent("Test", new anchor.BN(1), "UW", eventId)
      .accounts({
        organizer: organizer.publicKey,
        event: eventPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const event = await program.account.event.fetch(eventPda);
    expect(event.organizer.toBase58()).to.eq(organizer.publicKey.toBase58());
    expect(event.title).to.eq("Test");

    const [attendancePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendance"), eventPda.toBuffer(), attendee.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .checkIn()
      .accounts({
        attendee: attendee.publicKey,
        event: eventPda,
        attendance: attendancePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([attendee])
      .rpc();

    const attendance = await program.account.attendance.fetch(attendancePda);
    expect(attendance.attendee.toBase58()).to.eq(attendee.publicKey.toBase58());

    // Double check-in should fail to init the same PDA
    let failed = false;
    try {
      await program.methods
        .checkIn()
        .accounts({
          attendee: attendee.publicKey,
          event: eventPda,
          attendance: attendancePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([attendee])
        .rpc();
    } catch {
      failed = true;
    }
    expect(failed).to.eq(true);
  });
});


