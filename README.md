# PerpDex

A decentralized perpetual futures exchange on Solana with up to 20x leverage on SOL, BTC, and ETH.

## Architecture

- **Anchor Program** (`programs/perpdex/`) — Rust/Anchor smart contract with PDAs for Exchange, Market, UserAccount, Position, and Vault
- **Next.js Frontend** (`frontend/`) — Next.js 16 App Router, TypeScript, Tailwind CSS, Zustand state

## Quick Start

### Prerequisites

- [Rust & Cargo](https://rustup.rs/) 1.79+
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) 1.18+
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) 0.30.1
- Node.js 20+ and pnpm

### Smart Contract (Anchor Program)

```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1 && avm use 0.30.1

# Build
anchor build

# Deploy to devnet
solana config set --url devnet
anchor deploy

# Run tests
anchor test
```

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_PROGRAM_ID to your deployed program address

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_PROGRAM_ID` | Deployed Anchor program ID | `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` |
| `NEXT_PUBLIC_CLUSTER` | Solana cluster | `devnet` |
| `NEXT_PUBLIC_HELIUS_API_KEY` | Helius RPC API key (optional) | — |

## Features

- 🔄 Long/short perpetual futures on SOL, BTC, ETH
- 📈 Up to 20x leverage with automatic liquidation
- 💰 Non-custodial USDC vault
- 🔮 Pyth Network oracle price feeds
- 📊 TradingView Lightweight Charts
- 👛 Phantom & Solflare wallet support
- 🛡️ On-chain liquidation engine with insurance fund

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/trade` | Trading interface |
| `/portfolio` | User portfolio & trade history |
| `/liquidate` | Liquidation dashboard |
| `/admin` | Admin panel (admin only) |

## Program Accounts (PDAs)

| Account | Seeds | Purpose |
|---------|-------|---------|
| Exchange | `["exchange"]` | Global config |
| Market | `["market", exchange, market_index]` | Per-market state |
| UserAccount | `["user_account", exchange, user]` | User collateral & stats |
| Position | `["position", market, user]` | Open position |
| Vault | `["vault", exchange]` | USDC vault authority |

## ⚠️ Disclaimer

This is experimental software deployed on devnet. Do not use real funds. Smart contracts have not been audited.