'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { useState } from 'react';

// Create Wagmi config
const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_APP_ID!}
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID!}
        config={{
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
