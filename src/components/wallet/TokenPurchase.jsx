import React, { useState } from 'react';
import { BrowserProvider, parseEther } from 'ethers';
import { Contract } from 'ethers';
import MGPTokenFixed from '../../contracts/MGPTokenFixed.json';
import { useWallet } from '../../contexts/WalletContext';

const TokenPurchase = () => {
    const { account, provider } = useWallet();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const purchaseTokens = async () => {
        if (!account || !provider) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            const signer = await provider.getSigner();
            const contractAddress = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8";
            const contract = new Contract(
                contractAddress,
                MGPTokenFixed.abi,
                signer
            );

            // Calculate MATIC amount needed (amount * 0.1 MATIC per token)
            const maticAmount = parseFloat(amount || 0) * 0.1;
            if (maticAmount <= 0) {
                alert('Please enter a valid amount');
                setLoading(false);
                return;
            }

            const value = parseEther(maticAmount.toString());

            // MGP Token uses purchaseTokens() which is payable
            const tx = await contract.purchaseTokens({
                value: value
            });
            await tx.wait();

            alert('Tokens purchased successfully!');
            setAmount('');
        } catch (error) {
            console.error('Error purchasing tokens:', error);
            alert(`Error purchasing tokens: ${error.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    const maticPrice = parseFloat(amount || 0) * 0.1;

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            padding: '20px',
            color: 'white'
        }}>
            <h3 style={{
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                💎 Purchase MGP Tokens
            </h3>
            <div style={{ marginBottom: '15px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#ccc'
                }}>
                    Amount of MGP tokens
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    step="0.1"
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1a1a1a',
                        border: '2px solid #333',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                    }}
                    disabled={!account}
                />
                <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#999'
                }}>
                    Price: {isNaN(maticPrice) ? '0.0000' : maticPrice.toFixed(4)} MATIC
                </div>
                <div style={{
                    marginTop: '5px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    Rate: 1 MGP = 0.1 MATIC
                </div>
            </div>
            <button
                onClick={purchaseTokens}
                disabled={loading || !amount || !account || parseFloat(amount || 0) <= 0}
                style={{
                    width: '100%',
                    backgroundColor: (!account || loading || !amount || parseFloat(amount || 0) <= 0) ? '#666' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: (!account || loading || !amount || parseFloat(amount || 0) <= 0) ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    opacity: (!account || loading || !amount || parseFloat(amount || 0) <= 0) ? 0.7 : 1
                }}
            >
                {loading ? 'Purchasing...' : !account ? 'Connect Wallet First' : 'Purchase Tokens'}
            </button>
            {!account && (
                <div style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center'
                }}>
                    Connect your wallet to purchase tokens
                </div>
            )}
        </div>
    );
};

export default TokenPurchase; 