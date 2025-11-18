import React, { useState } from 'react';
import OfflineGame from './OfflineGame';

const GameTestMode = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [testResults, setTestResults] = useState({});

    const games = [
        { id: 'pong', name: '🏓 Multi-Pong', description: 'Classic paddle game (4 players)', supports4Players: true },
        { id: 'rps', name: '🪨 Rock Paper Scissors', description: 'Best of 3 rounds battle (2 players)', supports4Players: false },
        { id: 'snake', name: '🐍 Battle Snake', description: 'Snake battle game (4 players)', supports4Players: true },
        { id: 'platform', name: '🦘 Platform Jump', description: 'Jump and collect coins (4 players)', supports4Players: true },
        { id: 'clumsybird', name: '🐦 Clumsy Bird', description: 'Fly through pipes and survive (4 players)', supports4Players: true },
        { id: 'tictactoe', name: '⭕ Tic Tac Toe', description: 'Classic 3x3 grid game (2 players)', supports4Players: false },
        { id: 'towerbuilding', name: '🏗️ Tower Building', description: 'Click blocks to build a tower (4 players)', supports4Players: true },
        { id: 'endlessrunner', name: '🏃 Endless Runner', description: 'Run, jump and collect coins (2 players)', supports4Players: false },
        { id: 'chess', name: '♟️ Chess', description: 'Classic strategy board game (2 players)', supports4Players: false },
        { id: 'tetris', name: '🧩 Tetris', description: 'Competitive puzzle game (2 players)', supports4Players: false }
    ];

    const handleGameSelect = (gameId) => {
        setSelectedGame(gameId);
    };

    const handleTestResult = (gameId, result) => {
        setTestResults(prev => ({
            ...prev,
            [gameId]: result
        }));
    };

    const resetTests = () => {
        setSelectedGame(null);
        setTestResults({});
    };

    if (selectedGame) {
        return (
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '30px',
                color: 'white',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-bold)',
                    marginBottom: '20px',
                    fontFamily: 'var(--font-primary)'
                }}>
                    🎮 Testing: {games.find(g => g.id === selectedGame)?.name}
                </h2>
                
                <div style={{ marginBottom: '20px' }}>
                    <OfflineGame 
                        gameType={selectedGame}
                        onGameComplete={() => handleTestResult(selectedGame, 'completed')}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    <button
                        onClick={() => handleTestResult(selectedGame, 'working')}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-primary)',
                            fontWeight: 'var(--font-medium)'
                        }}
                    >
                        ✅ Game Works
                    </button>
                    <button
                        onClick={() => handleTestResult(selectedGame, 'broken')}
                        style={{
                            backgroundColor: '#F44336',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-primary)',
                            fontWeight: 'var(--font-medium)'
                        }}
                    >
                        ❌ Game Broken
                    </button>
                </div>

                <button
                    onClick={() => setSelectedGame(null)}
                    style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-primary)',
                        fontWeight: 'var(--font-medium)'
                    }}
                >
                    ← Back to Game Selection
                </button>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '30px',
            color: 'white'
        }}>
            <h1 style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-extrabold)',
                marginBottom: '20px',
                textAlign: 'center',
                fontFamily: 'var(--font-primary)',
                letterSpacing: 'var(--tracking-tight)'
            }}>
                🎮 Game Testing Mode
            </h1>

            <p style={{
                textAlign: 'center',
                marginBottom: '30px',
                fontSize: 'var(--text-lg)',
                color: '#999',
                fontFamily: 'var(--font-primary)'
            }}>
                Test each game individually to ensure they work properly
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {games.map(game => (
                    <div
                        key={game.id}
                        onClick={() => handleGameSelect(game.id)}
                        style={{
                            backgroundColor: '#2d2d2d',
                            padding: '20px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = '#4CAF50';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'transparent';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            fontSize: 'var(--text-3xl)',
                            marginBottom: '10px'
                        }}>
                            {game.name}
                        </div>
                        <div style={{
                            color: '#999',
                            fontSize: 'var(--text-sm)',
                            marginBottom: '15px',
                            fontFamily: 'var(--font-primary)'
                        }}>
                            {game.description}
                        </div>
                        {game.supports4Players && (
                            <div style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                display: 'inline-block',
                                marginBottom: '10px'
                            }}>
                                4-PLAYER
                            </div>
                        )}
                        <div style={{
                            fontSize: 'var(--text-xs)',
                            color: testResults[game.id] === 'working' ? '#4CAF50' : 
                                   testResults[game.id] === 'broken' ? '#F44336' : '#666',
                            fontFamily: 'var(--font-primary)',
                            fontWeight: 'var(--font-medium)'
                        }}>
                            {testResults[game.id] === 'working' ? '✅ Tested - Working' :
                             testResults[game.id] === 'broken' ? '❌ Tested - Broken' : '⏳ Not Tested'}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#2d2d2d',
                borderRadius: '8px'
            }}>
                <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-semibold)',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-primary)'
                }}>
                    Test Results Summary
                </h3>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-primary)'
                }}>
                    <span style={{ color: '#4CAF50' }}>
                        ✅ Working: {Object.values(testResults).filter(r => r === 'working').length}
                    </span>
                    <span style={{ color: '#F44336' }}>
                        ❌ Broken: {Object.values(testResults).filter(r => r === 'broken').length}
                    </span>
                    <span style={{ color: '#666' }}>
                        ⏳ Not Tested: {games.length - Object.keys(testResults).length}
                    </span>
                </div>
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '20px'
            }}>
                <button
                    onClick={resetTests}
                    style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-primary)',
                        fontWeight: 'var(--font-medium)',
                        marginRight: '10px'
                    }}
                >
                    🔄 Reset Tests
                </button>
                <button
                    onClick={() => window.location.href = '/room/test123'}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-primary)',
                        fontWeight: 'var(--font-medium)'
                    }}
                >
                    🎮 Back to Main Game
                </button>
            </div>
        </div>
    );
};

export default GameTestMode;
