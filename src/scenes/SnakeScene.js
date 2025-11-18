import Phaser from 'phaser';

class SnakeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SnakeScene' });
        this.snakes = [];
        this.food = [];
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.gridSize = 20;
        this.boardWidth = 800;
        this.boardHeight = 600;
        this.moveSpeed = 150; // milliseconds between moves (faster initial speed)
        this.lastMoveTime = 0;
        this.speedIncrease = 0;
        this.maxSpeedIncreases = 3;
    }

    init(data) {
        this.playerPosition = data.playerPosition || 0;
        this.roomId = data.roomId;
        this.wsConnection = data.wsConnection;
        this.numPlayers = data.numPlayers || 2;
        this.gameType = data.gameType || 'snake';
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create grid
        this.createGrid();
        this.createSnakes();
        this.spawnFood();
        this.createUI();
        this.setupInput();
        
        // Start countdown
        this.startCountdown();
    }

    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.5);
        
        // Draw vertical lines
        for (let x = 0; x <= this.boardWidth; x += this.gridSize) {
            graphics.beginPath();
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.boardHeight);
            graphics.strokePath();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.boardHeight; y += this.gridSize) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(this.boardWidth, y);
            graphics.strokePath();
        }
    }

    createSnakes() {
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500, 0x800080];
        
        for (let i = 0; i < this.numPlayers; i++) {
            const startX = 200 + (i * 200);
            const startY = 300;
            
            const head = this.add.rectangle(startX, startY, this.gridSize - 2, this.gridSize - 2, colors[i % colors.length]);
            
            this.snakes.push({
                head: head,
                body: [],
                direction: { x: 1, y: 0 },
                nextDirection: { x: 1, y: 0 },
                score: 0,
                alive: true,
                position: i
            });
        }
    }

    spawnFood() {
        // Clear existing food
        this.food.forEach(f => f.destroy());
        this.food = [];

        // Spawn food for each player
        for (let i = 0; i < this.numPlayers * 3; i++) {
            const x = Math.floor(Math.random() * (this.boardWidth / this.gridSize)) * this.gridSize + this.gridSize / 2;
            const y = Math.floor(Math.random() * (this.boardHeight / this.gridSize)) * this.gridSize + this.gridSize / 2;
            
            const food = this.add.circle(x, y, this.gridSize / 2 - 2, 0xFFD700);
            this.food.push(food);
        }
    }

    createUI() {
        // Score display
        this.scoreTexts = [];
        for (let i = 0; i < this.numPlayers; i++) {
            const scoreText = this.add.text(50, 50 + (i * 30), `Player ${i + 1}: 0`, {
                fontSize: '20px',
                fill: '#fff'
            });
            this.scoreTexts.push(scoreText);
        }

        // Game timer
        this.timerText = this.add.text(400, 20, '1:00', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Mobile touch controls - swipe gestures
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Track swipe gestures for mobile
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 30; // Minimum distance for a swipe
        
        // Touch start
        this.input.on('pointerdown', (pointer) => {
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
        });
        
        // Touch end - detect swipe direction
        this.input.on('pointerup', (pointer) => {
            const deltaX = pointer.x - this.touchStartX;
            const deltaY = pointer.y - this.touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Only register swipe if movement is significant
            if (absDeltaX > this.swipeThreshold || absDeltaY > this.swipeThreshold) {
                const playerSnake = this.snakes[this.playerPosition];
                if (!playerSnake || !playerSnake.alive) return;
                
                // Determine swipe direction
                if (absDeltaX > absDeltaY) {
                    // Horizontal swipe
                    if (deltaX > 0 && playerSnake.direction.x === 0) {
                        playerSnake.nextDirection = { x: 1, y: 0 }; // Right
                    } else if (deltaX < 0 && playerSnake.direction.x === 0) {
                        playerSnake.nextDirection = { x: -1, y: 0 }; // Left
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0 && playerSnake.direction.y === 0) {
                        playerSnake.nextDirection = { x: 0, y: 1 }; // Down
                    } else if (deltaY < 0 && playerSnake.direction.y === 0) {
                        playerSnake.nextDirection = { x: 0, y: -1 }; // Up
                    }
                }
            }
        });
    }

    startCountdown() {
        this.countdownValue = 3;
        this.countdownText = this.add.text(400, 300, '3', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            repeat: 2, // 3..2..1 then start
            callback: () => {
                this.countdownValue -= 1;
                if (this.countdownValue > 0) {
                    if (this.countdownText && this.countdownText.active) {
                        this.countdownText.setText(this.countdownValue.toString());
                    }
                } else {
                    if (this.countdownText && this.countdownText.active) {
                        this.countdownText.setText('GO!');
                        this.time.delayedCall(500, () => {
                            if (this.countdownText && this.countdownText.active) {
                                this.countdownText.destroy();
                                this.countdownText = null;
                            }
                            this.gameStarted = true;
                        });
                    }
                }
            }
        });
    }

    update() {
        if (!this.gameStarted) return;

        this.handleInput();
        
        // Move snakes based on speed
        const currentTime = this.time.now;
        if (currentTime - this.lastMoveTime >= this.moveSpeed) {
            this.updateSnakes();
            this.checkFood();
            this.checkCollisions();
            this.lastMoveTime = currentTime;
        }
        
        this.updateUI();
        this.updateTimer();
        this.checkSpeedIncrease();
        this.checkGameEnd();
    }

    handleInput() {
        const playerSnake = this.snakes[this.playerPosition];
        if (!playerSnake || !playerSnake.alive) return;

        // Prevent reversing into self
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            if (playerSnake.direction.x === 0) {
                playerSnake.nextDirection = { x: -1, y: 0 };
            }
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            if (playerSnake.direction.x === 0) {
                playerSnake.nextDirection = { x: 1, y: 0 };
            }
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            if (playerSnake.direction.y === 0) {
                playerSnake.nextDirection = { x: 0, y: -1 };
            }
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            if (playerSnake.direction.y === 0) {
                playerSnake.nextDirection = { x: 0, y: 1 };
            }
        }
    }

    updateSnakes() {
        this.snakes.forEach((snake, index) => {
            if (!snake.alive) return;

            // Update direction
            snake.direction = { ...snake.nextDirection };

            // Store previous head position for body movement
            const prevHeadX = snake.head.x;
            const prevHeadY = snake.head.y;

            // Move head
            const newX = snake.head.x + snake.direction.x * this.gridSize;
            const newY = snake.head.y + snake.direction.y * this.gridSize;

            // Wrap around screen
            const wrappedX = ((newX % this.boardWidth) + this.boardWidth) % this.boardWidth;
            const wrappedY = ((newY % this.boardHeight) + this.boardHeight) % this.boardHeight;

            snake.head.x = wrappedX;
            snake.head.y = wrappedY;

            // Move body segments
            if (snake.body.length > 0) {
                // Move each body segment to the position of the segment in front of it
                for (let i = snake.body.length - 1; i > 0; i--) {
                    snake.body[i].x = snake.body[i - 1].x;
                    snake.body[i].y = snake.body[i - 1].y;
                }
                // Move first body segment to previous head position
                snake.body[0].x = prevHeadX;
                snake.body[0].y = prevHeadY;
            }
        });
    }

    checkFood() {
        this.snakes.forEach((snake, index) => {
            if (!snake.alive) return;

            // Check each food item
            for (let i = this.food.length - 1; i >= 0; i--) {
                const food = this.food[i];
                const distance = Phaser.Math.Distance.Between(snake.head.x, snake.head.y, food.x, food.y);
                
                if (distance < this.gridSize) { // Increased collision radius
                    // Eat food
                    food.destroy();
                    this.food.splice(i, 1);
                    snake.score++;
                    
                    // Add body segment at a safe position (behind the head)
                    let bodyX = snake.head.x - snake.direction.x * this.gridSize;
                    let bodyY = snake.head.y - snake.direction.y * this.gridSize;
                    
                    // Wrap around if needed
                    bodyX = ((bodyX % this.boardWidth) + this.boardWidth) % this.boardWidth;
                    bodyY = ((bodyY % this.boardHeight) + this.boardHeight) % this.boardHeight;
                    
                    const bodySegment = this.add.rectangle(bodyX, bodyY, this.gridSize - 2, this.gridSize - 2, 0x666666);
                    snake.body.push(bodySegment);
                    
                    console.log(`Snake ${index + 1} ate food! Score: ${snake.score}, Body length: ${snake.body.length}`);
                }
            }
        });

        // Respawn food if needed
        if (this.food.length < this.numPlayers * 2) {
            this.spawnFood();
        }
    }

    checkCollisions() {
        this.snakes.forEach((snake, index) => {
            if (!snake.alive) return;

            // Check self collision
            snake.body.forEach((segment, segmentIndex) => {
                if (snake.head.x === segment.x && snake.head.y === segment.y) {
                    snake.alive = false;
                    snake.head.setAlpha(0.5);
                    console.log(`Snake ${index + 1} died from self-collision at segment ${segmentIndex}!`);
                }
            });

            // Check collision with other snakes
            this.snakes.forEach((otherSnake, otherIndex) => {
                if (index !== otherIndex && otherSnake.alive) {
                    if (snake.head.x === otherSnake.head.x && snake.head.y === otherSnake.head.y) {
                        // Head-to-head collision - both die
                        snake.alive = false;
                        otherSnake.alive = false;
                        snake.head.setAlpha(0.5);
                        otherSnake.head.setAlpha(0.5);
                        console.log(`Snakes ${index + 1} and ${otherIndex + 1} died from head-to-head collision!`);
                    }

                    // Check collision with other snake's body
                    otherSnake.body.forEach(segment => {
                        if (snake.head.x === segment.x && snake.head.y === segment.y) {
                            snake.alive = false;
                            snake.head.setAlpha(0.5);
                            console.log(`Snake ${index + 1} died from hitting snake ${otherIndex + 1}'s body!`);
                        }
                    });
                }
            });
        });
    }

    updateUI() {
        this.snakes.forEach((snake, index) => {
            this.scoreTexts[index].setText(`Player ${index + 1}: ${snake.score} ${snake.alive ? '' : '(DEAD)'}`);
        });
    }
    
    updateTimer() {
        this.gameTime += 16; // Assuming 60fps
        
        if (this.timerText && this.timerText.active) {
            const remainingTime = Math.max(0, this.maxGameTime - this.gameTime);
            const seconds = Math.ceil(remainingTime / 1000);
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            this.timerText.setText(`${minutes}:${secs.toString().padStart(2, '0')}`);
            
            // Change color when time is running low
            if (seconds <= 10) {
                this.timerText.setFill('#ff0000'); // Red when time is low
            } else if (seconds <= 30) {
                this.timerText.setFill('#ffaa00'); // Orange when time is medium
            } else {
                this.timerText.setFill('#ffffff'); // White normally
            }
        }
    }
    
    checkSpeedIncrease() {
        // Increase snake speed if no one has scored and we haven't reached max increases
        if (this.speedIncrease < this.maxSpeedIncreases) {
            const timeForSpeedIncrease = (this.speedIncrease + 1) * 15000; // Every 15 seconds
            if (this.gameTime >= timeForSpeedIncrease && this.snakes.every(snake => snake.score === 0)) {
                this.increaseSnakeSpeed();
            }
        }
    }
    
    increaseSnakeSpeed() {
        this.speedIncrease++;
        const speedMultiplier = 1 + (this.speedIncrease * 0.4); // 40% increase each time
        this.moveSpeed = Math.max(50, 150 / speedMultiplier); // Faster movement
        
        
        console.log(`Snake speed increased! Level: ${this.speedIncrease}, New speed: ${this.moveSpeed}ms`);
    }

    checkGameEnd() {
        const aliveSnakes = this.snakes.filter(snake => snake.alive);
        
        if (aliveSnakes.length <= 1 || this.gameTime >= this.maxGameTime) {
            this.endGame();
        }
    }

    endGame() {
        this.gameStarted = false;
        
        // Find winner
        const sortedSnakes = [...this.snakes].sort((a, b) => b.score - a.score);
        const winner = sortedSnakes[0];
        const isPlayerWinner = winner.position === this.playerPosition;
        
        let result = '';
        let gameResult = '';
        
        if (this.gameTime >= this.maxGameTime) {
            // Time's up - highest score wins
            if (winner.score > 0) {
                result = isPlayerWinner ? 'You Win!' : `Player ${winner.position + 1} Wins!`;
                gameResult = `Time's Up!\n${result}\nScore: ${winner.score}`;
            } else {
                // No one scored - check for sudden death
                if (this.speedIncrease >= this.maxSpeedIncreases) {
                    result = 'Sudden Death!';
                    gameResult = 'Time\'s Up!\nSudden Death! First to score wins!';
                } else {
                    result = 'Tie!';
                    gameResult = `Time's Up!\nTie! No one scored.`;
                }
            }
        } else {
            // Someone died - last snake standing wins
            const aliveSnakes = this.snakes.filter(snake => snake.alive);
            if (aliveSnakes.length === 1) {
                const lastSnake = aliveSnakes[0];
                const isLastSnakePlayer = lastSnake.position === this.playerPosition;
                result = isLastSnakePlayer ? 'You Win!' : `Player ${lastSnake.position + 1} Wins!`;
                gameResult = `${result}\nLast Snake Standing!\nScore: ${lastSnake.score}`;
            }
        }
        
        const gameOverText = this.add.text(400, 300, gameResult, {
            fontSize: '28px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(5000, () => {
            if (this.onGameComplete) {
                this.onGameComplete();
            }
        });
    }
    
    onShutdown() {
        this.gameStarted = false;
        // Clear countdown timer
        if (this.countdownEvent) {
            this.countdownEvent.remove();
            this.countdownEvent = null;
        }
        // Destroy texts safely
        if (this.countdownText && this.countdownText.active) {
            this.countdownText.destroy();
            this.countdownText = null;
        }
        if (this.timerText && this.timerText.active) {
            this.timerText.destroy();
            this.timerText = null;
        }
        if (this.scoreTexts) {
            this.scoreTexts.forEach(text => {
                if (text && text.active) text.destroy();
            });
        }
    }
    
    onDestroy() {
        this.onShutdown();
    }
}

export default SnakeScene;
