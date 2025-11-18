import React from 'react';

const LiveGames = () => {
    return (
        <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Live Games</h2>
            
            <div className="grid gap-4">
                {liveGames.map((game, index) => (
                    <GameCard key={index} {...game} />
                ))}
            </div>
        </div>
    );
};

const GameCard = ({ id, players, prizePool, status, timeLeft }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Game #{id}</span>
            <span className={`px-2 py-1 rounded text-sm ${
                status === 'In Progress' 
                    ? 'bg-green-900 text-green-400' 
                    : 'bg-yellow-900 text-yellow-400'
            }`}>
                {status}
            </span>
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-gray-400">Players</span>
                <span className="text-white">{players}/8</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Prize Pool</span>
                <span className="text-white">{prizePool} RACE</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Time Left</span>
                <span className="text-white">{timeLeft}</span>
            </div>
        </div>

        <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Join Game
        </button>
    </div>
);

const liveGames = [
    {
        id: '1234',
        players: 6,
        prizePool: '1,000',
        status: 'In Progress',
        timeLeft: '2:30'
    },
    {
        id: '1235',
        players: 3,
        prizePool: '500',
        status: 'Waiting',
        timeLeft: '1:45'
    }
];

export default LiveGames; 