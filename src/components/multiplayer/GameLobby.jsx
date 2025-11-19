import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';

const GameLobby = () => {
    const { account } = useWallet();
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedGame, setSelectedGame] = useState('race'); // Default game
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [roomSettings, setRoomSettings] = useState({
        name: '',
        maxPlayers: 4,
        isPrivate: false,
        password: '',
        gameMode: 'standard'
    });

    const games = [
        { id: 'race', name: 'Racing Game', maxPlayers: 4 },
        { id: 'platform', name: 'Platform Game', maxPlayers: 2 },
        // Add more games as they become available
    ];

    // Fetch rooms from WebSocket backend
    useEffect(() => {
        // Rooms will be fetched from WebSocket context
        // For now, start with empty array
        setAvailableRooms([]);
    }, []);

    const createRoom = () => {
        // This will be connected to your backend
        console.log('Creating room with settings:', roomSettings);
    };

    const joinRoom = (roomId) => {
        // This will be connected to your backend
        console.log('Joining room:', roomId);
    };

    return (
        <div style={{ color: 'white', padding: '20px' }}>
            {/* Game Selection */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '15px' }}>Select Game</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {games.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            selected={selectedGame === game.id}
                            onClick={() => setSelectedGame(game.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Create Room Button */}
            <button
                onClick={() => setIsCreatingRoom(true)}
                style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    cursor: 'pointer'
                }}
            >
                Create Room
            </button>

            {/* Create Room Modal */}
            {isCreatingRoom && (
                <CreateRoomModal
                    settings={roomSettings}
                    onSettingsChange={setRoomSettings}
                    onCreate={createRoom}
                    onClose={() => setIsCreatingRoom(false)}
                />
            )}

            {/* Available Rooms */}
            <div>
                <h2 style={{ marginBottom: '15px' }}>Available Rooms</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {availableRooms.map(room => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onJoin={() => joinRoom(room.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const GameCard = ({ game, selected, onClick }) => (
    <div
        onClick={onClick}
        style={{
            backgroundColor: selected ? '#4CAF50' : '#2d2d2d',
            padding: '15px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        }}
    >
        <h3>{game.name}</h3>
        <p style={{ color: '#999', fontSize: '14px' }}>
            Max Players: {game.maxPlayers}
        </p>
    </div>
);

const RoomCard = ({ room, onJoin }) => (
    <div style={{
        backgroundColor: '#2d2d2d',
        padding: '15px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <div>
            <h3 style={{ marginBottom: '5px' }}>{room.name}</h3>
            <p style={{ color: '#999', fontSize: '14px' }}>
                Players: {room.players.length}/{room.maxPlayers}
                {room.isPrivate && ' • Private'}
            </p>
        </div>
        <button
            onClick={onJoin}
            style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Join
        </button>
    </div>
);

const CreateRoomModal = ({ settings, onSettingsChange, onCreate, onClose }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    }}>
        <div style={{
            backgroundColor: '#2d2d2d',
            padding: '20px',
            borderRadius: '8px',
            width: '400px'
        }}>
            <h2 style={{ marginBottom: '20px' }}>Create Room</h2>
            
            <div style={{ marginBottom: '15px' }}>
                <label>Room Name</label>
                <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => onSettingsChange({
                        ...settings,
                        name: e.target.value
                    })}
                    style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        marginTop: '5px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Max Players</label>
                <select
                    value={settings.maxPlayers}
                    onChange={(e) => onSettingsChange({
                        ...settings,
                        maxPlayers: parseInt(e.target.value)
                    })}
                    style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        marginTop: '5px'
                    }}
                >
                    <option value="2">2 Players</option>
                    <option value="4">4 Players</option>
                </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={settings.isPrivate}
                        onChange={(e) => onSettingsChange({
                            ...settings,
                            isPrivate: e.target.checked
                        })}
                    />
                    Private Room
                </label>
            </div>

            {settings.isPrivate && (
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={settings.password}
                        onChange={(e) => onSettingsChange({
                            ...settings,
                            password: e.target.value
                        })}
                        style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#1a1a1a',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            marginTop: '5px'
                        }}
                    />
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
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
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Create
                </button>
            </div>
        </div>
    </div>
);

export default GameLobby; 