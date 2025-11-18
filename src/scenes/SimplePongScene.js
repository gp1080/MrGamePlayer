import Phaser from 'phaser';

class SimplePongScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SimplePongScene' });
        this.paddles = {};
        this.ball = null;
        this.scores = { left: 0, right: 0 };
        this.scoreTexts = {};
        this.gameStarted = false;
        this.playerSide = 'left'; // 'left' or 'right'
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute in milliseconds
        this.ballSpeedIncrease = 0; // Track speed increases
        this.maxSpeedIncreases = 3; // Maximum speed increases before sudden death
        this.onGameComplete = null;
    }

    init(data) {
        this.playerSide = data.playerSide || 'left';
        this.roomId = data.roomId;
        this.wsConnection = data.wsConnection;
        this.numPlayers = data.numPlayers || 2;
        this.gameType = data.gameType || 'pong';
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create ball texture (robust canvas-based to avoid drawImage nulls)
        if (!this.textures.exists('ball')) {
            const ballTex = this.textures.createCanvas('ball', 16, 16);
            const ctx = ballTex.getContext();
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(8, 8, 8, 0, Math.PI * 2);
                ctx.fill();
                ballTex.refresh();
            }
        }

        // Create game elements and set world bounds (top/bottom only collide)
        this.physics.world.setBounds(0, 0, 800, 600);
        // Collide only with top (up) and bottom (down) walls; left/right are open goals
        this.physics.world.setBoundsCollision(false, false, true, true);

        this.createField();
        this.createPaddles();
        this.createBall();
        this.createScoreDisplay();
        this.setupInput();
        this.setupCollisions();
        
        // Start countdown
        this.startCountdown();

        // Cleanup on shutdown/destroy to avoid timers acting on destroyed text
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
    }

    createField() {
        // Draw center line
        const centerLine = this.add.graphics();
        centerLine.lineStyle(2, 0xFFFFFF, 0.3);
        centerLine.beginPath();
        centerLine.moveTo(400, 0);
        centerLine.lineTo(400, 600);
        centerLine.strokePath();

        // Draw top and bottom boundaries
        centerLine.lineStyle(2, 0xFFFFFF, 0.8);
        centerLine.beginPath();
        centerLine.moveTo(0, 0);
        centerLine.lineTo(800, 0);
        centerLine.moveTo(0, 600);
        centerLine.lineTo(800, 600);
        centerLine.strokePath();
    }

    createPaddles() {
        // Create paddles as rectangles
        this.paddles.left = this.add.rectangle(50, 300, 10, 100, 0xFFFFFF);
        this.paddles.right = this.add.rectangle(750, 300, 10, 100, 0xFFFFFF);

        // Add physics to paddles with better settings
        this.physics.add.existing(this.paddles.left, true);
        this.physics.add.existing(this.paddles.right, true);
        
        // Set paddle physics properties for better collision detection
        this.paddles.left.body.setSize(10, 100);
        this.paddles.right.body.setSize(10, 100);
    }

    createBall() {
        // Create ball
        this.ball = this.physics.add.sprite(400, 300, 'ball');
        this.ball.setCircle(8);
        this.ball.setBounce(1, 1);
        // Collide with world bounds (only top/bottom are enabled above)
        this.ball.setCollideWorldBounds(true);
        this.ball.body.onWorldBounds = true;
        this.physics.world.on('worldbounds', (body, up, down, left, right) => {
            if (body.gameObject !== this.ball) return;
            // If hit left/right world bound (should be disabled, but guard anyway), treat as score
            if (!this.scoringCooldown) {
                if (left) {
                    this.scoringCooldown = true;
                    this.scores.right++;
                    this.updateScore();
                    this.resetBallAfterScore('right');
                } else if (right) {
                    this.scoringCooldown = true;
                    this.scores.left++;
                    this.updateScore();
                    this.resetBallAfterScore('left');
                }
            }
        });
        this.ball.setVelocity(0, 0);
        this.scoringCooldown = false;
    }

    createScoreDisplay() {
        const textStyle = {
            fontSize: '32px',
            fill: '#fff'
        };

        this.scoreTexts.left = this.add.text(300, 50, '0', textStyle);
        this.scoreTexts.right = this.add.text(500, 50, '0', textStyle);
        
        // Add timer display
        this.timerText = this.add.text(400, 20, '1:00', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
    }

    setupInput() {
        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        // Add mouse/touch control
        this.input.on('pointermove', (pointer) => {
            if (this.playerSide === 'left') {
                this.paddles.left.y = Phaser.Math.Clamp(pointer.y, 50, 550);
            } else {
                this.paddles.right.y = Phaser.Math.Clamp(pointer.y, 50, 550);
            }
        });
    }

    setupCollisions() {
        // Add colliders between ball and paddles with better collision detection
        this.physics.add.collider(this.ball, this.paddles.left, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.paddles.right, this.hitPaddle, null, this);
        
        // Add overlap detection as backup for fast movement
        this.physics.add.overlap(this.ball, this.paddles.left, this.handlePaddleOverlap, null, this);
        this.physics.add.overlap(this.ball, this.paddles.right, this.handlePaddleOverlap, null, this);
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
                        this.countdownText.destroy();
                        this.countdownText = null;
                    }
                    this.gameStarted = true;
                    this.resetBall();
                }
            }
        });
    }

    hitPaddle(ball, paddle) {
        // Prevent multiple hits in quick succession
        if (this.lastHitTime && (Date.now() - this.lastHitTime) < 30) {
            return;
        }
        this.lastHitTime = Date.now();
        
        this.processPaddleHit(ball, paddle);
    }
    
    handlePaddleOverlap(ball, paddle) {
        // Backup collision detection for fast paddle movement
        if (this.lastHitTime && (Date.now() - this.lastHitTime) < 30) {
            return;
        }
        
        // Check if ball is actually overlapping with paddle (not just touching)
        const ballBounds = ball.getBounds();
        const paddleBounds = paddle.getBounds();
        
        if (ballBounds.intersects(paddleBounds)) {
            this.lastHitTime = Date.now();
            this.processPaddleHit(ball, paddle);
        }
    }
    
    processPaddleHit(ball, paddle) {
        // Calculate where on the paddle the ball hit (0 = center, -1 = top, 1 = bottom)
        const paddleCenter = paddle.y;
        const ballCenter = ball.y;
        const paddleHalfHeight = paddle.displayHeight / 2;
        const hitPosition = (ballCenter - paddleCenter) / paddleHalfHeight;
        
        // Clamp hit position to valid range
        const normalizedHit = Phaser.Math.Clamp(hitPosition, -1, 1);
        
        // Calculate bounce angle based on hit position
        // Hit near top of paddle = ball goes up, hit near bottom = ball goes down
        const maxAngle = Math.PI / 3; // 60 degrees max
        const bounceAngle = normalizedHit * maxAngle;
        
        // Determine horizontal direction (away from paddle)
        const isLeftPaddle = (paddle === this.paddles.left);
        const horizontalDirection = isLeftPaddle ? 1 : -1;
        
        // Calculate new velocity
        const currentSpeed = Math.max(ball.body.speed, 300);
        const newSpeed = Math.min(currentSpeed * 1.05, 600); // Slight speed increase, capped
        
        const newVx = newSpeed * Math.cos(bounceAngle) * horizontalDirection;
        const newVy = newSpeed * Math.sin(bounceAngle);
        
        // Apply new velocity
        ball.setVelocity(newVx, newVy);
        
        // Force ball position outside paddle to prevent sticking
        if (isLeftPaddle) {
            ball.x = paddle.x + paddle.displayWidth / 2 + ball.displayWidth / 2 + 10;
        } else {
            ball.x = paddle.x - paddle.displayWidth / 2 - ball.displayWidth / 2 - 10;
        }
        
        // Keep ball within playable area
        ball.y = Phaser.Math.Clamp(ball.y, 20, 580);
    }
    
    checkManualCollisions() {
        // Manual collision detection for fast paddle movement
        if (this.lastHitTime && (Date.now() - this.lastHitTime) < 30) {
            return;
        }
        
        const ball = this.ball;
        const leftPaddle = this.paddles.left;
        const rightPaddle = this.paddles.right;
        
        // Check collision with left paddle
        if (this.checkPaddleCollision(ball, leftPaddle)) {
            this.lastHitTime = Date.now();
            this.processPaddleHit(ball, leftPaddle);
            return;
        }
        
        // Check collision with right paddle
        if (this.checkPaddleCollision(ball, rightPaddle)) {
            this.lastHitTime = Date.now();
            this.processPaddleHit(ball, rightPaddle);
        }
    }
    
    checkPaddleCollision(ball, paddle) {
        const ballX = ball.x;
        const ballY = ball.y;
        const ballRadius = 8;
        
        const paddleX = paddle.x;
        const paddleY = paddle.y;
        const paddleWidth = 10;
        const paddleHeight = 100;
        
        // Check if ball is within paddle bounds
        const leftEdge = paddleX - paddleWidth / 2;
        const rightEdge = paddleX + paddleWidth / 2;
        const topEdge = paddleY - paddleHeight / 2;
        const bottomEdge = paddleY + paddleHeight / 2;
        
        return (ballX - ballRadius < rightEdge && 
                ballX + ballRadius > leftEdge && 
                ballY - ballRadius < bottomEdge && 
                ballY + ballRadius > topEdge);
    }

    resetBall() {
        this.ball.setPosition(400, 300);
        const angle = Math.random() * Math.PI / 2 - Math.PI / 4;
        const baseSpeed = 400;
        const speedMultiplier = 1 + (this.ballSpeedIncrease * 0.3);
        const speed = baseSpeed * speedMultiplier;
        this.ball.setVelocity(
            Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
            Math.sin(angle) * speed
        );
        this.scoringCooldown = false;
    }

    resetBallAfterScore(scoredSide) {
        // Pause briefly and serve towards the player who conceded last point
        this.ball.setVelocity(0, 0);
        this.ball.setPosition(400, 300);
        this.time.delayedCall(500, () => {
            const baseSpeed = 400;
            const speedMultiplier = 1 + (this.ballSpeedIncrease * 0.3);
            const speed = baseSpeed * speedMultiplier;
            const angle = (Math.random() - 0.5) * (Math.PI / 3);
            const dir = scoredSide === 'left' ? 1 : -1; // serve towards the opponent
            this.ball.setVelocity(Math.cos(angle) * speed * dir, Math.sin(angle) * speed);
            this.scoringCooldown = false;
        });
    }

    update() {
        // Do not update if scene is shutting down or not running
        if (!this.gameStarted || this.sys.isTransitioning() || !this.scene.isActive()) return;

        // Handle keyboard input with smoother movement
        const paddleSpeed = 8; // Increased speed for better responsiveness
        
        if (this.playerSide === 'left') {
            if (this.cursors.up.isDown || this.wasd.W.isDown) {
                this.paddles.left.y = Phaser.Math.Clamp(this.paddles.left.y - paddleSpeed, 50, 550);
            } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
                this.paddles.left.y = Phaser.Math.Clamp(this.paddles.left.y + paddleSpeed, 50, 550);
            }
        } else {
            if (this.cursors.up.isDown || this.wasd.W.isDown) {
                this.paddles.right.y = Phaser.Math.Clamp(this.paddles.right.y - paddleSpeed, 50, 550);
            } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
                this.paddles.right.y = Phaser.Math.Clamp(this.paddles.right.y + paddleSpeed, 50, 550);
            }
        }
        
        // Manual collision check for fast movement (backup to physics system)
        this.checkManualCollisions();

        // Check for scoring with small offscreen buffer; prevent double count
        if (!this.scoringCooldown) {
            if (this.ball.x < -10) {
                this.scoringCooldown = true;
                this.scores.right++;
                this.updateScore();
                this.resetBallAfterScore('right');
            } else if (this.ball.x > 810) {
                this.scoringCooldown = true;
                this.scores.left++;
                this.updateScore();
                this.resetBallAfterScore('left');
            }
        }

        // Game timer
        this.gameTime += 16; // Assuming 60fps
        this.updateTimer();
        
        if (this.gameTime >= this.maxGameTime) {
            this.endGame();
        }
        
        // Check for speed increase if no one has scored
        this.checkSpeedIncrease();
    }

    updateScore() {
        if (this.scoreTexts.left && this.scoreTexts.left.active) {
            this.scoreTexts.left.setText(this.scores.left.toString());
        }
        if (this.scoreTexts.right && this.scoreTexts.right.active) {
            this.scoreTexts.right.setText(this.scores.right.toString());
        }
    }
    
    updateTimer() {
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
        // Increase ball speed if no one has scored and we haven't reached max increases
        if (this.ballSpeedIncrease < this.maxSpeedIncreases) {
            const timeForSpeedIncrease = (this.ballSpeedIncrease + 1) * 15000; // Every 15 seconds
            if (this.gameTime >= timeForSpeedIncrease && this.scores.left === 0 && this.scores.right === 0) {
                this.increaseBallSpeed();
            }
        }
    }
    
    increaseBallSpeed() {
        this.ballSpeedIncrease++;
        const speedMultiplier = 1 + (this.ballSpeedIncrease * 0.3); // 30% increase each time
        
        // Update current ball velocity
        const currentVx = this.ball.body.velocity.x;
        const currentVy = this.ball.body.velocity.y;
        this.ball.setVelocity(currentVx * speedMultiplier, currentVy * speedMultiplier);
        
        
        console.log(`Ball speed increased! Level: ${this.ballSpeedIncrease}`);
    }

    endGame() {
        this.gameStarted = false;
        
        let _winner = '';
        let gameResult = '';
        
        if (this.scores.left > this.scores.right) {
            _winner = 'Left Player';
            gameResult = `Left Player wins ${this.scores.left}-${this.scores.right}!`;
        } else if (this.scores.right > this.scores.left) {
            _winner = 'Right Player';
            gameResult = `Right Player wins ${this.scores.right}-${this.scores.left}!`;
        } else {
            // Tie - check if we need sudden death
            if (this.ballSpeedIncrease >= this.maxSpeedIncreases) {
                _winner = 'Sudden Death!';
                gameResult = 'Sudden Death! First to score wins!';
            } else {
                _winner = 'Tie';
                gameResult = `Tie! ${this.scores.left}-${this.scores.right}`;
            }
        }
        
        this.gameOverText = this.add.text(400, 300, `Time's Up!\n${gameResult}`, {
            fontSize: '28px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Auto-complete after 5 seconds
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
        if (this.scoreTexts) {
            if (this.scoreTexts.left && this.scoreTexts.left.active) this.scoreTexts.left.destroy();
            if (this.scoreTexts.right && this.scoreTexts.right.active) this.scoreTexts.right.destroy();
        }
        if (this.gameOverText && this.gameOverText.active) {
            this.gameOverText.destroy();
            this.gameOverText = null;
        }
        // Remove input listeners
        if (this.input) {
            this.input.removeAllListeners();
        }
    }

    onDestroy() {
        this.onShutdown();
    }
}

export default SimplePongScene;
