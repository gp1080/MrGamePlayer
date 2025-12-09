const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

console.log('Starting WebSocket server...');

// Store active connections and game rooms
const connections = new Map();
const rooms = new Map();

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`Client connected from ${clientIP}`);
    console.log(`WebSocket headers:`, req.headers);
    
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
                case 'GAME_STARTING':
                    handleGameStarting(ws, data.data);
                    break;
                case 'RPS_CHOICE':
                    handleRPSChoice(ws, data.data);
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
    // Check if user is authenticated
    if (!ws.userId) {
        console.log('CREATE_ROOM: User not authenticated, sending error');
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Not authenticated. Please connect your wallet first.' }
        }));
        return;
    }
    
    // Use provided roomId or generate one
    const roomId = data.roomId || generateRoomId();
    console.log(`CREATE_ROOM: Room ${roomId}, User: ${ws.userId}`);
    
    // Check if room already exists
    if (rooms.has(roomId)) {
        console.log(`Room ${roomId} already exists`);
        // If room exists and player is not in it, add them
        const existingRoom = rooms.get(roomId);
        if (!existingRoom.players.includes(ws.userId)) {
            existingRoom.players.push(ws.userId);
            rooms.set(roomId, existingRoom);
            console.log(`Added ${ws.userId} to existing room ${roomId}. Total players: ${existingRoom.players.length}`);
            broadcastRooms();
            broadcastToRoom(roomId, {
                type: 'PLAYERS_UPDATE',
                data: existingRoom.players
            });
        } else {
            // Player already in room, send current state
            console.log(`Player ${ws.userId} already in room ${roomId}`);
            ws.send(JSON.stringify({
                type: 'PLAYERS_UPDATE',
                data: existingRoom.players
            }));
        }
        return;
    }
    
    const room = {
        id: roomId,
        name: data.name || `Room ${roomId}`,
        maxPlayers: data.maxPlayers || 4,
        isPrivate: data.isPrivate || false,
        password: data.password || '',
        players: [ws.userId],
        roomCreator: ws.userId, // Store room creator
        gameState: null,
        status: 'waiting'
    };

    rooms.set(roomId, room);
    console.log(`Room ${roomId} created by ${ws.userId}. Players: ${room.players.length}`);
    broadcastRooms();
    
    // Immediately send PLAYERS_UPDATE to the creator
    console.log(`Sending PLAYERS_UPDATE to creator: ${room.players}`);
    ws.send(JSON.stringify({
        type: 'PLAYERS_UPDATE',
        data: room.players
    }));
    
    // Send confirmation to creator
    ws.send(JSON.stringify({
        type: 'ROOM_CREATED',
        data: { roomId }
    }));
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

    let room = rooms.get(data.roomId);
    
    // If room doesn't exist, create it automatically
    if (!room) {
        console.log(`Room ${data.roomId} not found, creating it automatically`);
        room = {
            id: data.roomId,
            name: `Room ${data.roomId}`,
            maxPlayers: 4, // Default max players
            isPrivate: false,
            password: '',
            players: [ws.userId], // Add the joining player immediately
            roomCreator: ws.userId, // Store room creator
            gameState: null,
            status: 'waiting'
        };
        rooms.set(data.roomId, room);
        console.log(`Auto-created room ${data.roomId} with player ${ws.userId}`);
        broadcastRooms();
        // Send PLAYERS_UPDATE to the joining player
        ws.send(JSON.stringify({
            type: 'PLAYERS_UPDATE',
            data: room.players
        }));
        return;
    }

    // Check if player is already in the room
    if (room.players.includes(ws.userId)) {
        // Player already in room, just send current state
        console.log(`Player ${ws.userId} already in room ${data.roomId}`);
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
    if (!room.players.includes(ws.userId)) {
        room.players.push(ws.userId);
        rooms.set(data.roomId, room);
        
        console.log(`Player ${ws.userId} joined room ${data.roomId}. Total players: ${room.players.length}`);
        
        // Broadcast rooms list update to all clients
        broadcastRooms();
        
        // Broadcast player update to ALL players in the room (including the new one)
        broadcastToRoom(room.id, {
            type: 'PLAYERS_UPDATE',
            data: room.players
        });
    } else {
        console.log(`Player ${ws.userId} already in room ${data.roomId}`);
        // Still send current state
        ws.send(JSON.stringify({
            type: 'PLAYERS_UPDATE',
            data: room.players
        }));
    }
}

