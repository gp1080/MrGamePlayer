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
        // Prevent multiple connections
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected, skipping...');
            return;
        }
        
        if (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING) {
            console.log('WebSocket connection in progress, skipping...');
            return;
        }
        
        console.log('Attempting to connect to WebSocket...');
        
        // Determine WebSocket URL
        let wsUrl;
        const envWsUrl = process.env.REACT_APP_WS_URL;
        
        // Check if REACT_APP_WS_URL is set and not a placeholder
        if (envWsUrl && 
            envWsUrl !== 'wss://your-ws-service.railway.app' && 
            envWsUrl !== 'wss://your-app-name.railway.app' &&
            envWsUrl.trim() !== '') {
            // Use configured environment variable
            wsUrl = envWsUrl;
            console.log('Using configured REACT_APP_WS_URL:', wsUrl);
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Development: use localhost
            wsUrl = window.location.protocol === 'https:' 
                ? `wss://localhost:8080` 
                : `ws://localhost:8080`;
            console.log('Development mode, using localhost WebSocket');
        } else {
            // Production: try to use same hostname
            // Railway can handle WebSocket on the same domain
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const hostname = window.location.hostname;
            wsUrl = `${protocol}//${hostname}`;
            console.warn('⚠️ REACT_APP_WS_URL not configured!');
            console.warn('Using same domain as fallback:', wsUrl);
            console.warn('⚠️ Please configure REACT_APP_WS_URL in Railway:');
            console.warn('   1. Go to Railway Dashboard → Your Project → web service');
            console.warn('   2. Click "Variables" tab');
            console.warn('   3. Add: REACT_APP_WS_URL=wss://your-websocket-service.railway.app');
            console.warn('   4. Replace with your actual WebSocket service domain');
        }
        
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

        ws.onclose = (event) => {
            console.log('WebSocket Disconnected', event.code, event.reason);
            setConnected(false);
            setSocket(null);
            socketRef.current = null;
            
            // Only reconnect if it wasn't a manual close (code 1000)
            if (event.code !== 1000) {
                console.log('Attempting to reconnect in 5 seconds...');
                setTimeout(() => {
                    // Check if we still need to reconnect
                    if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
                        connectWebSocket();
                    }
                }, 5000);
            }
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
            console.error('WebSocket URL attempted:', wsUrl);
            setConnected(false);
            // Don't try to reconnect immediately on error - let onclose handle it
        };
    }, [account, handleWebSocketMessage]);

    useEffect(() => {
        // Only connect if not already connected
        if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }
        
        return () => {
            // Cleanup: close connection on unmount
            if (socketRef.current) {
                console.log('Closing WebSocket on unmount');
                socketRef.current.close(1000, 'Component unmounting');
                socketRef.current = null;
            }
        };
    }, []); // Only run once on mount

    // Re-authenticate when account changes
    useEffect(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && account) {
            console.log('Re-authenticating with account:', account);
            socketRef.current.send(JSON.stringify({
                type: 'AUTH',
                data: { address: account }
            }));
        } else if (account && (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)) {
            // If we have an account but WebSocket is not connected, try to connect
            console.log('Account available but WebSocket not connected, attempting connection...');
            if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
                connectWebSocket();
            }
        }
    }, [account, connectWebSocket]);

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