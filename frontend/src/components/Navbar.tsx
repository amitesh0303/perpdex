'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const NAV_LINKS = [
  { href: '/trade', label: 'Trade' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/liquidate', label: 'Liquidate' },
  { href: '/admin', label: 'Admin' },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <Zap className="w-6 h-6 text-blue-400" />
            PerpDex
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === href
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !text-sm !h-9 !py-0" />
      </div>
    </nav>
  );
}
