import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Organizer creates an event on Solana.</li>
          <li>Students scan a QR and check in with their wallet.</li>
          <li>Anyone can verify attendance on-chain.</li>
        </ol>
      </section>
      <div className="flex gap-4">
        <Link href="/organizer" className="px-4 py-2 bg-uw-red text-white rounded">
          I’m an organizer
        </Link>
        <Link href="/me" className="px-4 py-2 border border-uw-red text-uw-red rounded">
          My badges
        </Link>
        <Link href="/verify" className="px-4 py-2 border rounded">
          Verify attendance
        </Link>
      </div>
    </main>
  );
}


