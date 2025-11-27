import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../contexts/WebSocketContext';
import Card from '../common/Card';

const GameLobby = () => {
    const navigate = useNavigate();
    const { createRoom: createRoomWS, rooms: wsRooms } = useWebSocket();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEnterRoomModal, setShowEnterRoomModal] = useState(false);
    const [roomSettings, setRoomSettings] = useState({
        useTokens: false,
        betAmount: '10', // Default bet amount
        randomGameSelection: false,
        playerCount: 2 // Default to 2 players
    });

    useEffect(() => {
        // Fetch real rooms from WebSocket
        console.log('WebSocket rooms updated:', wsRooms);
        if (wsRooms && Array.isArray(wsRooms) && wsRooms.length > 0) {
            // Map WebSocket rooms to display format
            const mappedRooms = wsRooms.map(room => {
                // Try to get room settings from localStorage
                const storedSettings = localStorage.getItem(`room_${room.id}_settings`);
                let settings = {
                    useTokens: false,
                    betAmount: '0',
                    randomGameSelection: false
                };
                if (storedSettings) {
                    try {
                        settings = JSON.parse(storedSettings);
                    } catch (e) {
                        console.error('Error parsing room settings:', e);
                    }
                }
                
                const playerCount = room.players ? (Array.isArray(room.players) ? room.players.length : 0) : 0;
                
                return {
                    id: room.id,
                    players: playerCount,
                    maxPlayers: room.maxPlayers || 4,
                    status: room.status || 'waiting',
                    useTokens: settings.useTokens || false,
                    betAmount: settings.betAmount || '0',
                    randomGameSelection: settings.randomGameSelection || false
                };
            });
            console.log('Mapped rooms:', mappedRooms);
            setRooms(mappedRooms);
            setIsLoading(false);
        } else {
            console.log('No rooms available or empty array');
            setRooms([]);
            setIsLoading(false);
        }
    }, [wsRooms]);

    const createRoom = () => {
        // Generate room ID and store settings in localStorage
        const roomId = Math.random().toString(36).substring(7);
        localStorage.setItem(`room_${roomId}_settings`, JSON.stringify(roomSettings));
        
        // Create room on WebSocket server
        createRoomWS({
            name: `Room ${roomId}`,
            maxPlayers: roomSettings.playerCount,
            isPrivate: false,
            password: '',
            roomId: roomId // Pass the roomId so server uses it
        });
        
        navigate(`/room/${roomId}`);
    };

    const enterRoomById = (roomId) => {
        if (roomId && roomId.trim()) {
            navigate(`/room/${roomId.trim()}`);
        }
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ color: '#fff', margin: 0 }}>Game Lobby</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowEnterRoomModal(true)}
                        style={{
                            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Enter Room ID
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Create New Room
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    <div className="loader" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #333',
                        borderTop: '4px solid #4CAF50',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {rooms.map(room => (
                        <Card
                            key={room.id}
                            title={`Room ${room.id}`}
                            icon="🎮"
                            gradient={room.status === 'waiting' ? 'success' : 'info'}
                            onClick={() => navigate(`/room/${room.id}`)}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Players</span>
                                    <span>{room.players}/{room.maxPlayers}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Status</span>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: room.status === 'waiting' ? '#4CAF50' : '#2196f3',
                                        color: 'white',
                                        fontSize: '12px',
                                        textTransform: 'capitalize'
                                    }}>
                                        {room.status.replace('-', ' ')}
                                    </span>
                                </div>
                                {room.useTokens && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px'
                                    }}>
                                        <span style={{ fontSize: '12px', color: '#999' }}>Bet Amount</span>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFD700' }}>
                                            {room.betAmount} MGP
                                        </span>
                                    </div>
                                )}
                                {!room.useTokens && (
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '12px', color: '#999' }}>Free Play</span>
                                    </div>
                                )}
                                {room.randomGameSelection && (
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '12px', color: '#4CAF50' }}>🎲 Random Game</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <CreateRoomModal
                    settings={roomSettings}
                    onSettingsChange={setRoomSettings}
                    onCreate={() => {
                        createRoom();
                        setShowCreateModal(false);
                    }}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {/* Enter Room ID Modal */}
            {showEnterRoomModal && (
                <EnterRoomModal
                    onEnter={(roomId) => {
                        enterRoomById(roomId);
                        setShowEnterRoomModal(false);
                    }}
                    onClose={() => setShowEnterRoomModal(false)}
                />
            )}
        </div>
    );
};

