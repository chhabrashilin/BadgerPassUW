import "./../styles/globals.css";
import { ReactNode } from "react";
import { SolanaWalletProvider } from "../components/WalletProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaWalletProvider>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-uw-red">BadgerPassUW</h1>
              <p className="text-sm text-gray-600">Verifiable, on-chain attendance for campus events.</p>
            </header>
            {children}
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}


