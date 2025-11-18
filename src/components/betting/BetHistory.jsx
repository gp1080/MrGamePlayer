import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const BetHistory = () => {
    const { account } = useWallet();
    const { getDisplayName } = useUserProfile();
    
    // Placeholder betting history - would be replaced with actual data from contract/API
    const bettingHistory = [
        // This would come from smart contract events or API
    ];

    if (!account) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#999'
            }}>
                Connect your wallet to view betting history
            </div>
        );
    }

    if (bettingHistory.length === 0) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#999'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                    No betting history yet
                </div>
                <div style={{ fontSize: '12px' }}>
                    Start playing games to see your betting history here
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {bettingHistory.map((bet, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '6px',
                        padding: '15px',
                        marginBottom: '10px',
                        borderLeft: '3px solid #4CAF50'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>
                            {bet.gameName}
                        </div>
                        <div style={{
                            color: bet.result === 'won' ? '#4CAF50' : '#F44336',
                            fontWeight: 'bold'
                        }}>
                            {bet.result === 'won' ? '+ ' : '- '}{bet.amount} MGP
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                        {bet.date} • {bet.opponent ? `vs ${getDisplayName(bet.opponent)}` : 'Solo game'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BetHistory;
