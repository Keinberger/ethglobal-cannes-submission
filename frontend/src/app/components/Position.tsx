'use client';

import { useAccount } from 'wagmi';
import { usePrices } from '../hooks/usePrices';
import { TokenBalances } from '../hooks/useTokenBalances';

interface PositionProps {
  balances: TokenBalances;
  balancesLoading: boolean;
  balancesError: string | null;
}

export default function Position({ balances, balancesLoading, balancesError }: PositionProps) {
  const { isConnected } = useAccount();
  const { latestUpPriceUSD, loading: pricesLoading } = usePrices();



  // Calculate position values
  // latestUpPriceUSD is the USD value of 1 UP token
  // For DOWN tokens: USD value = token balance * (1 - UP price) since UP + DOWN = 1 USD
  const upPositionValue = latestUpPriceUSD ? Number(balances.up) / 1e18 * (latestUpPriceUSD * 2) : 0;
  const downPositionValue = latestUpPriceUSD ? Number(balances.down) / 1e18 * ((1 - latestUpPriceUSD) * 2) : 0;
  const usdcBalanceUSD = Number(balances.usdc) / 1e6;



  const isLoading = balancesLoading || pricesLoading;
  // Use a small threshold to avoid showing dust amounts (less than 0.000001 tokens)
  const hasUpPosition = Number(balances.up) > 1e12; // 0.000001 tokens in wei
  const hasDownPosition = Number(balances.down) > 1e12; // 0.000001 tokens in wei
  const hasAnyPosition = hasUpPosition || hasDownPosition;

  if (!isConnected) {
    return null;
  }

  if (balancesError) {
    return (
      <div className="bg-white/70 rounded-xl p-4 border border-red-200">
        <div className="text-sm text-red-600">Error loading positions</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">Your Position</h3>
        <div className="flex items-center gap-2 text-2xl text-blue-900 font-semibold">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              ${usdcBalanceUSD.toFixed(2)}
            </>
          )}
        </div>
      </div>

      {/* Positions */}
      {hasAnyPosition && (
        <div className="space-y-4">
          {hasUpPosition && (
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-700 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-800 tracking-wider">UP</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                ${upPositionValue.toFixed(2)}
              </span>
            </div>
          )}

          {hasDownPosition && (
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-800 tracking-wider">DOWN</span>
              </div>
              <span className="text-lg font-bold text-red-700">
                ${downPositionValue.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* No positions message */}
      {!hasAnyPosition && !isLoading && (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">No active positions</div>
          <div className="text-xs text-gray-400 mt-1">Place your first opinion to see your position here</div>
        </div>
      )}
    </div>
  );
}
