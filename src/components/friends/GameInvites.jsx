import React from 'react';
import { useFriends } from '../../contexts/FriendsContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useNavigate } from 'react-router-dom';

const GameInvites = () => {
    const { gameInvites, acceptGameInvite, rejectGameInvite } = useFriends();
    const { getDisplayName } = useUserProfile();
    const navigate = useNavigate();

    if (!gameInvites || gameInvites.length === 0) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1001,
            maxWidth: '350px'
        }}>
            {gameInvites.map(invite => (
                <div
                    key={invite.id}
                    style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '10px',
                        border: '2px solid #4CAF50',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <span style={{ fontSize: '24px' }}>🎮</span>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                                Game Invitation
                            </div>
                            <div style={{ color: '#999', fontSize: '12px' }}>
                                From: {getDisplayName(invite.inviter)}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '6px',
                        padding: '8px',
                        marginBottom: '10px',
                        fontSize: '12px',
                        color: '#ccc'
                    }}>
                        Room: {invite.roomId}
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <button
                            onClick={() => {
                                acceptGameInvite(invite.id, invite.roomId);
                                navigate(`/room/${invite.roomId}`);
                            }}
                            style={{
                                flex: 1,
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => rejectGameInvite(invite.id)}
                            style={{
                                flex: 1,
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GameInvites;

