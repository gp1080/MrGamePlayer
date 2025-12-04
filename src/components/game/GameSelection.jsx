import React, { useState, useEffect } from 'react';

// Define all available games with their player requirements (constant, moved outside component)
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

const GameSelection = ({ playerCount, onGamesSelected, onStartGame }) => {
    const [selectedGames, setSelectedGames] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedGameIds, setSelectedGameIds] = useState(new Set()); // Track which games are selected

    // Filter games based on player count
    const getAvailableGames = React.useCallback((playerCount) => {
        return allGames.filter(game => 
            playerCount >= game.minPlayers && playerCount <= game.maxPlayers
        );
    }, []);

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
            const timer = setTimeout(() => {
                const games = selectRandomGames(playerCount);
                setSelectedGames(games);
                setIsSelecting(false);
                // Initialize selectedGameIds with all games (all selected by default)
                setSelectedGameIds(new Set(games.map(g => g.id)));
                if (onGamesSelected) {
                    onGamesSelected(games);
                }
            }, 1500);
            
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerCount]); // Only depend on playerCount to prevent loops

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
                {selectedGames.map((game, index) => {
                    const isSelected = selectedGameIds.has(game.id);
                    return (
                    <div
                        key={game.id}
                        onClick={() => {
                            const newSelectedIds = new Set(selectedGameIds);
                            if (isSelected) {
                                newSelectedIds.delete(game.id);
                            } else {
                                newSelectedIds.add(game.id);
                            }
                            setSelectedGameIds(newSelectedIds);
                            
                            // Update selected games array
                            const newSelectedGames = selectedGames.filter(g => newSelectedIds.has(g.id));
                            setSelectedGames(newSelectedGames);
                            if (onGamesSelected) {
                                onGamesSelected(newSelectedGames);
                            }
                        }}
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            padding: '20px',
                            border: isSelected ? '3px solid #4CAF50' : '2px solid #333',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 0 20px rgba(76, 175, 80, 0.5)' : 'none',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.borderColor = '#4CAF50';
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.borderColor = '#333';
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            } else {
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }
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
                        {isSelected && (
                            <div style={{
                                marginTop: '15px',
                                padding: '10px',
                                backgroundColor: '#1a3a1a',
                                borderRadius: '6px',
                                border: '1px solid #4CAF50',
                                textAlign: 'center',
                                color: '#4CAF50',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                ✓ Selected
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{
                textAlign: 'center'
            }}>
                <button
                    onClick={() => {
                        // Only start if games are selected
                        const gamesToStart = selectedGames.filter(g => selectedGameIds.has(g.id));
                        if (gamesToStart.length > 0 && onStartGame) {
                            onStartGame(gamesToStart);
                        } else if (onStartGame) {
                            // If no games selected, use all games
                            onStartGame(selectedGames);
                        }
                    }}
                    disabled={selectedGames.length === 0}
                    style={{
                        backgroundColor: selectedGames.length > 0 ? '#4CAF50' : '#666',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: selectedGames.length > 0 ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.3s ease',
                        opacity: selectedGames.length > 0 ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                        if (selectedGames.length > 0) {
                            e.target.style.backgroundColor = '#45a049';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedGames.length > 0) {
                            e.target.style.backgroundColor = '#4CAF50';
                        }
                    }}
                >
                    {selectedGameIds.size > 0 ? `Start Game Session (${selectedGameIds.size} selected)` : 'Start Game Session'}
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
