import React, { useState } from 'react';
import { useContract } from '../../contexts/ContractContext';

const TransactionHandler = () => {
    const { 
        tokenBalance, 
        isLoading, 
        error, 
        purchaseTokens, 
        placeBet 
    } = useContract();
    
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('purchase'); // 'purchase' or 'bet'

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (transactionType === 'purchase') {
            await purchaseTokens(amount);
        } else {
            await placeBet(amount);
        }
        
        setAmount('');
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                    {transactionType === 'purchase' ? 'Purchase Tokens' : 'Place Bet'}
                </h2>
                <div className="text-sm text-gray-400">
                    Balance: {tokenBalance} RACE
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setTransactionType('purchase')}
                            className={`flex-1 py-2 rounded ${
                                transactionType === 'purchase'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400'
                            }`}
                        >
                            Purchase
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType('bet')}
                            className={`flex-1 py-2 rounded ${
                                transactionType === 'bet'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400'
                            }`}
                        >
                            Bet
                        </button>
                    </div>

                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Amount in ${transactionType === 'purchase' ? 'MATIC' : 'RACE'}`}
                        className="w-full px-4 py-2 bg-gray-800 rounded text-white placeholder-gray-500"
                        min="0"
                        step="0.01"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !amount}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Processing...' : (
                        transactionType === 'purchase' ? 'Purchase Tokens' : 'Place Bet'
                    )}
                </button>
            </form>
        </div>
    );
};

export default TransactionHandler; 