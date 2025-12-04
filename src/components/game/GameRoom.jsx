import React, { useState, useEffect, useRef, useCallback } from 'react';
import Game from './Game';
import OfflineGame from './OfflineGame';
import GameChat from '../chat/GameChat';
import GameSelection from './GameSelection';
import GameCompletionScreen from './GameCompletionScreen';
import RoomInvite from '../room/RoomInvite';
import GameBetting from './GameBetting';
import TokenPurchase from '../token/TokenPurchase';
import { useParams, useNavigate } from 'react-router-dom';
import FriendsList from '../friends/FriendsList';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useWallet } from '../../contexts/WalletContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const GameRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { players, joinRoom, createRoom, leaveRoom, connected, sendGameAction } = useWebSocket();
    const { account } = useWallet();
    const { getDisplayName } = useUserProfile();
    const [selectedPlayerCount, setSelectedPlayerCount] = useState(null);
    const [selectedGames, setSelectedGames] = useState([]);
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [gameSessionStarted, setGameSessionStarted] = useState(false);
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showBetting, setShowBetting] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [bettingComplete, setBettingComplete] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [gameResults, setGameResults] = useState(null);
    const [showTokenPurchase, setShowTokenPurchase] = useState(false);
    const [useRandomGames, setUseRandomGames] = useState(false);
    const [roomReady, setRoomReady] = useState(false);
    const [actualPlayerCount, setActualPlayerCount] = useState(0);
    const [roomSettings, setRoomSettings] = useState({
        useTokens: false,
        betAmount: '0',
        randomGameSelection: false,
        playerCount: 2
    });
    const [betAccepted, setBetAccepted] = useState(false);
    const hasJoinedRoomRef = useRef(false); // Track if we've already joined the room
    const [isRoomCreator, setIsRoomCreator] = useState(false); // Track if current user is room creator
    const [gameCountdown, setGameCountdown] = useState(null); // Countdown timer before game starts (10 seconds)

    // Load room settings when component mounts
    useEffect(() => {
        if (roomId) {
            const storedSettings = localStorage.getItem(`room_${roomId}_settings`);
            if (storedSettings) {
                try {
                    const settings = JSON.parse(storedSettings);
                    setRoomSettings(settings);
                    setUseRandomGames(settings.randomGameSelection || false);
                    // Check if player has already accepted bet
                    const betAcceptedKey = `room_${roomId}_bet_accepted_${account}`;
                    const hasAccepted = localStorage.getItem(betAcceptedKey);
                    setBetAccepted(!!hasAccepted);
                } catch (e) {
                    console.error('Error loading room settings:', e);
                }
            }
        }
    }, [roomId, account]);

    // Create or join room when component mounts and WebSocket is connected AND authenticated
    useEffect(() => {
        // Reset the flag when roomId or account changes
        if (roomId && account) {
            hasJoinedRoomRef.current = false;
        }
    }, [roomId, account]);

    useEffect(() => {
        // Only join once per roomId/account combination
        if (connected && roomId && account && !hasJoinedRoomRef.current) {
            console.log('Creating/joining room:', roomId, 'Account:', account);
            hasJoinedRoomRef.current = true; // Mark as joined to prevent re-execution
            
            // Wait a bit to ensure authentication is complete
            const timer = setTimeout(() => {
                // First try to create the room (will handle if it already exists)
                console.log('Sending CREATE_ROOM for:', roomId);
                // Only allow 2 or 4 players
                const maxPlayers = roomSettings.playerCount === 2 ? 2 : 4;
                createRoom({
                    name: `Room ${roomId}`,
                    maxPlayers: maxPlayers,
                    isPrivate: false,
                    password: '',
                    roomId: roomId
                });
                
                // Then join it after a short delay
                setTimeout(() => {
                    console.log('Sending JOIN_ROOM for:', roomId);
                    joinRoom(roomId);
                }, 200);
            }, 500); // Wait 500ms to ensure WebSocket is ready
            
            return () => {
                clearTimeout(timer);
            };
        }
        
        // Cleanup: Leave room when component unmounts
        return () => {
            if (connected && roomId && account && hasJoinedRoomRef.current) {
                console.log('Leaving room on unmount:', roomId);
                leaveRoom(roomId);
                hasJoinedRoomRef.current = false;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, roomId, account]); // Removed function dependencies to prevent loops

    // Update actual player count from WebSocket and check if user is room creator
    useEffect(() => {
        if (players && Array.isArray(players)) {
            const playerCount = players.length;
            console.log('Player count updated:', playerCount, 'Players:', players);
            setActualPlayerCount(playerCount);
            
            // Check if current user is the room creator (first player in the list)
            if (account && players.length > 0) {
                const creatorAddress = players[0].toLowerCase();
                const currentAddress = account.toLowerCase();
                const isCreator = creatorAddress === currentAddress;
                setIsRoomCreator(isCreator);
                console.log('Is room creator:', isCreator, 'Creator:', creatorAddress, 'Current:', currentAddress);
            }
            
            // If this is the first player or we have players, mark room as ready
            if (playerCount > 0) {
                setRoomReady(true);
            }
        } else if (players === null || players === undefined) {
            // Reset if players is cleared
            setActualPlayerCount(0);
            setIsRoomCreator(false);
        }
    }, [players, account]);

    // Listen for GAME_STARTING messages from WebSocket to sync countdown
    useEffect(() => {
        const handleGameStarting = (event) => {
            const { roomId: msgRoomId, games, countdown } = event.detail;
            if (msgRoomId === roomId) {
                console.log('Received GAME_STARTING for room:', roomId, 'Games:', games);
                setSelectedGames(games);
                setGameCountdown(countdown || 10);
                setShowBetting(false);
                setBettingComplete(true);
                
                // Start countdown
                const countdownInterval = setInterval(() => {
                    setGameCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval);
                            setGameSessionStarted(true);
                            return null;
                        }
                        return prev - 1;
                    });
                }, 1000);
                
                // Store interval for cleanup
                return () => clearInterval(countdownInterval);
            }
        };
        
        window.addEventListener('gameStarting', handleGameStarting);
        return () => {
            window.removeEventListener('gameStarting', handleGameStarting);
        };
    }, [roomId]);

    const handleStartGameSelection = () => {
        // Use actual player count from room
        const playerCount = actualPlayerCount || 1;
        setSelectedPlayerCount(playerCount);
        setCurrentGameIndex(0);
        setGameSessionStarted(false);
        
        // If random game selection is enabled, immediately start with a random game
        if (useRandomGames) {
            console.log('Random game selection enabled - selecting random game immediately');
            handleStartGameSession(null);
        } else {
            // If tokens are required, show betting first
            if (roomSettings.useTokens) {
                setShowBetting(true);
            }
        }
    };

    const handleGamesSelected = useCallback((games) => {
        setSelectedGames(games);
    }, []);

    const handleStartGameSession = useCallback((games) => {
        console.log('Starting game session with games:', games);
        console.log('Use random games:', useRandomGames);
        console.log('Actual player count:', actualPlayerCount);
        
        if (useRandomGames) {
            // Use random game selection - select ONE random game
            const playerCount = actualPlayerCount || selectedPlayerCount || 2; // Use actual player count from room
            
            // Get all available games that match the player count
            const allAvailableGames = [
                { id: 'pong', name: 'Multi-Pong', description: 'Classic pong with multiple players', minPlayers: 2, maxPlayers: 8 },
                { id: 'rps', name: 'Rock Paper Scissors', description: 'Best of 3 rounds battle', minPlayers: 2, maxPlayers: 2 },
                { id: 'snake', name: 'Battle Snake', description: 'Multiplayer snake battle', minPlayers: 2, maxPlayers: 8 },
                { id: 'platform', name: 'Platform Jump', description: 'Jump and collect coins', minPlayers: 2, maxPlayers: 4 },
                { id: 'tetris', name: 'Competitive Tetris', description: 'Two-player Tetris battle', minPlayers: 2, maxPlayers: 2 },
                { id: 'chess', name: 'Chess', description: 'Classic chess game', minPlayers: 2, maxPlayers: 2 },
                { id: 'endlessrunner', name: 'Endless Runner', description: 'Run, jump and collect coins', minPlayers: 1, maxPlayers: 1 },
                { id: 'tictactoe', name: 'Tic Tac Toe', description: 'Classic 3x3 grid game', minPlayers: 2, maxPlayers: 2 }
            ];
            
            // Filter games based on player count
            const compatibleGames = allAvailableGames.filter(game => 
                playerCount >= game.minPlayers && playerCount <= game.maxPlayers
            );
            
            console.log('Player count:', playerCount);
            console.log('Compatible games:', compatibleGames);
            
            // Select ONE random game
            if (compatibleGames.length === 0) {
                console.error('No compatible games found for player count:', playerCount);
                // Fallback to all games if no compatible games found
                const randomIndex = Math.floor(Math.random() * allAvailableGames.length);
                const selectedRandom = [allAvailableGames[randomIndex]];
                console.log('Random game selected (fallback):', selectedRandom);
                setSelectedGames(selectedRandom);
            } else {
                const randomIndex = Math.floor(Math.random() * compatibleGames.length);
                const selectedRandom = [compatibleGames[randomIndex]];
                console.log('Random game selected:', selectedRandom);
                setSelectedGames(selectedRandom);
            }
        } else {
            console.log('Using provided games:', games);
            setSelectedGames(games || []);
        }
        setShowBetting(true);
        setCurrentGameIndex(0);
    }, [useRandomGames, actualPlayerCount, selectedPlayerCount]);

    const handleBettingComplete = (results) => {
        setBettingComplete(true);
        setGameResults(results);
        setGameSessionStarted(true);
    };

    const handleBetPlaced = (player) => {
        console.log('Bet placed by:', player);
    };

    const handleGameStart = (games = null) => {
        console.log('Game starting with betting complete');
        console.log('Games passed:', games);
        console.log('Current selectedGames:', selectedGames);
        
        // Use passed games or current selectedGames
        const gamesToUse = games || selectedGames;
        
        if (games) {
            setSelectedGames(games);
        }
        
        // Ensure we have games to play
        if (!gamesToUse || gamesToUse.length === 0) {
            console.error('No games selected! Cannot start game.');
            return;
        }
        
        console.log('Starting game with:', gamesToUse);
        setShowBetting(false);
        setBettingComplete(true);
        
        // Send game start message to WebSocket for synchronization
        if (sendGameAction && connected) {
            sendGameAction({
                type: 'GAME_STARTING',
                data: {
                    roomId,
                    games: gamesToUse,
                    countdown: 10
                }
            });
        }
        
        // Start 10-second countdown
        setGameCountdown(10);
        const countdownInterval = setInterval(() => {
            setGameCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setGameSessionStarted(true);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleGameComplete = () => {
        // Show completion screen and options for creator
        setShowCompletionScreen(true);
    };

    const handleNewGame = () => {
        // Creator wants to start a new game
        setShowCompletionScreen(false);
        setGameSessionStarted(false);
        setSelectedGames([]);
        setCurrentGameIndex(0);
        setGameCountdown(null);
    };

    const handleCloseRoom = () => {
        // Creator wants to close the room
        setShowCompletionScreen(false);
        setGameSessionStarted(false);
        setSelectedGames([]);
        setCurrentGameIndex(0);
        // Navigate back to lobby
        navigate('/lobby');
    };

    const handleEndSession = () => {
        // End session (used by GameCompletionScreen)
        setShowCompletionScreen(false);
        setGameSessionStarted(false);
        setSelectedGames([]);
        setCurrentGameIndex(0);
        setGameCountdown(null);
    };

    const handleLeaveRoom = () => {
        // Non-creator wants to leave (will lose chips)
        if (window.confirm('Are you sure you want to leave? You will lose any chips you bet in this room.')) {
            leaveRoom(roomId);
            navigate('/lobby');
        }
    };

    const getCurrentGame = () => {
        return selectedGames[currentGameIndex] || null;
    };

    return (
        <div>
            {/* Game Completion Screen Overlay */}
            {showCompletionScreen && (
                <GameCompletionScreen
                    currentGame={getCurrentGame()}
                    gameIndex={1}
                    totalGames={1}
                    playerCount={actualPlayerCount || selectedPlayerCount || roomSettings.playerCount}
                    isRoomCreator={isRoomCreator}
                    onNewGame={handleNewGame}
                    onCloseRoom={handleCloseRoom}
                    onEndSession={handleEndSession}
                />
            )}

            {/* Room Invite Modal */}
            {showInviteModal && (
                <RoomInvite
                    roomId={roomId}
                    onClose={() => setShowInviteModal(false)}
                />
            )}

            {/* Token Purchase Modal */}
            {showTokenPurchase && (
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
                    <TokenPurchase
                        onClose={() => setShowTokenPurchase(false)}
                        onTokensPurchased={() => setShowTokenPurchase(false)}
                    />
                </div>
            )}

        <div style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
                {/* Main Game Area */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                padding: '20px',
                minHeight: '600px'
            }}>
                {!roomReady ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: 'white'
                        }}>
                            <h2 style={{ marginBottom: '20px' }}>Waiting for players to join...</h2>
                            
                            {/* Room Settings Display */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                padding: '20px',
                                marginBottom: '20px',
                                display: 'inline-block',
                                textAlign: 'left',
                                maxWidth: '400px'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    marginBottom: '15px',
                                    textAlign: 'center'
                                }}>
                                    Room Settings
                                </h3>
                                
                                <div style={{
                                    marginBottom: '10px',
                                    padding: '10px',
                                    backgroundColor: '#121212',
                                    borderRadius: '6px'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                        Players Required
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>
                                        {roomSettings.playerCount === 2 ? '👥 2 Players (1vs1)' : '👥 4 Players (1vs1vs1vs1)'}
                                    </div>
                                </div>
                                
                                <div style={{
                                    marginBottom: '10px',
                                    padding: '10px',
                                    backgroundColor: '#121212',
                                    borderRadius: '6px'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                        Game Mode
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: roomSettings.useTokens ? '#FFD700' : '#4CAF50' }}>
                                        {roomSettings.useTokens ? `💰 Token Play - ${roomSettings.betAmount} MGP Chips` : '🎮 Free Play'}
                                    </div>
                                </div>
                                
                                <div style={{
                                    marginBottom: '10px',
                                    padding: '10px',
                                    backgroundColor: '#121212',
                                    borderRadius: '6px'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                        Game Selection
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {roomSettings.randomGameSelection ? '🎲 Random Game' : '🎯 Manual Selection'}
                                    </div>
                                </div>
                                
                                {roomSettings.useTokens && (
                                    <div style={{
                                        padding: '10px',
                                        backgroundColor: '#1a3a1a',
                                        borderRadius: '6px',
                                        border: '1px solid #4CAF50'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#4CAF50', marginBottom: '5px' }}>
                                            Prize Pool
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                                            {actualPlayerCount * parseFloat(roomSettings.betAmount || 0)} MGP Chips
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                                            Winner takes 92.5% • Platform takes 7.5%
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                padding: '20px',
                                marginBottom: '20px',
                                display: 'inline-block'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                                    {actualPlayerCount} / {roomSettings.playerCount === 2 ? '2' : '4'} Player{roomSettings.playerCount !== 1 ? 's' : ''}
                                </div>
                                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>
                                    Room ID: {roomId}
                                </div>
                                {actualPlayerCount < roomSettings.playerCount && (
                                    <div style={{ color: '#FF9800', fontSize: '14px', marginTop: '10px' }}>
                                        ⏳ Waiting for {roomSettings.playerCount - actualPlayerCount} more player{roomSettings.playerCount - actualPlayerCount !== 1 ? 's' : ''}...
                                    </div>
                                )}
                                {actualPlayerCount >= roomSettings.playerCount && (
                                    <div style={{ color: '#4CAF50', fontSize: '14px', marginTop: '10px' }}>
                                        ✅ Room is full and ready!
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                >
                                    📤 Invite Players
                                </button>
                                <button
                                    onClick={() => setShowTokenPurchase(true)}
                                    style={{
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
                                >
                                    💰 Buy Tokens
                                </button>
                            </div>
                            
                            {/* Bet Acceptance for Token Rooms */}
                            {roomSettings.useTokens && !betAccepted && (
                                <div style={{
                                    backgroundColor: '#1a3a1a',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    marginTop: '20px',
                                    border: '2px solid #4CAF50',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>
                                        💰 Accept Bet Request
                                    </h3>
                                    <div style={{ marginBottom: '15px', color: '#fff' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                                            Bet Amount: {roomSettings.betAmount} MGP Chips
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#999' }}>
                                            Winner takes 92.5% • Platform takes 7.5%
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Mark bet as accepted
                                            const betAcceptedKey = `room_${roomId}_bet_accepted_${account}`;
                                            localStorage.setItem(betAcceptedKey, 'true');
                                            setBetAccepted(true);
                                            // Show betting interface
                                            setShowBetting(true);
                                        }}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            width: '100%'
                                        }}
                                    >
                                        ✅ Accept Bet & Place Bet
                                    </button>
                                </div>
                            )}
                            
                            {roomSettings.useTokens && betAccepted && (
                                <div style={{
                                    backgroundColor: '#1a3a1a',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginTop: '20px',
                                    border: '1px solid #4CAF50',
                                    textAlign: 'center',
                                    color: '#4CAF50'
                                }}>
                                    ✅ Bet Accepted - Ready to Play
                                </div>
                            )}
                        </div>
                ) : !selectedPlayerCount ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: 'white'
                        }}>
                            <h2 style={{ marginBottom: '20px' }}>Room Ready!</h2>
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                padding: '20px',
                                marginBottom: '20px',
                                display: 'inline-block'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                                    {actualPlayerCount} Player{actualPlayerCount !== 1 ? 's' : ''} Ready
                                </div>
                                <div style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
                                    Players in room: {players && players.length > 0 ? players.map(addr => getDisplayName(addr)).join(', ') : 'You'}
                                </div>
                                
                                {/* Invite button - always visible */}
                                <div style={{ marginBottom: '20px' }}>
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            margin: '0 auto'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                    >
                                        📤 Invite Players / Share Room
                                    </button>
                                </div>
                                
                                {/* Show room information to all players */}
                                <div style={{
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginBottom: '20px',
                                    border: '1px solid #444'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Room Configuration</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                                        {roomSettings.randomGameSelection ? '🎲 Random Game Selection' : '🎯 Manual Game Selection'}
                                    </div>
                                    {selectedGames && selectedGames.length > 0 && (
                                        <div style={{ fontSize: '14px', color: '#4CAF50', marginTop: '8px', marginBottom: '5px' }}>
                                            🎮 Selected Games: {selectedGames.map(g => g.name || g.id).join(', ')}
                                        </div>
                                    )}
                                    {roomSettings.useTokens && (
                                        <div style={{ fontSize: '14px', color: '#FFD700', marginTop: '5px' }}>
                                            💰 Bet Required: {roomSettings.betAmount} MGP Chips per player
                                        </div>
                                    )}
                                    {!roomSettings.useTokens && (
                                        <div style={{ fontSize: '14px', color: '#4CAF50', marginTop: '5px' }}>
                                            🎮 Free Play Mode - No chips required
                                        </div>
                                    )}
                                </div>
                                
                                {/* Only show game selection controls to room creator */}
                                {isRoomCreator ? (
                                    <>
                                        {/* Random Game Selection - Only for creator */}
                                        <div style={{ 
                                            marginBottom: '20px', 
                                            display: 'flex', 
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <input
                                                type="checkbox"
                                                id="randomGames"
                                                checked={useRandomGames}
                                                onChange={(e) => setUseRandomGames(e.target.checked)}
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <label 
                                                htmlFor="randomGames"
                                                style={{
                                                    color: 'white',
                                                    fontSize: '16px',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontWeight: 'var(--font-medium)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                🎲 Random Game Selection
                                            </label>
                                        </div>
                                        
                                        <button
                                            onClick={handleStartGameSelection}
                                            style={{
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                padding: '15px 30px',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                        >
                                            🎮 Start Game Selection
                                        </button>
                                    </>
                                ) : (
                                    <div style={{
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        border: '1px solid #444'
                                    }}>
                                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
                                            ⏳ Waiting for room creator to start the game...
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            Room creator: {players && players.length > 0 ? getDisplayName(players[0]) : 'Unknown'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                ) : !gameSessionStarted ? (
                        showBetting ? (
                            <GameBetting
                                gameType={getCurrentGame()?.id}
                                playerCount={selectedPlayerCount}
                                onBetPlaced={handleBetPlaced}
                                onGameStart={() => handleGameStart(selectedGames)}
                                onGameComplete={handleBettingComplete}
                                roomId={roomId}
                                roomSettings={roomSettings}
                            />
                        ) : useRandomGames && selectedGames.length > 0 ? (
                            // Random game already selected, check if betting is needed
                            roomSettings.useTokens ? (
                                <div>
                                    <div style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '15px 20px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        textAlign: 'center',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                    }}>
                                        🎲 Random Game Selected: <span style={{ color: '#FFD700' }}>{getCurrentGame()?.name}</span>
                                    </div>
                                    <GameBetting
                                        gameType={getCurrentGame()?.id}
                                        playerCount={selectedPlayerCount}
                                        onBetPlaced={handleBetPlaced}
                                        onGameStart={() => handleGameStart(selectedGames)}
                                        onGameComplete={handleBettingComplete}
                                        roomId={roomId}
                                        roomSettings={roomSettings}
                                    />
                                </div>
                            ) : (
                                // Free play - skip betting and start game directly
                                <div>
                                    <div style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '15px 20px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        textAlign: 'center',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                    }}>
                                        🎲 Random Game Selected: <span style={{ color: '#FFD700' }}>{getCurrentGame()?.name}</span>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#2d2d2d',
                                        color: 'white',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                                            🎮 Free Play Mode - No betting required
                                        </p>
                                        <button
                                            onClick={() => handleGameStart(selectedGames)}
                                            style={{
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 24px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Start Game
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : isRoomCreator ? (
                            <GameSelection
                                playerCount={selectedPlayerCount}
                                onGamesSelected={handleGamesSelected}
                                onStartGame={handleStartGameSession}
                            />
                        ) : (
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                padding: '40px',
                                textAlign: 'center',
                                border: '1px solid #444'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                                <h3 style={{ color: 'white', marginBottom: '15px' }}>
                                    Waiting for Room Creator
                                </h3>
                                <p style={{ color: '#999', fontSize: '16px', marginBottom: '20px' }}>
                                    The room creator is selecting games. Please wait...
                                </p>
                                {selectedGames && selectedGames.length > 0 && (
                                    <div style={{
                                        padding: '15px',
                                        backgroundColor: '#1a3a1a',
                                        borderRadius: '8px',
                                        border: '1px solid #4CAF50'
                                    }}>
                                        <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '10px' }}>
                                            Selected Games:
                                        </div>
                                        <div style={{ color: '#fff' }}>
                                            {selectedGames.map((g, idx) => (
                                                <div key={idx} style={{ marginBottom: '5px' }}>
                                                    {idx + 1}. {g.name || g.id}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <div>
                            {/* Countdown Timer */}
                            {gameCountdown !== null && gameCountdown > 0 && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 9999
                                }}>
                                    <div style={{
                                        fontSize: '120px',
                                        fontWeight: 'bold',
                                        color: '#4CAF50',
                                        marginBottom: '20px',
                                        animation: 'pulse 1s infinite'
                                    }}>
                                        {gameCountdown}
                                    </div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#fff',
                                        marginBottom: '10px'
                                    }}>
                                        Game Starting...
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        color: '#999'
                                    }}>
                                        Get ready!
                                    </div>
                                    <style>{`
                                        @keyframes pulse {
                                            0%, 100% { transform: scale(1); }
                                            50% { transform: scale(1.1); }
                                        }
                                    `}</style>
                                </div>
                            )}
                            
                            {/* Leave Room Button for Non-Creators */}
                            {!isRoomCreator && gameSessionStarted && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    zIndex: 1000
                                }}>
                                    <button
                                        onClick={handleLeaveRoom}
                                        style={{
                                            backgroundColor: '#F44336',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#D32F2F'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#F44336'}
                                    >
                                        ⚠️ Leave Room (Lose Chips)
                                    </button>
                                </div>
                            )}
                            
                            <GameSessionHeader
                                currentGame={getCurrentGame()}
                                gameIndex={1}
                                totalGames={1}
                                playerCount={actualPlayerCount || selectedPlayerCount || roomSettings.playerCount}
                                onInvitePlayers={() => setShowInviteModal(true)}
                            />
                            {isOfflineMode ? (
                                <OfflineGame 
                                    gameType={getCurrentGame()?.id}
                                    onGameComplete={handleGameComplete}
                                />
                            ) : getCurrentGame() ? (
                                <Game 
                                    roomId={roomId} 
                                    gameType={getCurrentGame()?.id}
                                    onGameComplete={handleGameComplete}
                                    playerCount={actualPlayerCount || selectedPlayerCount || roomSettings.playerCount}
                                />
                            ) : (
                                <div style={{
                                    backgroundColor: '#2d2d2d',
                                    borderRadius: '8px',
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: 'white'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
                                    <h3 style={{ marginBottom: '15px' }}>Loading Game...</h3>
                                    <p style={{ color: '#999' }}>Preparing game session...</p>
                                </div>
                            )}
                            <div style={{
                                textAlign: 'center',
                                marginTop: '10px'
                            }}>
                                <button
                                    onClick={() => setIsOfflineMode(!isOfflineMode)}
                                    style={{
                                        backgroundColor: isOfflineMode ? '#FF9800' : '#666',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {isOfflineMode ? 'Switch to Online' : 'Switch to Offline Demo'}
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* Chat Area & Friends Sidebar */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                width: '100%',
                minWidth: '280px'
            }}>
                <GameChat roomId={roomId} />
                <FriendsList roomId={roomId} />
            </div>
        </div>
        </div>
    );
};

// Player Count Selection Component
// eslint-disable-next-line no-unused-vars
const PlayerCountSelection = ({ onPlayerCountSelect, onInvitePlayers, onBuyTokens, useRandomGames, setUseRandomGames }) => {
    const playerOptions = [
        { count: 2, label: '2 Players (1vs1)', description: 'Head-to-head battles' },
        { count: 4, label: '4 Players (1vs1vs1vs1)', description: 'Four-player competitions' }
    ];

    return (
        <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'white'
        }}>
            <h1 style={{
                marginBottom: '20px',
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-extrabold)',
                background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-primary)',
                letterSpacing: 'var(--tracking-tight)',
                lineHeight: 'var(--leading-tight)'
            }}>
                Choose Your Battle
            </h1>
            <p style={{
                color: '#999',
                marginBottom: '40px',
                fontSize: 'var(--text-lg)',
                fontFamily: 'var(--font-primary)',
                fontWeight: 'var(--font-normal)',
                lineHeight: 'var(--leading-relaxed)'
            }}>
                Select the number of players and optionally choose a random game
            </p>

                   {/* Random Game Selection */}
                   <div style={{ 
                       marginBottom: '30px', 
                       display: 'flex', 
                       justifyContent: 'center',
                       alignItems: 'center',
                       gap: '10px'
                   }}>
                       <input
                           type="checkbox"
                           id="randomGames"
                           checked={useRandomGames}
                           onChange={(e) => setUseRandomGames(e.target.checked)}
                           style={{
                               width: '18px',
                               height: '18px',
                               cursor: 'pointer'
                           }}
                       />
                       <label 
                           htmlFor="randomGames"
                           style={{
                               color: 'white',
                               fontSize: 'var(--text-lg)',
                               fontFamily: 'var(--font-primary)',
                               fontWeight: 'var(--font-medium)',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '8px'
                           }}
                       >
                           🎲 Random Game Selection
                       </label>
                   </div>

                   {/* Action Buttons */}
                   <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                       <button
                           onClick={onInvitePlayers}
                           style={{
                               backgroundColor: '#4CAF50',
                               color: 'white',
                               border: 'none',
                               padding: '12px 24px',
                               borderRadius: '8px',
                               fontFamily: 'var(--font-primary)',
                               fontSize: 'var(--text-base)',
                               fontWeight: 'var(--font-semibold)',
                               letterSpacing: 'var(--tracking-wide)',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '10px',
                               transition: 'background-color 0.3s ease'
                           }}
                           onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                           onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                       >
                           📤 Invite Friends
                       </button>
                       <button
                           onClick={onBuyTokens}
                           style={{
                               backgroundColor: '#FF9800',
                               color: 'white',
                               border: 'none',
                               padding: '12px 24px',
                               borderRadius: '8px',
                               fontFamily: 'var(--font-primary)',
                               fontSize: 'var(--text-base)',
                               fontWeight: 'var(--font-semibold)',
                               letterSpacing: 'var(--tracking-wide)',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '10px',
                               transition: 'background-color 0.3s ease'
                           }}
                           onMouseEnter={(e) => e.target.style.backgroundColor = '#F57C00'}
                           onMouseLeave={(e) => e.target.style.backgroundColor = '#FF9800'}
                       >
                           💰 Buy Tokens
                       </button>
                   </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                flexWrap: 'wrap'
            }}>
                {playerOptions.map(option => (
                    <div
                        key={option.count}
                        onClick={() => onPlayerCountSelect(option.count)}
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '12px',
                            padding: '30px',
                            cursor: 'pointer',
                            border: '2px solid #333',
                            transition: 'all 0.3s ease',
                            minWidth: '200px',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = '#4CAF50';
                            e.target.style.transform = 'translateY(-5px)';
                            e.target.style.boxShadow = '0 10px 20px rgba(76, 175, 80, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = '#333';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '15px'
                        }}>
                            {option.count === 2 ? '⚔️' : option.count === 4 ? '👥' : '🎯'}
                        </div>
                        <h3 style={{
                            margin: '0 0 10px 0',
                            fontSize: '24px',
                            color: 'white'
                        }}>
                            {option.label}
                        </h3>
                        <p style={{
                            margin: '0',
                            color: '#999',
                            fontSize: '14px'
                        }}>
                            {option.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Game Session Header Component
const GameSessionHeader = ({ currentGame, gameIndex, totalGames, playerCount, onInvitePlayers }) => {
    if (!currentGame) return null;

    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '32px' }}>{currentGame.icon}</span>
                <div>
                    <h3 style={{
                        margin: '0 0 5px 0',
                        color: 'white',
                        fontSize: '20px'
                    }}>
                        Game {gameIndex} of {totalGames}: {currentGame.name}
                    </h3>
                    <p style={{
                        margin: '0',
                        color: '#999',
                        fontSize: '14px'
                    }}>
                        {currentGame.description}
                    </p>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <div style={{
                    textAlign: 'right',
                    fontSize: '14px',
                    color: '#999'
                }}>
                    <div>Players: {playerCount}</div>
                    <div>Difficulty: {currentGame.difficulty}</div>
                    <div>Duration: {Math.floor(currentGame.duration / 60)}:{(currentGame.duration % 60).toString().padStart(2, '0')}</div>
                </div>
                
                <button
                    onClick={onInvitePlayers}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                    📤 Invite Players
                </button>
            </div>
        </div>
    );
};

export default GameRoom; 