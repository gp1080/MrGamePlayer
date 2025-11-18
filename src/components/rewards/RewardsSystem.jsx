import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';

const RewardsSystem = () => {
    const { account } = useWallet();
    const { contract } = useContract();
    const [dailyChallenges, setDailyChallenges] = useState([]);
    const [rewards, setRewards] = useState({
        available: 0,
        pending: 0,
        total: 0
    });

    useEffect(() => {
        if (account) {
            fetchDailyChallenges();
            fetchRewards();
        }
    }, [account]);

    const fetchDailyChallenges = () => {
        // Placeholder challenges
        setDailyChallenges([
            {
                id: 1,
                title: "Speed Demon",
                description: "Complete a race under 60 seconds",
                reward: 10,
                progress: 0,
                target: 1,
                completed: false
            },
            {
                id: 2,
                title: "Perfect Run",
                description: "Complete a race without hitting obstacles",
                reward: 20,
                progress: 2,
                target: 3,
                completed: false
            },
            {
                id: 3,
                title: "Social Racer",
                description: "Play 5 multiplayer races",
                reward: 15,
                progress: 3,
                target: 5,
                completed: false
            }
        ]);
    };

    const fetchRewards = () => {
        setRewards({
            available: 45,
            pending: 25,
            total: 150
        });
    };

    const claimReward = async (challengeId) => {
        try {
            // This will be connected to your smart contract later
            console.log(`Claiming reward for challenge ${challengeId}`);
            // Update UI
            fetchDailyChallenges();
            fetchRewards();
        } catch (error) {
            console.error("Error claiming reward:", error);
        }
    };

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            {/* Rewards Summary */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <StatCard title="Available Rewards" value={`${rewards.available} MGP`} />
                <StatCard title="Pending Rewards" value={`${rewards.pending} MGP`} />
                <StatCard title="Total Earned" value={`${rewards.total} MGP`} />
            </div>

            {/* Daily Challenges */}
            <div>
                <h2 style={{ marginBottom: '15px' }}>Daily Challenges</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {dailyChallenges.map(challenge => (
                        <ChallengeCard 
                            key={challenge.id}
                            {...challenge}
                            onClaim={() => claimReward(challenge.id)}
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

const ChallengeCard = ({ 
    title, 
    description, 
    reward, 
    progress, 
    target, 
    completed,
    onClaim 
}) => (
    <div style={{
        backgroundColor: '#2d2d2d',
        padding: '20px',
        borderRadius: '8px'
    }}>
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px'
        }}>
            <div>
                <h3 style={{ marginBottom: '5px' }}>{title}</h3>
                <p style={{ color: '#999', fontSize: '14px' }}>{description}</p>
            </div>
            <div style={{ 
                backgroundColor: '#4CAF50',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                {reward} MGP
            </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '15px' }}>
            <div style={{ 
                height: '6px',
                backgroundColor: '#444',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${(progress / target) * 100}%`,
                    height: '100%',
                    backgroundColor: '#4CAF50',
                    transition: 'width 0.3s ease'
                }} />
            </div>
            <div style={{ 
                fontSize: '12px',
                color: '#999',
                marginTop: '5px'
            }}>
                {progress} / {target}
            </div>
        </div>

        <button
            onClick={onClaim}
            disabled={progress < target}
            style={{
                backgroundColor: progress >= target ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: progress >= target ? 'pointer' : 'not-allowed',
                width: '100%'
            }}
        >
            {progress >= target ? 'Claim Reward' : 'In Progress'}
        </button>
    </div>
);

export default RewardsSystem; 