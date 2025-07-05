'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { useWalletConnection } from '../lib/walletConnection';
import { createWalletClient, custom, parseAbi, encodeFunctionData, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import {useSign7702Authorization} from '@privy-io/react-auth';
import smartVoterAbi from '../contracts/SmartVoter7702.json';
import { USDC_CONTRACT_ADDRESS, LIQUIDITY_ENGINE_CONTRACT_ADDRESS, AMM_CONTRACT_ADDRESS } from '../contracts/constants';

const CONTRACT_ADDRESS = '0x41d7A19804cA8B70E3a01595aF33eADa07C3D9bE';

export default function DebugPage() {
  const { authenticated, user } = usePrivy();
  const { primaryWallet } = useWalletConnection();
  const { sendTransaction } = useSendTransaction();
  const { signAuthorization } = useSign7702Authorization();
  
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState<string>('');
  const [isTestingContract, setIsTestingContract] = useState(false);
  const [contractTestResult, setContractTestResult] = useState<string>('');
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  useEffect(() => {
    if (primaryWallet) {
      checkCurrentChain();
    }
  }, [primaryWallet]);

  const switchToSepolia = async () => {
    if (!primaryWallet) return;
    
    try {
      const provider = await primaryWallet.getEthereumProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
      });
      setCurrentChainId(11155111);
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, add it
        try {
          const provider = await primaryWallet.getEthereumProvider();
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
          setCurrentChainId(11155111);
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
        }
      } else {
        console.error('Failed to switch to Sepolia:', error);
      }
    }
  };

  const checkCurrentChain = async () => {
    if (!primaryWallet) return;
    
    try {
      const provider = await primaryWallet.getEthereumProvider();
      const chainId = await provider.request({ method: 'eth_chainId' });
      setCurrentChainId(parseInt(chainId, 16));
    } catch (error) {
      console.error('Failed to get current chain:', error);
    }
  };

  const handleAuthorize7702 = async () => {
    if (!authenticated || !primaryWallet || !user) {
      setAuthorizationStatus('Please connect your wallet first');
      return;
    }

    setIsAuthorizing(true);
    setAuthorizationStatus('Initiating EIP-7702 authorization...');

    try {
      // Get the current nonce
        const provider = await primaryWallet.getEthereumProvider()
        const walletClient = createWalletClient({
        account: primaryWallet.address as `0x${string}`,
        chain: sepolia,
        transport: custom(provider),
        });
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });
      const nonce = await publicClient.getTransactionCount({
        address: primaryWallet.address as `0x${string}`,
      });

      setAuthorizationStatus('Signing authorization...');

      // Sign the authorization using Privy's hook
      const signedAuthorization = await signAuthorization({
        contractAddress: CONTRACT_ADDRESS,
        chainId: sepolia.id,
      });

      console.log('Signed authorization:', signedAuthorization);

      setAuthorizationStatus('Sending authorization transaction...');

      // Create the calldata for the contract function
      const calldata = encodeFunctionData({
        abi: smartVoterAbi.abi,
        functionName: 'enterMarket',
        args: [
          USDC_CONTRACT_ADDRESS,
          LIQUIDITY_ENGINE_CONTRACT_ADDRESS,
          AMM_CONTRACT_ADDRESS,
          true,                     // up
          100n * 10n**6n,           // 100 USDC (6 decimals)
          90n * 10n**18n            // min 90 tokens (18 decimals)
        ],
      });
      
      // Send the EIP-7702 authorization transaction with contract call
      const txHash = await sendTransaction({
        type: 'eip7702', // EIP-7702 transaction type
        authorizationList: [{...signedAuthorization, chainId: sepolia.id}], 
        to: primaryWallet.address as `0x${string}`,
        data: calldata,
        chain: sepolia,
      });

      setAuthorizationStatus(`Authorization successful! Transaction hash: ${txHash}`);
      
    } catch (error) {
      console.error('Authorization failed:', error);
      setAuthorizationStatus(`Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleTestContractCall = async () => {
    if (!authenticated || !primaryWallet) {
      setContractTestResult('Please connect your wallet first');
      return;
    }

    setIsTestingContract(true);
    setContractTestResult('Testing contract interaction...');

    try {
      // Create a test call to the enterMarket function
      const abi = smartVoterAbi.abi;
      
      // Example parameters for enterMarket (you would replace these with actual values)
      const mockParams = {
        usdc: '0xA0b86a33E6441e5031B5F10c0A7f5c44e83b8C8e', // Mock USDC address
        liquidityEngine: '0x1234567890123456789012345678901234567890', // Mock liquidity engine
        amm: '0x0987654321098765432109876543210987654321', // Mock AMM
        up: true,
        usdcAmount: BigInt(100000000), // 100 USDC (assuming 6 decimals)
        minAmountOut: BigInt(0), // 95 tokens minimum
      };

      const data = encodeFunctionData({
        abi: abi,
        functionName: 'enterMarket',
        args: [
          mockParams.usdc,
          mockParams.liquidityEngine,
          mockParams.amm,
          mockParams.up,
          mockParams.usdcAmount,
          mockParams.minAmountOut,
        ],
      });

      // Send transaction to the proxy contract (user's address with delegated code)
      const txHash = await sendTransaction({
        to: primaryWallet.address as `0x${string}`, // Send to user's address (now a proxy)
        value: 0,
        data: data,
      });

      setContractTestResult(`Contract call successful! Transaction hash: ${txHash}`);
      
    } catch (error) {
      console.error('Contract call failed:', error);
      setContractTestResult(`Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingContract(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Debug Tool</h1>
          <p className="text-gray-600">Please log in to use the EIP-7702 debug tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">EIP-7702 Debug Tool</h1>
          
          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">User Information</h2>
            <p><strong>Address:</strong> {primaryWallet?.address}</p>
            <p><strong>Status:</strong> {authenticated ? 'Authenticated' : 'Not authenticated'}</p>
            <div className="mt-2 flex items-center gap-2">
              <p><strong>Current Chain:</strong> {currentChainId ? (currentChainId === 11155111 ? 'Sepolia ✅' : `Chain ${currentChainId} ❌`) : 'Loading...'}</p>
              {currentChainId && currentChainId !== 11155111 && (
                <button
                  onClick={switchToSepolia}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                >
                  Switch to Sepolia
                </button>
              )}
            </div>
          </div>

          {/* Contract Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Contract Information</h2>
            <p><strong>SmartVoter7702 Address:</strong> {CONTRACT_ADDRESS}</p>
            <p><strong>Chain:</strong> Sepolia Testnet</p>
            <p><strong>Purpose:</strong> EIP-7702 proxy contract for opinion market interactions</p>
          </div>

          {/* Authorization Section */}
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-700 mb-4">Step 1: Authorize EIP-7702 Delegation</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will authorize your wallet to delegate execution to the SmartVoter7702 contract.
              After authorization, your wallet address will act as a proxy to the contract.
            </p>
            
            <button
              onClick={handleAuthorize7702}
              disabled={isAuthorizing}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthorizing ? 'Authorizing...' : 'Authorize EIP-7702 Delegation'}
            </button>
            
            {authorizationStatus && (
              <div className="mt-4 p-3 bg-gray-100 rounded border-l-4 border-yellow-500">
                <p className="text-sm font-mono">{authorizationStatus}</p>
              </div>
            )}
          </div>

          {/* Contract Interaction Section */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-700 mb-4">Step 2: Test Contract Interaction</h2>
            <p className="text-sm text-gray-600 mb-4">
              After authorization, test calling the enterMarket function through your proxy address.
              This will simulate entering an opinion market position.
            </p>
            
            <button
              onClick={handleTestContractCall}
              disabled={isTestingContract}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingContract ? 'Testing...' : 'Test Contract Call'}
            </button>
            
            {contractTestResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded border-l-4 border-green-500">
                <p className="text-sm font-mono">{contractTestResult}</p>
              </div>
            )}
          </div>

          {/* Contract ABI Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Contract ABI Functions</h2>
            <div className="space-y-2 text-sm font-mono">
              <div className="p-2 bg-white rounded border">
                <strong>enterMarket:</strong> (usdc, liquidityEngine, amm, up, usdcAmount, minAmountOut)
              </div>
              <div className="p-2 bg-white rounded border">
                <strong>exitMarket:</strong> (liquidityEngine, amm, burnAmount, up)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}