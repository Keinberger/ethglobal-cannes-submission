import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import SmartVoter7702ABI from '../contracts/SmartVoter7702.json';
import {
  BASE_SEPOLIA_AMM_CONTRACT_ADDRESS as AMM_CONTRACT_ADDRESS,
  BASE_SEPOLIA_LIQUIDITY_ENGINE_CONTRACT_ADDRESS as LIQUIDITY_ENGINE_CONTRACT_ADDRESS,
  BASE_SEPOLIA_SMART_VOTER_CONTRACT_ADDRESS as SMART_VOTER_CONTRACT_ADDRESS,
} from '../contracts/constants';

export type EIP7702ExitTransactionConfig = {
  burnAmount: bigint;
  up: boolean; // true if burning UP tokens, false for DOWN tokens
};

export type TransactionState = {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
  receipt: unknown | null;
};

/**
 * Hook for sending transactions to SmartVoter7702 contract
 * Directly calls the exitMarket function on the contract
 */
export function useExitMarket() {
  const { address, isConnected } = useAccount();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
    receipt: null,
  });

  // Execute the contract write
  const { writeContract, data: hash, isPending, error } = useContractWrite();

  const {
    data: receipt,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Update transaction state based on wagmi hooks
  useEffect(() => {
    if (isPending) {
      setTransactionState((prev) => ({
        ...prev,
        status: 'pending',
        error: null,
      }));
    } else if (isSuccess && receipt) {
      setTransactionState((prev) => ({
        ...prev,
        status: 'success',
        receipt,
      }));
    } else if (isError && error) {
      setTransactionState((prev) => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
    }
  }, [isPending, isSuccess, isError, receipt, error]);

  // Update hash when available
  useEffect(() => {
    if (hash) {
      setTransactionState((prev) => ({
        ...prev,
        hash,
      }));
    }
  }, [hash]);

  /**
   * Send a transaction to exit the market
   * Directly calls the SmartVoter7702 contract's exitMarket function
   */
  const exitMarket = useCallback(
    async (config: EIP7702ExitTransactionConfig) => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      if (!writeContract) {
        throw new Error('Write contract function not available');
      }

      try {
        // Reset state
        setTransactionState((prev) => ({
          ...prev,
          status: 'pending',
          error: null,
        }));

        console.log('Sending exitMarket transaction to SmartVoter contract with params:', config);

        // Send the transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (writeContract as any)({
          address: SMART_VOTER_CONTRACT_ADDRESS,
          abi: SmartVoter7702ABI.abi,
          functionName: 'exitMarket',
          args: [
            LIQUIDITY_ENGINE_CONTRACT_ADDRESS,
            AMM_CONTRACT_ADDRESS,
            config.burnAmount,
            config.up,
          ],
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';

        setTransactionState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));

        throw error;
      }
    },
    [isConnected, address, writeContract]
  );

  /**
   * Reset transaction state
   */
  const resetTransaction = useCallback(() => {
    setTransactionState({
      hash: null,
      status: 'idle',
      error: null,
      receipt: null,
    });
  }, []);

  /**
   * Check if wallet is ready for transactions
   */
  const isReady = isConnected && !!address && !!writeContract;

  return {
    // State
    transactionState,

    // Actions
    exitMarket,
    resetTransaction,

    // Utilities
    isReady,
    hasWallet: isConnected && !!address,

    // Wagmi state
    isPending,
    isSuccess,
    isError,
    hash,
    receipt,
  };
}
