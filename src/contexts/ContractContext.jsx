import React, { createContext, useContext, useState } from 'react';
import { ethers, parseEther, formatEther } from 'ethers';
import { useWallet } from './WalletContext';
import MGPTokenFixed from '../contracts/MGPTokenFixed.json';
import GameBetting from '../contracts/GameBetting.json';

const ContractContext = createContext();

const CONTRACT_ADDRESSES = {
    token: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8", // MGPTokenFixed - Deployed on Amoy
    betting: process.env.REACT_APP_BETTING_CONTRACT_ADDRESS
};

export const ContractProvider = ({ children }) => {
    const { provider, account } = useWallet();
    const [tokenBalance, setTokenBalance] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getContracts = () => {
        if (!provider || !account) return null;

        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
            CONTRACT_ADDRESSES.token,
            MGPTokenFixed.abi,
            signer
        );
        const bettingContract = new ethers.Contract(
            CONTRACT_ADDRESSES.betting,
            GameBetting.abi,
            signer
        );

        return { tokenContract, bettingContract };
    };

    const updateTokenBalance = async () => {
        const contracts = getContracts();
        if (!contracts) return;

        try {
            const balance = await contracts.tokenContract.balanceOf(account);
            setTokenBalance(formatEther(balance));
        } catch (err) {
            console.error('Error fetching token balance:', err);
        }
    };

    // Token Contract Functions
    const purchaseTokens = async (maticAmount) => {
        setIsLoading(true);
        setError(null);

        try {
            const contracts = getContracts();
            if (!contracts) throw new Error('Contracts not initialized');

            // MGP Token uses purchaseTokens() which is payable
            // Send MATIC directly, contract calculates token amount (1 MGP = 0.1 MATIC)
            const tx = await contracts.tokenContract.purchaseTokens({
                value: parseEther(maticAmount.toString())
            });
            
            await tx.wait();
            await updateTokenBalance();
            
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Betting Contract Functions
    const placeBet = async (amount) => {
        setIsLoading(true);
        setError(null);

        try {
            const contracts = getContracts();
            if (!contracts) throw new Error('Contracts not initialized');

            const parsedAmount = parseEther(amount);
            
            // First approve the betting contract to spend tokens
            const approveTx = await contracts.tokenContract.approve(
                CONTRACT_ADDRESSES.betting,
                parsedAmount
            );
            await approveTx.wait();

            // Then place the bet
            const betTx = await contracts.bettingContract.placeBet(parsedAmount);
            await betTx.wait();
            
            await updateTokenBalance();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Transaction History
    const getTransactionHistory = async () => {
        try {
            const contracts = getContracts();
            if (!contracts) throw new Error('Contracts not initialized');

            // Get bet events
            const filter = contracts.bettingContract.filters.BetPlaced(null, account);
            const events = await contracts.bettingContract.queryFilter(filter);

            return events.map(event => ({
                type: 'bet',
                amount: formatEther(event.args.amount),
                timestamp: new Date(event.blockTimestamp * 1000),
                transactionHash: event.transactionHash
            }));
        } catch (err) {
            console.error('Error fetching transaction history:', err);
            return [];
        }
    };

    return (
        <ContractContext.Provider
            value={{
                tokenBalance,
                isLoading,
                error,
                purchaseTokens,
                placeBet,
                updateTokenBalance,
                getTransactionHistory
            }}
        >
            {children}
        </ContractContext.Provider>
    );
};

export const useContract = () => {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error('useContract must be used within a ContractProvider');
    }
    return context;
}; 