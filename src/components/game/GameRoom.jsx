import React, { useState, useEffect } from 'react';
import Game from './Game';
import OfflineGame from './OfflineGame';
import GameChat from '../chat/GameChat';
import GameSelection from './GameSelection';
import GameCompletionScreen from './GameCompletionScreen';
import RoomInvite from '../room/RoomInvite';
import GameBetting from './GameBetting';
import TokenPurchase from '../token/TokenPurchase';
import { useParams } from 'react-router-dom';
import FriendsList from '../friends/FriendsList';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useWallet } from '../../contexts/WalletContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const GameRoom = () => {
    const { roomId } = useParams();
    const { players, joinRoom, connected } = useWebSocket();
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

    // Join room when component mounts and WebSocket is connected
    useEffect(() => {
        if (connected && roomId && account) {
            console.log('Joining room:', roomId);
            joinRoom(roomId);
        }
    }, [connected, roomId, account, joinRoom]);

    // Update actual player count from WebSocket
    useEffect(() => {
        if (players && Array.isArray(players)) {
            const playerCount = players.length;
            console.log('Player count updated:', playerCount, 'Players:', players);
            setActualPlayerCount(playerCount);
            // If this is the first player or we have players, mark room as ready
            if (playerCount > 0) {
                setRoomReady(true);
            }
        } else if (players === null || players === undefined) {
            // Reset if players is cleared
            setActualPlayerCount(0);
        }
    }, [players]);

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

    const handleGamesSelected = (games) => {
        setSelectedGames(games);
    };

    const handleStartGameSession = (games) => {
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
    };

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
        setGameSessionStarted(true); // This was missing!
    };

    const handleGameComplete = () => {
        setShowCompletionScreen(true);
    };

    const handleNextGame = () => {
        setShowCompletionScreen(false);
        if (currentGameIndex < selectedGames.length - 1) {
            setCurrentGameIndex(currentGameIndex + 1);
        } else {
            // All games completed
            handleEndSession();
        }
    };

    const handleEndSession = () => {
        setShowCompletionScreen(false);
        setGameSessionStarted(false);
        setSelectedPlayerCount(null);
        setSelectedGames([]);
        setCurrentGameIndex(0);
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
                    gameIndex={currentGameIndex + 1}
                    totalGames={selectedGames.length}
                    playerCount={selectedPlayerCount}
                    onNextGame={handleNextGame}
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
                                        Game Mode
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: roomSettings.useTokens ? '#FFD700' : '#4CAF50' }}>
                                        {roomSettings.useTokens ? `💰 Token Play - ${roomSettings.betAmount} MGP bet` : '🎮 Free Play'}
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
                                            {actualPlayerCount * parseFloat(roomSettings.betAmount || 0)} MGP
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
                                    {actualPlayerCount} Player{actualPlayerCount !== 1 ? 's' : ''} in Room
                                </div>
                                <div style={{ color: '#999', fontSize: '14px' }}>
                                    Room ID: {roomId}
                                </div>
                            </div>
                            <div style={{ marginTop: '20px' }}>
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
                                        marginRight: '10px'
                                    }}
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
                                        cursor: 'pointer'
                                    }}
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
                                            Bet Amount: {roomSettings.betAmount} MGP
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
                                
                                {/* Random Game Selection */}
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
                        ) : (
                            <GameSelection
                                playerCount={selectedPlayerCount}
                                onGamesSelected={handleGamesSelected}
                                onStartGame={handleStartGameSession}
                            />
                        )
                    ) : (
                        <div>
                            <GameSessionHeader
                                currentGame={getCurrentGame()}
                                gameIndex={currentGameIndex + 1}
                                totalGames={selectedGames.length}
                                playerCount={selectedPlayerCount}
                                onInvitePlayers={() => setShowInviteModal(true)}
                            />
                            {isOfflineMode ? (
                                <OfflineGame 
                                    gameType={getCurrentGame()?.id}
                                    onGameComplete={handleGameComplete}
                                />
                            ) : (
                                <Game 
                                    roomId={roomId} 
                                    gameType={getCurrentGame()?.id}
                                    onGameComplete={handleGameComplete}
                                />
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
        { count: 2, label: '2 Players', description: 'Head-to-head battles' },
        { count: 4, label: '4 Players', description: 'Small team competitions' },
        { count: 8, label: '8 Players', description: 'Large multiplayer mayhem' }
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