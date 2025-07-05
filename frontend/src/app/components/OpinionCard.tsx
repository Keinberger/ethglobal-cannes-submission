'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrices } from '../hooks/usePrices';
import { useEntermarket } from '../hooks/useEnterMarket';

export default function OpinionCard() {
  const { isConnected, address } = useAccount();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [stance, setStance] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

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
    transactionState,
    isPending,
    isSuccess,
    isError,
    resetTransaction
  } = useEntermarket();

  // Debug logging
  console.log('=== usePrices Hook Debug ===');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Price count:', priceCount);
  console.log('Latest UP price USD:', latestUpPriceUSD);
  console.log('Historical prices:', historicalPrices);
  console.log('===========================');

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
      // Convert USD amount to USDC (6 decimals)
      const usdAmount = parseFloat(amount);
      const usdcAmount = BigInt(Math.floor(usdAmount * 1e6)); // Convert to USDC with 6 decimals
      // Determine if this is an UP or DOWN position
      const isUpPosition = stance === 'yes';

      console.log('Submitting opinion transaction:', {
        mode,
        stance,
        usdAmount,
        usdcAmount: usdcAmount.toString(),
        minAmountOut: 0n,
        isUpPosition,
        comment,
        address
      });

      // Send the EIP-7702 transaction
      await enterMarket({
        usdcAmount,
        minAmountOut: 0n,
        up: isUpPosition,
      });

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

  // Handle transaction state changes
  const getButtonText = () => {
    if (!isConnected) {
      return 'Connect Wallet to Voice Opinion';
    }
    
    if (isPending) {
      return 'Submitting Opinion...';
    }
    
    if (isSuccess) {
      return 'Opinion Submitted!';
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
