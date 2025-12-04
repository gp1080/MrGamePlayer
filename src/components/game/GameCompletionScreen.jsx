import React, { useState, useEffect } from 'react';

const GameCompletionScreen = ({ 
    currentGame, 
    gameIndex, 
    totalGames, 
    playerCount, 
    isRoomCreator = false,
    onNewGame,
    onCloseRoom,
    onNextGame: _onNextGame,
    onEndSession: _onEndSession,
    gameResults: _gameResults = {} 
}) => {
    const [countdown, setCountdown] = useState(10);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowResults(true);
        }
    }, [countdown]);

    const isLastGame = gameIndex >= totalGames;
    const nextGame = isLastGame ? null : currentGame;

    const getGameIcon = (gameId) => {
        const icons = {
            pong: '🏓',
            racing: '🏎️',
            platform: '🦘',
            snake: '🐍',
            tetris: '🧩',
            bomberman: '💣',
            tank: '🚗',
            puzzle: '🧠',
            shooter: '🚀',
            maze: '🏃'
        };
        return icons[gameId] || '🎮';
    };

    const getCompletionMessage = () => {
        if (isLastGame) {
            return "Session Complete! 🎉";
        }
        return "Game Complete! ✅";
    };

    // eslint-disable-next-line no-unused-vars
    const getNextGameMessage = () => {
        if (isLastGame) {
            return "All games finished! Great job!";
        }
        return `Next: ${nextGame?.name} ${getGameIcon(nextGame?.id)}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                maxWidth: '600px',
                width: '90%',
                color: 'white'
            }}>
                {/* Main Completion Message */}
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                }}>
                    {getCompletionMessage()}
                </div>

                {/* Game Progress */}
                <div style={{
                    fontSize: '18px',
                    color: '#999',
                    marginBottom: '30px'
                }}>
                    Game {gameIndex} of {totalGames} Complete
                </div>

                {/* Current Game Info */}
                {currentGame && (
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px'
                    }}>
                        <span style={{ fontSize: '32px' }}>
                            {getGameIcon(currentGame.id)}
                        </span>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
                                {currentGame.name}
                            </h3>
                            <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>
                                {currentGame.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Next Game Preview */}
                {!isLastGame && nextGame && (
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '30px',
                        border: '2px solid #4CAF50'
                    }}>
                        <h4 style={{
                            margin: '0 0 15px 0',
                            color: '#4CAF50',
                            fontSize: '18px'
                        }}>
                            Coming Up Next
                        </h4>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px'
                        }}>
                            <span style={{ fontSize: '28px' }}>
                                {getGameIcon(nextGame.id)}
                            </span>
                            <div>
                                <h5 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                                    {nextGame.name}
                                </h5>
                                <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                                    {nextGame.description}
                                </p>
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'center',
                                    marginTop: '10px',
                                    fontSize: '12px'
                                }}>
                                    <span style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '3px'
                                    }}>
                                        {nextGame.difficulty}
                                    </span>
                                    <span style={{ color: '#999' }}>
                                        {Math.floor(nextGame.duration / 60)}:{(nextGame.duration % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {showResults && (
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {isRoomCreator ? (
                            <>
                                <button
                                    onClick={onNewGame}
                                    style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '15px 30px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                >
                                    🎮 Select New Game
                                </button>
                                <button
                                    onClick={onCloseRoom}
                                    style={{
                                        backgroundColor: '#F44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '15px 30px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#D32F2F'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F44336'}
                                >
                                    🚪 Close Room
                                </button>
                            </>
                        ) : (
                            <div style={{
                                fontSize: '18px',
                                color: '#999',
                                padding: '20px'
                            }}>
                                Waiting for room creator to choose next action...
                            </div>
                        )}
                    </div>
                )}

                {/* Session Stats */}
                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#999'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Session Progress:</strong> {gameIndex}/{totalGames} games completed
                    </div>
                    <div>
                        <strong>Players:</strong> {playerCount} • <strong>Current Game:</strong> {currentGame?.name}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCompletionScreen;
