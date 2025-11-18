import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';

const Dashboard = () => {
    const { account } = useWallet();
    // eslint-disable-next-line no-unused-vars
    const { contract } = useContract();
    const [userStats, setUserStats] = useState({
        gamesPlayed: 0,
        highScore: 0,
        tokensEarned: 0,
        achievements: [],
        rank: 0
    });
    const [leaderboard, setLeaderboard] = useState([]);

    // Fetch user stats
    useEffect(() => {
        if (account) {
            fetchUserStats();
            fetchLeaderboard();
        }
    }, [account]);

    const fetchUserStats = async () => {
        // This will be connected to your backend later
        // Placeholder data for now
        setUserStats({
            gamesPlayed: 42,
            highScore: 15000,
            tokensEarned: 150,
            achievements: [
                { id: 1, name: "First Win", description: "Win your first game", completed: true },
                { id: 2, name: "High Roller", description: "Score over 10,000 points", completed: true },
                { id: 3, name: "Token Master", description: "Earn 100 MGP tokens", completed: true }
            ],
            rank: 5
        });
    };

    const fetchLeaderboard = async () => {
        // Placeholder leaderboard data
        setLeaderboard([
            { address: "0x1234...5678", score: 20000, tokens: 200 },
            { address: "0x8765...4321", score: 18000, tokens: 180 },
            { address: "0x9876...1234", score: 15000, tokens: 150 }
        ]);
    };

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            {/* User Stats */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <StatCard title="Games Played" value={userStats.gamesPlayed} />
                <StatCard title="High Score" value={userStats.highScore} />
                <StatCard title="Tokens Earned" value={`${userStats.tokensEarned} MGP`} />
                <StatCard title="Global Rank" value={`#${userStats.rank}`} />
            </div>

            {/* Achievements */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '15px' }}>Achievements</h2>
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '15px'
                }}>
                    {userStats.achievements.map(achievement => (
                        <AchievementCard key={achievement.id} {...achievement} />
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div>
                <h2 style={{ marginBottom: '15px' }}>Global Leaderboard</h2>
                <div style={{ 
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {leaderboard.map((player, index) => (
                        <LeaderboardRow 
                            key={index}
                            rank={index + 1}
                            {...player}
                            isUser={player.address === account}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div style={{
        backgroundColor: '#2d2d2d',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
    }}>
        <div style={{ fontSize: '14px', color: '#999', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '24px' }}>{value}</div>
    </div>
);

const AchievementCard = ({ name, description, completed }) => (
    <div style={{
        backgroundColor: '#2d2d2d',
        padding: '15px',
        borderRadius: '8px',
        opacity: completed ? 1 : 0.5
    }}>
        <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px'
        }}>
            <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: completed ? '#4CAF50' : '#666',
                marginRight: '10px'
            }} />
            <h3>{name}</h3>
        </div>
        <p style={{ color: '#999', fontSize: '14px' }}>{description}</p>
    </div>
);

const LeaderboardRow = ({ rank, address, score, tokens, isUser }) => (
    <div style={{
        padding: '15px',
        backgroundColor: isUser ? '#3d3d3d' : 'transparent',
        display: 'grid',
        gridTemplateColumns: '50px 1fr 100px 100px',
        gap: '15px',
        alignItems: 'center',
        borderBottom: '1px solid #444'
    }}>
        <div style={{ fontWeight: 'bold' }}>#{rank}</div>
        <div>{address}</div>
        <div>{score}</div>
        <div>{tokens} MGP</div>
    </div>
);

export default Dashboard; 