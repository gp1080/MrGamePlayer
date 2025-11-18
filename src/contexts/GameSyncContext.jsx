import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';

const GameSyncContext = createContext();

export const GameSyncProvider = ({ children }) => {
    const { gameState, sendGameAction } = useWebSocket();
    const [syncState, setSyncState] = useState({
        players: {},
        gameTime: 0,
        lastUpdate: Date.now(),
        interpolation: {},
        serverTime: 0,
        latency: 0
    });

    // Update local state when receiving server updates
    useEffect(() => {
        if (gameState) {
            const now = Date.now();
            setSyncState(prev => ({
                ...prev,
                players: gameState.players,
                gameTime: gameState.gameTime,
                lastUpdate: now,
                serverTime: gameState.serverTime,
                latency: now - gameState.serverTime
            }));
        }
    }, [gameState]);

    // Interpolation loop for smooth movement
    useEffect(() => {
        const interpolationInterval = setInterval(() => {
            setSyncState(prev => {
                const now = Date.now();
                const timeDelta = now - prev.lastUpdate;

                // Interpolate player positions
                const interpolatedPlayers = Object.entries(prev.players).reduce((acc, [id, player]) => {
                    if (prev.interpolation[id]) {
                        const { start, end, startTime, duration } = prev.interpolation[id];
                        const progress = Math.min((now - startTime) / duration, 1);

                        acc[id] = {
                            ...player,
                            position: {
                                x: start.x + (end.x - start.x) * progress,
                                y: start.y + (end.y - start.y) * progress
                            }
                        };
                    } else {
                        acc[id] = player;
                    }
                    return acc;
                }, {});

                return {
                    ...prev,
                    players: interpolatedPlayers,
                    gameTime: prev.gameTime + timeDelta
                };
            });
        }, 16); // 60fps

        return () => clearInterval(interpolationInterval);
    }, []);

    // Send player updates to server
    const updatePlayerState = (playerId, state) => {
        const now = Date.now();
        
        // Start interpolation for this player
        setSyncState(prev => ({
            ...prev,
            interpolation: {
                ...prev.interpolation,
                [playerId]: {
                    start: prev.players[playerId]?.position || state.position,
                    end: state.position,
                    startTime: now,
                    duration: 100 // Interpolate over 100ms
                }
            }
        }));

        // Send update to server
        sendGameAction({
            type: 'PLAYER_UPDATE',
            playerId,
            state,
            timestamp: now
        });
    };

    // Predict future state based on current velocity and latency
    const predictState = (playerId) => {
        const player = syncState.players[playerId];
        if (!player || !player.velocity) return player;

        const prediction = {
            ...player,
            position: {
                x: player.position.x + player.velocity.x * syncState.latency,
                y: player.position.y + player.velocity.y * syncState.latency
            }
        };

        return prediction;
    };

    return (
        <GameSyncContext.Provider value={{
            gameState: syncState,
            updatePlayerState,
            predictState,
            latency: syncState.latency
        }}>
            {children}
        </GameSyncContext.Provider>
    );
};

export const useGameSync = () => useContext(GameSyncContext); 