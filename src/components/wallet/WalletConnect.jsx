import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
// eslint-disable-next-line no-unused-vars
import { BrowserProvider, formatEther } from 'ethers';

const WalletConnect = () => {
    const {
        account,
        provider,
        chainId,
        isConnecting,
        error,
        connectWallet,
        switchNetwork
    } = useWallet();
    const { getDisplayName } = useUserProfile();
    const [balance, setBalance] = useState('0');

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && provider) {
                try {
                    const balance = await provider.getBalance(account);
                    setBalance(formatEther(balance));
                } catch (err) {
                    console.error('Error fetching balance:', err);
                    setBalance('0');
                }
            } else {
                setBalance('0');
            }
        };

        fetchBalance();
        // Refresh balance periodically
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [account, provider]);

    const handleNetworkSwitch = async () => {
        try {
            // Switch to Polygon (chainId: 137) or Amoy testnet (chainId: 80002)
            await switchNetwork(137);
        } catch (err) {
            console.error('Failed to switch network:', err);
        }
    };

    if (error) {
        return (
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                padding: '20px',
                color: '#F44336'
            }}>
                {error}
            </div>
        );
    }

    if (account) {
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
                    💼 Wallet Info
                </h3>
                {chainId !== 137 && chainId !== 80002 && (
                    <button
                        onClick={handleNetworkSwitch}
                        style={{
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginBottom: '15px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Switch to Polygon
                    </button>
                )}
                <div style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '6px',
                    padding: '15px',
                    marginBottom: '10px'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '5px'
                    }}>
                        Address
                    </div>
                    <div style={{
                        fontSize: '16px',
                        color: '#fff',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        wordBreak: 'break-all'
                    }}>
                        {getDisplayName(account)}
                    </div>
                </div>
                <div style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '6px',
                    padding: '15px'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '5px'
                    }}>
                        Balance
                    </div>
                    <div style={{
                        fontSize: '20px',
                        color: '#4CAF50',
                        fontWeight: 'bold'
                    }}>
                        {parseFloat(balance || '0').toFixed(4)} MATIC
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            padding: '20px',
            color: 'white',
            textAlign: 'center'
        }}>
            <h3 style={{
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: 'bold'
            }}>
                💼 Connect Wallet
            </h3>
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                    backgroundColor: isConnecting ? '#666' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    width: '100%',
                    opacity: isConnecting ? 0.7 : 1
                }}
            >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
        </div>
    );
};

export default WalletConnect; 