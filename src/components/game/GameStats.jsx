import React from 'react';

const GameStats = () => {
    return (
        <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Game Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Players"
                    value="0"
                    change="--"
                    isPositive={true}
                />
                <StatCard
                    title="Active Games"
                    value="0"
                    change="--"
                    isPositive={true}
                />
                <StatCard
                    title="Total Prize Pool"
                    value="0 MGP"
                    change="--"
                    isPositive={true}
                />
                <StatCard
                    title="Avg. Bet Size"
                    value="0 MGP"
                    change="--"
                    isPositive={false}
                />
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                        <ActivityItem key={index} {...activity} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, isPositive }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <div className="text-white text-xl font-bold mt-1">{value}</div>
        <div className={`text-sm mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {change}
        </div>
    </div>
);

const ActivityItem = ({ type, player, amount, time }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-800">
        <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
                type === 'win' ? 'bg-green-400' : 'bg-blue-400'
            }`} />
            <span className="text-gray-300">{player}</span>
        </div>
        <div className="text-right">
            <div className="text-gray-300">{amount} RACE</div>
            <div className="text-sm text-gray-500">{time}</div>
        </div>
    </div>
);

// Fetch real activity from backend
const recentActivity = [];

export default GameStats; 