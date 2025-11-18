import React, { useState } from 'react';
import { ethers, BrowserProvider, parseEther } from 'ethers';
import GameBetting from '../../contracts/GameBetting.json';

const BettingPanel = () => {
    const [betAmount, setBetAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const placeBet = async () => {
        try {
            setLoading(true);
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                process.env.REACT_APP_BETTING_CONTRACT_ADDRESS,
                GameBetting.abi,
                signer
            );

            const amount = parseEther(betAmount);
            const tx = await contract.placeBet(amount);
            await tx.wait();

            alert('Bet placed successfully!');
            setBetAmount('');
        } catch (error) {
            console.error('Error placing bet:', error);
            alert('Error placing bet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Place Your Bet</h2>
            <div className="space-y-4">
                <div>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        placeholder="Amount in MGP tokens"
                        className="w-full px-4 py-2 rounded bg-gray-800 text-white"
                    />
                </div>
                <button
                    onClick={placeBet}
                    disabled={loading || !betAmount}
                    className="w-full bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-white disabled:opacity-50"
                >
                    {loading ? 'Placing Bet...' : 'Place Bet'}
                </button>
            </div>
        </div>
    );
};

export default BettingPanel; 