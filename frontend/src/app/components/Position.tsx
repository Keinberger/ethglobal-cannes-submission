'use client';

import { useAccount } from 'wagmi';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { usePrices } from '../hooks/usePrices';
import { SMART_VOTER_CONTRACT_ADDRESS } from '../contracts/constants';

export default function Position() {
  const { isConnected } = useAccount();
  const { balances, loading: balancesLoading, error: balancesError } = useTokenBalances(SMART_VOTER_CONTRACT_ADDRESS);
  const { latestUpPriceUSD, loading: pricesLoading } = usePrices();

  console.log("balances",balances)

  // Calculate position values
  const upPositionValue = latestUpPriceUSD ? Number(balances.up) / 1e18 * latestUpPriceUSD : 0;
  const downPositionValue = latestUpPriceUSD ? Number(balances.down) / 1e18 * (1 - latestUpPriceUSD) : 0;
  const totalPositionValue = upPositionValue + downPositionValue;
  const usdcBalanceUSD = Number(balances.usdc) / 1e6; // USDC has 6 decimals

  const isLoading = balancesLoading || pricesLoading;
  const hasUpPosition = Number(balances.up) > 0;
  const hasDownPosition = Number(balances.down) > 0;
  const hasAnyPosition = hasUpPosition || hasDownPosition;

  // Don't render anything if not connected or if no positions exist
  if (!isConnected || (!hasAnyPosition && !isLoading)) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Position</h3>
        {isLoading && (
          <div className="text-sm text-gray-500">Loading...</div>
        )}
      </div>

      {balancesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-red-700">
            Error loading balances: {balancesError}
          </div>
        </div>
      )}

      {/* USDC Balance */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-medium text-blue-900">USDC Balance</div>
            <div className="text-sm text-blue-700">Available for trading</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-900">
              ${usdcBalanceUSD.toFixed(2)}
            </div>
            <div className="text-sm text-blue-700">
              {balances.usdcFormatted} USDC
            </div>
          </div>
        </div>
      </div>

      {/* Market Position - Show only if user has positions */}
      {hasAnyPosition && (
        <div className="space-y-3">
          <div className="text-base font-medium text-gray-700">Market Position</div>
          
          {/* UP Position - Only show if user has UP tokens */}
          {hasUpPosition && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-base font-medium text-green-900">UP Position</div>
                    <div className="text-sm text-green-700">
                      {balances.upFormatted} UP tokens
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-900">
                    ${upPositionValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-700">
                    @ ${latestUpPriceUSD?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOWN Position - Only show if user has DOWN tokens */}
          {hasDownPosition && (
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="text-base font-medium text-red-900">DOWN Position</div>
                    <div className="text-sm text-red-700">
                      {balances.downFormatted} DOWN tokens
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-900">
                    ${downPositionValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-red-700">
                    @ ${(1 - (latestUpPriceUSD || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total Position Value - Only show if user has positions */}
      {totalPositionValue > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium text-gray-700">Total Position Value</div>
            <div className="text-xl font-bold text-gray-900">
              ${totalPositionValue.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Position Summary - Only show if user has positions */}
      {totalPositionValue > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Total stake in market: ${totalPositionValue.toFixed(2)}</div>
            <div>• Available USDC: ${usdcBalanceUSD.toFixed(2)}</div>
            <div>• Net exposure: ${(totalPositionValue + usdcBalanceUSD).toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
