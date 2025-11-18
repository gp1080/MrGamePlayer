import React, { useState, useEffect } from 'react';

const GameSelection = ({ playerCount, onGamesSelected, onStartGame }) => {
    const [selectedGames, setSelectedGames] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);

    // Define all available games with their player requirements
    const allGames = [
        {
            id: 'pong',
            name: 'Multi-Pong',
            description: 'Classic pong with multiple players',
            minPlayers: 2,
            maxPlayers: 8,
            supports4Players: true, // 4-player game
            duration: 60, // 1 minute
            difficulty: 'Easy',
            icon: '🏓'
        },
        {
            id: 'rps',
            name: 'Rock Paper Scissors',
            description: 'Best of 3 rounds battle',
            minPlayers: 2,
            maxPlayers: 2,
            duration: 60, // 1 minute
            difficulty: 'Easy',
            icon: '🪨'
        },
        {
            id: 'snake',
            name: 'Battle Snake',
            description: 'Multiplayer snake battle',
            minPlayers: 2,
            maxPlayers: 8,
            supports4Players: true, // 4-player game
            duration: 60, // 1 minute
            difficulty: 'Easy',
            icon: '🐍'
        },
        {
            id: 'platform',
            name: 'Platform Jump',
            description: 'Jump and collect coins',
            minPlayers: 2,
            maxPlayers: 4,
            supports4Players: true, // 4-player game
            duration: 60, // 1 minute
            difficulty: 'Easy',
            icon: '🦘'
        },
        {
            id: 'clumsybird',
            name: 'Clumsy Bird',
            description: 'Fly through pipes and survive',
            minPlayers: 2,
            maxPlayers: 8,
            supports4Players: true, // 4-player game
            duration: 60, // 1 minute
            difficulty: 'Medium',
            icon: '🐦'
        },
        {
            id: 'tictactoe',
            name: 'Tic Tac Toe',
            description: 'Classic 3x3 grid game',
            minPlayers: 2,
            maxPlayers: 2,
            duration: 5, // Quick game
            difficulty: 'Easy',
            icon: '⭕'
        },
        {
            id: 'towerbuilding',
            name: 'Tower Building',
            description: 'Click blocks to build the tallest tower',
            minPlayers: 2,
            maxPlayers: 4,
            supports4Players: true, // 4-player game
            duration: 60, // 1 minute
            difficulty: 'Easy',
            icon: '🏗️'
        },
        {
            id: 'endlessrunner',
            name: 'Endless Runner',
            description: 'Run, jump and collect coins',
            minPlayers: 1,
            maxPlayers: 1,
            duration: 60, // 1 minute
            difficulty: 'Easy',
            icon: '🏃'
        },
    ];

    // Filter games based on player count
    const getAvailableGames = React.useCallback((playerCount) => {
        return allGames.filter(game => 
            playerCount >= game.minPlayers && playerCount <= game.maxPlayers
        );
    }, [allGames]);

    // Randomly select 4-5 games based on player count
    const selectRandomGames = React.useCallback((playerCount) => {
        const availableGames = getAvailableGames(playerCount);
        const numGames = playerCount === 2 ? 4 : 5; // 4 games for 2 players, 5 for 4-8 players
        
        // Shuffle and select
        const shuffled = [...availableGames].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(numGames, shuffled.length));
    }, [getAvailableGames]);

    // Initialize game selection when player count changes
    useEffect(() => {
        if (playerCount) {
            setIsSelecting(true);
            // Add a small delay for dramatic effect
            setTimeout(() => {
                const games = selectRandomGames(playerCount);
                setSelectedGames(games);
                setIsSelecting(false);
                if (onGamesSelected) {
                    onGamesSelected(games);
                }
            }, 1500);
        }
    }, [playerCount, onGamesSelected, selectRandomGames]);

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return '#4CAF50';
            case 'Medium': return '#FF9800';
            case 'Hard': return '#F44336';
            default: return '#666';
        }
    };

    if (isSelecting) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'white',
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                margin: '20px 0'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px',
                    animation: 'spin 1s linear infinite'
                }}>
                    🎲
                </div>
                <h2 style={{ marginBottom: '10px' }}>Selecting Games...</h2>
                <p style={{ color: '#999' }}>
                    Choosing {playerCount === 2 ? '4' : '5'} random games for {playerCount} players
                </p>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            margin: '20px 0'
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '30px'
            }}>
                <h2 style={{ color: 'white', marginBottom: '10px' }}>
                    Selected Games for {playerCount} Players
                </h2>
                <p style={{ color: '#999', marginBottom: '15px' }}>
                    {selectedGames.length} games will be played in sequence
                </p>
                {playerCount === 4 && (
                    <div style={{
                        backgroundColor: '#1a3a1a',
                        border: '2px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '10px',
                        display: 'inline-block'
                    }}>
                        <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '14px' }}>
                            🎮 4-Player Games Available: Multi-Pong, Battle Snake, Platform Jump, Clumsy Bird, Tower Building
                        </span>
                    </div>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {selectedGames.map((game, index) => (
                    <div
                        key={game.id}
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            padding: '20px',
                            border: '2px solid #333',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = '#4CAF50';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = '#333';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <span style={{
                                fontSize: '32px',
                                marginRight: '15px'
                            }}>
                                {game.icon}
                            </span>
                            <div>
                                <h3 style={{
                                    color: 'white',
                                    margin: '0 0 5px 0',
                                    fontSize: '18px'
                                }}>
                                    {index + 1}. {game.name}
                                </h3>
                                <p style={{
                                    color: '#999',
                                    margin: '0',
                                    fontSize: '14px'
                                }}>
                                    {game.description}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '14px'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '10px'
                            }}>
                                <span style={{
                                    backgroundColor: getDifficultyColor(game.difficulty),
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    {game.difficulty}
                                </span>
                                <span style={{ color: '#999' }}>
                                    {formatDuration(game.duration)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <span style={{
                                    color: '#4CAF50',
                                    fontWeight: 'bold'
                                }}>
                                    {game.minPlayers}-{game.maxPlayers} players
                                </span>
                                {game.supports4Players && playerCount === 4 && (
                                    <span style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        4-PLAYER
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                textAlign: 'center'
            }}>
                <button
                    onClick={() => onStartGame && onStartGame(selectedGames)}
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
                    Start Game Session
                </button>
                
                <button
                    onClick={() => {
                        setIsSelecting(true);
                        setTimeout(() => {
                            const games = selectRandomGames(playerCount);
                            setSelectedGames(games);
                            setIsSelecting(false);
                            if (onGamesSelected) {
                                onGamesSelected(games);
                            }
                        }, 1500);
                    }}
                    style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginLeft: '15px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#777'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#666'}
                >
                    Reselect Games
                </button>
            </div>
        </div>
    );
};

export default GameSelection;
