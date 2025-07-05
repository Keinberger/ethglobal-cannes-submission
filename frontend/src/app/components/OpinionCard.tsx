'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { sepolia } from 'viem/chains';
import { usePrices } from '../hooks/usePrices';
import { useEntermarket } from '../hooks/useEnterMarket';
import { useExitMarket } from '../hooks/useExitMarket';

export default function OpinionCard() {
  const { isConnected, address } = useAccount();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [stance, setStance] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const publicClient = usePublicClient({ chainId: sepolia.id });

  const { 
    historicalPrices, 
    latestUpPriceUSD, 
    loading, 
    error, 
    priceCount,
    fetchRecentPrices 
  } = usePrices();

  const {
    enterMarket,
    transactionState: enterTransactionState,
    isPending: isEnterPending,
    isSuccess: isEnterSuccess,
    isError: isEnterError,
    resetTransaction: resetEnterTransaction,
    hash: enterHash
  } = useEntermarket();

  const {
    exitMarket,
    transactionState: exitTransactionState,
    isPending: isExitPending,
    isSuccess: isExitSuccess,
    isError: isExitError,
    resetTransaction: resetExitTransaction,
    hash: exitHash
  } = useExitMarket();

  // Use the appropriate transaction state based on mode
  const transactionState = mode === 'buy' ? enterTransactionState : exitTransactionState;
  const isPending = mode === 'buy' ? isEnterPending : isExitPending;
  const isSuccess = mode === 'buy' ? isEnterSuccess : isExitSuccess;
  const isError = mode === 'buy' ? isEnterError : isExitError;
  const hash = mode === 'buy' ? enterHash : exitHash;

  // Function to refresh data after 2 blocks
  const refreshAfterBlocks = async (transactionHash: string) => {
    if (!publicClient) return;

    try {
      console.log('Waiting for 2 blocks after transaction:', transactionHash);
      
      // Get the current block number
      const currentBlock = await publicClient.getBlockNumber();
      const targetBlock = currentBlock + 2n;
      
      // Wait for 2 blocks to be mined
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 30 attempts (about 5 minutes)
      
      const checkBlock = async () => {
        const latestBlock = await publicClient.getBlockNumber();
        
        if (latestBlock >= targetBlock) {
          console.log('2 blocks confirmed, refreshing data...');
          // Refresh prices and balances
          await fetchRecentPrices();
          // Trigger a page refresh to update balances
          window.location.reload();
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait 10 seconds before checking again
          setTimeout(checkBlock, 10000);
        } else {
          console.log('Timeout waiting for 2 blocks, refreshing anyway...');
          await fetchRecentPrices();
          window.location.reload();
        }
      };
      
      checkBlock();
    } catch (error) {
      console.error('Error in refreshAfterBlocks:', error);
      // Fallback: refresh immediately
      await fetchRecentPrices();
      window.location.reload();
    }
  };

  // Effect to trigger refresh after successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      refreshAfterBlocks(hash);
    }
  }, [isSuccess, hash, publicClient, fetchRecentPrices]);

  // Use real prices from hook if available, otherwise fallback to mock
  const yesPrice = latestUpPriceUSD || 0.68;
  const noPrice = latestUpPriceUSD ? 1 - latestUpPriceUSD : 0.32;

  const handleSubmit = async () => {
    if (!isConnected) {
      // The user will need to connect their wallet through RainbowKit's ConnectButton
      console.log('User needs to connect wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.log('Invalid amount');
      return;
    }

    try {
      const usdAmount = parseFloat(amount);
      const isUpPosition = stance === 'yes';

      console.log('Submitting opinion transaction:', {
        mode,
        stance,
        usdAmount,
        isUpPosition,
        comment,
        address
      });

      if (mode === 'buy') {
        // Convert USD amount to USDC (6 decimals) for buying
        const usdcAmount = BigInt(Math.floor(usdAmount * 1e6));
        
        console.log('Buying position with USDC amount:', usdcAmount.toString());
        
        // Send the enterMarket transaction
        await enterMarket({
          usdcAmount,
          minAmountOut: 0n,
          up: isUpPosition,
        });
      } else {
        // For selling, we need to convert USD amount to token amount (18 decimals)
        const tokenAmount = BigInt(Math.floor(usdAmount * 1e18));
        
        console.log('Selling position with token amount:', tokenAmount.toString());
      
        // Send the exitMarket transaction
        await exitMarket({
          burnAmount: tokenAmount,
          up: isUpPosition,
        });
      }

      console.log('Transaction submitted successfully');
      
      // Reset form on success
      if (isSuccess) {
        setAmount('');
        setComment('');
        setShowComment(false);
      }

    } catch (error) {
      console.error('Failed to submit opinion:', error);
    }
  };

  const resetTransaction = () => {
    if (mode === 'buy') {
      resetEnterTransaction();
    } else {
      resetExitTransaction();
    }
  };

  // Handle transaction state changes
  const getButtonText = () => {
    if (!isConnected) {
      return 'Connect Wallet to Voice Opinion';
    }
    
    if (isPending) {
      return mode === 'buy' ? 'Submitting Opinion...' : 'Selling Position...';
    }
    
    if (isSuccess) {
      return mode === 'buy' ? 'Opinion Submitted!' : 'Position Sold!';
    }
    
    if (isError) {
      return 'Transaction Failed - Try Again';
    }
    
    return mode === 'buy' ? 'Voice Opinion' : 'Sell Position';
  };

  const getButtonClass = () => {
    if (!isConnected) {
      return 'bg-indigo-500 hover:bg-indigo-600';
    }
    
    if (isPending) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    
    if (isSuccess) {
      return 'bg-green-600 cursor-not-allowed';
    }
    
    if (isError) {
      return 'bg-red-600 hover:bg-red-700';
    }
    
    return mode === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-2">
      {/* Transaction Status */}
      {transactionState.status !== 'idle' && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          transactionState.status === 'pending' ? 'bg-blue-50 text-blue-700' :
          transactionState.status === 'success' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          {transactionState.status === 'pending' && 'Transaction pending...'}
          {transactionState.status === 'success' && 'Transaction successful!'}
          {transactionState.status === 'error' && `Transaction failed: ${transactionState.error}`}
        </div>
      )}

      {/* Compact Buy/Sell Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('buy')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'buy'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'sell'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Yes/No Buttons with Prices */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={() => setStance('yes')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              stance === 'yes'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">Yes</div>
              <div className="text-lg font-bold text-green-600">${yesPrice.toFixed(2)}</div>
            </div>
          </button>
          <button
            onClick={() => setStance('no')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              stance === 'no' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">No</div>
              <div className="text-lg font-bold text-red-600">${noPrice.toFixed(2)}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
            $
          </span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending}
          />
        </div>
        <p className="text-xs text-gray-500">
          This will be converted to USDC (6 decimals) for the transaction
        </p>
      </div>

      {/* Comment Dropdown */}
      <div className="space-y-2">
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isPending}
        >
          <span className="text-sm font-medium text-gray-700">Add reasoning (optional)</span>
          <svg
            className={`w-4 h-4 transition-transform ${showComment ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showComment && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share why you feel this way..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isPending}
          />
        )}
      </div>

      {/* Debug Button for Testing */}
      <button
        onClick={fetchRecentPrices}
        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors mb-2"
        disabled={isPending}
      >
        {loading ? 'Fetching Prices...' : 'Fetch Recent Prices (Debug)'}
      </button>

      {/* Reset Transaction Button */}
      {(isSuccess || isError) && (
        <button
          onClick={resetTransaction}
          className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors mb-2"
        >
          Reset Transaction State
        </button>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className={`w-full px-6 py-4 rounded-lg text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${getButtonClass()}`}
        disabled={!isConnected || isPending || (isConnected && (!amount || parseFloat(amount) <= 0))}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
