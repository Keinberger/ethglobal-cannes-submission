'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePrivy, useSign7702Authorization, useWallets } from '@privy-io/react-auth';
// import { useSetActiveWallet } from '@privy-io/wagmi'; // Not needed for this implementation
import { useWalletClient } from 'wagmi';
import { createPublicClient, createWalletClient, http, zeroAddress, encodeFunctionData, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { entryPoint08Address } from 'viem/account-abstraction';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import smartVoterAbi from '../contracts/SmartVoter7702.json';
import { USDC_CONTRACT_ADDRESS, LIQUIDITY_ENGINE_CONTRACT_ADDRESS, AMM_CONTRACT_ADDRESS } from '../contracts/constants';

const CONTRACT_ADDRESS = '0x41d7A19804cA8B70E3a01595aF33eADa07C3D9bE';

export default function DebugPage() {
  const { authenticated, user, ready } = usePrivy();
  const { signAuthorization } = useSign7702Authorization();
  const { wallets } = useWallets();
  const { data: walletClient } = useWalletClient();
  
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState<string>('');
  const [isTestingContract, setIsTestingContract] = useState(false);
  const [contractTestResult, setContractTestResult] = useState<string>('');
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletClientType === 'privy'),
    [wallets]
  );

  useEffect(() => {
    if (embeddedWallet) {
      checkCurrentChain();
    }
  }, [embeddedWallet]);

  const checkCurrentChain = async () => {
    if (!embeddedWallet) return;
    
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      const chainId = await provider.request({ method: 'eth_chainId' });
      setCurrentChainId(parseInt(chainId, 16));
    } catch (error) {
      console.error('Failed to get current chain:', error);
    }
  };

  const switchToSepolia = async () => {
    if (!embeddedWallet) return;
    
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
      });
      setCurrentChainId(11155111);
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          const provider = await embeddedWallet.getEthereumProvider();
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

  const sendEIP7702Transaction = async () => {
    if (!user || !embeddedWallet) {
      setAuthorizationStatus('No wallet connected');
      return;
    }

    setIsAuthorizing(true);
    setAuthorizationStatus('Setting up EIP-7702 transaction...');

    try {
      // You'll need to set these environment variables
      const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || 'YOUR_PIMLICO_API_KEY';
      
      if (!pimlicoApiKey || pimlicoApiKey === 'YOUR_PIMLICO_API_KEY') {
        throw new Error('Please set NEXT_PUBLIC_PIMLICO_API_KEY in your .env.local file');
      }

      const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${pimlicoApiKey}`;

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://rpc.sepolia.org')
      });

      const pimlicoClient = createPimlicoClient({
        transport: http(pimlicoUrl)
      });

      setAuthorizationStatus('Creating smart account...');

      // Use walletClient from Wagmi or create manually
      let activeWalletClient = walletClient;
      if (!activeWalletClient) {
        const provider = await embeddedWallet.getEthereumProvider();
        activeWalletClient = createWalletClient({
          account: embeddedWallet.address as `0x${string}`,
          chain: sepolia,
          transport: custom(provider),
        });
        console.log('Using manual wallet client for SmartVoter');
      }

      const simpleSmartAccount = await toSimpleSmartAccount({
        owner: activeWalletClient,
        entryPoint: {
          address: entryPoint08Address,
          version: '0.8'
        },
        client: publicClient,
        address: activeWalletClient.account.address
      });

      // Create the smart account client
      const smartAccountClient = createSmartAccountClient({
        account: simpleSmartAccount,
        chain: sepolia,
        bundlerTransport: http(pimlicoUrl),
        paymaster: pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast;
          }
        }
      });

      setAuthorizationStatus('Signing EIP-7702 authorization...');

      // Sign the EIP-7702 authorization for the SmartVoter contract
      const authorization = await signAuthorization({
        contractAddress: CONTRACT_ADDRESS,
        chainId: sepolia.id,
        nonce: await publicClient.getTransactionCount({
          address: activeWalletClient.account.address
        })
      });

      console.log('Signed authorization:', authorization);

      setAuthorizationStatus('Sending EIP-7702 UserOperation...');

      // Create the calldata for the enterMarket function
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

      // Send the EIP-7702 UserOperation
      const txnHash = await smartAccountClient.sendTransaction({
        calls: [
          {
            to: activeWalletClient.account.address, // Send to the user's address (now a smart contract proxy)
            data: calldata,
            value: BigInt(0)
          }
        ],
        factory: '0x7702', // EIP-7702 factory identifier
        factoryData: '0x',
        paymasterContext: {
          sponsorshipPolicyId: process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID
        },
        authorization
      });

      setTxHash(txnHash);
      setAuthorizationStatus(`EIP-7702 transaction successful! Hash: ${txnHash}`);
      
    } catch (error) {
      console.error('EIP-7702 transaction failed:', error);
      setAuthorizationStatus(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const sendSimpleTest = async () => {
    console.log('Debug info:', {
      user: !!user,
      userWallet: user?.wallet?.address,
      embeddedWallet: !!embeddedWallet,
      embeddedWalletAddress: embeddedWallet?.address,
      walletClient: !!walletClient,
      walletClientAccount: walletClient?.account?.address
    });

    if (!user || !embeddedWallet) {
      setContractTestResult('No wallet connected - please ensure you are logged in');
      return;
    }

    if (!walletClient) {
      setContractTestResult('Wallet client not available - trying to get it manually...');
      // Try to get wallet client manually
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        const manualWalletClient = createWalletClient({
          account: embeddedWallet.address as `0x${string}`,
          chain: sepolia,
          transport: custom(provider),
        });
        console.log('Manual wallet client created:', manualWalletClient);
      } catch (error) {
        console.error('Failed to create manual wallet client:', error);
        setContractTestResult('Failed to create wallet client');
        return;
      }
    }

    setIsTestingContract(true);
    setContractTestResult('Setting up simple EIP-7702 test...');

    try {
      const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
      
      if (!pimlicoApiKey) {
        throw new Error('Please set NEXT_PUBLIC_PIMLICO_API_KEY in your .env.local file');
      }

      const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${pimlicoApiKey}`;

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://rpc.sepolia.org')
      });

      const pimlicoClient = createPimlicoClient({
        transport: http(pimlicoUrl)
      });

      // Use walletClient from Wagmi or create manually
      let activeWalletClient = walletClient;
      if (!activeWalletClient) {
        const provider = await embeddedWallet.getEthereumProvider();
        activeWalletClient = createWalletClient({
          account: embeddedWallet.address as `0x${string}`,
          chain: sepolia,
          transport: custom(provider),
        });
        console.log('Using manual wallet client');
      }

      const simpleSmartAccount = await toSimpleSmartAccount({
        owner: activeWalletClient,
        entryPoint: {
          address: entryPoint08Address,
          version: '0.8'
        },
        client: publicClient,
        address: activeWalletClient.account.address
      });

      const smartAccountClient = createSmartAccountClient({
        account: simpleSmartAccount,
        chain: sepolia,
        bundlerTransport: http(pimlicoUrl),
        paymaster: pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast;
          }
        }
      });

      // Sign authorization for the simple account implementation
      const authorization = await signAuthorization({
        contractAddress: '0xe6Cae83BdE06E4c305530e199D7217f42808555B', // Simple account implementation
        chainId: sepolia.id,
        nonce: await publicClient.getTransactionCount({
          address: activeWalletClient.account.address
        })
      });

      // Send a simple transaction to zero address
      const txnHash = await smartAccountClient.sendTransaction({
        calls: [
          {
            to: zeroAddress,
            data: '0x',
            value: BigInt(0)
          }
        ],
        factory: '0x7702',
        factoryData: '0x',
        paymasterContext: {
          sponsorshipPolicyId: process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID
        },
        authorization
      });

      setContractTestResult(`Simple test successful! Hash: ${txnHash}`);
      
    } catch (error) {
      console.error('Simple test failed:', error);
      setContractTestResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingContract(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">EIP-7702 Debug Tool</h1>
          <p className="text-gray-600">Please log in to use the EIP-7702 debug tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">EIP-7702 Debug Tool (Privy + Permissionless)</h1>
          
          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">User Information</h2>
            <p><strong>Address:</strong> {embeddedWallet?.address}</p>
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

          {/* Environment Setup */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-700 mb-2">Environment Setup Required</h2>
            <p className="text-sm text-gray-600 mb-2">
              To use EIP-7702 with Pimlico, you need to set these environment variables in your .env.local file:
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <div>NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key</div>
              <div>NEXT_PUBLIC_SPONSORSHIP_POLICY_ID=your_policy_id (optional)</div>
              <div>NEXT_PUBLIC_SEPOLIA_RPC_URL=your_sepolia_rpc_url (optional)</div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Contract Information</h2>
            <p><strong>SmartVoter7702 Address:</strong> {CONTRACT_ADDRESS}</p>
            <p><strong>Chain:</strong> Sepolia Testnet</p>
            <p><strong>Purpose:</strong> EIP-7702 proxy contract for opinion market interactions</p>
          </div>

          {/* Simple Test Section */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-700 mb-4">Step 1: Simple EIP-7702 Test</h2>
            <p className="text-sm text-gray-600 mb-4">
              Test basic EIP-7702 functionality with a simple transaction to the zero address.
            </p>
            
            <button
              onClick={sendSimpleTest}
              disabled={isTestingContract || currentChainId !== 11155111}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              
              {isTestingContract ? 'Testing...' : 'Send Simple EIP-7702 Test'}
            </button>
            
            {contractTestResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded border-l-4 border-green-500">
                <p className="text-sm font-mono">{contractTestResult}</p>
              </div>
            )}
          </div>

          {/* SmartVoter Contract Test Section */}
          <div className="mb-8 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">Step 2: SmartVoter Contract Test</h2>
            <p className="text-sm text-gray-600 mb-4">
              Test EIP-7702 with your SmartVoter contract's enterMarket function.
            </p>
            
            <button
              onClick={sendEIP7702Transaction}
              disabled={isAuthorizing || currentChainId !== 11155111}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthorizing ? 'Processing...' : 'Send SmartVoter EIP-7702 Transaction'}
            </button>
            
            {authorizationStatus && (
              <div className="mt-4 p-3 bg-gray-100 rounded border-l-4 border-purple-500">
                <p className="text-sm font-mono">{authorizationStatus}</p>
              </div>
            )}
          </div>

          {/* Transaction Result */}
          {txHash && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Transaction Success!</h2>
              <p className="text-sm font-mono break-all mb-2">{txHash}</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                View on Etherscan
              </a>
            </div>
          )}

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