import React, { useState } from 'react';
import { useFriends } from '../../contexts/FriendsContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
// eslint-disable-next-line no-unused-vars
import Card from '../common/Card';

const FriendsList = ({ roomId }) => {
    const { friends, friendRequests, acceptFriendRequest, sendGameInvite, removeFriend } = useFriends();
    const { getDisplayName } = useUserProfile();
    const [isExpanded, setIsExpanded] = useState(true); // Always expanded by default

    const statusColors = {
        online: '#4CAF50',
        'in-game': '#2196F3',
        offline: '#757575'
    };

    // If roomId is null, use inline styling for Profile page
    const isInline = roomId === null;
    
    return (
        <div style={{
            width: '100%',
            backgroundColor: isInline ? 'transparent' : '#1E1E1E',
            borderRadius: isInline ? '0' : '12px',
            boxShadow: isInline ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.3)',
            border: isInline ? 'none' : '1px solid #333',
            minHeight: isInline ? 'auto' : '200px',
            maxHeight: isInline ? 'none' : '500px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {!isInline && (
                <div 
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        padding: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: isExpanded ? '1px solid #333' : 'none',
                        backgroundColor: '#2d2d2d',
                        borderRadius: isExpanded ? '0' : '12px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>👥</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                            Friends ({friends.length})
                        </span>
                    </div>
                    <span style={{ color: '#999', fontSize: '14px' }}>
                        {isExpanded ? '▼' : '▶'}
                    </span>
                </div>
            )}

            {(isExpanded || isInline) && (
                <div style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    minHeight: isInline ? 'auto' : '150px'
                }}>
                    {friends.length === 0 && friendRequests.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            <p style={{ margin: 0 }}>No friends yet. Add friends from your Profile page!</p>
                        </div>
                    )}
                    
                    {friendRequests.length > 0 && (
                        <div style={{ padding: '10px' }}>
                            <h4 style={{ color: '#fff', marginBottom: '10px' }}>Friend Requests</h4>
                            {friendRequests.map(request => (
                                <div 
                                    key={request.address}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: '#2d2d2d',
                                        borderRadius: '8px',
                                        marginBottom: '8px'
                                    }}
                                >
                                    <div style={{ color: '#fff', marginBottom: '5px' }}>
                                        {getDisplayName(request.address)}
                                    </div>
                                    <button
                                        onClick={() => acceptFriendRequest(request.address)}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Accept
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ padding: '10px' }}>
                        {friends.map(friend => (
                            <div
                                key={friend.address}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#2d2d2d',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 'bold' }}>
                                        {getDisplayName(friend.address)}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        marginTop: '3px'
                                    }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: statusColors[friend.status],
                                            display: 'inline-block'
                                        }} />
                                        <span style={{
                                            color: '#999',
                                            fontSize: '12px'
                                        }}>
                                            {friend.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {roomId && friend.status === 'online' && (
                                        <button
                                            onClick={() => sendGameInvite(friend.address, roomId)}
                                            style={{
                                                backgroundColor: '#2196F3',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Invite
                                        </button>
                                    )}
                                    {!roomId && (
                                        <button
                                            onClick={() => removeFriend(friend.address)}
                                            style={{
                                                backgroundColor: '#F44336',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendsList; 