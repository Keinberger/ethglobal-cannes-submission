import { useSendTransaction, usePrivy } from '@privy-io/react-auth';
import { useWalletConnection } from './walletConnection';

export default function SendTransactionButton() {
  const { sendTransaction } = useSendTransaction();
  const { authenticated } = usePrivy();
  const { hasWallet, primaryWallet } = useWalletConnection();

  const onSendTransaction = async () => {
    if (!authenticated || !hasWallet) {
      console.error('User not authenticated or wallet not connected');
      return;
    }

    try {
      await sendTransaction({
        to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C',
        value: 100000,
      });
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  if (!authenticated) {
    return <div>Please log in to send transactions</div>;
  }

  if (!hasWallet) {
    return <div>Please connect your wallet to send transactions</div>;
  }

  return (
    <button
      onClick={onSendTransaction}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Send Transaction
    </button>
  );
}
