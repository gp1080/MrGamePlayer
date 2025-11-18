import React from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/wallet/WalletConnect';
import TokenPurchase from '../components/wallet/TokenPurchase';
import BetHistory from '../components/betting/BetHistory';
import NicknameEditor from '../components/profile/NicknameEditor';
import AddFriend from '../components/friends/AddFriend';
import FriendsList from '../components/friends/FriendsList';
import { useFriends } from '../contexts/FriendsContext';
import { useUserProfile } from '../contexts/UserProfileContext';

const Profile = () => {
    const navigate = useNavigate();
    const { friends, friendRequests, gameInvites, acceptGameInvite, rejectGameInvite } = useFriends();
    const { getDisplayName } = useUserProfile();

    return (
        <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '20px',
            minHeight: '100vh'
        }}>
            <h1 style={{
                fontSize: 'var(--text-5xl)',
                fontWeight: 'var(--font-extrabold)',
                color: 'white',
                marginBottom: '10px',
                background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>
                👤 Profile
            </h1>
            
            <p style={{
                fontSize: 'var(--text-lg)',
                color: '#ccc',
                marginBottom: '40px'
            }}>
                Manage your account, friends, and game settings
            </p>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #4CAF50',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#4CAF50',
                        marginBottom: '5px'
                    }}>
                        {friends.length}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '14px' }}>
                        Total Friends
                    </div>
                </div>
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #FF9800',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#FF9800',
                        marginBottom: '5px'
                    }}>
                        {friendRequests.length}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '14px' }}>
                        Pending Requests
                    </div>
                </div>
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #2196F3',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#2196F3',
                        marginBottom: '5px'
                    }}>
                        {gameInvites?.length || 0}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '14px' }}>
                        Game Invites
                    </div>
                </div>
            </div>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'white',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>✏️</span> Edit Nickname
                        </h2>
                        <NicknameEditor />
                    </div>

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'white',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>➕</span> Add Friend
                        </h2>
                        <AddFriend />
                    </div>

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'white',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>🔗</span> Wallet Connection
                        </h2>
                        <WalletConnect />
                    </div>

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'white',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>💎</span> Purchase Tokens
                        </h2>
                        <TokenPurchase />
                    </div>
                </div>
                
                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Game Invites Section */}
                    {gameInvites && gameInvites.length > 0 && (
                        <div style={{
                            backgroundColor: '#2d2d2d',
                            borderRadius: '12px',
                            padding: '25px',
                            border: '2px solid #4CAF50'
                        }}>
                            <h2 style={{
                                fontSize: 'var(--text-xl)',
                                fontWeight: 'var(--font-bold)',
                                color: '#4CAF50',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>🎮</span> Game Invitations ({gameInvites.length})
                            </h2>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                {gameInvites.map(invite => (
                                    <div
                                        key={invite.id}
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '8px',
                                            padding: '15px',
                                            border: '2px solid #4CAF50'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            marginBottom: '8px',
                                            color: 'white'
                                        }}>
                                            Game Invitation
                                        </div>
                                        <div style={{
                                            color: '#999',
                                            fontSize: '14px',
                                            marginBottom: '5px'
                                        }}>
                                            From: {getDisplayName(invite.inviter)}
                                        </div>
                                        <div style={{
                                            color: '#999',
                                            fontSize: '12px',
                                            marginBottom: '15px'
                                        }}>
                                            Room ID: {invite.roomId}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '10px'
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
                                                    padding: '10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    transition: 'background-color 0.3s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                            >
                                                Accept & Join
                                            </button>
                                            <button
                                                onClick={() => rejectGameInvite(invite.id)}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#666',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    transition: 'background-color 0.3s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#666'}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'white',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>👥</span> Friends ({friends.length})
                        </h2>
                        <FriendsList roomId={null} />
                    </div>

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'white',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>📊</span> Betting History
                        </h2>
                        <BetHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 