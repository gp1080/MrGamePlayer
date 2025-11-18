import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameManager from '../../scenes/GameManager';
import SimplePongScene from '../../scenes/SimplePongScene';
import RacingScene from '../../scenes/RacingScene';
import SnakeScene from '../../scenes/SnakeScene';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useWallet } from '../../contexts/WalletContext';

const Game = ({ roomId, gameType = 'pong', onGameComplete }) => {
    const gameRef = useRef(null);
    const { connected, sendGameAction, gameState } = useWebSocket();
    const { account } = useWallet();
    const [playerCount, setPlayerCount] = useState(4);
    // eslint-disable-next-line no-unused-vars
    const [isGameReady, setIsGameReady] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Initializing...');
    const [gameStartTime, setGameStartTime] = useState(null);
    const [gameDuration, setGameDuration] = useState(0);

    useEffect(() => {
        console.log('Game component mounted');
        console.log('WebSocket connected:', connected);
        console.log('Account:', account);
        console.log('Room ID:', roomId);

        if (!connected) {
            setConnectionStatus('Connecting to game server...');
            return;
        }

        if (!account) {
            setConnectionStatus('Please connect your wallet');
            return;
        }

        if (!roomId) {
            setConnectionStatus('Invalid room ID');
            return;
        }

        setConnectionStatus('Connected! Joining game...');

        // Join the game room
        try {
            sendGameAction({
                type: 'JOIN_GAME',
                data: {
                    roomId,
                    account,
                    playerCount
                }
            });
            console.log('Join game action sent');
        } catch (error) {
            console.error('Error sending join game action:', error);
            setConnectionStatus('Error joining game');
            return;
        }

        const config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            width: 800,
            height: 600,
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [GameManager, SimplePongScene, RacingScene, SnakeScene]
        };

        try {
            // Create game instance
            const game = new Phaser.Game(config);
            gameRef.current = game;
            console.log('Game instance created');
            setGameStartTime(Date.now());

            // Create WebSocket event handlers
            const wsHandlers = {
                gameState: [],
                paddleMove: [],
                ballSync: [],
                score: [],
                gameComplete: []
            };

            // Start the game manager scene
            game.scene.start('GameManager', {
                playerPosition: determinePlayerPosition(roomId, account),
                roomId: roomId,
                numPlayers: playerCount,
                gameType: gameType,
                onGameComplete: onGameComplete,
                wsConnection: {
                    emit: sendGameAction,
                    on: (event, callback) => {
                        wsHandlers[event] = wsHandlers[event] || [];
                        wsHandlers[event].push(callback);
                    }
                }
            });
            setIsGameReady(true);
            setConnectionStatus('Game ready!');
            console.log('Game manager started');

            // Handle incoming WebSocket messages
            const handleGameUpdate = (update) => {
                if (wsHandlers[update.type]) {
                    wsHandlers[update.type].forEach(handler => handler(update.data));
                }
            };

            // Subscribe to game updates
            const gameUpdateInterval = setInterval(() => {
                if (gameState) {
                    handleGameUpdate(gameState);
                }
            }, 16); // 60fps

            // Game timer
            const gameTimerInterval = setInterval(() => {
                if (gameStartTime) {
                    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                    setGameDuration(elapsed);
                }
            }, 1000);

            return () => {
                console.log('Cleaning up game component');
                clearInterval(gameUpdateInterval);
                clearInterval(gameTimerInterval);
                if (gameRef.current) {
                    gameRef.current.destroy(true);
                }
                // Leave the game room
                sendGameAction({
                    type: 'LEAVE_GAME',
                    data: {
                        roomId,
                        account
                    }
                });
            };
        } catch (error) {
            console.error('Error initializing game:', error);
            setConnectionStatus('Error initializing game');
        }
    }, [connected, account, roomId, playerCount, gameType, sendGameAction, gameState, gameStartTime, onGameComplete]);

    const determinePlayerPosition = (roomId, account) => {
        return parseInt(account.slice(2, 4), 16) % playerCount;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // eslint-disable-next-line no-unused-vars
    const handleGameComplete = () => {
        if (onGameComplete) {
            onGameComplete();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Game Info Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px'
            }}>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                    {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ color: '#4CAF50', fontSize: '16px' }}>
                        ⏱️ {formatTime(gameDuration)}
                    </div>
                    {onGameComplete && (
                        <button
                            onClick={() => {
                                // Withdraw - player automatically loses
                                if (onGameComplete) {
                                    onGameComplete({
                                        winner: null, // No winner, player withdrew
                                        withdrew: true,
                                        playerLost: true
                                    });
                                }
                            }}
                            style={{
                                backgroundColor: '#F44336',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#D32F2F'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#F44336'}
                        >
                            ⚠️ Withdraw (Lose)
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                padding: '10px'
            }}>
                {[4, 8, 16].map(count => (
                    <button
                        key={count}
                        onClick={() => {
                            setPlayerCount(count);
                            if (connected) {
                                sendGameAction({
                                    type: 'UPDATE_PLAYER_COUNT',
                                    data: {
                                        roomId,
                                        playerCount: count
                                    }
                                });
                            }
                        }}
                        style={{
                            backgroundColor: playerCount === count ? '#4CAF50' : '#2d2d2d',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {count} Players
                    </button>
                ))}
            </div>
            
            <div id="game-container" style={{
                width: '100%',
                height: '600px',
                backgroundColor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{ color: 'white' }}>
                    {connectionStatus}
                </div>
                {connected && account && (
                    <div style={{ color: '#666', fontSize: '14px' }}>
                        Room: {roomId} | Player: {determinePlayerPosition(roomId, account) + 1}
                    </div>
                )}
            </div>
            
            <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '10px',
                fontSize: '14px'
            }}>
                <p>Connection Status: {connected ? 'Connected' : 'Disconnected'}</p>
                <p>Wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}</p>
            </div>
        </div>
    );
};

export default Game; 