'use client';

import { useAccount } from 'wagmi';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { usePrices } from '../hooks/usePrices';
import { SMART_VOTER_CONTRACT_ADDRESS } from '../contracts/constants';

export default function Position() {
  const { isConnected } = useAccount();
  const { balances, loading: balancesLoading, error: balancesError } = useTokenBalances(SMART_VOTER_CONTRACT_ADDRESS);
  const { latestUpPriceUSD, loading: pricesLoading } = usePrices();

  // Calculate position values
  const upPositionValue = latestUpPriceUSD ? Number(balances.up) / 1e18 * latestUpPriceUSD : 0;
  const downPositionValue = latestUpPriceUSD ? Number(balances.down) / 1e18 * (1 - latestUpPriceUSD) : 0;
  const usdcBalanceUSD = Number(balances.usdc) / 1e6;

  const isLoading = balancesLoading || pricesLoading;
  const hasUpPosition = Number(balances.up) > 0;
  const hasDownPosition = Number(balances.down) > 0;
  const hasAnyPosition = hasUpPosition || hasDownPosition;

  if (!isConnected || (!hasAnyPosition && !isLoading)) {
    return null;
  }

  if (balancesError) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-red-200">
        <div className="text-sm text-red-600">Error loading positions</div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Your Position</h3>
        {isLoading && <div className="text-xs text-gray-400">Loading...</div>}
      </div>

      {/* Balance summary */}
      <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-blue-700 font-medium">Balance</span>
        <span className="text-lg font-bold text-blue-900">${usdcBalanceUSD.toFixed(2)}</span>
      </div>

      {/* Positions */}
      {hasAnyPosition && (
        <div className="flex gap-2">
          {hasUpPosition && (
            <div className="flex-1 bg-green-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700">YES</span>
                </div>
                <span className="text-sm font-medium text-green-700">
                  ${upPositionValue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {hasDownPosition && (
            <div className="flex-1 bg-red-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-700">NO</span>
                </div>
                <span className="text-sm font-medium text-red-700">
                  ${downPositionValue.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
