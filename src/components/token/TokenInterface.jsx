import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { ethers, formatEther, parseEther } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import MGPCalculator from './MGPCalculator';

const TokenInterface = () => {
    const { account, provider } = useWallet();
    const { contract } = useContract();
    
    const [balance, setBalance] = useState('0');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [sellAmount, setSellAmount] = useState('');
    const [stakeAmount, setStakeAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [stakedBalance, setStakedBalance] = useState('0');
    const [contractReserve, setContractReserve] = useState('0');

    const updateBalances = React.useCallback(async () => {
        try {
            const balance = await contract.balanceOf(account);
            setBalance(formatEther(balance));
            
            const staked = await contract.stakingBalance(account);
            setStakedBalance(formatEther(staked));
            
            // Get contract MATIC balance (reserves)
            if (provider) {
                const contractAddress = await contract.getAddress();
                const reserve = await provider.getBalance(contractAddress);
                setContractReserve(formatEther(reserve));
            }
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    }, [contract, account, provider]);

    // Fetch balances
    useEffect(() => {
        if (contract && account) {
            updateBalances();
        }
    }, [contract, account, updateBalances]);

    // Buy tokens
    const handlePurchase = async () => {
        try {
            const amountInMatic = parseEther(purchaseAmount);
            const tx = await contract.purchaseTokens({ value: amountInMatic });
            await tx.wait();
            updateBalances();
            setPurchaseAmount('');
            alert('Tokens purchased successfully!');
        } catch (error) {
            console.error("Error purchasing tokens:", error);
            alert('Failed to purchase tokens: ' + (error.message || 'Unknown error'));
        }
    };

    // Sell tokens
    const handleSell = async () => {
        try {
            if (!sellAmount || parseFloat(sellAmount) <= 0) {
                alert('Please enter a valid amount to sell');
                return;
            }
            
            const amount = parseEther(sellAmount);
            const tx = await contract.sellTokens(amount);
            await tx.wait();
            updateBalances();
            setSellAmount('');
            alert('Tokens sold successfully!');
        } catch (error) {
            console.error("Error selling tokens:", error);
            const errorMsg = error.message || 'Unknown error';
            if (errorMsg.includes('Insufficient MATIC reserves')) {
                alert('Contract has insufficient MATIC reserves. Please try again later.');
            } else if (errorMsg.includes('Insufficient balance')) {
                alert('You do not have enough MGP tokens to sell.');
            } else {
                alert('Failed to sell tokens: ' + errorMsg);
            }
        }
    };

    // Stake tokens
    const handleStake = async () => {
        try {
            const amount = parseEther(stakeAmount);
            const tx = await contract.stake(amount);
            await tx.wait();
            updateBalances();
            setStakeAmount('');
        } catch (error) {
            console.error("Error staking tokens:", error);
        }
    };

    // Transfer tokens
    const handleTransfer = async () => {
        try {
            const amount = parseEther(transferAmount);
            const tx = await contract.transfer(transferTo, amount);
            await tx.wait();
            updateBalances();
            setTransferAmount('');
            setTransferTo('');
        } catch (error) {
            console.error("Error transferring tokens:", error);
        }
    };


    return (
        <div style={{ color: 'white' }}>
            {/* MGP Calculator */}
            <div style={{ marginBottom: '40px' }}>
                <MGPCalculator />
            </div>

            {/* Stats */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '30px' 
            }}>
                <StatCard title="Your Balance" value={`${parseFloat(balance).toFixed(2)} MGP`} />
                <StatCard title="Staked" value={`${parseFloat(stakedBalance).toFixed(2)} MGP`} />
                <StatCard title="Price" value="$0.0167 USD" />
                <StatCard title="Contract Reserves" value={`${parseFloat(contractReserve).toFixed(2)} MATIC`} />
                <StatCard title="Total Liquidity" value="100M MGP" />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Buy Section */}
                <ActionSection>
                    <h3>💰 Buy Tokens</h3>
                    <input
                        type="number"
                        step="0.1"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        placeholder="Amount in MATIC"
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #555',
                            backgroundColor: '#2d2d2d',
                            color: 'white',
                            fontSize: '16px'
                        }}
                    />
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '-5px' }}>
                        {purchaseAmount ? `You'll receive ${(parseFloat(purchaseAmount) / 0.1).toFixed(2)} MGP` : '1 MATIC = 10 MGP'}
                    </div>
                    <button 
                        onClick={handlePurchase}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Buy MGP Tokens
                    </button>
                </ActionSection>

                {/* Sell Section */}
                <ActionSection>
                    <h3>💸 Sell Tokens</h3>
                    <input
                        type="number"
                        step="0.1"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        placeholder="Amount in MGP"
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #555',
                            backgroundColor: '#2d2d2d',
                            color: 'white',
                            fontSize: '16px'
                        }}
                    />
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '-5px' }}>
                        {sellAmount ? `You'll receive ${(parseFloat(sellAmount) * 0.1).toFixed(4)} MATIC` : '1 MGP = 0.1 MATIC'}
                    </div>
                    <button 
                        onClick={handleSell}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#F44336',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Sell MGP Tokens
                    </button>
                    <button 
                        onClick={() => setSellAmount(balance)}
                        style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #555',
                            backgroundColor: 'transparent',
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Sell All ({parseFloat(balance).toFixed(2)} MGP)
                    </button>
                </ActionSection>

                {/* Stake Section */}
                <ActionSection>
                    <h3>Stake Tokens</h3>
                    <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="Amount to stake"
                    />
                    <button onClick={handleStake}>Stake MGP</button>
                </ActionSection>

                {/* Transfer Section */}
                <ActionSection>
                    <h3>Transfer Tokens</h3>
                    <input
                        type="text"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        placeholder="Recipient address"
                    />
                    <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Amount to transfer"
                    />
                    <button onClick={handleTransfer}>Transfer</button>
                </ActionSection>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '15px',
        borderRadius: '6px'
    }}>
        <div style={{ fontSize: '14px', color: '#999' }}>{title}</div>
        <div style={{ fontSize: '18px', marginTop: '5px' }}>{value}</div>
    </div>
);

const ActionSection = ({ children }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '20px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    }}>
        {children}
    </div>
);

export default TokenInterface; 