const EnterRoomModal = ({ onEnter, onClose }) => {
    const [roomId, setRoomId] = useState('');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '400px',
                width: '90%',
                color: 'white'
            }}>
                <h2 style={{
                    marginBottom: '20px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    🔑 Enter Room ID
                </h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#ccc'
                    }}>
                        Room ID
                    </label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#121212',
                            border: '2px solid #333',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && roomId.trim()) {
                                onEnter(roomId);
                            }
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => roomId.trim() && onEnter(roomId)}
                        disabled={!roomId.trim()}
                        style={{
                            backgroundColor: roomId.trim() ? '#2196F3' : '#555',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: roomId.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            fontWeight: '500',
                            opacity: roomId.trim() ? 1 : 0.5
                        }}
                    >
                        Enter Room
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateRoomModal = ({ settings, onSettingsChange, onCreate, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: 'white'
            }}>
                <h2 style={{
                    marginBottom: '20px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    🎮 Create Game Room
                </h2>

                {/* Token Play Option */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}>
                        <input
                            type="checkbox"
                            checked={settings.useTokens}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                useTokens: e.target.checked,
                                betAmount: e.target.checked ? settings.betAmount : '0'
                            })}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer'
                            }}
                        />
                        <span>Play for Tokens (MGP)</span>
                    </label>
                    {settings.useTokens && (
                        <div style={{
                            marginTop: '10px',
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '6px'
                        }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                color: '#ccc'
                            }}>
                                Bet Amount (MGP tokens)
                            </label>
                            <input
                                type="number"
                                value={settings.betAmount}
                                onChange={(e) => onSettingsChange({
                                    ...settings,
                                    betAmount: e.target.value
                                })}
                                min="60"
                                step="1"
                                placeholder="Enter bet amount (min: 60)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#121212',
                                    border: parseFloat(settings.betAmount) < 60 && settings.betAmount !== '' && settings.betAmount !== '0' ? '2px solid #F44336' : '2px solid #333',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{
                                marginTop: '8px',
                                padding: '10px',
                                backgroundColor: '#3a1a1a',
                                borderRadius: '6px',
                                border: '1px solid #FF9800'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#FF9800',
                                    fontWeight: 'bold',
                                    marginBottom: '4px'
                                }}>
                                    💜 Bet Amount: {settings.betAmount} MGP
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#999',
                                    marginBottom: '4px'
                                }}>
                                    Contract rate: 1 MGP = 0.1 MATIC. Each player will bet this amount. Winner takes 92.5% of the pot (7.5% commission).
                                </div>
                                {settings.betAmount && parseFloat(settings.betAmount) > 0 && (
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#9C27B0',
                                        marginTop: '4px'
                                    }}>
                                        💜 Equivalent: {(parseFloat(settings.betAmount) * 0.1).toFixed(1)} MATIC (contract rate)
                                    </div>
                                )}
                            </div>
                            {parseFloat(settings.betAmount) <= 0 && settings.betAmount !== '' && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px',
                                    backgroundColor: '#3a1a1a',
                                    borderRadius: '6px',
                                    border: '1px solid #F44336',
                                    fontSize: '12px',
                                    color: '#F44336',
                                    textAlign: 'center'
                                }}>
                                    ⚠️ Bet amount must be at least 60 MGP
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Player Count Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Number of Players
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '10px'
                    }}>
                        {[2, 4].map(count => (
                            <button
                                key={count}
                                onClick={() => onSettingsChange({
                                    ...settings,
                                    playerCount: count
                                })}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: settings.playerCount === count ? '#4CAF50' : '#1a1a1a',
                                    color: 'white',
                                    border: `2px solid ${settings.playerCount === count ? '#4CAF50' : '#333'}`,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (settings.playerCount !== count) {
                                        e.target.style.backgroundColor = '#2d2d2d';
                                        e.target.style.borderColor = '#555';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (settings.playerCount !== count) {
                                        e.target.style.backgroundColor = '#1a1a1a';
                                        e.target.style.borderColor = '#333';
                                    }
                                }}
                            >
                                {count} Players
                            </button>
                        ))}
                    </div>
                </div>

                {/* Random Game Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}>
                        <input
                            type="checkbox"
                            checked={settings.randomGameSelection}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                randomGameSelection: e.target.checked
                            })}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer'
                            }}
                        />
                        <span>🎲 Random Game Selection</span>
                    </label>
                    <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#999',
                        paddingLeft: '30px'
                    }}>
                        If enabled, a random game will be selected automatically
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    marginTop: '30px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onCreate}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameLobby; 