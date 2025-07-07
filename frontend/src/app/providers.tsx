'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { MONAD_CHAIN_ID, MONAD_RPC_URL } from '@/services/api';

const MONAD_RPC_URL_HARDCODED = 'https://testnet-rpc.monad.xyz';

const monadTestnet = {
  id: Number(MONAD_CHAIN_ID), // 10143
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [MONAD_RPC_URL_HARDCODED] },
    public: { http: [MONAD_RPC_URL_HARDCODED] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
};

// Move these outside the component!
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(MONAD_RPC_URL_HARDCODED, {
      timeout: 10000, // 10 second timeout
    }),
  },
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 