'use client';

import { useState } from 'react';
import { usePrivy, useSendTransaction, useWallets } from '@privy-io/react-auth';
import { useEnterMarket } from '../hooks/wagmi/useEnterMarket';
import { useExitMarket } from '../hooks/wagmi/useExitMarket';

export default function DebugPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  
  // Hook instances
  const enterMarketHook = useEnterMarket();
  const exitMarketHook = useExitMarket();
  
  // Local state for form inputs
  const [usdcAmount, setUsdcAmount] = useState<string>('100');
  const [minAmountOut, setMinAmountOut] = useState<string>('0');
  const [burnAmount, setBurnAmount] = useState<string>('50');
  const [position, setPosition] = useState<'up' | 'down'>('up');
  const [txStatus, setTxStatus] = useState<string>('');

  // Get user's wallet address
  const userWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const walletAddress = userWallet?.address;

  const handleBasicTransaction = async () => {
    if (!authenticated) {
      setTxStatus('Please login first');
      return;
    }

    try {
      setTxStatus('Sending basic transaction...');
      const result = await sendTransaction({
        to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C',
        value: 100000
      });
      setTxStatus(`Basic transaction sent: ${result.transactionHash}`);
    } catch (error) {
      setTxStatus(`Basic transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEnterMarket = async () => {
    if (!enterMarketHook.isReady) {
      setTxStatus('Enter market hook not ready');
      return;
    }

    try {
      setTxStatus('Entering market...');
      await enterMarketHook.enterMarket({
        usdcAmount: BigInt(parseInt(usdcAmount) * 1e6), // Convert to USDC decimals (6)
        minAmountOut: BigInt(parseInt(minAmountOut) * 1e18), // Convert to token decimals (18)
        up: position === 'up'
      });
      setTxStatus('Enter market transaction initiated');
    } catch (error) {
      setTxStatus(`Enter market failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExitMarket = async () => {
    if (!exitMarketHook.isReady) {
      setTxStatus('Exit market hook not ready');
      return;
    }

    try {
      setTxStatus('Exiting market...');
      await exitMarketHook.exitMarket({
        burnAmount: BigInt(parseInt(burnAmount) * 1e18), // Convert to token decimals (18)
        up: position === 'up'
      });
      setTxStatus('Exit market transaction initiated');
    } catch (error) {
      setTxStatus(`Exit market failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Debug - Privy Hooks Testing</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Authenticated:</strong> {authenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Wallets:</strong> {wallets.length}</p>
              <p><strong>Wallet Address:</strong> {walletAddress || 'Not available'}</p>
            </div>
            <div>
              <p><strong>Enter Hook Ready:</strong> {enterMarketHook.isReady ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Exit Hook Ready:</strong> {exitMarketHook.isReady ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            {!authenticated ? (
              <button
                onClick={login}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login with Privy
              </button>
            ) : (
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {authenticated && (
          <>
            {/* Basic Transaction Test */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Transaction Test</h2>
              <button
                onClick={handleBasicTransaction}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Send Basic Transaction
              </button>
            </div>

            {/* Enter Market Test */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Enter Market Test</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    USDC Amount
                  </label>
                  <input
                    type="number"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount Out
                  </label>
                  <input
                    type="number"
                    value={minAmountOut}
                    onChange={(e) => setMinAmountOut(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as 'up' | 'down')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="up">UP (Yes)</option>
                  <option value="down">DOWN (No)</option>
                </select>
              </div>

              <button
                onClick={handleEnterMarket}
                disabled={enterMarketHook.isPending || !enterMarketHook.isReady}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {enterMarketHook.isPending ? 'Sending...' : 'Enter Market'}
              </button>

              {/* Enter Market Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p><strong>Status:</strong> {enterMarketHook.isPending ? 'Pending' : enterMarketHook.isSuccess ? 'Success' : enterMarketHook.isError ? 'Error' : 'Idle'}</p>
                <p><strong>Hash:</strong> {enterMarketHook.hash || 'None'}</p>
                {enterMarketHook.transactionState.error && (
                  <p className="text-red-600"><strong>Error:</strong> {enterMarketHook.transactionState.error}</p>
                )}
              </div>
            </div>

            {/* Exit Market Test */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Exit Market Test</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Burn Amount (tokens)
                </label>
                <input
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="50"
                />
              </div>

              <button
                onClick={handleExitMarket}
                disabled={exitMarketHook.isPending || !exitMarketHook.isReady}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {exitMarketHook.isPending ? 'Sending...' : 'Exit Market'}
              </button>

              {/* Exit Market Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p><strong>Status:</strong> {exitMarketHook.isPending ? 'Pending' : exitMarketHook.isSuccess ? 'Success' : exitMarketHook.isError ? 'Error' : 'Idle'}</p>
                <p><strong>Hash:</strong> {exitMarketHook.hash || 'None'}</p>
                {exitMarketHook.transactionState.error && (
                  <p className="text-red-600"><strong>Error:</strong> {exitMarketHook.transactionState.error}</p>
                )}
              </div>
            </div>

            {/* Global Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Global Status</h2>
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Current Status:</strong> {txStatus || 'Ready'}</p>
              </div>
            </div>

            {/* Reset Buttons */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={enterMarketHook.resetTransaction}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset Enter Market
              </button>
              <button
                onClick={exitMarketHook.resetTransaction}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset Exit Market
              </button>
            </div>
          </>
        )}

        {/* Debug JSON */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(
                {
                  authenticated,
                  userId: user?.id,
                  walletAddress,
                  walletsCount: wallets.length,
                  enterMarket: {
                    isReady: enterMarketHook.isReady,
                    isPending: enterMarketHook.isPending,
                    isSuccess: enterMarketHook.isSuccess,
                    isError: enterMarketHook.isError,
                    hash: enterMarketHook.hash,
                  },
                  exitMarket: {
                    isReady: exitMarketHook.isReady,
                    isPending: exitMarketHook.isPending,
                    isSuccess: exitMarketHook.isSuccess,
                    isError: exitMarketHook.isError,
                    hash: exitMarketHook.hash,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}