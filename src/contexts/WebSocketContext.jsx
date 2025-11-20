import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from './WalletContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    // Get wallet context - useWallet will throw if not in provider, but we handle it
    const walletContext = useWallet();
    const account = walletContext?.account;
    
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [gameState, setGameState] = useState(null);
    const [players, setPlayers] = useState([]);
    const [rooms, setRooms] = useState([]);

    const handleWebSocketMessage = useCallback((message) => {
        console.log('WebSocket message received:', message.type, message.data);
        switch (message.type) {
            case 'ROOMS_UPDATE':
                setRooms(message.data);
                break;
            case 'GAME_STATE':
                setGameState(message.data);
                break;
            case 'PLAYERS_UPDATE':
                console.log('Players updated:', message.data);
                setPlayers(message.data);
                break;
            case 'ERROR':
                console.error('WebSocket error:', message.data);
                break;
            case 'GAME_INVITE':
                // Store invite in localStorage for FriendsContext to pick up
                if (account && message.data) {
                    const invites = JSON.parse(localStorage.getItem(`gameInvites_${account}`) || '[]');
                    invites.push({
                        id: message.data.inviteId || Date.now().toString(),
                        roomId: message.data.roomId,
                        inviter: message.data.inviter,
                        timestamp: message.data.timestamp || Date.now()
                    });
                    localStorage.setItem(`gameInvites_${account}`, JSON.stringify(invites));
                    // Trigger a custom event so FriendsContext can update
                    window.dispatchEvent(new CustomEvent('gameInviteReceived', { detail: message.data }));
                }
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }, [account]);

    const connectWebSocket = useCallback(() => {
        console.log('Attempting to connect to WebSocket...');
        // Use environment variable for WebSocket URL
        // For production: Set REACT_APP_WS_URL to your Railway WebSocket service URL
        // For development: Falls back to localhost
        const wsUrl = process.env.REACT_APP_WS_URL || 
                     (window.location.protocol === 'https:' 
                        ? `wss://${window.location.hostname}:8080` 
                        : `ws://${window.location.hostname}:8080`);
        console.log('Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setConnected(true);
            setSocket(ws);
            socketRef.current = ws;
            
            // Make WebSocket available globally for FriendsContext
            window.__websocket__ = ws;
            
            // Send authentication if account is available
            if (account) {
                ws.send(JSON.stringify({
                    type: 'AUTH',
                    data: { address: account }
                }));
            }
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setConnected(false);
            setSocket(null);
            socketRef.current = null;
            // Attempt to reconnect
            setTimeout(connectWebSocket, 5000);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);
                handleWebSocketMessage(message);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setConnected(false);
        };
    }, [account, handleWebSocketMessage]);

    useEffect(() => {
        // Always try to connect to WebSocket, even without account
        connectWebSocket();
        
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [connectWebSocket]);

    // Re-authenticate when account changes
    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && account) {
            console.log('Re-authenticating with account:', account);
            socket.send(JSON.stringify({
                type: 'AUTH',
                data: { address: account }
            }));
            // Request rooms update after authentication
            setTimeout(() => {
                console.log('Requesting rooms update after auth');
            }, 100);
        }
    }, [account, socket]);

    const sendGameAction = (action) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('Sending action:', action);
            socket.send(JSON.stringify(action));
        } else {
            console.warn('WebSocket is not connected');
        }
    };

    const createRoom = (roomSettings) => {
        sendGameAction({
            type: 'CREATE_ROOM',
            data: roomSettings
        });
    };

    const joinRoom = (roomId) => {
        sendGameAction({
            type: 'JOIN_ROOM',
            data: { roomId }
        });
    };

    const leaveRoom = (roomId) => {
        sendGameAction({
            type: 'LEAVE_ROOM',
            data: { roomId }
        });
    };

    // Provide connection status and error state
    const value = {
        connected,
        gameState,
        players,
        rooms,
        createRoom,
        joinRoom,
        leaveRoom,
        sendGameAction,
        isConnecting: !connected && socket !== null,
        error: null
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}; 