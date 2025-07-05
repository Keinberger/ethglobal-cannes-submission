import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, custom, http, PublicClient } from 'viem';
import { sepolia } from 'viem/chains';
import { AMM_CONTRACT_ADDRESS } from '../contracts/constants';
import AMM_ABI from '../contracts/AMM.json';
import { HistoricalPrice } from '../types';

/**
 * Hook that listens for SwapExecuted events and fetches historical price data
 * at each swap block + 1 to track price changes over time
 */
export function usePrices() {
  const { wallets } = useWallets();
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  // Get the viem client from Privy
  const primaryWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  // Extract the provider when wallet is available
  useEffect(() => {
    const setupClient = async () => {
      if (primaryWallet?.getEthereumProvider) {
        try {
          const provider = await primaryWallet.getEthereumProvider();
          const client = createPublicClient({
            chain: sepolia,
            transport: custom(provider),
          }) as any;
          setPublicClient(client);
        } catch (error) {
          console.error('Failed to setup Privy client:', error);
          // Fallback to default client
          const fallbackClient = createPublicClient({
            chain: sepolia,
            transport: http(),
          }) as any;
          setPublicClient(fallbackClient);
        }
      } else {
        // Default client when no wallet
        const defaultClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        }) as any;
        setPublicClient(defaultClient);
      }
    };

    setupClient();
  }, [primaryWallet]);

  /**
   * Fetch price data at a specific block number
   */
  const fetchPriceAtBlock = useCallback(async (blockNumber: bigint): Promise<HistoricalPrice | null> => {
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
  }, [publicClient]);

  /**
   * Fetch SwapExecuted events and get historical prices
   */
  const fetchHistoricalPrices = useCallback(async (fromBlock?: bigint, toBlock?: bigint) => {
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

      console.log(`Fetching SwapExecuted events from block ${fromBlock} to ${toBlock}`);

      // Fetch SwapExecuted events
      const logs = await publicClient.getContractEvents({
        address: AMM_CONTRACT_ADDRESS as unknown as `0x${string}`,
        abi: AMM_ABI.abi,
        eventName: 'SwapExecuted',
        fromBlock,
        toBlock,
      });

      console.log(`Found ${logs.length} SwapExecuted events`);

      // For each swap event, fetch price at block + 1
      const newPrices: HistoricalPrice[] = [];
      
      for (const log of logs) {
        const swapBlock = log.blockNumber;
        const priceBlock = swapBlock + 1n;
        
        console.log(`Fetching price at block ${priceBlock} (after swap at ${swapBlock})`);
        
        const priceData = await fetchPriceAtBlock(priceBlock);
        if (priceData) {
          newPrices.push(priceData);
        }
      }

      // Update state with new historical prices
      setHistoricalPrices(prev => [...prev, ...newPrices]);
      console.log(`Added ${newPrices.length} new historical price points`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical prices');
      console.error('Error fetching historical prices:', err);
    } finally {
      setLoading(false);
    }
  }, [publicClient, fetchPriceAtBlock]);

  /**
   * Fetch recent historical prices (last 1000 blocks)
   */
  const fetchRecentPrices = useCallback(async () => {
    await fetchHistoricalPrices();
  }, [fetchHistoricalPrices]);

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