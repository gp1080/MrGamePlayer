import Phaser from 'phaser';

class ChessScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChessScene' });
        this.board = [];
        this.selectedPiece = null;
        this.currentPlayer = 'white';
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 1800000; // 30 minutes
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.players = [];
        this.alivePlayers = 0;
        this.boardSize = 8;
        this.cellSize = 60;
        this.boardX = 160; // Centered: (800 - 480) / 2 = 160
        this.boardY = 60;  // Slightly higher for better positioning
        this.pieces = [];
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create background
        this.createBackground();

        // Create chess board
        this.createBoard();

        // Create pieces
        this.createPieces();

        // Create UI
        this.createUI();

        // Start game
        this.gameStarted = true;
        console.log('Chess game started!');
    }

    createBackground() {
        this.add.rectangle(400, 300, 800, 600, 0xF5DEB3);
    }

    createBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const x = this.boardX + col * this.cellSize;
                const y = this.boardY + row * this.cellSize;
                
                const color = (row + col) % 2 === 0 ? 0xF0D9B5 : 0xB58863;
                const cell = this.add.rectangle(x, y, this.cellSize, this.cellSize, color);
                cell.setStrokeStyle(2, 0x000000);
                cell.setInteractive();
                
                this.board[row][col] = {
                    x: x,
                    y: y,
                    row: row,
                    col: col,
                    piece: null,
                    cell: cell
                };
                
                cell.on('pointerdown', () => this.onCellClick(row, col));
            }
        }
    }

    createPieces() {
        // Create all chess pieces in correct positions
        this.createPieceRow(0, 'black', 'back');
        this.createPieceRow(1, 'black', 'pawn');
        this.createPieceRow(6, 'white', 'pawn');
        this.createPieceRow(7, 'white', 'back');
    }

    createPieceRow(row, color, type) {
        const pieces = type === 'back' ? 
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] :
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'];

        for (let col = 0; col < this.boardSize; col++) {
            this.createPiece(row, col, color, pieces[col]);
        }
    }

    createPiece(row, col, color, type) {
        const cell = this.board[row][col];
        const piece = this.add.circle(cell.x, cell.y, 25, color === 'white' ? 0xFFFFFF : 0x000000);
        piece.setStrokeStyle(2, 0x000000);
        piece.setInteractive();
        piece.setDepth(1);
        
        const pieceText = this.add.text(cell.x, cell.y, this.getPieceSymbol(type), {
            fontSize: '20px',
            fill: color === 'white' ? '#000000' : '#FFFFFF',
            fontFamily: 'Arial'
        });
        pieceText.setOrigin(0.5);
        pieceText.setDepth(2);
        
        const pieceData = {
            row: row,
            col: col,
            color: color,
            type: type,
            piece: piece,
            text: pieceText,
            hasMoved: false
        };
        
        this.pieces.push(pieceData);
        this.board[row][col].piece = pieceData;
        
        piece.on('pointerdown', () => this.onPieceClick(row, col));
    }

    getPieceSymbol(type) {
        const symbols = {
            'king': '♔',
            'queen': '♕',
            'rook': '♖',
            'bishop': '♗',
            'knight': '♘',
            'pawn': '♙'
        };
        return symbols[type] || '?';
    }

    createUI() {
        this.currentPlayerText = this.add.text(400, 550, 'Current Player: White', {
            fontSize: '20px',
            fill: '#000'
        });
        this.currentPlayerText.setOrigin(0.5);
        this.currentPlayerText.setDepth(10);

        this.timerText = this.add.text(400, 575, 'Time: 30:00', {
            fontSize: '18px',
            fill: '#000'
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setDepth(10);
        
        // Check indicator text (hidden initially)
        this.checkText = this.add.text(400, 30, '', {
            fontSize: '24px',
            fill: '#FF0000',
            fontStyle: 'bold'
        });
        this.checkText.setOrigin(0.5);
        this.checkText.setDepth(10);
        this.checkText.setVisible(false);
    }

    update() {
        if (!this.gameStarted || this.gameOver) {
            return;
        }

        this.updateTimer();

        if (this.gameTime >= this.maxGameTime) {
            this.endGame('time');
        }
    }

    onCellClick(row, col) {
        if (this.gameOver) return;
        
        // eslint-disable-next-line no-unused-vars
        const cell = this.board[row][col];
        
        if (this.selectedPiece) {
            if (this.isValidMove(this.selectedPiece, row, col)) {
                this.movePiece(this.selectedPiece, row, col);
                this.clearSelection();
                // Only switch player if game is not over
                if (!this.gameOver) {
                    this.switchPlayer();
                }
            } else {
                this.clearSelection();
            }
        }
    }

    onPieceClick(row, col) {
        if (this.gameOver) return;
        
        const cell = this.board[row][col];
        const piece = cell.piece;
        
        if (piece && piece.color === this.currentPlayer) {
            this.selectPiece(piece);
        } else if (this.selectedPiece) {
            if (this.isValidMove(this.selectedPiece, row, col)) {
                this.movePiece(this.selectedPiece, row, col);
                this.clearSelection();
                // Only switch player if game is not over
                if (!this.gameOver) {
                    this.switchPlayer();
                }
            } else {
                this.clearSelection();
            }
        }
    }

    selectPiece(piece) {
        this.clearSelection();
        this.selectedPiece = piece;
        
        piece.piece.setStrokeStyle(4, 0xFF0000);
        this.showValidMoves(piece);
    }

    clearSelection() {
        if (this.selectedPiece) {
            this.selectedPiece.piece.setStrokeStyle(2, 0x000000);
        }
        this.selectedPiece = null;
        this.clearValidMoves();
    }

    showValidMoves(piece) {
        this.clearValidMoves();
        let moves = this.getValidMoves(piece);
        
        // If current player is in check, filter moves to only show those that resolve the check
        if (this.isKingInCheck(this.currentPlayer)) {
            moves = moves.filter(move => this.moveResolvesCheck(piece, move.row, move.col));
        }
        
        moves.forEach(move => {
            const cell = this.board[move.row][move.col];
            // Create clean green highlight
            const highlight = this.add.rectangle(cell.x, cell.y, this.cellSize - 10, this.cellSize - 10, 0x00FF00, 0.5);
            highlight.setDepth(0.5);
            highlight.setInteractive();
            highlight.on('pointerdown', () => {
                this.onCellClick(move.row, move.col);
            });
            this.validMoves.push(highlight);
        });
    }

    clearValidMoves() {
        this.validMoves.forEach(highlight => {
            if (highlight.destroy) {
                highlight.destroy();
            }
        });
        this.validMoves = [];
    }

    getValidMoves(piece) {
        const moves = [];
        // eslint-disable-next-line no-unused-vars
        const { row, col, type, color } = piece;
        
        switch (type) {
            case 'pawn':
                this.getPawnMoves(piece, moves);
                break;
            case 'rook':
                this.getRookMoves(piece, moves);
                break;
            case 'knight':
                this.getKnightMoves(piece, moves);
                break;
            case 'bishop':
                this.getBishopMoves(piece, moves);
                break;
            case 'queen':
                this.getQueenMoves(piece, moves);
                break;
            case 'king':
                this.getKingMoves(piece, moves);
                break;
            default:
                break;
        }
        
        return moves;
    }

    getPawnMoves(piece, moves) {
        const { row, col, color } = piece;
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col].piece) {
            moves.push({ row: row + direction, col: col });
            
            // Double move from start position
            if (row === startRow && !this.board[row + 2 * direction][col].piece) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Diagonal captures
        [-1, 1].forEach(dc => {
            const newRow = row + direction;
            const newCol = col + dc;
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol].piece;
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
    }

    getRookMoves(piece, moves) {
        this.getLinearMoves(piece, moves, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    }

    getBishopMoves(piece, moves) {
        this.getLinearMoves(piece, moves, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    }

    getQueenMoves(piece, moves) {
        this.getLinearMoves(piece, moves, [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]);
    }

    getKingMoves(piece, moves) {
        const { row, col, color } = piece;
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        directions.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol].piece;
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
    }

    getKnightMoves(piece, moves) {
        const { row, col, color } = piece;
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        
        knightMoves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol].piece;
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
    }

    getLinearMoves(piece, moves, directions) {
        const { row, col, color } = piece;
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < this.boardSize; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol].piece;
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    isValidMove(piece, targetRow, targetCol) {
        const moves = this.getValidMoves(piece);
        let validMoves = moves.filter(move => move.row === targetRow && move.col === targetCol);
        
        // If current player is in check, only allow moves that resolve the check
        if (this.isKingInCheck(this.currentPlayer)) {
            validMoves = validMoves.filter(move => this.moveResolvesCheck(piece, move.row, move.col));
        }
        
        return validMoves.length > 0;
    }
    
    moveResolvesCheck(piece, targetRow, targetCol) {
        // Simulate the move to see if it gets the king out of check
        const originalRow = piece.row;
        const originalCol = piece.col;
        const targetCell = this.board[targetRow][targetCol];
        const capturedPiece = targetCell.piece;
        
        // Make the move temporarily
        this.board[originalRow][originalCol].piece = null;
        piece.row = targetRow;
        piece.col = targetCol;
        targetCell.piece = piece;
        
        // Check if the king is still in check after this move
        const stillInCheck = this.isKingInCheck(this.currentPlayer);
        
        // Undo the move
        this.board[originalRow][originalCol].piece = piece;
        piece.row = originalRow;
        piece.col = originalCol;
        targetCell.piece = capturedPiece;
        
        // Move resolves check if king is no longer in check
        return !stillInCheck;
    }

    movePiece(piece, targetRow, targetCol) {
        if (this.gameOver) return;
        
        const sourceCell = this.board[piece.row][piece.col];
        const targetCell = this.board[targetRow][targetCol];
        
        // Remove piece from source
        sourceCell.piece = null;
        
        // Capture target piece if exists
        let capturedPiece = null;
        if (targetCell.piece) {
            capturedPiece = targetCell.piece;
            
            // Check if captured piece is a king - game over!
            if (capturedPiece.type === 'king') {
                // Set winner immediately - the player who captured the king wins
                this.winner = piece.color;
                this.gameOver = true; // Set game over immediately
                
                // Remove captured king from pieces array
                const pieceIndex = this.pieces.indexOf(capturedPiece);
                if (pieceIndex !== -1) {
                    this.pieces.splice(pieceIndex, 1);
                }
                // Destroy visual elements of captured king
                capturedPiece.piece.destroy();
                capturedPiece.text.destroy();
                
                // Move the capturing piece to final position
                piece.row = targetRow;
                piece.col = targetCol;
                piece.hasMoved = true;
                piece.piece.x = targetCell.x;
                piece.piece.y = targetCell.y;
                piece.text.x = targetCell.x;
                piece.text.y = targetCell.y;
                targetCell.piece = piece;
                piece.piece.removeAllListeners();
                piece.piece.on('pointerdown', () => this.onPieceClick(targetRow, targetCol));
                
                // Clear any selected pieces and valid moves
                this.clearSelection();
                
                // Disable all input immediately
                this.input.enabled = false;
                
                // End game immediately with clear message
                this.endGame('king_captured');
                return; // Don't continue with the move
            }
            
            // Normal capture (not a king)
            const pieceIndex = this.pieces.indexOf(capturedPiece);
            if (pieceIndex !== -1) {
                this.pieces.splice(pieceIndex, 1);
            }
            targetCell.piece.piece.destroy();
            targetCell.piece.text.destroy();
        }
        
        // Move piece to target
        piece.row = targetRow;
        piece.col = targetCol;
        piece.hasMoved = true;
        
        // Update visual position
        piece.piece.x = targetCell.x;
        piece.piece.y = targetCell.y;
        piece.text.x = targetCell.x;
        piece.text.y = targetCell.y;
        
        // Update board - CRITICAL: Set the piece at the new position
        targetCell.piece = piece;
        
        // Update the piece's click handler to the new position
        piece.piece.removeAllListeners();
        piece.piece.on('pointerdown', () => this.onPieceClick(targetRow, targetCol));
        
        // Check for checkmate after the move (only if game is still ongoing)
        if (!this.gameOver) {
            this.checkForCheckmate();
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.currentPlayerText.setText('Current Player: ' + (this.currentPlayer === 'white' ? 'White' : 'Black'));
        
        // Check if the current player's king is in check
        this.updateCheckIndicator();
    }
    
    updateCheckIndicator() {
        // Check if current player's king is in check
        const isInCheck = this.isKingInCheck(this.currentPlayer);
        
        if (isInCheck && !this.gameOver) {
            // Show check warning
            const playerColor = this.currentPlayer === 'white' ? 'White' : 'Black';
            this.checkText.setText(`⚠ CHECK! ${playerColor} King is in Check`);
            this.checkText.setVisible(true);
            
            // Check for checkmate immediately when in check
            this.checkForCheckmate();
        } else {
            // Hide check warning
            this.checkText.setVisible(false);
        }
    }
    
    hasAnyValidMoves(color) {
        // Check if the player has any valid moves that resolve check
        const playerPieces = this.pieces.filter(p => p.color === color);
        
        for (const piece of playerPieces) {
            const moves = this.getValidMoves(piece);
            
            // If in check, filter to only moves that resolve check
            let validMoves = moves;
            if (this.isKingInCheck(color)) {
                validMoves = moves.filter(move => this.moveResolvesCheck(piece, move.row, move.col));
            }
            
            if (validMoves.length > 0) {
                return true; // Found at least one valid move
            }
        }
        
        return false; // No valid moves found
    }

    updateTimer() {
        this.gameTime += 16;
        const remainingTime = Math.max(0, Math.floor((this.maxGameTime - this.gameTime) / 1000));
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    checkForCheckmate() {
        if (this.gameOver) return;
        
        // Check if the current player (who is about to move or just moved) is in checkmate
        const king = this.pieces.find(p => p.type === 'king' && p.color === this.currentPlayer);
        
        if (!king) {
            // King was captured, game should have already ended
            return;
        }
        
        // Check if king is in check
        const isInCheck = this.isKingInCheck(this.currentPlayer);
        
        if (!isInCheck) {
            // Not in check, so not checkmate
            return;
        }
        
        // Check if player has any valid moves (king moves or blocking moves)
        const hasValidMoves = this.hasAnyValidMoves(this.currentPlayer);
        
        // Checkmate: king is in check and has no valid moves
        if (!hasValidMoves) {
            // The opponent wins (the player who put them in checkmate)
            this.winner = this.currentPlayer === 'white' ? 'black' : 'white';
            this.clearSelection(); // Clear any selected pieces
            this.input.enabled = false; // Disable input immediately
            this.checkText.setVisible(false); // Hide check text
            // Don't set gameOver here - let endGame() handle it
            this.endGame('checkmate');
        }
    }
    
    isKingInCheck(color) {
        const king = this.pieces.find(p => p.type === 'king' && p.color === color);
        if (!king) return false;
        
        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = this.pieces.filter(p => p.color === opponentColor);
        
        // Check if any opponent piece can attack the king
        for (const opponentPiece of opponentPieces) {
            const moves = this.getValidMoves(opponentPiece);
            if (moves.some(move => move.row === king.row && move.col === king.col)) {
                return true;
            }
        }
        
        return false;
    }
    
    canBlockCheck(color) {
        // Check if any piece of the given color can block the check
        const pieces = this.pieces.filter(p => p.color === color);
        
        for (const piece of pieces) {
            const moves = this.getValidMoves(piece);
            // Try each move to see if it gets the king out of check
            for (const move of moves) {
                // Simulate the move
                const originalRow = piece.row;
                const originalCol = piece.col;
                const targetCell = this.board[move.row][move.col];
                const capturedPiece = targetCell.piece;
                
                // Make the move temporarily
                this.board[originalRow][originalCol].piece = null;
                piece.row = move.row;
                piece.col = move.col;
                targetCell.piece = piece;
                
                // Check if king is still in check
                const stillInCheck = this.isKingInCheck(color);
                
                // Undo the move
                this.board[originalRow][originalCol].piece = piece;
                piece.row = originalRow;
                piece.col = originalCol;
                targetCell.piece = capturedPiece;
                
                if (!stillInCheck) {
                    return true; // Found a move that gets out of check
                }
            }
        }
        
        return false;
    }

    endGame(reason) {
        if (this.gameOver && reason !== 'king_captured' && reason !== 'checkmate') return; // Prevent multiple calls (except for king capture and checkmate)
        
        this.gameOver = true;
        console.log(`Chess game ended: ${reason}, Winner: ${this.winner}`);
        
        // Display winner message with clear identification
        let message = '';
        let winnerText = '';
        
        if (reason === 'king_captured') {
            // King was captured - clear winner message
            const winnerColor = this.winner === 'white' ? 'White' : 'Black';
            const loserColor = this.winner === 'white' ? 'Black' : 'White';
            message = `${winnerColor} WINS!`;
            winnerText = `${loserColor} King Captured`;
        } else if (reason === 'checkmate') {
            const winnerColor = this.winner === 'white' ? 'White' : 'Black';
            const loserColor = this.winner === 'white' ? 'Black' : 'White';
            message = `${winnerColor} WINS!`;
            winnerText = `Checkmate! ${loserColor} King is in Checkmate`;
        } else if (reason === 'stalemate') {
            message = 'GAME ENDED';
            winnerText = 'Stalemate - Draw';
        } else if (reason === 'time') {
            message = 'TIME\'S UP';
            if (this.winner) {
                const winnerColor = this.winner === 'white' ? 'White' : 'Black';
                winnerText = `${winnerColor} Wins`;
            } else {
                winnerText = 'Draw';
            }
        }
        
        // Create a semi-transparent background for better visibility
        const bg = this.add.rectangle(400, 300, 700, 300, 0x000000, 0.85);
        bg.setDepth(99);
        
        // Main winner message (large and bold)
        const gameOverText = this.add.text(400, 250, message, {
            fontSize: '48px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center'
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(100);
        
        // Reason text (smaller, below main message)
        if (winnerText) {
            const reasonText = this.add.text(400, 310, winnerText, {
                fontSize: '28px',
                fill: '#FFFF00',
                fontStyle: 'bold',
                align: 'center'
            });
            reasonText.setOrigin(0.5);
            reasonText.setDepth(100);
        }
        
        // Disable all interactions
        this.input.enabled = false;
        
        // Wait 3 seconds before calling onGameComplete to show the message
        this.time.delayedCall(3000, () => {
            if (this.onGameComplete) {
                this.onGameComplete({
                    gameType: 'chess',
                    reason: reason,
                    winner: this.winner,
                    winnerColor: this.winner === 'white' ? 'white' : 'black',
                    time: Math.floor(this.gameTime / 1000)
                });
            }
        });
    }
}

export default ChessScene;