function handleLeaveRoom(ws, data) {
    const room = rooms.get(data.roomId);
    if (!room) {
        console.log(`Room ${data.roomId} not found for leave`);
        return;
    }

    room.players = room.players.filter(id => id !== ws.userId);
    console.log(`Player ${ws.userId} left room ${data.roomId}. Remaining players: ${room.players.length}`);
    
    if (room.players.length === 0) {
        // Delete room if empty
        rooms.delete(data.roomId);
        console.log(`Room ${data.roomId} deleted (empty)`);
        broadcastRooms();
    } else {
        rooms.set(data.roomId, room);
        broadcastRooms();
        broadcastToRoom(room.id, {
            type: 'PLAYERS_UPDATE',
            data: room.players
        });
    }
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

    console.log(`Broadcasting ${roomsList.length} rooms to ${connections.size} connections`);
    
    connections.forEach((ws, userId) => {
        // Check if connection is still open
        if (ws.readyState === 1) { // WebSocket.OPEN = 1
            try {
                ws.send(JSON.stringify({
                    type: 'ROOMS_UPDATE',
                    data: roomsList
                }));
            } catch (error) {
                console.error(`Error sending ROOMS_UPDATE to ${userId}:`, error);
            }
        } else {
            console.log(`Skipping closed connection for ${userId}`);
        }
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

function handleGameStarting(ws, data) {
    // Check if user is authenticated
    if (!ws.userId) {
        console.log('GAME_STARTING: User not authenticated');
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Not authenticated. Please connect your wallet first.' }
        }));
        return;
    }

    const { roomId, games, countdown } = data;
    console.log(`GAME_STARTING: Room ${roomId}, Games:`, games, 'Countdown:', countdown);
    
    const room = rooms.get(roomId);
    if (!room) {
        console.log(`GAME_STARTING: Room ${roomId} not found`);
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Room not found' }
        }));
        return;
    }

    // Check if the sender is the room creator
    const isCreator = room.roomCreator === ws.userId || (room.players.length > 0 && room.players[0] === ws.userId);
    if (!isCreator) {
        console.log(`GAME_STARTING: User ${ws.userId} is not the room creator. Creator is: ${room.roomCreator || room.players[0]}`);
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Only the room creator can start the game' }
        }));
        return;
    }

    // Update room status
    room.status = 'starting';
    room.selectedGames = games || [];
    room.countdown = countdown || 10;
    rooms.set(roomId, room);

    // Broadcast GAME_STARTING to ALL players in the room
    console.log(`Broadcasting GAME_STARTING to ${room.players.length} players in room ${roomId}:`, room.players);
    const gameStartingMessage = {
        type: 'GAME_STARTING',
        data: {
            roomId,
            games: room.selectedGames,
            countdown: room.countdown
        }
    };
    
    // Send to all players in the room
    room.players.forEach(playerId => {
        const playerWs = connections.get(playerId);
        if (playerWs && playerWs.readyState === 1) { // WebSocket.OPEN = 1
            console.log(`Sending GAME_STARTING to player ${playerId}`);
            playerWs.send(JSON.stringify(gameStartingMessage));
        } else {
            console.log(`Player ${playerId} WebSocket not available or not open`);
        }
    });
}

function handleRPSChoice(ws, data) {
    // Check if user is authenticated
    if (!ws.userId) {
        console.log('RPS_CHOICE: User not authenticated');
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Not authenticated. Please connect your wallet first.' }
        }));
        return;
    }

    const { roomId, playerPosition, choice } = data;
    console.log(`RPS_CHOICE: Room ${roomId}, Player ${playerPosition} (${ws.userId}) chose ${choice}`);
    
    const room = rooms.get(roomId);
    if (!room) {
        console.log(`RPS_CHOICE: Room ${roomId} not found`);
        ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Room not found' }
        }));
        return;
    }

    // Initialize RPS choices if needed
    if (!room.rpsChoices) {
        room.rpsChoices = {};
    }

    // Store the choice
    room.rpsChoices[ws.userId] = {
        playerPosition,
        choice,
        timestamp: Date.now()
    };

    // Broadcast RPS_CHOICE to ALL players in the room (except sender)
    console.log(`Broadcasting RPS_CHOICE to ${room.players.length} players in room ${roomId}`);
    const rpsChoiceMessage = {
        type: 'RPS_CHOICE',
        data: {
            roomId,
            playerPosition,
            playerId: ws.userId,
            choice
        }
    };
    
    // Send to all players in the room
    room.players.forEach(playerId => {
        const playerWs = connections.get(playerId);
        if (playerWs && playerWs.readyState === 1) { // WebSocket.OPEN = 1
            console.log(`Sending RPS_CHOICE to player ${playerId}`);
            playerWs.send(JSON.stringify(rpsChoiceMessage));
        } else {
            console.log(`Player ${playerId} WebSocket not available or not open`);
        }
    });
}

// Use WS_PORT for WebSocket server, PORT for Railway's main port
const WS_PORT = process.env.WS_PORT || process.env.PORT || 8080;

// Add error handling
server.on('error', (error) => {
    console.error('HTTP Server Error:', error);
});

wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});

server.listen(WS_PORT, '0.0.0.0', () => {
    console.log(`WebSocket server is running on port ${WS_PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Listening on 0.0.0.0:${WS_PORT}`);
    console.log(`Ready to accept WebSocket connections`);
}); 