import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
import GnomeMascot from '../common/GnomeMascot';

const Header = () => {
    const walletContext = useWallet();
    const { account, connectWallet, disconnectWallet, isConnecting } = walletContext || {};
    const { getDisplayName } = useUserProfile();
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    
    // Debug: Log wallet context and disconnectWallet
    useEffect(() => {
        console.log('Header: Wallet context:', walletContext);
        console.log('Header: disconnectWallet type:', typeof disconnectWallet);
        console.log('Header: disconnectWallet value:', disconnectWallet);
        console.log('Header: Account changed to:', account);
    }, [account, walletContext, disconnectWallet]);

    const formatAddress = (address) => {
        if (!address) return '';
        // Use nickname if available, otherwise show shortened address
        return getDisplayName(address);
    };

    const handleDisconnect = () => {
        console.log('Disconnect button clicked');
        console.log('disconnectWallet available:', typeof disconnectWallet);
        console.log('walletContext:', walletContext);
        
        if (!disconnectWallet || typeof disconnectWallet !== 'function') {
            console.error('disconnectWallet is not a function!', disconnectWallet);
            // Try to get it directly from context
            const directDisconnect = walletContext?.disconnectWallet;
            if (directDisconnect && typeof directDisconnect === 'function') {
                console.log('Using direct disconnectWallet from context');
                setIsDisconnecting(true);
                try {
                    directDisconnect();
                    setTimeout(() => {
                        setIsDisconnecting(false);
                    }, 300);
                } catch (error) {
                    console.error('Error disconnecting wallet:', error);
                    setIsDisconnecting(false);
                }
            } else {
                console.error('disconnectWallet not found in context at all!');
                setIsDisconnecting(false);
            }
            return;
        }
        
        setIsDisconnecting(true);
        try {
            disconnectWallet();
            // Small delay to show the disconnecting state, then reset
            setTimeout(() => {
                setIsDisconnecting(false);
            }, 300);
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            setIsDisconnecting(false);
        }
    };

    return (
        <header style={{
            backgroundColor: '#1a1a1a',
            padding: '15px 30px',
            position: 'fixed',
            top: 0,
            right: 0,
            left: '250px', // Match navigation width
            zIndex: 1000,
            borderBottom: '1px solid #2d2d2d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {/* Gnome Mascot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GnomeMascot size="medium" color="brown" animated={true} />
                <span style={{ 
                    color: '#fff', 
                    fontFamily: 'var(--font-primary)', 
                    fontWeight: 'var(--font-bold)',
                    fontSize: 'var(--text-lg)'
                }}>
                    MrGamePlayer
                </span>
            </div>
            {account ? (
                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        padding: '8px 15px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        letterSpacing: 'var(--tracking-normal)'
                    }}>
                        {formatAddress(account)}
                    </div>
                    <button 
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        style={{
                            backgroundColor: isDisconnecting ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: isDisconnecting ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            fontFamily: 'var(--font-primary)',
                            fontWeight: 'var(--font-medium)',
                            fontSize: 'var(--text-sm)',
                            letterSpacing: 'var(--tracking-wide)',
                            opacity: isDisconnecting ? 0.7 : 1
                        }}
                        onMouseOver={(e) => !isDisconnecting && (e.target.style.backgroundColor = '#c82333')}
                        onMouseOut={(e) => !isDisconnecting && (e.target.style.backgroundColor = '#dc3545')}
                    >
                        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                </div>
            ) : (
                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    alignItems: 'center'
                }}>
                    <button 
                        onClick={connectWallet}
                        disabled={isConnecting}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                            opacity: isConnecting ? 0.7 : 1,
                            transition: 'background-color 0.2s',
                            fontFamily: 'var(--font-primary)',
                            fontWeight: 'var(--font-medium)',
                            fontSize: 'var(--text-sm)',
                            letterSpacing: 'var(--tracking-wide)'
                        }}
                        onMouseOver={(e) => !isConnecting && (e.target.style.backgroundColor = '#45a049')}
                        onMouseOut={(e) => !isConnecting && (e.target.style.backgroundColor = '#4CAF50')}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header; 