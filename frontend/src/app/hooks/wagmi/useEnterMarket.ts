import { useState, useCallback, useEffect } from 'react';
import { useSendTransaction, usePrivy } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import SmartVoter7702ABI from '../../contracts/SmartVoter7702.json';
import { 
  AMM_CONTRACT_ADDRESS, 
  LIQUIDITY_ENGINE_CONTRACT_ADDRESS, 
  USDC_CONTRACT_ADDRESS,
  SMART_VOTER_CONTRACT_ADDRESS
} from '../../contracts/constants';

export type EIP7702TransactionConfig = {
  usdcAmount: bigint;
  minAmountOut: bigint;
  up: boolean; // true for UP position, false for DOWN position
};

export type TransactionState = {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
  receipt: unknown | null;
};

/**
 * Hook for sending transactions to SmartVoter7702 contract using Privy
 * Directly calls the enterMarket function on the contract
 */
export function useEnterMarket() {
  const { authenticated, user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
    receipt: null,
  });

  /**
   * Send a transaction to enter the market
   * Directly calls the SmartVoter7702 contract's enterMarket function using Privy
   */
  const enterMarket = useCallback(async (config: EIP7702TransactionConfig) => {
    if (!authenticated) {
      throw new Error('User not authenticated');
    }

    if (!sendTransaction) {
      throw new Error('Send transaction function not available');
    }

    try {
      // Reset state
      setTransactionState(prev => ({
        ...prev,
        status: 'pending',
        error: null,
      }));

      console.log('Sending enterMarket transaction to SmartVoter contract with params:', config);

      // Encode the contract call
      const calldata = encodeFunctionData({
        abi: SmartVoter7702ABI.abi,
        functionName: 'enterMarket',
        args: [
          USDC_CONTRACT_ADDRESS,
          LIQUIDITY_ENGINE_CONTRACT_ADDRESS,
          AMM_CONTRACT_ADDRESS,
          config.up,
          config.usdcAmount,
          config.minAmountOut,
        ],
      });

      // Send transaction to the SmartVoter contract using Privy
      const txResult = await sendTransaction({
        to: SMART_VOTER_CONTRACT_ADDRESS,
        data: calldata as `0x${string}`,
        value: 0,
      });

      // Update state with transaction hash
      setTransactionState(prev => ({
        ...prev,
        status: 'success',
        hash: txResult.transactionHash,
      }));

      console.log('SmartVoter enterMarket transaction sent:', txResult);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      
      setTransactionState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      throw error;
    }
  }, [authenticated, user, sendTransaction]);

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
  const isReady = authenticated && !!user && !!sendTransaction;

  return {
    // State
    transactionState,
    
    // Actions
    enterMarket,
    resetTransaction,
    
    // Utilities
    isReady,
    hasWallet: authenticated && !!user,
    
    // Transaction state
    isPending: transactionState.status === 'pending',
    isSuccess: transactionState.status === 'success',
    isError: transactionState.status === 'error',
    hash: transactionState.hash,
    receipt: transactionState.receipt,
  };
} 