import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameManager from '../../scenes/GameManager';
import SimplePongScene from '../../scenes/SimplePongScene';
import MultiPongScene from '../../scenes/MultiPongScene';
import RockPaperScissorsScene from '../../scenes/RockPaperScissorsScene';
import SnakeScene from '../../scenes/SnakeScene';
import PlatformJumpScene from '../../scenes/PlatformJumpScene';
import ClumsyBirdScene from '../../scenes/ClumsyBirdScene';
import TicTacToeScene from '../../scenes/TicTacToeScene';
import TowerBuildingScene from '../../scenes/TowerBuildingScene';
import EndlessRunnerScene from '../../scenes/EndlessRunnerScene';
import ChessScene from '../../scenes/ChessScene';
import TetrisScene from '../../scenes/TetrisScene';

const OfflineGame = ({ gameType = 'pong', onGameComplete }) => {
    const gameRef = useRef(null);
    const [isGameReady, setIsGameReady] = useState(false);
    const startTimeRef = useRef(null);
    const [gameDuration, setGameDuration] = useState(0);
    
    // 4-player games
    const fourPlayerGames = ['pong', 'snake', 'platform', 'clumsybird', 'towerbuilding'];
    const numPlayers = fourPlayerGames.includes(gameType) ? 4 : 2;

    useEffect(() => {
        console.log('Offline game component mounted');
        console.log('Game type:', gameType);

        // Initialize start time once per mount/game type
        startTimeRef.current = Date.now();

        const config = {
            type: Phaser.AUTO,
            parent: 'offline-game-container',
            width: 800,
            height: 600,
            backgroundColor: '#000000',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 800,
                height: 600
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
                   scene: [GameManager, SimplePongScene, MultiPongScene, RockPaperScissorsScene, SnakeScene, PlatformJumpScene, ClumsyBirdScene, TicTacToeScene, TowerBuildingScene, EndlessRunnerScene, ChessScene, TetrisScene]
        };

        try {
            // Create game instance
            const game = new Phaser.Game(config);
            gameRef.current = game;
            console.log('Offline game instance created');

            // Start the game manager scene
            game.scene.start('GameManager', {
                playerPosition: 0,
                roomId: 'offline',
                numPlayers: numPlayers,
                gameType: gameType,
                onGameComplete: onGameComplete
            });
            setIsGameReady(true);
            console.log('Offline game manager started');

            // Game timer
            const gameTimerInterval = setInterval(() => {
                if (startTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    setGameDuration(elapsed);
                }
            }, 1000);

            return () => {
                console.log('Cleaning up offline game component');
                clearInterval(gameTimerInterval);
                if (gameRef.current) {
                    gameRef.current.destroy(true);
                }
            };
        } catch (error) {
            console.error('Error initializing offline game:', error);
        }
    }, [gameType, onGameComplete, numPlayers]);

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
                    {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game (Offline)
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ color: '#4CAF50', fontSize: '16px' }}>
                        ⏱️ {formatTime(gameDuration)}
                    </div>
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
                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ 
                    color: 'white', 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: '#333',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    {isGameReady ? '🎮 Game Ready!' : '⏳ Loading...'}
                </div>
            </div>
            
            <div id="offline-game-container" style={{
                width: '800px',
                height: '600px',
                backgroundColor: '#000000',
                margin: '0 auto',
                border: '2px solid #333',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
            </div>
            
            <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '10px',
                fontSize: '14px'
            }}>
                <p>Mode: Offline Demo • Controls: Arrow Keys or WASD</p>
                <p>Game Type: {gameType} • Players: {fourPlayerGames.includes(gameType) ? '4 (You + 3 AI)' : '2 (You + AI)'}</p>
            </div>
        </div>
    );
};

export default OfflineGame;
