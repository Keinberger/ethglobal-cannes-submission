import {useSign7702Authorization} from '@privy-io/react-auth';

export default function Sign7702Button() {
    const {signAuthorization} = useSign7702Authorization();

    const handleSign = async () => {
        try {
            const authorization = await signAuthorization({
                contractAddress: '0x41d7A19804cA8B70E3a01595aF33eADa07C3D9bE',
                chainId: 11155111,
            });

            console.log('Signed authorization:', authorization);
            // Use the authorization with your AA provider
        } catch (error) {
            console.error('Failed to sign authorization:', error);
        }
    };

    return (
        <button onClick={handleSign}>
            Sign EIP-7702 Authorization
        </button>
    );
}