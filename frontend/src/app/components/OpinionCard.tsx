'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrices } from '../hooks/usePrices';
import { useEntermarket } from '../hooks/useEnterMarket';
import { useExitMarket } from '../hooks/useExitMarket';
import { TokenBalances } from '../hooks/useTokenBalances';

interface OpinionCardProps {
  balances: TokenBalances;
  refetchBalances: () => Promise<void>;
}

export default function OpinionCard({ balances, refetchBalances }: OpinionCardProps) {
  const { isConnected, address } = useAccount();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [stance, setStance] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const { 
    latestUpPriceUSD, 
    fetchRecentPrices 
  } = usePrices();

  const {
    enterMarket,
    isPending: isEnterPending,
    isSuccess: isEnterSuccess,
    isError: isEnterError,
    resetTransaction: resetEnterTransaction,
    hash: enterHash
  } = useEntermarket();

  const {
    exitMarket,
    isPending: isExitPending,
    isSuccess: isExitSuccess,
    isError: isExitError,
    resetTransaction: resetExitTransaction,
    hash: exitHash
  } = useExitMarket();

  // Use the appropriate transaction state based on mode
  const isPending = mode === 'buy' ? isEnterPending : isExitPending;
  const isSuccess = mode === 'buy' ? isEnterSuccess : isExitSuccess;
  const isError = mode === 'buy' ? isEnterError : isExitError;
  const hash = mode === 'buy' ? enterHash : exitHash;

  // Function to refresh data after 2 blocks


  // Effect to handle transaction completion and refresh data
  useEffect(() => {
    if (isSuccess && hash) {
      console.log('Transaction successful, refreshing data...');
      
      // Immediately refresh data when transaction is mined
      fetchRecentPrices();
      refetchBalances();
      
      // Reset transaction state after a short delay
      setTimeout(() => {
        resetTransaction();
      }, 2000);
    }
  }, [isSuccess, hash, fetchRecentPrices, refetchBalances]);

  // Use real prices from hook if available, otherwise fallback to mock
  const yesPrice = latestUpPriceUSD || 0.68;
  const noPrice = latestUpPriceUSD ? 1 - latestUpPriceUSD : 0.32;

  // Calculate position values for percentage buttons
  // Since 1 UP + 1 DOWN = 2 USDC, we need to convert the ratio to actual USD value
  const calculatePositionValue = () => {
    if (!latestUpPriceUSD) return 0;
    
    if (stance === 'yes') {
      // UP position value = UP tokens * (UP ratio * 2 USDC)
      return Number(balances.up) / 1e18 * latestUpPriceUSD * 2;
    } else {
      // DOWN position value = DOWN tokens * (DOWN ratio * 2 USDC)
      return Number(balances.down) / 1e18 * (1 - latestUpPriceUSD) * 2;
    }
  };

  const positionValue = calculatePositionValue();

  // Handle percentage button clicks
  const handlePercentageClick = (percentage: number) => {
    if (percentage === 100) {
      // For 100%, use the exact token balance to avoid dust
      if (stance === 'yes') {
        // UP position: convert UP tokens to USD value
        const upTokens = Number(balances.up) / 1e18;
        const upRatio = latestUpPriceUSD || 0.68;
        const exactUSDValue = upTokens * upRatio * 2; // Convert ratio to USD (1 UP + 1 DOWN = 2 USDC)
        setAmount(exactUSDValue.toString());
      } else {
        // DOWN position: convert DOWN tokens to USD value
        const downTokens = Number(balances.down) / 1e18;
        const downRatio = latestUpPriceUSD ? 1 - latestUpPriceUSD : 0.32;
        const exactUSDValue = downTokens * downRatio * 2; // Convert ratio to USD (1 UP + 1 DOWN = 2 USDC)
        setAmount(exactUSDValue.toString());
      }
    } else {
      // For other percentages, use the calculated position value
      const targetAmount = (positionValue * percentage / 100).toFixed(2);
      setAmount(targetAmount);
    }
  };

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
        // For selling, we need to convert USD amount to token amount based on current price
        let tokenAmount: bigint;
        let tokenAmountFloat: number;
        
        if (isUpPosition) {
          // Selling UP tokens: USD amount / (UP ratio * 2 USDC)
          const upRatio = latestUpPriceUSD || 0.68;
          tokenAmountFloat = usdAmount / (upRatio * 2);
          tokenAmount = BigInt(Math.floor(tokenAmountFloat * 1e18));
        } else {
          // Selling DOWN tokens: USD amount / (DOWN ratio * 2 USDC)
          const downRatio = latestUpPriceUSD ? 1 - latestUpPriceUSD : 0.32;
          tokenAmountFloat = usdAmount / (downRatio * 2);
          tokenAmount = BigInt(Math.floor(tokenAmountFloat * 1e18));
        }
        
        console.log('Selling position - Token conversion:', {
          usdAmount,
          isUpPosition,
          currentRatio: isUpPosition ? (latestUpPriceUSD || 0.68) : (latestUpPriceUSD ? 1 - latestUpPriceUSD : 0.32),
          tokenAmountFloat,
          tokenAmountRaw: tokenAmount.toString(),
          tokenAmountFormatted: (Number(tokenAmount) / 1e18).toFixed(6)
        });
      
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
      return 'Voice Opinion';
    }
    
    if (isPending) {
      return 'Submitting...';
    }
    
    if (isSuccess) {
      return mode === 'buy' ? 'Voice Opinion' : 'Sell Position';
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
      return mode === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';
    }
    
    if (isError) {
      return 'bg-red-600 hover:bg-red-700';
    }
    
    return mode === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-2">

      {/* Compact Buy/Sell Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('buy')}
          className={`px-6 py-2 rounded-md text-sm transition-all ${
            mode === 'buy'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`px-6 py-2 rounded-md text-sm transition-all ${
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
              <div className="text-sm text-gray-900">Yes</div>
              <div className="text-lg text-green-600">${yesPrice.toFixed(2)}</div>
            </div>
          </button>
          <button
            onClick={() => setStance('no')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              stance === 'no' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <div className="text-center">
              <div className="text-sm text-gray-900">No</div>
              <div className="text-lg text-red-600">${noPrice.toFixed(2)}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <label className="text-sm text-gray-700">Amount (USD)</label>
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

        {/* Percentage Selection Buttons - Only show in sell mode */}
        {mode === 'sell' && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              Available position: ${(positionValue).toFixed(2)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePercentageClick(25)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isPending}
              >
                25%
              </button>
              <button
                onClick={() => handlePercentageClick(50)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isPending}
              >
                50%
              </button>
              <button
                onClick={() => handlePercentageClick(100)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isPending}
              >
                100%
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comment Dropdown */}
      {mode === 'buy' && 
      (<div className="space-y-2">
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isPending}
        >
          <span className="text-sm text-gray-700">Add reasoning (optional)</span>
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
      </div>)}



      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className={`w-full px-6 py-4 rounded-lg text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${getButtonClass()}`}
        disabled={!isConnected || isPending || (isConnected && (!amount || parseFloat(amount) <= 0))}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
