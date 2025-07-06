import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { sepolia } from 'viem/chains';
import {
  USDC_CONTRACT_ADDRESS,
  UP_TOKEN_CONTRACT_ADDRESS,
  DOWN_TOKEN_CONTRACT_ADDRESS,
} from '../contracts/constants';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export type TokenBalances = {
  usdc: bigint;
  up: bigint;
  down: bigint;
  usdcFormatted: string;
  upFormatted: string;
  downFormatted: string;
};

export function useTokenBalances(address?: `0x${string}`) {
  const [balances, setBalances] = useState<TokenBalances>({
    usdc: 0n,
    up: 0n,
    down: 0n,
    usdcFormatted: '0.00',
    upFormatted: '0.00',
    downFormatted: '0.00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient({ chainId: sepolia.id });

  const fetchBalances = useCallback(async () => {
    if (!address || !publicClient) {
      return;
    }

    console.log('Fetching token balances for address:', address);
    setLoading(true);
    setError(null);

    try {
      // Fetch USDC balance (6 decimals)
      const usdcBalance = (await publicClient.readContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint;

      // Fetch UP token balance (18 decimals)
      const upBalance = (await publicClient.readContract({
        address: UP_TOKEN_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint;

      // Fetch DOWN token balance (18 decimals)
      const downBalance = (await publicClient.readContract({
        address: DOWN_TOKEN_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint;

      // Format balances
      const usdcFormatted = (Number(usdcBalance) / 1e6).toFixed(2);
      const upFormatted = (Number(upBalance) / 1e18).toFixed(4);
      const downFormatted = (Number(downBalance) / 1e18).toFixed(4);

      const newBalances = {
        usdc: usdcBalance,
        up: upBalance,
        down: downBalance,
        usdcFormatted,
        upFormatted,
        downFormatted,
      };

      setBalances(newBalances);
      console.log('Token balances updated:', {
        usdc: usdcFormatted,
        up: upFormatted,
        down: downFormatted,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      console.error('Error fetching token balances:', err);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient]);

  // Fetch balances when address changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    loading,
    error,
    refetch: fetchBalances,
  };
}
