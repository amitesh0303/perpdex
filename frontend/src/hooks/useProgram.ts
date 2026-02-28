'use client';
import { useCallback, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PROGRAM_ID } from '@/lib/constants';
import { useTradingStore } from '@/store/trading';
import { PositionSide } from '@/types';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { setLoading, setError, updateUserStats, addPosition, removePosition } = useTradingStore();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
  }, [connection, wallet]);

  const getExchangePDA = useCallback(async () => {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('exchange')],
      new PublicKey(PROGRAM_ID)
    );
    return pda;
  }, []);

  const getUserAccountPDA = useCallback(async (exchangePDA: PublicKey, userPubkey: PublicKey) => {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('user_account'), exchangePDA.toBuffer(), userPubkey.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );
    return pda;
  }, []);

  const deposit = useCallback(async (amount: number) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      updateUserStats({ totalBalance: amount, freeCollateral: amount });
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, setLoading, setError, updateUserStats]);

  const withdraw = useCallback(async (amount: number) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      updateUserStats({ totalBalance: 0, freeCollateral: 0 });
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, setLoading, setError, updateUserStats]);

  const openPosition = useCallback(async (
    marketSymbol: string,
    side: PositionSide,
    size: number,
    leverage: number,
    entryPrice: number
  ) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const margin = size / leverage;
      const liqPrice = side === 'long'
        ? entryPrice * (1 - 1 / leverage)
        : entryPrice * (1 + 1 / leverage);
      
      addPosition({
        id: `${marketSymbol}-${Date.now()}`,
        marketSymbol,
        side,
        size,
        entryPrice,
        markPrice: entryPrice,
        margin,
        leverage,
        liquidationPrice: liqPrice,
        pnl: 0,
        pnlPercent: 0,
        marginRatio: 1 / leverage,
      });
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, setLoading, setError, addPosition]);

  const closePosition = useCallback(async (positionId: string) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      removePosition(positionId);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, setLoading, setError, removePosition]);

  const addMargin = useCallback(async (positionId: string, amount: number) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      void positionId;
      void amount;
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, setLoading]);

  const removeMargin = useCallback(async (positionId: string, amount: number) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      void positionId;
      void amount;
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, setLoading]);

  const fetchUserAccount = useCallback(async () => {
    if (!wallet.publicKey || !provider) return null;
    return null;
  }, [wallet.publicKey, provider]);

  void getExchangePDA;
  void getUserAccountPDA;

  return {
    deposit,
    withdraw,
    openPosition,
    closePosition,
    addMargin,
    removeMargin,
    fetchUserAccount,
    isConnected: !!wallet.publicKey,
  };
}
