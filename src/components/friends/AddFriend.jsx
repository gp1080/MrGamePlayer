import React, { useState } from 'react';
import { useFriends } from '../../contexts/FriendsContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const AddFriend = () => {
    const { sendFriendRequest, friends } = useFriends();
    const { getDisplayName } = useUserProfile();
    const [friendAddress, setFriendAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddFriend = async () => {
        setError('');
        setSuccess('');

        // Validate address
        if (!friendAddress.trim()) {
            setError('Please enter a wallet address');
            return;
        }

        // Basic address validation (starts with 0x and has 42 characters)
        if (!friendAddress.startsWith('0x') || friendAddress.length !== 42) {
            setError('Invalid wallet address format');
            return;
        }

        // Check if already a friend
        if (friends.some(f => f.address.toLowerCase() === friendAddress.toLowerCase())) {
            setError('This user is already your friend');
            return;
        }

        try {
            await sendFriendRequest(friendAddress);
            setSuccess(`Friend request sent to ${getDisplayName(friendAddress)}`);
            setFriendAddress('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to send friend request');
        }
    };

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            color: 'white'
        }}>
            <h3 style={{
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                ➕ Add Friend
            </h3>

            <div style={{ marginBottom: '15px' }}>
                <input
                    type="text"
                    value={friendAddress}
                    onChange={(e) => {
                        setFriendAddress(e.target.value);
                        setError('');
                        setSuccess('');
                    }}
                    placeholder="Enter wallet address (0x...)"
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1a1a1a',
                        border: `2px solid ${error ? '#F44336' : '#333'}`,
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAddFriend();
                        }
                    }}
                />
                {error && (
                    <div style={{
                        color: '#F44336',
                        fontSize: '12px',
                        marginTop: '5px'
                    }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        color: '#4CAF50',
                        fontSize: '12px',
                        marginTop: '5px'
                    }}>
                        {success}
                    </div>
                )}
            </div>

            <button
                onClick={handleAddFriend}
                style={{
                    width: '100%',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}
            >
                Send Friend Request
            </button>
        </div>
    );
};

export default AddFriend;
