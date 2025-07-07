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

  return (
    <div className="mb-4 p-3 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm font-medium">
          {isCorrectNetwork ? 'Connected to Monad Testnet' : 'Wrong Network'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Chain ID: {chainId} {isCorrectNetwork ? '(Correct)' : `(Expected: ${MONAD_CHAIN_ID})`}
      </p>
    </div>
  );
}; 