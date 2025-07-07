'use client';

console.log('WalletConnect component loaded');

import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useEffect, useState } from 'react';
import { MONAD_CHAIN_ID } from '@/services/api';

// Helper to prompt wallet to switch/add Monad Testnet
async function switchToMonadTestnet() {
  if (typeof window === 'undefined' || !window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x279f' }], // 10143 in hex
    });
  } catch (switchError) {
    const err = switchError as any;
    if (
      err.code === 4902 ||
      (err.data && err.data.originalError && err.data.originalError.code === 4902)
    ) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x279f',
            chainName: 'Monad Testnet',
            nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
            rpcUrls: ['https://testnet-rpc.monad.xyz'],
            blockExplorerUrls: ['https://testnet.monadexplorer.com'],
          }],
        });
      } catch (addError) {
        const addErr = addError as any;
        alert('Failed to add Monad Testnet: ' + (addErr.message || String(addErr)));
      }
    } else {
      alert('Failed to switch network: ' + (err.message || String(err)));
    }
  }
}

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { connect, error: connectError, isPending, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: address,
  });
  const chainId = useChainId();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for chainChanged events and reload the page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handler = () => window.location.reload();
      window.ethereum.on('chainChanged', handler);
      return () => {
        window.ethereum.removeListener('chainChanged', handler);
      };
    }
  }, []);

  // Debug output
  useEffect(() => {
    console.log({ address, isConnected, chainId, isPending, connectError, balanceData });
  }, [address, isConnected, chainId, isPending, connectError, balanceData]);

  // Custom connect handler: if not on Monad, prompt to switch/add first, then connect
  const handleConnect = async () => {
    if (chainId !== Number(MONAD_CHAIN_ID)) {
      await switchToMonadTestnet();
      // After switching, user may need to click again if wallet doesn't auto-switch
      return;
    }
    try {
      await connect({ connector: injected() });
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes('user rejected')) {
        setRejectionMessage('Wallet connection was rejected. Please approve the request to connect.');
        setTimeout(() => {
          setRejectionMessage(null);
          reset();
        }, 3000);
      } else {
        console.error('Connection error:', error);
      }
    }
  };

  if (!mounted) {
    return null;
  }

  if (isConnected) {
    // If on wrong network, show notice and switch button, hide balance
    if (chainId !== Number(MONAD_CHAIN_ID)) {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm text-yellow-300">
              Wrong network. Please switch to Monad Testnet.
            </p>
          </div>
          <button
            onClick={switchToMonadTestnet}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors"
          >
            Switch/Add Monad Testnet
          </button>
          <button
            onClick={() => disconnect()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      );
    }
    // If on Monad, show balance and normal UI
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-sm text-gray-300">
            {address?.slice(0, 6)}...{address?.slice(-4)}
            {balanceData && (
              <span className="ml-2 text-yellow-300 font-mono">
                {parseFloat(balanceData.formatted).toFixed(4)} MON
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Not connected: if not on Monad, show switch/add button as well
  return (
    <div className="flex flex-col items-end gap-2">
      {chainId !== Number(MONAD_CHAIN_ID) && (
        <button
          onClick={switchToMonadTestnet}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors mb-2"
        >
          Switch/Add Monad Testnet
        </button>
      )}
      <button
        onClick={handleConnect}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors`}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {rejectionMessage && (
        <p className="text-red-500 text-xs text-right animate-pulse">
          {rejectionMessage}
        </p>
      )}
      {connectError && !rejectionMessage && (
        <p className="text-red-500 text-xs text-right">
          {connectError.message}
        </p>
      )}
    </div>
  );
} 