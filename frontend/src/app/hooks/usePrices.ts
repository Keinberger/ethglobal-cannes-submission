import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { sepolia } from 'viem/chains';
import { AMM_CONTRACT_ADDRESS } from '../contracts/constants';
import AMM_ABI from '../contracts/AMM.json';
import { HistoricalPrice } from '../types';

/**
 * Hook that listens for SwapExecuted events and fetches historical price data
 * at each swap block + 1 to track price changes over time
 */
export function usePrices() {
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use wagmi's public client
  const publicClient = usePublicClient({ chainId: sepolia.id });

  /**
   * Fetch price data at a specific block number
   */
  const fetchPriceAtBlock = useCallback(
    async (blockNumber: bigint): Promise<HistoricalPrice | null> => {
      if (!publicClient) {
        console.error('No public client available');
        return null;
      }

      try {
        // Get block info for timestamp
        const block = await publicClient.getBlock({ blockNumber });

        // Fetch UP price at this block
        const upPrice = await publicClient.readContract({
          address: AMM_CONTRACT_ADDRESS,
          abi: AMM_ABI.abi,
          functionName: 'getUpPrice',
          args: [],
          blockNumber,
        });

        // Fetch DOWN price at this block
        const downPrice = await publicClient.readContract({
          address: AMM_CONTRACT_ADDRESS,
          abi: AMM_ABI.abi,
          functionName: 'getDownPrice',
          args: [],
          blockNumber,
        });

        // Calculate USD value of UP token
        // If 1 DOWN + 1 UP = 1 USD, then UP value = 1 - DOWN value
        // DOWN value = 1 / (1 + exchange_rate)
        // UP value = 1 - DOWN value
        const upPriceBigInt = upPrice as bigint;
        const downPriceBigInt = downPrice as bigint;

        // Convert to numbers for calculation (assuming 18 decimals)
        const upPriceNum = Number(upPriceBigInt) / 1e18;
        const downPriceNum = Number(downPriceBigInt) / 1e18;

        // Calculate USD value: UP value = 1 / (1 + downPrice/upPrice)
        // This gives us the USD value of 1 UP token
        const upPriceUSD = 1 / (1 + downPriceNum / upPriceNum);

        // Format date for charts
        const date = new Date(Number(block.timestamp) * 1000); // Convert Unix timestamp to milliseconds
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' '); // Format as "YYYY-MM-DD HH:MM:SS"

        return {
          upPriceUSD,
          timestamp: Number(block.timestamp),
          formattedDate,
          blockNumber,
          swapBlockNumber: blockNumber - 1n, // The block where the swap happened
        };
      } catch (err) {
        console.error(`Failed to fetch price at block ${blockNumber}:`, err);
        return null;
      }
    },
    [publicClient]
  );

  /**
   * Fetch SwapExecuted events and get historical prices
   */
  const fetchHistoricalPrices = useCallback(
    async (fromBlock?: bigint, toBlock?: bigint) => {
      if (!publicClient) {
        setError('No public client available');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get current block if no range specified
        if (!toBlock) {
          toBlock = await publicClient.getBlockNumber();
        }
        if (!fromBlock) {
          fromBlock = toBlock - 1000n; // Default to last 1000 blocks
        }

        // Fetch SwapExecuted events
        const logs = await publicClient.getContractEvents({
          address: AMM_CONTRACT_ADDRESS,
          abi: AMM_ABI.abi,
          eventName: 'SwapExecuted',
          fromBlock,
          toBlock,
        });

        // For each swap event, fetch price at block + 1
        const newPrices: HistoricalPrice[] = [];

        for (const log of logs) {
          const swapBlock = log.blockNumber;
          const priceBlock = swapBlock + 1n;

          const priceData = await fetchPriceAtBlock(priceBlock);
          if (priceData) {
            newPrices.push(priceData);
          }
        }

        // Update state with new historical prices
        setHistoricalPrices((prev) => [...prev, ...newPrices]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch historical prices');
        console.error('Error fetching historical prices:', err);
      } finally {
        setLoading(false);
      }
    },
    [publicClient, fetchPriceAtBlock]
  );

  /**
   * Fetch current price and recent historical prices
   */
  const fetchRecentPrices = useCallback(async () => {
    if (!publicClient) return;

    try {
      console.log('Fetching current price data...');

      // First, fetch the current price
      const currentBlock = await publicClient.getBlockNumber();
      const currentPrice = await fetchPriceAtBlock(currentBlock);

      if (currentPrice) {
        // Add current price to historical prices if it's not already there
        setHistoricalPrices((prev) => {
          const exists = prev.some((p) => p.blockNumber === currentPrice.blockNumber);
          if (!exists) {
            return [...prev, currentPrice];
          }
          return prev;
        });
      }

      // Then fetch historical prices
      await fetchHistoricalPrices();

      console.log('Price data refreshed successfully');
    } catch (error) {
      console.error('Error fetching recent prices:', error);
    }
  }, [fetchHistoricalPrices, fetchPriceAtBlock, publicClient]);

  /**
   * Clear all historical price data
   */
  const clearPrices = useCallback(() => {
    setHistoricalPrices([]);
    setError(null);
  }, []);

  // Auto-fetch recent prices when component mounts
  useEffect(() => {
    fetchRecentPrices();
  }, [fetchRecentPrices]);

  return {
    // State
    historicalPrices,
    loading,
    error,

    // Actions
    fetchHistoricalPrices,
    fetchRecentPrices,
    clearPrices,

    // Computed values
    latestPrice: historicalPrices[historicalPrices.length - 1] || null,
    priceCount: historicalPrices.length,

    // Easy access to latest prices
    latestUpPriceUSD: historicalPrices[historicalPrices.length - 1]?.upPriceUSD,
  };
}
