'use client';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const AppWalletProviderInner = dynamic(
  () => import('@/components/WalletProvider').then((m) => m.AppWalletProvider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return <AppWalletProviderInner>{children}</AppWalletProviderInner>;
}
