'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { MONAD_CHAIN_ID } from '@/services/api';

export function ChainValidator() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  if (!chain) return null;

  if (chain.id !== Number(MONAD_CHAIN_ID)) {
    return (
      <div className="bg-yellow-600 text-white p-4 text-center">
        <p>Please switch to Monad Testnet to use this app.</p>
        <p>Expected Chain ID: {MONAD_CHAIN_ID}, Current: {chain.id}</p>
        <button
          onClick={() => switchChain({ chainId: Number(MONAD_CHAIN_ID) })}
          className="mt-2 bg-white text-yellow-600 px-4 py-2 rounded font-bold"
        >
          Switch Network
        </button>
      </div>
    );
  }

  return null;
} 