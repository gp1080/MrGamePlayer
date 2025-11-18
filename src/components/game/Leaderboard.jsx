import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
    const [timeFrame, setTimeFrame] = useState('daily'); // daily, weekly, monthly
    const [leaderboardData, setLeaderboardData] = useState([]);

    // Simulated data - replace with actual API call
    useEffect(() => {
        const dummyData = [
            { address: '0x1234...5678', wins: 15, earnings: 1500, rank: 1 },
            { address: '0x8765...4321', wins: 12, earnings: 1200, rank: 2 },
            { address: '0x9876...1234', wins: 10, earnings: 1000, rank: 3 },
        ];
        setLeaderboardData(dummyData);
    }, [timeFrame]);

    return (
        <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                <div className="flex space-x-2">
                    {['daily', 'weekly', 'monthly'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeFrame(period)}
                            className={`px-3 py-1 rounded ${
                                timeFrame === period
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-800">
                            <th className="px-4 py-2 text-left">Rank</th>
                            <th className="px-4 py-2 text-left">Player</th>
                            <th className="px-4 py-2 text-right">Wins</th>
                            <th className="px-4 py-2 text-right">Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map((player) => (
                            <tr 
                                key={player.address} 
                                className="border-b border-gray-800 hover:bg-gray-800"
                            >
                                <td className="px-4 py-3 text-gray-300">#{player.rank}</td>
                                <td className="px-4 py-3 text-gray-300">{player.address}</td>
                                <td className="px-4 py-3 text-right text-gray-300">{player.wins}</td>
                                <td className="px-4 py-3 text-right text-green-400">
                                    {player.earnings} RACE
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard; 