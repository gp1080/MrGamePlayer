const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

console.log('Starting WebSocket server...');

// Store active connections and game rooms
const connections = new Map();
const rooms = new Map();

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            switch (data.type) {
                case 'AUTH':
                    handleAuth(ws, data.data);
                    break;
                case 'CREATE_ROOM':
                    handleCreateRoom(ws, data.data);
                    break;
                case 'JOIN_ROOM':
                    handleJoinRoom(ws, data.data);
                    break;
                case 'LEAVE_ROOM':
                    handleLeaveRoom(ws, data.data);
                    break;
                case 'GAME_ACTION':
                    handleGameAction(ws, data.data);
                    break;
                case 'CHAT_MESSAGE':
                    handleChatMessage(ws, data);
                    break;
                case 'PLAYER_UPDATE':
                    handlePlayerUpdate(ws, data);
                    break;
                case 'JOIN_GAME':
                    handleJoinGame(ws, data.data);
                    break;
                case 'LEAVE_GAME':
                    handleLeaveGame(ws, data.data);
                    break;
                case 'UPDATE_PLAYER_COUNT':
                    handleUpdatePlayerCount(ws, data.data);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        handleDisconnect(ws);
    });
});

function handleAuth(ws, data) {
    const { address } = data;
    connections.set(address, ws);
    ws.userId = address;
    
    // Send current rooms list
    ws.send(JSON.stringify({
        type: 'ROOMS_UPDATE',
        data: Array.from(rooms.values())
    }));
}

function handleCreateRoom(ws, data) {
    const roomId = generateRoomId();
    const room = {
        id: roomId,
        name: data.name,
        maxPlayers: data.maxPlayers,
        isPrivate: data.isPrivate,
        password: data.password,
        players: [ws.userId],
        gameState: null,
        status: 'waiting'
    };

    rooms.set(roomId, room);
    broadcastRooms();
}

function handleJoinRoom(ws, data) {
    // Check if user is authenticated
    if (!ws.userId) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Not authenticated. Please connect your wallet first.' }
        }));
        return;
    }

    const room = rooms.get(data.roomId);
    if (!room) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Room not found' }
        }));
        return;
    }

    // Check if player is already in the room
    if (room.players.includes(ws.userId)) {
        // Player already in room, just send current state
        ws.send(JSON.stringify({
            type: 'PLAYERS_UPDATE',
            data: room.players
        }));
        return;
    }

    if (room.isPrivate && room.password !== data.password) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Invalid password' }
        }));
        return;
    }

    if (room.players.length >= room.maxPlayers) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Room is full' }
        }));
        return;
    }

    // Add player to room
    room.players.push(ws.userId);
    rooms.set(data.roomId, room);
    
    console.log(`Player ${ws.userId} joined room ${data.roomId}. Total players: ${room.players.length}`);
    
    // Broadcast rooms list update
    broadcastRooms();
    
    // Broadcast player update to ALL players in the room (including the new one)
    broadcastToRoom(room.id, {
        type: 'PLAYERS_UPDATE',
        data: room.players
    });
}

function handleLeaveRoom(ws, data) {
    const room = rooms.get(data.roomId);
    if (!room) return;

    room.players = room.players.filter(id => id !== ws.userId);
    
    if (room.players.length === 0) {
        rooms.delete(data.roomId);
    } else {
        rooms.set(data.roomId, room);
    }

    broadcastRooms();
    broadcastToRoom(room.id, {
        type: 'PLAYERS_UPDATE',
        data: room.players
    });
}

function handleGameAction(ws, data) {
    // Find the room the player is in
    const room = Array.from(rooms.values()).find(r => 
        r.players.includes(ws.userId)
    );

    if (!room) return;

    // Update game state based on action
    updateGameState(room, data);
    
    // Broadcast new state to all players in room
    broadcastToRoom(room.id, {
        type: 'GAME_STATE',
        data: room.gameState
    });
}

