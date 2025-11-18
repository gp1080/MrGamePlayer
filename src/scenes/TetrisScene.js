import Phaser from 'phaser';

class TetrisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TetrisScene' });
        this.boards = [];
        this.currentPieces = [];
        this.scores = [];
        this.lines = [];
        this.levels = [];
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 300000; // 5 minutes
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.gameOver = false;
        this.cursors = null;
        this.wasd = null;
        this.space = null;
        this.rKey = null;
        this.qKey = null;
        this.boardWidth = 10;
        this.boardHeight = 15; // Reduced height to fit better
        this.cellSize = 25; // Smaller cells to fit two boards
        // Player 1 board position (left side) - centered in left half
        // Screen width: 800px, left half: 0-400px, center at 200px
        // Board width: 10 cells * 25px = 250px, so start at 200 - 125 = 75px
        // But we want some margin, so use 100px
        this.player1BoardX = 100; // Left side board X position
        this.player1BoardY = 80; // Top Y position - leave room for UI
        // Player 2 board position (right side) - centered in right half
        // Right half: 400-800px, center at 600px
        // Board starts at 600 - 125 = 475px, but use 500px for symmetry
        this.player2BoardX = 500; // Right side board X position
        this.player2BoardY = 80; // Top Y position - aligned with player 1
        this.boardY = 100; // Legacy - kept for compatibility but use player-specific Y positions
        this.dropTimers = [];
        this.dropIntervals = [];
        this.pieceGraphics = [[], []];
        this.boardGraphics = [[], []];
        this.lastMoveTimes = [0, 0];
        this.moveCooldown = 100;
        this.lastRotateTimes = [0, 0];
        this.rotateCooldown = 200;
        this.countdownTime = 3;
        this.countdownText = null;
        this.gameOverText = null;
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create background
        this.createBackground();

        // Initialize both player boards
        this.initBoards();

        // Create visual boards
        this.createBoardVisuals();

        // Create UI
        this.createUI();

        // Set up controls
        this.setupControls();

        // Start countdown
        this.startCountdown();
    }

    startCountdown() {
        this.countdownText = this.add.text(400, 300, '3', {
            fontSize: '72px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.countdownText.setOrigin(0.5);
        this.countdownText.setDepth(100);

        let count = 3;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0 && this.countdownText && this.countdownText.active) {
                this.countdownText.setText(count.toString());
            } else if (this.countdownText && this.countdownText.active) {
                this.countdownText.setText('GO!');
                setTimeout(() => {
                    if (this.countdownText && this.countdownText.active) {
                        this.countdownText.destroy();
                    }
                    this.gameStarted = true;
                    this.spawnPiece(0);
                    this.spawnPiece(1);
                    console.log('Tetris game started!');
                }, 500);
                clearInterval(countdownInterval);
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    createBackground() {
        // Create a dark background
        this.add.rectangle(400, 300, 800, 600, 0x1a1a1a);
        
        // Add dividing line between players
        const divider = this.add.graphics();
        divider.lineStyle(3, 0xFFFFFF, 0.5);
        divider.moveTo(400, 0);
        divider.lineTo(400, 600);
        divider.strokePath();
    }

    initBoards() {
        // Initialize both player boards
        for (let player = 0; player < 2; player++) {
            this.boards[player] = [];
            for (let row = 0; row < this.boardHeight; row++) {
                this.boards[player][row] = [];
                for (let col = 0; col < this.boardWidth; col++) {
                    this.boards[player][row][col] = 0;
                }
            }
            this.currentPieces[player] = null;
            this.scores[player] = 0;
            this.lines[player] = 0;
            this.levels[player] = 1;
            this.dropTimers[player] = 0;
            this.dropIntervals[player] = 1000;
        }
    }

    createBoardVisuals() {
        // Create boards for both players
        for (let player = 0; player < 2; player++) {
            const boardX = player === 0 ? this.player1BoardX : this.player2BoardX;
            const boardY = player === 0 ? this.player1BoardY : this.player2BoardY;
            
            // Draw board border
            // Pieces are rendered at: boardX + col * cellSize + cellSize/2 (centered in cells)
            // Pieces now fill cells completely (cellSize x cellSize)
            // First piece (col=0) center: boardX + cellSize/2, extends from boardX to boardX + cellSize
            // Last piece (col=boardWidth-1) center: boardX + (boardWidth-1)*cellSize + cellSize/2
            //   extends from boardX + (boardWidth-1)*cellSize to boardX + boardWidth*cellSize
            // Border should align with piece edges: start at boardX, end at boardX + boardWidth*cellSize
            const borderGraphics = this.add.graphics();
            borderGraphics.lineStyle(2, 0xFFFFFF, 1);
            // Border starts at boardX (left edge of first piece) and ends at boardX + boardWidth*cellSize
            const borderX = boardX;
            const borderY = boardY;
            // Border dimensions match the cell grid exactly
            borderGraphics.strokeRect(
                borderX,
                borderY,
                this.boardWidth * this.cellSize,
                this.boardHeight * this.cellSize
            );

            // Initialize board graphics array for placed pieces
            this.boardGraphics[player] = [];
            for (let row = 0; row < this.boardHeight; row++) {
                this.boardGraphics[player][row] = [];
                for (let col = 0; col < this.boardWidth; col++) {
                    this.boardGraphics[player][row][col] = null;
                }
            }
        }
    }

    createUI() {
        // Player 1 UI (left side)
        this.add.text(150, 30, 'Player 1', {
            fontSize: '20px',
            fill: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(150, 470, 'Score:', {
            fontSize: '18px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.scoreText1 = this.add.text(150, 495, '0', {
            fontSize: '24px',
            fill: '#00FF00',
            fontStyle: 'bold'
        });
        this.scoreText1.setOrigin(0.5);

        this.add.text(150, 520, 'Lines:', {
            fontSize: '16px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.linesText1 = this.add.text(150, 540, '0', {
            fontSize: '20px',
            fill: '#00FF00'
        });
        this.linesText1.setOrigin(0.5);

        // Player 2 UI (right side)
        this.add.text(650, 30, 'Player 2', {
            fontSize: '20px',
            fill: '#00FFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(650, 470, 'Score:', {
            fontSize: '18px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.scoreText2 = this.add.text(650, 495, '0', {
            fontSize: '24px',
            fill: '#00FFFF',
            fontStyle: 'bold'
        });
        this.scoreText2.setOrigin(0.5);

        this.add.text(650, 520, 'Lines:', {
            fontSize: '16px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.linesText2 = this.add.text(650, 540, '0', {
            fontSize: '20px',
            fill: '#00FFFF'
        });
        this.linesText2.setOrigin(0.5);

        // Timer (center top)
        this.timerText = this.add.text(400, 50, 'Time: 5:00', {
            fontSize: '20px',
            fill: '#FFD700',
            fontStyle: 'bold'
        });
        this.timerText.setOrigin(0.5);

        // Instructions (bottom center)
        this.add.text(400, 570, 'P1: Arrow Keys (Move/Down) + Space (Hard Drop) + R (Rotate) | P2: WASD (Move/Down) + E (Hard Drop) + Q (Rotate)', {
            fontSize: '12px',
            fill: '#CCCCCC'
        }).setOrigin(0.5);
    }

    setupControls() {
        // Keyboard controls for both players
        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        // Player 2 controls (WASD)
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Track key states for justDown behavior
        this.spaceWasDown = false;
        this.rKeyWasDown = false;
        this.eKeyWasDown = false;
        this.qKeyWasDown = false;
        
        // Prevent default browser behavior for Space
        this.input.keyboard.on('keydown-SPACE', (event) => {
            event.preventDefault();
        });
        
        // Mobile touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Create touch buttons for mobile - only show controls for current player
        const isMobile = this.sys.game.device.input.touch;
        if (!isMobile) return;
        
        // Determine which player this device controls
        const isPlayer1 = this.playerPosition === 0;
        const boardX = isPlayer1 ? this.player1BoardX : this.player2BoardX;
        const buttonY = 500; // Position buttons below boards
        
        // Touch state tracking
        this.touchLeft = false;
        this.touchRight = false;
        this.touchDown = false;
        this.touchRotate = false;
        this.touchDrop = false;
        this.touchRotateJustPressed = false;
        this.touchDropJustPressed = false;
        
        if (isPlayer1) {
            // Player 1 controls (left side)
            this.p1LeftBtn = this.add.rectangle(boardX - 60, buttonY, 50, 50, 0x4A90E2, 0.2);
            this.p1LeftBtn.setInteractive({ useHandCursor: true });
            this.p1LeftBtn.setDepth(20);
            this.p1LeftBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX - 60, buttonY, '←', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            this.p1RightBtn = this.add.rectangle(boardX + 60, buttonY, 50, 50, 0x4A90E2, 0.2);
            this.p1RightBtn.setInteractive({ useHandCursor: true });
            this.p1RightBtn.setDepth(20);
            this.p1RightBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX + 60, buttonY, '→', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            this.p1RotateBtn = this.add.rectangle(boardX, buttonY - 60, 50, 50, 0x4A90E2, 0.2);
            this.p1RotateBtn.setInteractive({ useHandCursor: true });
            this.p1RotateBtn.setDepth(20);
            this.p1RotateBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX, buttonY - 60, '↻', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            this.p1DropBtn = this.add.rectangle(boardX, buttonY, 50, 50, 0xFF6B6B, 0.2);
            this.p1DropBtn.setInteractive({ useHandCursor: true });
            this.p1DropBtn.setDepth(20);
            this.p1DropBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX, buttonY, '↓', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            // Touch events for Player 1
            this.p1LeftBtn.on('pointerdown', () => { this.touchLeft = true; });
            this.p1LeftBtn.on('pointerup', () => { this.touchLeft = false; });
            this.p1LeftBtn.on('pointerout', () => { this.touchLeft = false; });
            
            this.p1RightBtn.on('pointerdown', () => { this.touchRight = true; });
            this.p1RightBtn.on('pointerup', () => { this.touchRight = false; });
            this.p1RightBtn.on('pointerout', () => { this.touchRight = false; });
            
            this.p1RotateBtn.on('pointerdown', () => { 
                this.touchRotate = true; 
                this.touchRotateJustPressed = true;
            });
            this.p1RotateBtn.on('pointerup', () => { this.touchRotate = false; });
            this.p1RotateBtn.on('pointerout', () => { this.touchRotate = false; });
            
            this.p1DropBtn.on('pointerdown', () => { 
                this.touchDrop = true; 
                this.touchDropJustPressed = true;
            });
            this.p1DropBtn.on('pointerup', () => { this.touchDrop = false; });
            this.p1DropBtn.on('pointerout', () => { this.touchDrop = false; });
        } else {
            // Player 2 controls (right side)
            this.p2LeftBtn = this.add.rectangle(boardX - 60, buttonY, 50, 50, 0xFF6B6B, 0.2);
            this.p2LeftBtn.setInteractive({ useHandCursor: true });
            this.p2LeftBtn.setDepth(20);
            this.p2LeftBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX - 60, buttonY, '←', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            this.p2RightBtn = this.add.rectangle(boardX + 60, buttonY, 50, 50, 0xFF6B6B, 0.2);
            this.p2RightBtn.setInteractive({ useHandCursor: true });
            this.p2RightBtn.setDepth(20);
            this.p2RightBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX + 60, buttonY, '→', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            this.p2RotateBtn = this.add.rectangle(boardX, buttonY - 60, 50, 50, 0xFF6B6B, 0.2);
            this.p2RotateBtn.setInteractive({ useHandCursor: true });
            this.p2RotateBtn.setDepth(20);
            this.p2RotateBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX, buttonY - 60, '↻', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            this.p2DropBtn = this.add.rectangle(boardX, buttonY, 50, 50, 0xFF6B6B, 0.2);
            this.p2DropBtn.setInteractive({ useHandCursor: true });
            this.p2DropBtn.setDepth(20);
            this.p2DropBtn.setStrokeStyle(1, 0x000000, 0.5);
            this.add.text(boardX, buttonY, '↓', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
            
            // Touch events for Player 2
            this.p2LeftBtn.on('pointerdown', () => { this.touchLeft = true; });
            this.p2LeftBtn.on('pointerup', () => { this.touchLeft = false; });
            this.p2LeftBtn.on('pointerout', () => { this.touchLeft = false; });
            
            this.p2RightBtn.on('pointerdown', () => { this.touchRight = true; });
            this.p2RightBtn.on('pointerup', () => { this.touchRight = false; });
            this.p2RightBtn.on('pointerout', () => { this.touchRight = false; });
            
            this.p2RotateBtn.on('pointerdown', () => { 
                this.touchRotate = true; 
                this.touchRotateJustPressed = true;
            });
            this.p2RotateBtn.on('pointerup', () => { this.touchRotate = false; });
            this.p2RotateBtn.on('pointerout', () => { this.touchRotate = false; });
            
            this.p2DropBtn.on('pointerdown', () => { 
                this.touchDrop = true; 
                this.touchDropJustPressed = true;
            });
            this.p2DropBtn.on('pointerup', () => { this.touchDrop = false; });
            this.p2DropBtn.on('pointerout', () => { this.touchDrop = false; });
        }
    }

    update() {
        if (!this.gameStarted || this.gameOver) {
            return;
        }

        // Handle input for both players
        this.handleInput(0); // Player 1 (Arrow keys)
        this.handleInput(1); // Player 2 (WASD)

        // Auto drop pieces for both players
        for (let player = 0; player < 2; player++) {
            this.dropTimers[player] += this.sys.game.loop.delta;
            if (this.dropTimers[player] >= this.dropIntervals[player]) {
                this.dropPiece(player);
                this.dropTimers[player] = 0;
            }
        }

        // Update timer
        this.updateTimer();

        // Render current pieces for both players
        this.renderCurrentPiece(0);
        this.renderCurrentPiece(1);

        // Check for game end
        if (this.gameTime >= this.maxGameTime) {
            this.endGame('time');
        }

        // Game over check is handled in spawnPiece() when a new piece can't be placed
    }

    handleInput(player) {
        if (!this.currentPieces[player]) return;

        const currentTime = this.time.now;
        const _cursors = player === 0 ? this.cursors : this.wasd;
        const _dropKey = player === 0 ? this.space : this.eKey;
        const _rotateKey = player === 0 ? this.rKey : this.qKey;

        // Left/Right movement with cooldown - keyboard or touch
        const isCurrentPlayer = (player === 0 && this.playerPosition === 0) || (player === 1 && this.playerPosition === 1);
        
        if (player === 0) {
            // Player 1: Arrow keys or touch
            if ((this.cursors.left.isDown || (isCurrentPlayer && this.touchLeft)) && currentTime - this.lastMoveTimes[player] > this.moveCooldown) {
                this.movePiece(player, -1, 0);
                this.lastMoveTimes[player] = currentTime;
            }
            if ((this.cursors.right.isDown || (isCurrentPlayer && this.touchRight)) && currentTime - this.lastMoveTimes[player] > this.moveCooldown) {
                this.movePiece(player, 1, 0);
                this.lastMoveTimes[player] = currentTime;
            }
            if ((this.cursors.down.isDown || (isCurrentPlayer && this.touchDown)) && currentTime - this.lastMoveTimes[player] > 50) {
                this.movePiece(player, 0, 1);
                this.lastMoveTimes[player] = currentTime;
            }
        } else {
            // Player 2: WASD or touch
            if ((this.wasd.A.isDown || (isCurrentPlayer && this.touchLeft)) && currentTime - this.lastMoveTimes[player] > this.moveCooldown) {
                this.movePiece(player, -1, 0);
                this.lastMoveTimes[player] = currentTime;
            }
            if ((this.wasd.D.isDown || (isCurrentPlayer && this.touchRight)) && currentTime - this.lastMoveTimes[player] > this.moveCooldown) {
                this.movePiece(player, 1, 0);
                this.lastMoveTimes[player] = currentTime;
            }
            if ((this.wasd.S.isDown || (isCurrentPlayer && this.touchDown)) && currentTime - this.lastMoveTimes[player] > 50) {
                this.movePiece(player, 0, 1);
                this.lastMoveTimes[player] = currentTime;
            }
        }

        // Drop piece (hard drop) - using manual justDown tracking - keyboard or touch
        
        if (player === 0) {
            // Player 1: Space key or touch
            if ((this.space.isDown && !this.spaceWasDown) || (isCurrentPlayer && this.touchDropJustPressed)) {
                this.spaceWasDown = true;
                this.touchDropJustPressed = false;
                while (!this.checkCollision(player, this.currentPieces[player], 0, 1)) {
                    this.currentPieces[player].y++;
                }
                this.placePiece(player);
                this.clearLines(player);
                this.spawnPiece(player);
            } else if (!this.space.isDown && this.spaceWasDown) {
                this.spaceWasDown = false;
            }
        } else {
            // Player 2: E key or touch
            if ((this.eKey.isDown && !this.eKeyWasDown) || (isCurrentPlayer && this.touchDropJustPressed)) {
                this.eKeyWasDown = true;
                this.touchDropJustPressed = false;
                while (!this.checkCollision(player, this.currentPieces[player], 0, 1)) {
                    this.currentPieces[player].y++;
                }
                this.placePiece(player);
                this.clearLines(player);
                this.spawnPiece(player);
            } else if (!this.eKey.isDown && this.eKeyWasDown) {
                this.eKeyWasDown = false;
            }
        }

        // Rotate piece with cooldown - using manual justDown tracking - keyboard or touch
        if (player === 0) {
            // Player 1: R key or touch
            if ((this.rKey.isDown && !this.rKeyWasDown && currentTime - this.lastRotateTimes[player] > this.rotateCooldown) || 
                (isCurrentPlayer && this.touchRotateJustPressed && currentTime - this.lastRotateTimes[player] > this.rotateCooldown)) {
                this.rKeyWasDown = true;
                this.touchRotateJustPressed = false;
                this.rotatePiece(player);
                this.lastRotateTimes[player] = currentTime;
            } else if (!this.rKey.isDown && this.rKeyWasDown) {
                this.rKeyWasDown = false;
            }
        } else {
            // Player 2: Q key or touch
            if ((this.qKey.isDown && !this.qKeyWasDown && currentTime - this.lastRotateTimes[player] > this.rotateCooldown) || 
                (isCurrentPlayer && this.touchRotateJustPressed && currentTime - this.lastRotateTimes[player] > this.rotateCooldown)) {
                this.qKeyWasDown = true;
                this.touchRotateJustPressed = false;
                this.rotatePiece(player);
                this.lastRotateTimes[player] = currentTime;
            } else if (!this.qKey.isDown && this.qKeyWasDown) {
                this.qKeyWasDown = false;
            }
        }
    }

    spawnPiece(player) {
        const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const pieceType = pieces[Math.floor(Math.random() * pieces.length)];
        
        const spawnX = Math.floor(this.boardWidth / 2) - 1;
        const spawnY = 0;
        
        this.currentPieces[player] = {
            type: pieceType,
            x: spawnX,
            y: spawnY,
            rotation: 0,
            shape: this.getPieceShape(pieceType)
        };

        // Check if the new piece can be placed (game over if spawn position is blocked)
        // Only check if the piece would collide immediately at spawn position with placed blocks
        let canPlace = true;
        for (let row = 0; row < this.currentPieces[player].shape.length; row++) {
            for (let col = 0; col < this.currentPieces[player].shape[row].length; col++) {
                if (this.currentPieces[player].shape[row][col]) {
                    const boardX = spawnX + col;
                    const boardY = spawnY + row;
                    
                    // If any part of the piece would be placed in an occupied cell at spawn, game over
                    if (boardY >= 0 && boardY < this.boardHeight && 
                        boardX >= 0 && boardX < this.boardWidth && 
                        this.boards[player][boardY][boardX]) {
                        canPlace = false;
                        break;
                    }
                }
            }
            if (!canPlace) break;
        }
        
        if (!canPlace) {
            this.endGame('gameover', player);
            return;
        }
    }

    getPieceShape(type) {
        const shapes = {
            'I': [[1, 1, 1, 1]],
            'O': [[1, 1], [1, 1]],
            'T': [[0, 1, 0], [1, 1, 1]],
            'S': [[0, 1, 1], [1, 1, 0]],
            'Z': [[1, 1, 0], [0, 1, 1]],
            'J': [[1, 0, 0], [1, 1, 1]],
            'L': [[0, 0, 1], [1, 1, 1]]
        };
        return shapes[type];
    }

    movePiece(player, dx, dy) {
        if (!this.currentPieces[player]) return;

        if (!this.checkCollision(player, this.currentPieces[player], dx, dy)) {
            this.currentPieces[player].x += dx;
            this.currentPieces[player].y += dy;
        }
    }

    rotatePiece(player) {
        if (!this.currentPieces[player]) return;

        const rotated = this.rotateMatrix(this.currentPieces[player].shape);
        if (!this.checkCollision(player, { ...this.currentPieces[player], shape: rotated }, 0, 0)) {
            this.currentPieces[player].shape = rotated;
            this.currentPieces[player].rotation = (this.currentPieces[player].rotation + 1) % 4;
        }
    }

    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        
        return rotated;
    }

    dropPiece(player) {
        if (!this.currentPieces[player]) return;

        // Check if piece can move down
        if (!this.checkCollision(player, this.currentPieces[player], 0, 1)) {
            this.currentPieces[player].y++;
        } else {
            // Piece has landed, place it
            this.placePiece(player);
            this.clearLines(player);
            
            // Only spawn new piece if game isn't over
            if (!this.gameOver) {
                this.spawnPiece(player);
            }
        }
    }

    checkCollision(player, piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const boardX = newX + col;
                    const boardY = newY + row;

                    // Check horizontal boundaries
                    if (boardX < 0 || boardX >= this.boardWidth) {
                        return true;
                    }

                    // Check bottom boundary (pieces can be above board)
                    // Allow pieces to reach the bottom row (boardHeight - 1)
                    if (boardY > this.boardHeight - 1) {
                        return true;
                    }

                    // Check collision with placed pieces (only if within board bounds)
                    const cell = this.boards[player][boardY][boardX];
                    if (boardY >= 0 && boardY < this.boardHeight) {
                        // Handle both old format (number) and new format (object)
                        if (typeof cell === 'object' && cell !== null) {
                            if (cell.filled === 1) return true;
                        } else if (cell === 1) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    placePiece(player) {
        if (!this.currentPieces[player]) return;

        const colors = {
            'I': 0x00FFFF, 'O': 0xFFFF00, 'T': 0x800080,
            'S': 0x00FF00, 'Z': 0xFF0000, 'J': 0x0000FF, 'L': 0xFFA500
        };

        const color = colors[this.currentPieces[player].type] || 0xFFFFFF;
        const boardX = player === 0 ? this.player1BoardX : this.player2BoardX;
        const boardY = player === 0 ? this.player1BoardY : this.player2BoardY;

        for (let row = 0; row < this.currentPieces[player].shape.length; row++) {
            for (let col = 0; col < this.currentPieces[player].shape[row].length; col++) {
                if (this.currentPieces[player].shape[row][col]) {
                    const boardCol = this.currentPieces[player].x + col;
                    const boardRow = this.currentPieces[player].y + row;
                    
                    if (boardRow >= 0 && boardRow < this.boardHeight && boardCol >= 0 && boardCol < this.boardWidth) {
                        // Store piece type in board for color preservation (1 = filled, use type for color)
                        // For now, just mark as filled
                        this.boards[player][boardRow][boardCol] = {
                            filled: 1,
                            color: color
                        };
                        
                        // Create visual representation
                        const x = boardX + boardCol * this.cellSize + this.cellSize / 2;
                        const y = boardY + boardRow * this.cellSize + this.cellSize / 2;
                        
                        // Destroy old graphic if exists
                        if (this.boardGraphics[player][boardRow][boardCol]) {
                            this.boardGraphics[player][boardRow][boardCol].destroy();
                        }
                        
                        // Make pieces fill cells completely to reach borders
                        const cell = this.add.rectangle(x, y, this.cellSize, this.cellSize, color);
                        cell.setStrokeStyle(1, 0xFFFFFF);
                        this.boardGraphics[player][boardRow][boardCol] = cell;
                    }
                }
            }
        }

        this.currentPieces[player] = null;
    }

    clearLines(player) {
        let linesCleared = 0;
        const rowsToClear = [];

        // Find all full lines (from bottom to top)
        for (let row = this.boardHeight - 1; row >= 0; row--) {
            // Check if line is full (handle both old number format and new object format)
            const isFull = this.boards[player][row].every(cell => {
                if (typeof cell === 'object' && cell !== null) {
                    return cell.filled === 1;
                }
                return cell === 1;
            });
            if (isFull) {
                rowsToClear.push(row);
            }
        }

        // If no lines to clear, return early
        if (rowsToClear.length === 0) {
            return;
        }

        linesCleared = rowsToClear.length;

        // Destroy all graphics before clearing
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                if (this.boardGraphics[player][row][col]) {
                    this.boardGraphics[player][row][col].destroy();
                    this.boardGraphics[player][row][col] = null;
                }
            }
        }

        // Remove cleared lines from board (must work from bottom to top to avoid index shifting issues)
        rowsToClear.sort((a, b) => b - a); // Sort descending (highest index first)
        for (const row of rowsToClear) {
            this.boards[player].splice(row, 1);
            this.boards[player].unshift(new Array(this.boardWidth).fill(0));
            
            // Also update graphics array
            this.boardGraphics[player].splice(row, 1);
            this.boardGraphics[player].unshift(new Array(this.boardWidth).fill(null));
        }

        // Now redraw the entire board with proper colors
        this.redrawBoard(player);

        // Update game stats
        this.lines[player] += linesCleared;
        this.scores[player] += this.calculateScore(linesCleared, player);
        this.updateLevel(player);
        this.updateUI();
    }

    redrawBoard(player) {
        const boardX = player === 0 ? this.player1BoardX : this.player2BoardX;
        const boardY = player === 0 ? this.player1BoardY : this.player2BoardY;
        
        // Redraw all placed pieces to match board state
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                const cell = this.boards[player][row][col];
                const isFilled = (typeof cell === 'object' && cell !== null && cell.filled === 1) || cell === 1;
                
                if (isFilled) {
                    const x = boardX + col * this.cellSize + this.cellSize / 2;
                    const y = boardY + row * this.cellSize + this.cellSize / 2;
                    
                    // Destroy old graphic if exists
                    if (this.boardGraphics[player][row][col]) {
                        this.boardGraphics[player][row][col].destroy();
                    }
                    
                    // Get color from stored data or use default
                    let color = 0x888888;
                    if (typeof cell === 'object' && cell !== null && cell.color) {
                        color = cell.color;
                    }
                    
                    // Make pieces fill cells completely to reach borders
                    const newCell = this.add.rectangle(x, y, this.cellSize, this.cellSize, color);
                    newCell.setStrokeStyle(1, 0xFFFFFF);
                    this.boardGraphics[player][row][col] = newCell;
                } else {
                    // Clear graphic if cell is empty
                    if (this.boardGraphics[player][row][col]) {
                        this.boardGraphics[player][row][col].destroy();
                        this.boardGraphics[player][row][col] = null;
                    }
                }
            }
        }
    }

    calculateScore(lines, player) {
        const baseScore = [0, 40, 100, 300, 1200];
        return baseScore[lines] * this.levels[player];
    }

    updateLevel(player) {
        this.levels[player] = Math.floor(this.lines[player] / 10) + 1;
        this.dropIntervals[player] = Math.max(50, 1000 - (this.levels[player] - 1) * 100);
    }

    updateUI() {
        // Only update if text objects exist
        if (this.scoreText1 && this.scoreText1.active) {
            this.scoreText1.setText(this.scores[0].toString());
        }
        if (this.linesText1 && this.linesText1.active) {
            this.linesText1.setText(this.lines[0].toString());
        }
        
        if (this.scoreText2 && this.scoreText2.active) {
            this.scoreText2.setText(this.scores[1].toString());
        }
        if (this.linesText2 && this.linesText2.active) {
            this.linesText2.setText(this.lines[1].toString());
        }
    }

    renderCurrentPiece(player) {
        // Clear previous piece graphics
        this.pieceGraphics[player].forEach(g => {
            if (g && g.active) {
                g.destroy();
            }
        });
        this.pieceGraphics[player] = [];

        if (!this.currentPieces[player]) return;

        const colors = {
            'I': 0x00FFFF, 'O': 0xFFFF00, 'T': 0x800080,
            'S': 0x00FF00, 'Z': 0xFF0000, 'J': 0x0000FF, 'L': 0xFFA500
        };

        const color = colors[this.currentPieces[player].type] || 0xFFFFFF;
        const boardX = player === 0 ? this.player1BoardX : this.player2BoardX;
        const boardY = player === 0 ? this.player1BoardY : this.player2BoardY;

        // Draw each cell of the current piece (only if within visible bounds)
        for (let row = 0; row < this.currentPieces[player].shape.length; row++) {
            for (let col = 0; col < this.currentPieces[player].shape[row].length; col++) {
                if (this.currentPieces[player].shape[row][col]) {
                    const boardCol = this.currentPieces[player].x + col;
                    const boardRow = this.currentPieces[player].y + row;
                    
                    // Only render if the cell would be visible (allow pieces above board)
                    if (boardRow >= -2 && boardRow < this.boardHeight && 
                        boardCol >= 0 && boardCol < this.boardWidth) {
                        const x = boardX + boardCol * this.cellSize + this.cellSize / 2;
                        const y = boardY + boardRow * this.cellSize + this.cellSize / 2;
                        
                        // Make pieces fill cells completely to reach borders
                        const cell = this.add.rectangle(
                            x,
                            y,
                            this.cellSize,
                            this.cellSize,
                            color
                        );
                        cell.setStrokeStyle(1, 0xFFFFFF);
                        cell.setAlpha(0.9); // Slightly transparent for falling piece
                        this.pieceGraphics[player].push(cell);
                    }
                }
            }
        }
    }

    updateTimer() {
        this.gameTime += this.sys.game.loop.delta;
        const remainingTime = Math.max(0, Math.floor((this.maxGameTime - this.gameTime) / 1000));
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        if (this.timerText && this.timerText.active) {
            this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
    }

    endGame(reason, loserPlayer = null) {
        this.gameOver = true;
        this.gameStarted = false;

        // Determine winner
        let winner = null;
        if (reason === 'time') {
            // Winner is player with highest score
            if (this.scores[0] > this.scores[1]) {
                winner = 0;
            } else if (this.scores[1] > this.scores[0]) {
                winner = 1;
            } else {
                // Tie - winner by lines cleared
                winner = this.lines[0] >= this.lines[1] ? 0 : 1;
            }
        } else if (reason === 'gameover') {
            // Loser is the player who game over'd, winner is the other
            winner = loserPlayer === 0 ? 1 : 0;
        }

        // Show winner
        const winnerText = winner !== null ? `Player ${winner + 1} Wins!` : 'Tie Game!';
        const winnerColor = winner === 0 ? '#00FF00' : winner === 1 ? '#00FFFF' : '#FFD700';
        
        this.gameOverText = this.add.text(400, 300, winnerText, {
            fontSize: '48px',
            fill: winnerColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setDepth(100);

        this.add.text(400, 360, `Final Scores - P1: ${this.scores[0]} | P2: ${this.scores[1]}`, {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setDepth(100);

        console.log(`Tetris game ended: ${reason}, Winner: Player ${winner + 1}`);
        
        if (this.onGameComplete) {
            setTimeout(() => {
                this.onGameComplete({
                    gameType: 'tetris',
                    reason: reason,
                    winner: winner,
                    scores: [this.scores[0], this.scores[1]],
                    lines: [this.lines[0], this.lines[1]],
                    time: Math.floor(this.gameTime / 1000)
                });
            }, 3000);
        }
    }
}

export default TetrisScene;
