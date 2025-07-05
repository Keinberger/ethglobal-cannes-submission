'use client';

import { usePrivy } from '@privy-io/react-auth';
import { WalletConnectionButton } from '../lib/walletConnection';

export default function LoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          {user?.email?.address || user?.wallet?.address?.slice(0, 8) + '...'}
        </span>
        <WalletConnectionButton />
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
    >
      Login
    </button>
  );
}