function handleChatMessage(ws, data) {
    const { roomId, data: messageData } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    broadcastToRoom(roomId, {
        type: 'CHAT_MESSAGE',
        data: {
            ...messageData,
            timestamp: Date.now()
        }
    });
}

function handlePlayerUpdate(ws, data) {
    const { playerId, state, timestamp } = data;
    const room = Array.from(rooms.values()).find(r => 
        r.players.includes(playerId)
    );

    if (!room) return;

    // Update player state
    if (!room.gameState) {
        room.gameState = {
            players: {},
            gameTime: Date.now(),
            serverTime: Date.now()
        };
    }

    room.gameState.players[playerId] = {
        ...state,
        lastUpdate: timestamp
    };

    room.gameState.serverTime = Date.now();

    // Broadcast updated game state
    broadcastToRoom(room.id, {
        type: 'GAME_STATE',
        data: room.gameState
    });
}

function handleDisconnect(ws) {
    if (!ws.userId) return;

    connections.delete(ws.userId);

    // Remove player from any rooms they're in
    rooms.forEach((room, roomId) => {
        if (room.players.includes(ws.userId)) {
            handleLeaveRoom(ws, { roomId });
        }
    });
}

function broadcastRooms() {
    const roomsList = Array.from(rooms.values()).map(room => ({
        ...room,
        password: undefined // Don't send passwords to clients
    }));

    connections.forEach(ws => {
        ws.send(JSON.stringify({
            type: 'ROOMS_UPDATE',
            data: roomsList
        }));
    });
}

function broadcastToRoom(roomId, message) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.players.forEach(playerId => {
        const ws = connections.get(playerId);
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    });
}

function updateGameState(room, action) {
    // Initialize game state if needed
    if (!room.gameState) {
        room.gameState = {
            players: room.players.map(id => ({
                id,
                position: { x: 0, y: 0 },
                score: 0
            })),
            gameTime: 0,
            status: 'playing'
        };
    }

    // Handle different types of actions
    switch (action.type) {
        case 'MOVE':
            const player = room.gameState.players.find(p => p.id === action.playerId);
            if (player) {
                player.position = action.position;
            }
            break;
        case 'SCORE':
            const scoringPlayer = room.gameState.players.find(p => p.id === action.playerId);
            if (scoringPlayer) {
                scoringPlayer.score += action.points;
            }
            break;
    }
}

function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

function handleJoinGame(ws, data) {
    const { roomId, account, playerCount } = data;
    let room = rooms.get(roomId);

    if (!room) {
        room = {
            id: roomId,
            players: new Map(),
            gameState: {
                balls: [],
                paddles: {},
                scores: {},
                playerCount
            }
        };
        rooms.set(roomId, room);
    }

    // Add player to room
    room.players.set(account, {
        position: room.players.size,
        ws
    });

    // Broadcast room update
    broadcastToRoom(roomId, {
        type: 'GAME_STATE',
        data: room.gameState
    });
}

function handleLeaveGame(ws, data) {
    const { roomId, account } = data;
    const room = rooms.get(roomId);
    
    if (room) {
        room.players.delete(account);
        
        if (room.players.size === 0) {
            rooms.delete(roomId);
        } else {
            // Broadcast room update
            broadcastToRoom(roomId, {
                type: 'GAME_STATE',
                data: room.gameState
            });
        }
    }
}

function handleUpdatePlayerCount(ws, data) {
    const { roomId, playerCount } = data;
    const room = rooms.get(roomId);
    
    if (room) {
        room.gameState.playerCount = playerCount;
        // Reset game state for new player count
        room.gameState.balls = [];
        room.gameState.paddles = {};
        room.gameState.scores = {};
        
        // Broadcast room update
        broadcastToRoom(roomId, {
            type: 'GAME_STATE',
            data: room.gameState
        });
    }
}

// Use WS_PORT for WebSocket server, PORT for Railway's main port
const WS_PORT = process.env.WS_PORT || process.env.PORT || 8080;
server.listen(WS_PORT, '0.0.0.0', () => {
    console.log(`WebSocket server is running on port ${WS_PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 