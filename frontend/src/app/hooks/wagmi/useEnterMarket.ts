import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { encodeFunctionData } from 'viem';
import SmartVoter7702ABI from '../../contracts/SmartVoter7702.json';
import { 
  AMM_CONTRACT_ADDRESS, 
  LIQUIDITY_ENGINE_CONTRACT_ADDRESS, 
  USDC_CONTRACT_ADDRESS 
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
 * Hook for sending EIP-7702 transactions using wagmi
 * Sends type 0x04 transactions to the EOA with encoded calldata for SmartVoter7702
 */
export function useEntermarket() {
  const { address, isConnected } = useAccount();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
    receipt: null,
  });

  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  
  const { data: receipt, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  // Update transaction state based on wagmi hooks
  useEffect(() => {
    if (isPending) {
      setTransactionState(prev => ({
        ...prev,
        status: 'pending',
        error: null,
      }));
    } else if (isSuccess && receipt) {
      setTransactionState(prev => ({
        ...prev,
        status: 'success',
        receipt,
      }));
    } else if (isError && error) {
      setTransactionState(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
    }
  }, [isPending, isSuccess, isError, receipt, error]);

  // Update hash when available
  useEffect(() => {
    if (hash) {
      setTransactionState(prev => ({
        ...prev,
        hash,
      }));
    }
  }, [hash]);

  /**
   * Encode the enterMarket function call for SmartVoter7702
   */
  const encodeEnterMarketCalldata = useCallback((config: EIP7702TransactionConfig): string => {
    try {
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

      return calldata;
    } catch (error) {
      throw new Error(`Failed to encode enterMarket calldata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  /**
   * Send an EIP-7702 transaction to enter the market
   * Sends transaction to EOA with encoded calldata for SmartVoter contract
   */
  const enterMarket = useCallback(async (config: EIP7702TransactionConfig) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
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

      // Encode the calldata for the SmartVoter enterMarket function
      const calldata = encodeEnterMarketCalldata(config);

      // Prepare EIP-7702 transaction parameters
      // Send to EOA (wallet address) with encoded calldata for SmartVoter
      const transactionParams = {
        to: address as `0x${string}`, // EOA address (wallet address)
        data: calldata as `0x${string}`, // Encoded enterMarket function call
        type: "eip7702"
      };

      console.log('Sending EIP-7702 enterMarket transaction with params:', transactionParams);

      // Send the transaction
      sendTransaction(transactionParams);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      
      setTransactionState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      throw error;
    }
  }, [isConnected, address, sendTransaction, encodeEnterMarketCalldata]);

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
  const isReady = isConnected && !!address && !!sendTransaction;

  return {
    // State
    transactionState,
    
    // Actions
    enterMarket,
    resetTransaction,
    
    // Utilities
    encodeEnterMarketCalldata,
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