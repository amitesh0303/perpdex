import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <Zap className="w-6 h-6 text-blue-400" />
          PerpDex
        </Link>
        <div className="flex items-center gap-4">
          <Link href="#features" className="text-gray-400 hover:text-white text-sm">Features</Link>
          <Link href="#markets" className="text-gray-400 hover:text-white text-sm">Markets</Link>
          <Link href="/trade">
            <Button size="sm">Launch App</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
