import Phaser from 'phaser';

class TicTacToeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TicTacToeScene' });
        this.board = [];
        this.currentPlayer = 'X';
        this.gameStarted = false;
        this.gameOver = false;
        this.winner = null;
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.round = 1;
        this.maxRounds = 3;
        this.scores = { X: 0, O: 0 };
        this.isTiebreaker = false;
        this.roundConfigs = [
            { size: 3, connect: 3, cellSize: 120 },
            { size: 5, connect: 4, cellSize: 80 },
            { size: 10, connect: 5, cellSize: 40 }
        ];
        this.boardSize = 3;
        this.connectRequired = 3;
        this.cellSize = 120;
        this.boardX = 0;
        this.boardY = 0;
        this.cells = [];
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create background
        this.add.rectangle(400, 300, 800, 600, 0x2C3E50);
        
        // Start first round
        this.startRound();
    }

    startRound() {
        // Get round configuration
        // If tiebreaker, use round 3 config (10x10, connect 5)
        const configIndex = this.isTiebreaker ? 2 : (this.round - 1);
        const config = this.roundConfigs[configIndex];
        this.boardSize = config.size;
        this.connectRequired = config.connect;
        this.cellSize = config.cellSize;
        
        // Calculate board position (left side, below instructions)
        const boardWidth = this.boardSize * this.cellSize;
        const boardHeight = this.boardSize * this.cellSize;
        this.boardX = 150;
        // Position board below the instructions (which end at ~y=100)
        // Center board vertically in remaining space
        const instructionsBottom = 100;
        const availableHeight = 600 - instructionsBottom;
        const boardCenterY = instructionsBottom + availableHeight / 2;
        this.boardY = boardCenterY - boardHeight / 2;
        
        // Reset round state
        this.gameOver = false;
        this.winner = null;
        this.currentPlayer = 'X';
        this.cells = [];
        
        // Re-enable input for the new round
        this.input.enabled = true;
        
        // Clear previous board visuals
        this.children.removeAll();
        this.add.rectangle(400, 300, 800, 600, 0x2C3E50);
        
        // Initialize board
        this.initBoard();
        
        // Create board visual
        this.createBoard();
        
        // Create UI
        this.createUI();
        
        // Start game
        this.gameStarted = true;
        console.log(`Tic Tac Toe Round ${this.round} started! Board: ${this.boardSize}x${this.boardSize}, Connect: ${this.connectRequired}`);
    }

    initBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = null;
            }
        }
    }

    createBoard() {
        this.cells = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const x = this.boardX + col * this.cellSize + this.cellSize / 2;
                const y = this.boardY + row * this.cellSize + this.cellSize / 2;
                
                // Create cell background
                const cell = this.add.rectangle(x, y, this.cellSize - 4, this.cellSize - 4, 0x34495E);
                cell.setStrokeStyle(2, 0xECF0F1);
                cell.setInteractive();
                cell.setData('row', row);
                cell.setData('col', col);
                
                cell.on('pointerdown', () => {
                    if (!this.gameOver && this.isPlayerTurn()) {
                        this.onCellClick(row, col);
                    }
                });
                
                cell.on('pointerover', () => {
                    if (!this.gameOver && this.isPlayerTurn() && this.board[row][col] === null) {
                        cell.setFillStyle(0x3498DB, 0.5);
                    }
                });
                
                cell.on('pointerout', () => {
                    if (this.board[row][col] === null) {
                        cell.setFillStyle(0x34495E);
                    }
                });
                
                this.cells[row][col] = cell;
            }
        }
    }

    createUI() {
        // Round info and instructions (top of screen, centered)
        const instructionsX = 400; // Center of canvas
        const instructionsY = 30; // Top of screen
        
        // Round header
        const roundLabel = this.isTiebreaker ? '⚡ TIEBREAKER ROUND ⚡' : `Round ${this.round} of ${this.maxRounds}`;
        this.roundText = this.add.text(instructionsX, instructionsY, roundLabel, {
            fontSize: '28px',
            fill: this.isTiebreaker ? '#E74C3C' : '#F39C12',
            fontStyle: 'bold'
        });
        this.roundText.setOrigin(0.5);
        this.roundText.setDepth(10);
        
        // Instructions (compact format)
        const instructionLines = [
            `Board: ${this.boardSize}x${this.boardSize} | Connect ${this.connectRequired} to win`
        ];
        
        this.instructionText = this.add.text(instructionsX, instructionsY + 40, instructionLines.join('\n'), {
            fontSize: '16px',
            fill: '#ECF0F1',
            align: 'center'
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setDepth(10);
        
        // Current player and scores (compact, side by side)
        this.currentPlayerText = this.add.text(instructionsX - 120, instructionsY + 70, 'Current: X', {
            fontSize: '18px',
            fill: '#ECF0F1',
            fontStyle: 'bold'
        });
        this.currentPlayerText.setOrigin(0.5);
        this.currentPlayerText.setDepth(10);
        
        // Scores
        this.scoreText = this.add.text(instructionsX + 120, instructionsY + 70, `X: ${this.scores.X} | O: ${this.scores.O}`, {
            fontSize: '18px',
            fill: '#95A5A6'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setDepth(10);

        this.gameOverText = null;
        this.roundOverText = null;
    }

    isPlayerTurn() {
        // Player 0 is X, Player 1 is O
        if (this.playerPosition === 0) {
            return this.currentPlayer === 'X';
        } else {
            return this.currentPlayer === 'O';
        }
    }

    onCellClick(row, col) {
        if (this.gameOver || this.board[row][col] !== null) {
            return;
        }

        // Place the mark
        this.board[row][col] = this.currentPlayer;
        this.drawMark(row, col, this.currentPlayer);

        // Check for win or draw
        if (this.checkWin(row, col)) {
            this.winner = this.currentPlayer;
            this.endRound('win');
        } else if (this.isBoardFull()) {
            this.endRound('draw');
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateUI();
            
            // If it's AI turn (for single player or when other player's turn)
            if (!this.isPlayerTurn() && this.numPlayers === 2) {
                // In multiplayer, wait for other player
                // In single player, make AI move
                this.time.delayedCall(500, () => {
                    if (!this.gameOver) {
                        this.makeAIMove();
                    }
                });
            }
        }
    }

    drawMark(row, col, mark) {
        const x = this.boardX + col * this.cellSize + this.cellSize / 2;
        const y = this.boardY + row * this.cellSize + this.cellSize / 2;
        const size = Math.min(this.cellSize * 0.6, 40);
        
        if (mark === 'X') {
            // Draw X
            const line1 = this.add.line(0, 0, x - size/2, y - size/2, x + size/2, y + size/2, 0xE74C3C);
            line1.setLineWidth(Math.max(4, this.cellSize / 15));
            line1.setOrigin(0, 0);
            const line2 = this.add.line(0, 0, x + size/2, y - size/2, x - size/2, y + size/2, 0xE74C3C);
            line2.setLineWidth(Math.max(4, this.cellSize / 15));
            line2.setOrigin(0, 0);
        } else {
            // Draw O
            const circle = this.add.circle(x, y, size/2, 0x3498DB);
            circle.setStrokeStyle(Math.max(4, this.cellSize / 15), 0x2980B9);
        }
    }

    checkWin(row, col) {
        const mark = this.board[row][col];
        const connectRequired = this.connectRequired;
        
        // Check horizontal (left to right)
        if (this.checkDirection(row, col, mark, 0, 1) >= connectRequired) return true;
        
        // Check vertical (top to bottom)
        if (this.checkDirection(row, col, mark, 1, 0) >= connectRequired) return true;
        
        // Check diagonal (top-left to bottom-right)
        if (this.checkDirection(row, col, mark, 1, 1) >= connectRequired) return true;
        
        // Check diagonal (top-right to bottom-left)
        if (this.checkDirection(row, col, mark, 1, -1) >= connectRequired) return true;
        
        return false;
    }
    
    checkDirection(row, col, mark, deltaRow, deltaCol) {
        let count = 1; // Count the current cell
        
        // Check in positive direction
        let r = row + deltaRow;
        let c = col + deltaCol;
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && 
               this.board[r][c] === mark) {
            count++;
            r += deltaRow;
            c += deltaCol;
        }
        
        // Check in negative direction
        r = row - deltaRow;
        c = col - deltaCol;
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && 
               this.board[r][c] === mark) {
            count++;
            r -= deltaRow;
            c -= deltaCol;
        }
        
        return count;
    }

    isBoardFull() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    makeAIMove() {
        if (this.gameOver) return;
        
        // Simple AI: Try to win, then block, then random
        const bestMove = this.findBestMove();
        if (bestMove) {
            this.onCellClick(bestMove.row, bestMove.col);
        }
    }

    findBestMove() {
        const aiMark = this.currentPlayer;
        const opponentMark = aiMark === 'X' ? 'O' : 'X';
        const connectRequired = this.connectRequired;
        
        // 1. Try to win (check if AI can complete a line)
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = aiMark;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = null;
                        return { row, col };
                    }
                    this.board[row][col] = null;
                }
            }
        }
        
        // 2. Try to block opponent (check if opponent can win next turn)
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = opponentMark;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = null;
                        return { row, col };
                    }
                    this.board[row][col] = null;
                }
            }
        }
        
        // 3. Try to build towards a win (find best strategic position)
        // For larger boards, prioritize center and areas with existing pieces
        const centerRow = Math.floor(this.boardSize / 2);
        const centerCol = Math.floor(this.boardSize / 2);
        
        if (this.board[centerRow][centerCol] === null) {
            return { row: centerRow, col: centerCol };
        }
        
        // 4. Find position near existing pieces
        const bestMove = this.findStrategicMove(aiMark);
        if (bestMove) {
            return bestMove;
        }
        
        // 5. Take any available spot
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return { row, col };
                }
            }
        }
        
        return null;
    }
    
    findStrategicMove(mark) {
        // Find positions that would create the longest line
        let bestScore = 0;
        let bestMove = null;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    // Simulate placing mark here
                    this.board[row][col] = mark;
                    
                    // Check all directions and find max connection
                    const directions = [
                        [0, 1],   // horizontal
                        [1, 0],   // vertical
                        [1, 1],   // diagonal \
                        [1, -1]   // diagonal /
                    ];
                    
                    let maxConnection = 0;
                    directions.forEach(([dr, dc]) => {
                        const connection = this.checkDirection(row, col, mark, dr, dc);
                        maxConnection = Math.max(maxConnection, connection);
                    });
                    
                    this.board[row][col] = null;
                    
                    if (maxConnection > bestScore) {
                        bestScore = maxConnection;
                        bestMove = { row, col };
                    }
                }
            }
        }
        
        return bestMove;
    }

    updateUI() {
        if (this.currentPlayerText) {
            this.currentPlayerText.setText(`Current: ${this.currentPlayer}`);
        }
        if (this.scoreText) {
            this.scoreText.setText(`X: ${this.scores.X} | O: ${this.scores.O}`);
        }
    }

    endRound(reason) {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.input.enabled = false;
        
        let message = '';
        if (reason === 'win') {
            const winnerName = this.winner === 'X' ? 'X' : 'O';
            const isPlayerWinner = (this.playerPosition === 0 && this.winner === 'X') || 
                                  (this.playerPosition === 1 && this.winner === 'O');
            message = isPlayerWinner ? `You Win Round ${this.round}! (${winnerName})` : `${winnerName} Wins Round ${this.round}!`;
            this.scores[this.winner]++;
        } else if (reason === 'draw') {
            message = `Round ${this.round} is a Draw!`;
        }
        
        // Display round result (centered on screen)
        const bg = this.add.rectangle(400, 300, 500, 120, 0x000000, 0.8);
        bg.setDepth(99);
        
        this.roundOverText = this.add.text(400, 300, message, {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center'
        });
        this.roundOverText.setOrigin(0.5);
        this.roundOverText.setDepth(100);
        
        // Update score display
        this.updateUI();
        
        console.log(`Tic Tac Toe Round ${this.round} ended: ${reason}`);
        
        // If this is a tiebreaker round
        if (this.isTiebreaker) {
            if (reason === 'win') {
                // Winner of tiebreaker wins the game
                this.time.delayedCall(2000, () => {
                    this.endGame();
                });
                return;
            } else if (reason === 'draw') {
                // If tiebreaker is a draw, start another tiebreaker round
                this.time.delayedCall(2000, () => {
                    this.startRound();
                });
                return;
            }
        }
        
        // Wait 2 seconds, then move to next round or end game
        this.time.delayedCall(2000, () => {
            if (this.round < this.maxRounds) {
                // Move to next round
                this.round++;
                this.startRound();
            } else {
                // All rounds complete - check for tie and start tiebreaker if needed
                if (this.scores.X === this.scores.O) {
                    // Tie after 3 rounds - start tiebreaker
                    this.isTiebreaker = true;
                    this.startRound();
                } else {
                    // Determine overall winner
                    this.endGame();
                }
            }
        });
    }
    
    endGame() {
        // Determine overall winner
        let overallWinner = null;
        let message = '';
        
        // If tiebreaker was played, the tiebreaker winner is the overall winner
        if (this.isTiebreaker && this.winner) {
            overallWinner = this.winner;
            const isPlayerWinner = (this.playerPosition === 0 && this.winner === 'X') || 
                                  (this.playerPosition === 1 && this.winner === 'O');
            message = isPlayerWinner ? '🎉 You Win the Match! (Tiebreaker) 🎉' : `${this.winner} Wins the Match! (Tiebreaker)`;
        } else if (this.scores.X > this.scores.O) {
            overallWinner = 'X';
            const isPlayerWinner = this.playerPosition === 0;
            message = isPlayerWinner ? '🎉 You Win the Match! 🎉' : 'X Wins the Match!';
        } else if (this.scores.O > this.scores.X) {
            overallWinner = 'O';
            const isPlayerWinner = this.playerPosition === 1;
            message = isPlayerWinner ? '🎉 You Win the Match! 🎉' : 'O Wins the Match!';
        } else {
            message = 'Match is a Draw!';
        }
        
        // Clear previous messages
        if (this.roundOverText) {
            this.roundOverText.destroy();
        }
        
        // Create final game over background
        const bg = this.add.rectangle(400, 300, 700, 300, 0x000000, 0.9);
        bg.setDepth(99);
        
        // Display final message
        const finalMessage = this.add.text(400, 250, message, {
            fontSize: '40px',
            fill: '#F39C12',
            fontStyle: 'bold',
            align: 'center'
        });
        finalMessage.setOrigin(0.5);
        finalMessage.setDepth(100);
        
        // Display final scores
        const finalScore = this.add.text(400, 320, `Final Score - X: ${this.scores.X} | O: ${this.scores.O}`, {
            fontSize: '28px',
            fill: '#ECF0F1',
            align: 'center'
        });
        finalScore.setOrigin(0.5);
        finalScore.setDepth(100);
        
        console.log(`Tic Tac Toe game ended. Final scores - X: ${this.scores.X}, O: ${this.scores.O}`);
        
        // Wait 3 seconds before calling onGameComplete
        this.time.delayedCall(3000, () => {
            if (this.onGameComplete) {
                this.onGameComplete({
                    gameType: 'tictactoe',
                    reason: 'complete',
                    winner: overallWinner,
                    scores: this.scores,
                    playerPosition: this.playerPosition
                });
            }
        });
    }
}

export default TicTacToeScene;

