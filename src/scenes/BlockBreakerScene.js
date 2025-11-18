import Phaser from 'phaser';

class BlockBreakerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BlockBreakerScene' });
        this.ball = null;
        this.paddle = null;
        this.blocks = [];
        this.score = 0;
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.players = [];
        this.alivePlayers = 0;
        this.ballSpeed = 300;
        this.paddleSpeed = 400;
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Set up physics - no gravity needed for this game
        // this.physics.world.gravity.y = 0;

        // Create background
        this.createBackground();

        // Create blocks
        this.createBlocks();

        // Create paddle
        this.createPaddle();

        // Create ball
        this.createBall();

        // Create UI
        this.createUI();

        // Set up controls
        this.setupControls();

        // Start countdown
        this.startCountdown();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
    }

    createBackground() {
        // Simple gradient background
        this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
    }

    createBlocks() {
        this.blocks = [];
        const blockWidth = 60;
        const blockHeight = 30;
        const blockSpacing = 5;
        const startX = 100;
        const startY = 100;
        const rows = 5;
        const cols = 10;

        const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (blockWidth + blockSpacing);
                const y = startY + row * (blockHeight + blockSpacing);
                
                const block = this.add.rectangle(x, y, blockWidth, blockHeight, colors[row]);
                this.physics.add.existing(block, true);
                block.setStrokeStyle(2, 0xffffff);
                
                // Block properties
                block.hits = 0;
                block.maxHits = row + 1; // Different durability for each row
                block.points = (rows - row) * 10; // More points for higher rows
                
                this.blocks.push(block);
            }
        }
    }

    createPaddle() {
        // Create paddle for human player
        this.paddle = this.add.rectangle(400, 550, 120, 20, 0xffffff);
        this.physics.add.existing(this.paddle, true);
    }

    createBall() {
        this.ball = this.add.circle(400, 500, 10, 0xffffff);
        this.physics.add.existing(this.ball);
        this.ball.body.setBounce(1);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setVelocity(0, 0); // Start stationary
    }

    createUI() {
        // Score display
        this.scoreText = this.add.text(50, 50, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });

        // Blocks remaining
        this.blocksText = this.add.text(50, 80, 'Blocks: 50', {
            fontSize: '20px',
            fill: '#fff'
        });

        // Game timer
        this.timerText = this.add.text(400, 50, '1:00', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Instructions
        this.instructionsText = this.add.text(400, 100, 'Use LEFT/RIGHT arrows to move paddle', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5);
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    startCountdown() {
        this.countdownValue = 3;
        this.countdownText = this.add.text(400, 200, '3', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            repeat: 2,
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
                            
                            // Launch ball
                            this.launchBall();
                        });
                    }
                }
            }
        });
    }

    launchBall() {
        // Launch ball in random direction
        const angle = Phaser.Math.Between(-45, 45) * (Math.PI / 180);
        const velocityX = Math.cos(angle) * this.ballSpeed;
        const velocityY = Math.sin(angle) * this.ballSpeed;
        
        this.ball.body.setVelocity(velocityX, velocityY);
    }

    update() {
        if (!this.gameStarted) return;

        // Update paddle
        this.updatePaddle();

        // Update ball
        this.updateBall();

        // Check collisions
        this.checkCollisions();

        // Update timer
        this.updateTimer();

        // Check game end
        if (this.gameTime >= this.maxGameTime || this.blocks.length === 0) {
            this.endGame();
        }
    }

    updatePaddle() {
        // Move paddle with arrow keys
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.paddle.x -= this.paddleSpeed * (16 / 1000);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.paddle.x += this.paddleSpeed * (16 / 1000);
        }

        // Keep paddle within bounds
        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, 60, 740);
    }

    updateBall() {
        // Keep ball speed consistent
        const velocity = this.ball.body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        if (speed > 0) {
            const normalizedX = velocity.x / speed;
            const normalizedY = velocity.y / speed;
            this.ball.body.setVelocity(normalizedX * this.ballSpeed, normalizedY * this.ballSpeed);
        }

        // Check if ball fell off screen
        if (this.ball.y > 600) {
            this.resetBall();
        }
    }

    resetBall() {
        // Reset ball to paddle
        this.ball.setPosition(this.paddle.x, this.paddle.y - 30);
        this.ball.body.setVelocity(0, 0);
        
        // Launch after a short delay
        this.time.delayedCall(1000, () => {
            if (this.gameStarted) {
                this.launchBall();
            }
        });
    }

    checkCollisions() {
        // Ball vs Paddle collision
        this.physics.add.collider(this.ball, this.paddle, () => {
            // Add some spin based on where ball hits paddle
            const hitPoint = this.ball.x - this.paddle.x;
            const normalizedHit = hitPoint / (this.paddle.width / 2);
            const spin = normalizedHit * 0.5;
            
            const velocity = this.ball.body.velocity;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            const angle = Math.atan2(velocity.y, velocity.x) + spin;
            
            this.ball.body.setVelocity(
                Math.cos(angle) * speed,
                Math.abs(Math.sin(angle)) * speed // Always bounce up
            );
        });

        // Ball vs Blocks collision
        this.blocks.forEach(block => {
            if (block.active) {
                this.physics.add.collider(this.ball, block, () => {
                    this.hitBlock(block);
                });
            }
        });
    }

    hitBlock(block) {
        block.hits++;
        
        if (block.hits >= block.maxHits) {
            // Block destroyed
            this.score += block.points;
            this.updateScore();
            block.destroy();
            this.blocks.splice(this.blocks.indexOf(block), 1);
            
            // Add some visual effect
            this.createBlockDestroyEffect(block.x, block.y);
        } else {
            // Block damaged but not destroyed
            const alpha = 1 - (block.hits / block.maxHits) * 0.5;
            block.setAlpha(alpha);
        }
    }

    createBlockDestroyEffect(x, y) {
        // Create particle effect
        for (let i = 0; i < 5; i++) {
            const particle = this.add.circle(x, y, 3, 0xffff00);
            this.physics.add.existing(particle);
            particle.body.setVelocity(
                Phaser.Math.Between(-200, 200),
                Phaser.Math.Between(-200, 200)
            );
            
            // Fade out and destroy
            this.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    updateScore() {
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
        
        if (this.blocksText) {
            this.blocksText.setText(`Blocks: ${this.blocks.length}`);
        }
    }

    updateTimer() {
        this.gameTime += 16; // Assuming 60fps
        
        if (this.timerText && this.timerText.active) {
            const timeLeft = Math.max(0, Math.floor((this.maxGameTime - this.gameTime) / 1000));
            this.timerText.setText(`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`);
            
            if (timeLeft <= 10) {
                this.timerText.setFill('#ff0000'); // Red when time is low
            } else {
                this.timerText.setFill('#ffffff'); // White normally
            }
        }
    }

    endGame() {
        this.gameStarted = false;
        
        let result = '';
        let gameResult = '';
        
        if (this.blocks.length === 0) {
            result = 'All Blocks Destroyed!';
            gameResult = `Victory!\n${result}\nFinal Score: ${this.score}`;
        } else {
            result = 'Time\'s Up!';
            gameResult = `${result}\nFinal Score: ${this.score}\nBlocks Remaining: ${this.blocks.length}`;
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
        if (this.countdownEvent) {
            this.countdownEvent.destroy();
        }
    }

    onDestroy() {
        this.onShutdown();
    }
}

export default BlockBreakerScene;
