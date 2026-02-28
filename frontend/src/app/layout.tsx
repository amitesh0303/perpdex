import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'PerpDex | Decentralized Perpetual Futures on Solana',
  description: 'Trade SOL, BTC, ETH perpetual futures with up to 20x leverage on Solana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
