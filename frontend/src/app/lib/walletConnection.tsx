'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

export function useWalletConnection() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [isConnecting, setIsConnecting] = useState(false);

  const primaryWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const hasWallet = wallets.length > 0;

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (primaryWallet) {
        await primaryWallet.connect();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (primaryWallet) {
        await primaryWallet.disconnect();
      }
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return {
    ready,
    authenticated,
    user,
    hasWallet,
    primaryWallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    wallets,
  };
}

export function WalletConnectionButton() {
  const {
    ready,
    authenticated,
    hasWallet,
    primaryWallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useWalletConnection();

  if (!ready || !authenticated) {
    return null;
  }

  if (!hasWallet) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">
        {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
      </span>
      <button
        onClick={disconnectWallet}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
      >
        Disconnect
      </button>
    </div>
  );
}
