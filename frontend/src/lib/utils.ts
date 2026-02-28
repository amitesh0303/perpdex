import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

export function formatUSDC(amount: number): string {
  return `$${formatPrice(amount / 1_000_000)}`;
}

export function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${formatUSDC(pnl)}`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function calculateLiquidationPrice(
  side: 'long' | 'short',
  entryPrice: number,
  leverage: number
): number {
  if (side === 'long') {
    return entryPrice * (1 - 1 / leverage);
  } else {
    return entryPrice * (1 + 1 / leverage);
  }
}

export function calculatePnl(
  side: 'long' | 'short',
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  if (side === 'long') {
    return ((currentPrice - entryPrice) / entryPrice) * size;
  } else {
    return ((entryPrice - currentPrice) / entryPrice) * size;
  }
}

export function calculateMarginRatio(margin: number, positionValue: number): number {
  if (positionValue === 0) return 0;
  return margin / positionValue;
}
