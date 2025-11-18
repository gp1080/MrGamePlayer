import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [forceUpdate, setForceUpdate] = useState(0);
    const isDisconnectedRef = useRef(false);

    // Define handlers first so they can be referenced everywhere
    const handleAccountsChanged = (accounts) => {
        console.log('Accounts changed event:', accounts);
        
        // If user manually disconnected, don't auto-reconnect
        if (isDisconnectedRef.current) {
            console.log('Manual disconnect detected - ignoring accounts changed event');
            return;
        }
        
        if (!accounts || accounts.length === 0) {
            // User disconnected wallet or switched accounts
            console.log('No accounts - clearing connection');
            setAccount(null);
            setProvider(null);
            return;
        }
        
        // User switched accounts (not manual disconnect)
        if (accounts && accounts.length > 0) {
            // Ensure account is a string
            const accountAddress = typeof accounts[0] === 'string' ? accounts[0] : accounts[0].address || accounts[0];
            console.log('Updating account to:', accountAddress);
            setAccount(accountAddress);
        }
    };

    const handleChainChanged = () => {
        window.location.reload();
    };

    const checkIfWalletIsConnected = async () => {
        try {
            // Don't check if manually disconnected
            if (isDisconnectedRef.current) {
                console.log('Skipping auto-connect check - wallet was manually disconnected');
                return;
            }
            
            if (!window.ethereum) {
                return; // No wallet installed, don't set error on mount
            }

            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            
            if (accounts && accounts.length > 0) {
                const accountAddress = accounts[0].address || accounts[0];
                setProvider(provider);
                setAccount(accountAddress);
                
                // Set up listeners only if wallet was already connected
                if (window.ethereum) {
                    // Remove existing listeners first to avoid duplicates
                    try {
                        window.ethereum.off('accountsChanged', handleAccountsChanged);
                        window.ethereum.off('chainChanged', handleChainChanged);
                    } catch (e) {
                        try {
                            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                            window.ethereum.removeListener('chainChanged', handleChainChanged);
                        } catch (e2) {
                            // Listeners might not exist yet, that's okay
                        }
                    }
                    
                    // Add new listeners
                    window.ethereum.on('accountsChanged', handleAccountsChanged);
                    window.ethereum.on('chainChanged', handleChainChanged);
                }
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
            // Don't set error on mount - just log it
        }
    };

    const connectWallet = async () => {
        try {
            setIsConnecting(true);
            setError(null);
            console.log('Attempting to connect wallet...');
            
            // Clear disconnect flag
            isDisconnectedRef.current = false;

            if (!window.ethereum) {
                throw new Error("Please install a Web3 wallet (MetaMask, Phantom, etc.)!");
            }

            console.log('Web3 provider found:', window.ethereum);
            
            const provider = new BrowserProvider(window.ethereum);
            console.log('Provider created:', provider);
            
            // Request accounts using window.ethereum directly
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log('Accounts received:', accounts);
            
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please unlock your wallet.");
            }
            
            // Ensure account is a string
            const accountAddress = typeof accounts[0] === 'string' ? accounts[0] : accounts[0].address || accounts[0];
            
            setProvider(provider);
            setAccount(accountAddress);
            console.log('Wallet connected successfully:', accountAddress);

            // Set up event listeners after successful connection
            if (window.ethereum) {
                // Remove existing listeners first to avoid duplicates
                try {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                } catch (e) {
                    // Listeners might not exist yet, that's okay
                }
                
                // Add new listeners
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', handleChainChanged);
            }

            return accountAddress;
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError(error.message || "Failed to connect wallet. Please try again.");
            return null;
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        console.log('=== DISCONNECT WALLET CALLED ===');
        
        // Set flag to prevent auto-reconnect IMMEDIATELY
        isDisconnectedRef.current = true;
        console.log('Disconnect flag set to true');
        
        // Remove event listeners FIRST before clearing state
        if (window.ethereum) {
            try {
                // Use off() method which is more reliable than removeListener
                window.ethereum.off('accountsChanged', handleAccountsChanged);
                window.ethereum.off('chainChanged', handleChainChanged);
                console.log('Event listeners removed using off()');
            } catch (listenerError) {
                try {
                    // Fallback to removeListener
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                    console.log('Event listeners removed using removeListener');
                } catch (e) {
                    console.warn('Could not remove listeners:', e);
                }
            }
        }
        
        // Clear any stored wallet data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAccount');
            console.log('LocalStorage cleared');
        }
        
        // Clear state IMMEDIATELY - set all state synchronously
        console.log('Clearing state...');
        
        // Clear all state immediately
        setAccount(null);
        setProvider(null);
        setError(null);
        setIsConnecting(false);
        setForceUpdate(prev => prev + 1); // Force re-render
        
        // Use flushSync if available to force immediate update (React 18+)
        if (React.useSyncExternalStore) {
            // Force immediate render
            setTimeout(() => {
                setAccount(null);
                setProvider(null);
            }, 0);
        }
        
        console.log('=== DISCONNECT COMPLETE ===');
    };

    // Check if wallet is already connected on mount and set up listeners
    useEffect(() => {
        // Only check on initial mount, and only if not manually disconnected
        const checkConnection = async () => {
            if (window.ethereum && !isDisconnectedRef.current) {
                await checkIfWalletIsConnected();
            }
        };
        checkConnection();
    }, []);

    // Cleanup listeners on unmount
    useEffect(() => {
        return () => {
            if (window.ethereum) {
                try {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                } catch (error) {
                    console.error('Error removing listeners:', error);
                }
            }
        };
    }, []);

    // Create context value object
    const contextValue = {
        account,
        provider,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet
    };
    
    // Debug: Verify disconnectWallet is a function
    console.log('WalletProvider: disconnectWallet type:', typeof disconnectWallet);
    console.log('WalletProvider: contextValue:', contextValue);
    console.log('WalletProvider: disconnectWallet in value:', contextValue.disconnectWallet);
    
    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        // Return a default context instead of throwing to allow graceful degradation
        console.warn('useWallet called outside WalletProvider - returning default context');
        return {
            account: null,
            provider: null,
            isConnecting: false,
            error: null,
            connectWallet: async () => {
                console.warn('connectWallet called but wallet not initialized');
                return null;
            },
            disconnectWallet: () => {
                console.warn('disconnectWallet called but wallet not initialized');
            }
        };
    }
    return context;
}; 