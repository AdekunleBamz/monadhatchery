import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { MONAD_CHAIN_ID } from '@/services/api';

export const NetworkStatus: React.FC = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  if (!isConnected) {
    return null;
  }

  const isCorrectNetwork = chainId === Number(MONAD_CHAIN_ID);

  if (!isConnected || !isCorrectNetwork) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="font-bold text-white">Connected to Monad Testnet</span>
    </div>
  );
}; 