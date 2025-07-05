import { useState, useCallback } from 'react';
import { useSendTransaction, usePrivy } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import SmartVoter7702ABI from '../../contracts/SmartVoter7702.json';
import { 
  AMM_CONTRACT_ADDRESS, 
  LIQUIDITY_ENGINE_CONTRACT_ADDRESS,
  SMART_VOTER_CONTRACT_ADDRESS
} from '../../contracts/constants';

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
 * Hook for sending exit market transactions to SmartVoter7702 contract using Privy
 * Directly calls the exitMarket function on the contract
 */
export function useExitMarket() {
  const { authenticated, user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
    receipt: null,
  });


  /**
   * Send a transaction to exit the market
   * Directly calls the SmartVoter7702 contract's exitMarket function using Privy
   */
  const exitMarket = useCallback(async (config: EIP7702ExitTransactionConfig) => {
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

      console.log('Sending exitMarket transaction to SmartVoter contract with params:', config);

      // Encode the contract call
      const calldata = encodeFunctionData({
        abi: SmartVoter7702ABI.abi,
        functionName: 'exitMarket',
        args: [
          LIQUIDITY_ENGINE_CONTRACT_ADDRESS,
          AMM_CONTRACT_ADDRESS,
          config.burnAmount,
          config.up,
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

      console.log('SmartVoter exitMarket transaction sent:', txResult);

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
    exitMarket,
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