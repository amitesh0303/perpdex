import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Zap, Shield, TrendingUp, Clock } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Up to 20x Leverage', description: 'Trade with amplified exposure on SOL, BTC, and ETH perpetual futures.' },
  { icon: Shield, title: 'Non-Custodial', description: 'Your funds stay in your control. Smart contracts handle all settlements.' },
  { icon: TrendingUp, title: 'Deep Liquidity', description: 'Powered by Pyth Network oracles for accurate, real-time price feeds.' },
  { icon: Clock, title: 'Fast Settlements', description: 'Sub-second transaction finality on Solana. No waiting, no delays.' },
];

const MOCK_MARKETS = [
  { symbol: 'SOL-PERP', price: '$142.50', change: '+3.2%', positive: true, oi: '$12.4M' },
  { symbol: 'BTC-PERP', price: '$67,890', change: '-0.8%', positive: false, oi: '$48.2M' },
  { symbol: 'ETH-PERP', price: '$3,520', change: '+1.5%', positive: true, oi: '$22.1M' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300">Live on Solana Devnet</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Perps with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              20x Leverage
            </span>
            {' '}on Solana
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            The fastest, most capital-efficient perpetual futures DEX. Trade SOL, BTC, and ETH with deep liquidity and real-time Pyth price feeds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/trade">
              <Button size="lg">Start Trading</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="secondary">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: '24h Volume', value: '$82.7M' },
            { label: 'Open Interest', value: '$82.7M' },
            { label: 'Total Traders', value: '4,291' },
            { label: 'Markets', value: '3' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Why PerpDex?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6 hover:border-blue-500/30 transition-colors">
              <CardContent className="p-0">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Available Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_MARKETS.map((market) => (
            <Card key={market.symbol} className="p-6 hover:border-white/20 transition-colors">
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">{market.symbol}</h3>
                  <span className={`text-sm font-medium ${market.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {market.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">{market.price}</div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Open Interest</span>
                  <span>{market.oi}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/trade">
            <Button>Trade Now</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Connect Wallet', desc: 'Connect your Phantom or Solflare wallet to get started.' },
            { step: '02', title: 'Deposit USDC', desc: 'Deposit USDC as collateral into the trading vault.' },
            { step: '03', title: 'Open Positions', desc: 'Long or short any market with up to 20x leverage.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-5xl font-bold text-blue-400/30 mb-4">{step}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Zap className="w-5 h-5 text-blue-400" />
            PerpDex
          </div>
          <p className="text-sm text-gray-500">© 2025 PerpDex. Built on Solana.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/trade" className="hover:text-white">Trade</Link>
            <Link href="/portfolio" className="hover:text-white">Portfolio</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
