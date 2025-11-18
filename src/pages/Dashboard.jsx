import React from 'react';
import WalletConnect from '../components/wallet/WalletConnect';
import GameStats from '../components/game/GameStats';
import Leaderboard from '../components/game/Leaderboard';
import LiveGames from '../components/game/LiveGames';
import BettingPanel from '../components/betting/BettingPanel';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-800 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Game Dashboard</h1>
                    <WalletConnect />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats and Live Games */}
                    <div className="lg:col-span-2 space-y-8">
                        <GameStats />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-900 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Your Balance</span>
                                        <span className="text-green-400">1,234 RACE</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Games Played</span>
                                        <span>24</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Win Rate</span>
                                        <span className="text-blue-400">65%</span>
                                    </div>
                                </div>
                            </div>
                            <BettingPanel />
                        </div>
                        <LiveGames />
                    </div>

                    {/* Right Column - Leaderboard */}
                    <div className="space-y-8">
                        <Leaderboard />
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Your Achievements</h2>
                            <div className="space-y-4">
                                {achievements.map((achievement, index) => (
                                    <Achievement key={index} {...achievement} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Achievement = ({ title, description, progress, completed }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <span className={`font-semibold ${completed ? 'text-green-400' : 'text-gray-300'}`}>
                {title}
            </span>
            {completed && (
                <span className="text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
            )}
        </div>
        <p className="text-sm text-gray-400">{description}</p>
        {!completed && (
            <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className="bg-blue-600 rounded-full h-2" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs text-gray-400 mt-1">{progress}%</span>
            </div>
        )}
    </div>
);

const achievements = [
    {
        title: 'First Victory',
        description: 'Win your first race',
        completed: true
    },
    {
        title: 'High Roller',
        description: 'Place a bet of 1000 RACE or more',
        progress: 75
    },
    {
        title: 'Champion',
        description: 'Win 50 races',
        progress: 48
    }
];

export default Dashboard; 