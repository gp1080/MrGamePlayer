import React, { useState, useEffect } from 'react';
import { ethers, parseEther } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';

const TokenPurchase = ({ onClose, onTokensPurchased }) => {
    const { account, connectWallet } = useWallet();
    const { contract } = useContract();
    const [purchaseAmount, setPurchaseAmount] = useState(10); // Default 10 tokens
    const [maticAmount, setMaticAmount] = useState(1); // 1 MATIC = 10 tokens (0.1 MATIC per token)
    const [isLoading, setIsLoading] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [userMaticBalance, setUserMaticBalance] = useState(0);

    const TOKEN_PRICE = 0.1; // 0.1 MATIC per token (for MGP tokens)
    // eslint-disable-next-line no-unused-vars
    const MGP_TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8"; // MGPTokenFixed - Deployed on Amoy

    const fetchBalances = React.useCallback(async () => {
        try {
            if (contract && account) {
                // Fetch MGP token balance
                const tokenBalance = await contract.balanceOf(account);
                setUserBalance(parseInt(tokenBalance.toString()) / 1e18);

                // Fetch MATIC balance from provider
                if (window.ethereum) {
                    try {
                        // eslint-disable-next-line no-undef
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const balance = await provider.getBalance(account);
                        setUserMaticBalance(parseFloat(ethers.formatEther(balance)));
                    } catch (error) {
                        console.error('Error fetching MATIC balance:', error);
                        setUserMaticBalance(0);
                    }
                } else {
                    setUserMaticBalance(0);
                }
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    }, [contract, account]);

    useEffect(() => {
        if (account && contract) {
            fetchBalances();
        }
    }, [account, contract, fetchBalances]);

    const handleTokenAmountChange = (amount) => {
        const numAmount = parseInt(amount);
        if (numAmount > 0) {
            setPurchaseAmount(numAmount);
            setMaticAmount(numAmount * TOKEN_PRICE);
        }
    };

    const handleMaticAmountChange = (amount) => {
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            setMaticAmount(numAmount);
            setPurchaseAmount(Math.floor(numAmount / TOKEN_PRICE));
        }
    };

    const purchaseTokens = async () => {
        if (!account) {
            await connectWallet();
            return;
        }

        if (maticAmount > userMaticBalance) {
            alert('Insufficient MATIC balance');
            return;
        }

        setIsLoading(true);
        try {
            // Convert MATIC to wei using ethers v6
            const maticWei = parseEther(maticAmount.toString());
            
            // Call the purchase function - contract calculates tokens (1 MGP = 0.1 MATIC)
            const tx = await contract.purchaseTokens({ value: maticWei });
            await tx.wait();

            // Update balances
            await fetchBalances();
            
            if (onTokensPurchased) {
                onTokensPurchased(purchaseAmount);
            }

            alert(`Successfully purchased ${purchaseAmount} MGP tokens!`);
            if (onClose) {
                onClose();
            }

        } catch (error) {
            console.error('Error purchasing tokens:', error);
            alert('Failed to purchase tokens. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickPurchase = (amount) => {
        setPurchaseAmount(amount);
        setMaticAmount(amount * TOKEN_PRICE);
    };

    if (!account) {
        return (
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{ 
                    marginBottom: '20px',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-bold)',
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: 'var(--tracking-tight)'
                }}>💰 Purchase MGP Tokens</h2>
                <p style={{ 
                    marginBottom: '30px', 
                    color: '#999',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-primary)',
                    fontWeight: 'var(--font-normal)',
                    lineHeight: 'var(--leading-relaxed)'
                }}>
                    Connect your wallet to purchase MGP tokens for gaming
                </p>
                <button
                    onClick={connectWallet}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '30px',
            color: 'white'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ margin: 0 }}>💰 Purchase MGP Tokens</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Current Balances */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center'
                }}>
                <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>
                    {userBalance.toFixed(2)} MGP
                </div>
                <div style={{ color: '#999', fontSize: '14px' }}>
                    Token Balance
                </div>
                </div>
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#2196F3', fontSize: '18px', fontWeight: 'bold' }}>
                        {userMaticBalance.toFixed(2)} MATIC
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        MATIC Balance
                    </div>
                </div>
            </div>

            {/* Quick Purchase Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Quick Purchase:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[50, 100, 250, 500, 1000].map(amount => (
                        <button
                            key={amount}
                            onClick={() => quickPurchase(amount)}
                            style={{
                                backgroundColor: purchaseAmount === amount ? '#4CAF50' : '#333',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {amount} MGP
                        </button>
                    ))}
                </div>
            </div>

            {/* Purchase Amount */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Token Amount:
                </label>
                <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => handleTokenAmountChange(e.target.value)}
                    min="1"
                    max="10000"
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#333',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '16px'
                    }}
                />
            </div>

            {/* MATIC Amount */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    MATIC Amount:
                </label>
                <input
                    type="number"
                    value={maticAmount}
                    onChange={(e) => handleMaticAmountChange(e.target.value)}
                    min="0.01"
                    step="0.01"
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#333',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '16px'
                    }}
                />
            </div>

            {/* Price Info */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                    💰 {purchaseAmount} MGP = {maticAmount.toFixed(4)} MATIC
                </div>
                <div style={{ color: '#999', fontSize: '14px' }}>
                    Rate: 1 MGP = 0.1 MATIC
                </div>
            </div>

            {/* Purchase Button */}
            <button
                onClick={purchaseTokens}
                disabled={isLoading || maticAmount > userMaticBalance || purchaseAmount < 1}
                style={{
                    width: '100%',
                    backgroundColor: maticAmount > userMaticBalance || purchaseAmount < 1 ? '#666' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '8px',
                    cursor: maticAmount > userMaticBalance || purchaseAmount < 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
            >
                {isLoading ? 'Purchasing...' : `Purchase ${purchaseAmount} MGP Tokens`}
            </button>

            {/* Info */}
            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#333',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#999',
                textAlign: 'center'
            }}>
                💡 MGP tokens are used for betting in games. Winners earn tokens, house takes commission.
            </div>
        </div>
    );
};

export default TokenPurchase;
