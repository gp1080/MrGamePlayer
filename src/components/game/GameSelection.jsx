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
];

const GameSelection = ({ playerCount, onGamesSelected, onStartGame }) => {
    const [selectedGames, setSelectedGames] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedGameIds, setSelectedGameIds] = useState(new Set()); // Track which games are selected
    const [isStarting, setIsStarting] = useState(false); // Track if game is starting to prevent multiple clicks

    // Filter games based on player count
    const getAvailableGames = React.useCallback((playerCount) => {
        return allGames.filter(game => 
            playerCount >= game.minPlayers && playerCount <= game.maxPlayers
        );
    }, []);

    // Randomly select 1 game based on player count
    const selectRandomGame = React.useCallback((playerCount) => {
        const availableGames = getAvailableGames(playerCount);
        
        // Shuffle and select only 1 game
        const shuffled = [...availableGames].sort(() => 0.5 - Math.random());
        return shuffled.length > 0 ? [shuffled[0]] : [];
    }, [getAvailableGames]);

    // Initialize game selection when player count changes - show available games but none selected initially
    useEffect(() => {
        if (playerCount) {
            setIsSelecting(true);
            // Add a small delay for dramatic effect
            const timer = setTimeout(() => {
                const availableGames = getAvailableGames(playerCount);
                setSelectedGames(availableGames);
                setIsSelecting(false);
                // Start with no games selected - user must select one
                setSelectedGameIds(new Set());
                if (onGamesSelected) {
                    onGamesSelected([]);
                }
            }, 500);
            
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
                <h2 style={{ marginBottom: '10px' }}>Loading Games...</h2>
                <p style={{ color: '#999' }}>
                    Preparing available games for {playerCount} players
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
                    Select One Game for {playerCount} Players
                </h2>
                <p style={{ color: '#999', marginBottom: '15px' }}>
                    {selectedGameIds.size > 0 ? `1 game selected` : 'Click on a game below to select it'}
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
                            console.log('Game clicked:', game.id, game.name);
                            // Only allow one game to be selected at a time
                            const newSelectedIds = new Set([game.id]);
                            setSelectedGameIds(newSelectedIds);
                            
                            // Update selected games array to only include the selected game
                            const newSelectedGames = [game];
                            console.log('Setting selectedGames to:', newSelectedGames);
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
                    );
                })}
            </div>

            <div style={{
                textAlign: 'center'
            }}>
                <button
                    onClick={() => {
                        console.log('=== Start Game button clicked ===');
                        console.log('selectedGameIds:', Array.from(selectedGameIds));
                        console.log('selectedGames:', selectedGames);
                        console.log('isStarting:', isStarting);
                        console.log('onStartGame:', onStartGame);
                        
                        // Prevent multiple clicks while starting
                        if (isStarting) {
                            console.log('Game is already starting, ignoring click');
                            return;
                        }
                        
                        // Get the selected game directly from selectedGames (which should only contain the selected game)
                        // Or filter from all available games if selectedGames hasn't been updated
                        let gamesToStart = [];
                        if (selectedGames.length === 1 && selectedGameIds.has(selectedGames[0].id)) {
                            // selectedGames already contains only the selected game
                            gamesToStart = selectedGames;
                        } else if (selectedGameIds.size === 1) {
                            // Find the selected game from available games
                            const selectedId = Array.from(selectedGameIds)[0];
                            const availableGames = getAvailableGames(playerCount);
                            gamesToStart = availableGames.filter(g => g.id === selectedId);
                        }
                        
                        console.log('gamesToStart:', gamesToStart);
                        console.log('gamesToStart.length:', gamesToStart.length);
                        console.log('selectedGameIds.size:', selectedGameIds.size);
                        console.log('selectedGames.length:', selectedGames.length);
                        
                        if (gamesToStart.length === 1 && onStartGame) {
                            console.log('Calling onStartGame with:', gamesToStart);
                            setIsStarting(true); // Mark as starting
                            onStartGame(gamesToStart);
                        } else {
                            console.warn('Cannot start game - gamesToStart.length:', gamesToStart.length, 'onStartGame:', onStartGame, 'selectedGameIds:', Array.from(selectedGameIds));
                        }
                    }}
                    disabled={selectedGameIds.size !== 1 || isStarting}
                    style={{
                        backgroundColor: (selectedGameIds.size === 1 && !isStarting) ? '#4CAF50' : '#666',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: (selectedGameIds.size === 1 && !isStarting) ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.3s ease',
                        opacity: (selectedGameIds.size === 1 && !isStarting) ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                        if (selectedGameIds.size === 1 && !isStarting) {
                            e.target.style.backgroundColor = '#45a049';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedGameIds.size === 1 && !isStarting) {
                            e.target.style.backgroundColor = '#4CAF50';
                        }
                    }}
                >
                    {isStarting ? 'Starting Game...' : (selectedGameIds.size === 1 ? 'Start Game' : 'Select a Game to Start')}
                </button>
                
                <button
                    onClick={() => {
                        setIsSelecting(true);
                        setTimeout(() => {
                            const games = selectRandomGame(playerCount);
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
