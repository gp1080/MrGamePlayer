import React, { useState } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useWallet } from '../../contexts/WalletContext';

const NicknameEditor = () => {
    const { nickname, updateNickname } = useUserProfile();
    const { account } = useWallet();
    const [editing, setEditing] = useState(false);
    const [newNickname, setNewNickname] = useState(nickname || '');
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        
        // Validate nickname
        if (newNickname.trim().length > 20) {
            setError('Nickname must be 20 characters or less');
            return;
        }

        // Check for invalid characters (optional - add more validation if needed)
        const invalidChars = /[<>]/;
        if (invalidChars.test(newNickname)) {
            setError('Nickname contains invalid characters');
            return;
        }

        updateNickname(newNickname);
        setEditing(false);
    };

    const handleCancel = () => {
        setNewNickname(nickname || '');
        setEditing(false);
        setError('');
    };

    if (!account) {
        return (
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                padding: '20px',
                color: 'white'
            }}>
                <p style={{ color: '#999' }}>Connect your wallet to set a nickname</p>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            padding: '20px',
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
                🏷️ Your Nickname
            </h3>

            {!editing ? (
                <div>
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '6px',
                        padding: '15px',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                                {nickname || 'No nickname set'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {nickname ? 'Edit' : 'Set Nickname'}
                        </button>
                    </div>
                    {nickname && (
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                            Your nickname will be displayed to friends and in game rooms
                        </p>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => {
                            setNewNickname(e.target.value);
                            setError('');
                        }}
                        placeholder="Enter your nickname (max 20 characters)"
                        maxLength={20}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#1a1a1a',
                            border: `2px solid ${error ? '#F44336' : '#333'}`,
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '16px',
                            marginBottom: '10px'
                        }}
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSave();
                            } else if (e.key === 'Escape') {
                                handleCancel();
                            }
                        }}
                    />
                    {error && (
                        <div style={{
                            color: '#F44336',
                            fontSize: '12px',
                            marginBottom: '10px'
                        }}>
                            {error}
                        </div>
                    )}
                    <div style={{
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <button
                            onClick={handleSave}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                flex: 1
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                flex: 1
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                        {newNickname.length}/20 characters
                    </p>
                </div>
            )}
        </div>
    );
};

export default NicknameEditor;
