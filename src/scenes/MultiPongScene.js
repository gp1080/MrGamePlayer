import Phaser from 'phaser';

class MultiPongScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MultiPongScene' });
        this.paddles = {};
        this.balls = [];
        this.scores = {};
        this.scoreTexts = {};
        this.gameStarted = false;
        this.playerPosition = null;
        this.centerX = 400;
        this.centerY = 300;
        this.arenaRadius = 250;
        this.ballSpeed = 200;
        this.countdownTime = 3;
        this.numPlayers = 4; // Set default number of players
        this.angleStep = (2 * Math.PI) / this.numPlayers;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 60 seconds
        this.gameEnded = false;
        this.playerColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00]; // Red, Green, Blue, Yellow
        this.zoneGraphics = [];
        this.maxBalls = 5; // Maximum number of balls on screen
        this.ballSpawnInterval = 3000; // Spawn new ball every 3 seconds
        this.lastBallSpawnTime = 0;
    }

    init(data) {
        this.playerPosition = data.playerPosition || 0;
        this.roomId = data.roomId;
        this.wsConnection = data.wsConnection;
        this.numPlayers = data.numPlayers || 4;
        this.gameType = data.gameType || 'pong';
        this.onGameComplete = data.onGameComplete;
        this.angleStep = (2 * Math.PI) / this.numPlayers;
    }

    create() {
        // Create ball texture first
        const ballTexture = this.add.graphics();
        ballTexture.fillStyle(0xFFFFFF);
        ballTexture.fillCircle(8, 8, 8);
        ballTexture.generateTexture('ball', 16, 16);
        ballTexture.destroy();

        // Create game elements
        this.createArena();
        this.createPaddles();
        this.createBalls();
        this.createScoreDisplay();
        this.createTimer();
        this.setupInput();
        this.setupCollisions();
        
        // Initialize scores
        for (let i = 0; i < this.numPlayers; i++) {
            this.scores[i] = 0;
        }

        // Start countdown using graphics
        this.startCountdownWithGraphics();
    }

    createArena() {
        // Create colored zones showing paddle movement area for each player
        // Each player gets equal share - no gaps, no overlaps
        // Colors match EXACT paddle movement limits (same calculation as movePaddle)
        const zoneAngle = (2 * Math.PI) / this.numPlayers;
        const maxAngleOffset = Math.PI / this.numPlayers; // Full sector per player
        
        // Paddle distance from center (same as in createPaddles)
        const paddleDistance = this.arenaRadius - 20;
        
        for (let i = 0; i < this.numPlayers; i++) {
            const baseAngle = i * zoneAngle;
            // Match EXACT paddle movement limits - paddles can move from baseAngle ± maxAngleOffset
            // This is the EXACT SAME calculation used in movePaddle()
            const startAngle = baseAngle - maxAngleOffset;
            const endAngle = baseAngle + maxAngleOffset;
            const color = this.playerColors[i] || 0xFFFFFF;
            
            const zoneGraphics = this.add.graphics();
            zoneGraphics.fillStyle(color, 0.3); // More visible
            
            // Draw arc segment showing paddle movement zone
            // Zones extend from inner radius to where paddles actually are
            const innerRadius = this.arenaRadius - 80;
            const outerRadius = paddleDistance + 30; // Extend slightly beyond paddle for visibility
            
            // Draw the sector as a pie slice from center
            zoneGraphics.beginPath();
            zoneGraphics.moveTo(this.centerX, this.centerY);
            
            // Draw outer arc from start to end angle
            const steps = 40; // More steps for smoother arc
            for (let step = 0; step <= steps; step++) {
                const t = step / steps;
                const angle = startAngle + (endAngle - startAngle) * t;
                const x = this.centerX + Math.cos(angle) * outerRadius;
                const y = this.centerY + Math.sin(angle) * outerRadius;
                zoneGraphics.lineTo(x, y);
            }
            
            // Draw back along inner radius
            for (let step = steps; step >= 0; step--) {
                const t = step / steps;
                const angle = startAngle + (endAngle - startAngle) * t;
                const x = this.centerX + Math.cos(angle) * innerRadius;
                const y = this.centerY + Math.sin(angle) * innerRadius;
                zoneGraphics.lineTo(x, y);
            }
            
            zoneGraphics.closePath();
            zoneGraphics.fillPath();
            
            // Draw border lines at sector boundaries (where one player's area ends and next begins)
            zoneGraphics.lineStyle(4, color, 1.0); // Thicker, fully opaque borders
            // Left border (start angle - where this player's area begins)
            const leftX1 = this.centerX + Math.cos(startAngle) * innerRadius;
            const leftY1 = this.centerY + Math.sin(startAngle) * innerRadius;
            const leftX2 = this.centerX + Math.cos(startAngle) * outerRadius;
            const leftY2 = this.centerY + Math.sin(startAngle) * outerRadius;
            zoneGraphics.lineBetween(leftX1, leftY1, leftX2, leftY2);
            // Right border (end angle - where this player's area ends)
            const rightX1 = this.centerX + Math.cos(endAngle) * innerRadius;
            const rightY1 = this.centerY + Math.sin(endAngle) * innerRadius;
            const rightX2 = this.centerX + Math.cos(endAngle) * outerRadius;
            const rightY2 = this.centerY + Math.sin(endAngle) * outerRadius;
            zoneGraphics.lineBetween(rightX1, rightY1, rightX2, rightY2);
            
            this.zoneGraphics.push(zoneGraphics);
        }
        
        // Draw outer circle boundary
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xFFFFFF, 0.5);
        graphics.strokeCircle(this.centerX, this.centerY, this.arenaRadius);
    }

    createPaddles() {
        for (let i = 0; i < this.numPlayers; i++) {
            const angle = i * this.angleStep;
            const paddleDistance = this.arenaRadius - 20;
            const x = this.centerX + Math.cos(angle) * paddleDistance;
            const y = this.centerY + Math.sin(angle) * paddleDistance;
            
            const color = this.playerColors[i] || 0xFFFFFF;
            const paddle = this.add.rectangle(x, y, 60, 12, color); // Slightly taller for better collision
            paddle.angle = (angle * 180 / Math.PI) + 90;
            
            // Add physics body with proper size
            this.physics.add.existing(paddle, true);
            
            // Set collision box size - make it slightly larger for better detection
            if (paddle.body) {
                paddle.body.setSize(60, 12);
                paddle.body.setOffset(0, 0);
            }
            
            this.paddles[i] = {
                sprite: paddle,
                baseAngle: angle,
                currentAngle: angle,
                baseX: x,
                baseY: y,
                color: color
            };
        }

        console.log('Paddles created:', Object.keys(this.paddles).length);
        console.log('Player position:', this.playerPosition);
    }

    createBalls() {
        // Initialize balls array
        this.balls = [];
        // Spawn initial ball
        this.spawnBall();
    }

    spawnBall() {
        if (this.balls.length >= this.maxBalls || this.gameEnded) return;
        
        // Create a physics sprite for the ball
        const ball = this.physics.add.sprite(this.centerX, this.centerY, 'ball');
        
        if (ball.body) {
            ball.body.setBounce(1, 1);
            ball.body.setCollideWorldBounds(false);
            ball.setScale(0.8);
            ball.baseSpeed = this.ballSpeed;
            
            // Store the ball
            this.balls.push(ball);
            
            // Start ball with random velocity after a short delay
            this.time.delayedCall(500, () => {
                if (ball && ball.body && !this.gameEnded) {
                    const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                    const velocityX = Math.cos(randomAngle) * this.ballSpeed;
                    const velocityY = Math.sin(randomAngle) * this.ballSpeed;
                    ball.body.setVelocity(velocityX, velocityY);
                }
            });
            
            console.log('Ball spawned. Total balls:', this.balls.length);
        } else {
            console.error('Failed to create ball physics body');
        }
    }

    createScoreDisplay() {
        // Create score displays using text with player colors
        // Scores represent "Goals Against" - lower is better
        for (let i = 0; i < this.numPlayers; i++) {
            const angle = i * this.angleStep;
            const distance = this.arenaRadius + 50;
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance;
            
            const color = this.playerColors[i] || 0xFFFFFF;
            const colorHex = '#' + color.toString(16).padStart(6, '0');
            
            const scoreText = this.add.text(x, y, `P${i + 1}: 0`, {
                fontSize: '20px',
                fill: colorHex,
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            });
            scoreText.setOrigin(0.5);
            scoreText.setDepth(10);
            
            this.scoreTexts[i] = scoreText;
        }
    }

    createTimer() {
        this.timerText = this.add.text(this.centerX, 30, '60', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setDepth(10);
    }

    setupInput() {
        // Create cursor keys and store them in the instance
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Add keyboard event listeners
        this.input.keyboard.on('keydown-LEFT', () => {
            this.handlePaddleMovement('left');
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.handlePaddleMovement('right');
        });

        // Add cursor/mouse control (like 2-player version)
        // Enable pointer capture for better mouse tracking
        this.input.setTopOnly(false);
        
        // Store pointer reference for continuous tracking
        this.activePointer = null;
        
        this.input.on('pointermove', (pointer) => {
            this.activePointer = pointer;
            if (this.playerPosition !== null && this.paddles[this.playerPosition] && this.gameStarted) {
                this.handleCursorControl(pointer);
            }
        }, this);

        // Mobile touch controls - swipe gestures
        this.setupTouchControls();

        console.log('Input setup completed');
    }

    handleCursorControl(pointer) {
        const paddle = this.paddles[this.playerPosition];
        if (!paddle || !this.gameStarted) return;

        // Use worldX and worldY for accurate cursor position
        const cursorX = pointer.worldX !== undefined ? pointer.worldX : pointer.x;
        const cursorY = pointer.worldY !== undefined ? pointer.worldY : pointer.y;
        
        // Calculate angle from center to cursor position
        const dx = cursorX - this.centerX;
        const dy = cursorY - this.centerY;
        // eslint-disable-next-line no-unused-vars
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Always respond to cursor movement (remove distance check for better control)
        const cursorAngle = Math.atan2(dy, dx);
        
        // Get player's sector boundaries (EXACT same calculation as movePaddle)
        const maxAngleOffset = Math.PI / this.numPlayers;
        
        // Calculate angle difference from base angle (same logic as movePaddle)
        let angleDiff = Phaser.Math.Angle.Wrap(cursorAngle - paddle.baseAngle);
        
        // Adjust angle difference to be between -PI and PI (same as movePaddle)
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Clamp the angle difference to stay within player's sector (same as movePaddle)
        angleDiff = Phaser.Math.Clamp(angleDiff, -maxAngleOffset, maxAngleOffset);
        
        // Calculate final target angle
        const targetAngle = paddle.baseAngle + angleDiff;
        
        // Move paddle directly to target angle (immediate response, no smoothing delay)
        this.movePaddle(this.playerPosition, targetAngle);
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
                // Horizontal swipe takes priority
                if (absDeltaX > absDeltaY) {
                    if (deltaX > 0) {
                        this.handlePaddleMovement('right');
                    } else {
                        this.handlePaddleMovement('left');
                    }
                }
            }
        });
    }

    handlePaddleMovement(direction) {
        if (!this.paddles[this.playerPosition]) return;
        
        const paddle = this.paddles[this.playerPosition];
        const moveSpeed = 0.1; // Increased for more responsive movement
        
        if (direction === 'left') {
            const newAngle = paddle.currentAngle - moveSpeed;
            this.movePaddle(this.playerPosition, newAngle);
            console.log('Moving paddle left');
        } else if (direction === 'right') {
            const newAngle = paddle.currentAngle + moveSpeed;
            this.movePaddle(this.playerPosition, newAngle);
            console.log('Moving paddle right');
        }
    }

    setupCollisions() {
        // Don't use Phaser colliders - we'll handle collisions manually for better control
        // The manual collision check in update() will handle all collisions
    }

    startCountdownWithGraphics() {
        let count = this.countdownTime;
        const countdownCircle = this.add.graphics();
        
        const updateCountdown = () => {
            countdownCircle.clear();
            countdownCircle.fillStyle(0xFFFFFF, 1);
            countdownCircle.fillCircle(this.centerX, this.centerY, 40);
            
            // Draw the number using shapes instead of text
            if (count > 0) {
                countdownCircle.lineStyle(4, 0x000000);
                // Draw the number using lines
                switch(count) {
                    case 3:
                        countdownCircle.strokeCircle(this.centerX, this.centerY, 20);
                        break;
                    case 2:
                        countdownCircle.lineBetween(this.centerX - 20, this.centerY - 20, this.centerX + 20, this.centerY + 20);
                        break;
                    default:
                        break;
                    case 1:
                        countdownCircle.lineBetween(this.centerX, this.centerY - 20, this.centerX, this.centerY + 20);
                        break;
                }
            }
        };

        updateCountdown();

        const countdownInterval = setInterval(() => {
            count--;
            
            if (count >= 0) {
                updateCountdown();
            } else {
                countdownCircle.clear();
                clearInterval(countdownInterval);
                this.gameStarted = true;
                this.startGame();
            }
        }, 1000);
    }

    startGame() {
        const ball = this.balls[0];
        if (ball && ball.body) {
            const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const velocityX = Math.cos(randomAngle) * this.ballSpeed;
            const velocityY = Math.sin(randomAngle) * this.ballSpeed;
            ball.body.setVelocity(velocityX, velocityY);
            console.log('Ball velocity set:', velocityX, velocityY);
        } else {
            console.error('Cannot start game: Ball or physics body missing');
        }
    }

    createHitEffect(x, y) {
        // Create a simple flash effect instead of particles
        const flash = this.add.circle(x, y, 10, 0xffffff);
        flash.setAlpha(0.8);

        // Animate the flash effect
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    handleBallPaddleCollision(ball, paddleSprite, paddleIndex) {
        if (!ball.body) return;

        // Prevent multiple collisions in quick succession
        const now = this.time.now;
        if (ball.lastCollisionPaddle === paddleIndex && ball.lastCollisionTime && now - ball.lastCollisionTime < 50) {
            return; // Ignore collisions with same paddle within 50ms
        }
        ball.lastCollisionTime = now;
        ball.lastCollisionPaddle = paddleIndex;

        // Get paddle position and angle
        const paddle = this.paddles[paddleIndex];
        // eslint-disable-next-line no-unused-vars
        const paddleX = paddle.sprite.x;
        // eslint-disable-next-line no-unused-vars
        const paddleY = paddle.sprite.y;
        const paddleAngle = paddle.currentAngle;
        
        // Calculate normal vector (pointing outward from center, perpendicular to paddle)
        // Paddle is tangent to circle, so normal points radially outward
        const normalX = Math.cos(paddleAngle);
        const normalY = Math.sin(paddleAngle);
        
        // Get current ball velocity
        const ballVelX = ball.body.velocity.x;
        const ballVelY = ball.body.velocity.y;
        const ballSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
        
        if (ballSpeed === 0) return; // Ball has no velocity
        
        // Calculate reflection: R = V - 2(V·N)N
        // Where V is velocity vector, N is normal vector
        const dotProduct = ballVelX * normalX + ballVelY * normalY;
        const reflectedVelX = ballVelX - 2 * dotProduct * normalX;
        const reflectedVelY = ballVelY - 2 * dotProduct * normalY;
        
        // Calculate new speed
        const newSpeed = Math.min(ballSpeed * 1.1, this.ballSpeed * 2.5);
        
        // Normalize reflected vector and apply new speed
        const reflectedSpeed = Math.sqrt(reflectedVelX * reflectedVelX + reflectedVelY * reflectedVelY);
        const normalizedReflectedX = reflectedSpeed > 0 ? reflectedVelX / reflectedSpeed : 0;
        const normalizedReflectedY = reflectedSpeed > 0 ? reflectedVelY / reflectedSpeed : 0;
        
        // Add slight randomness for unpredictability
        const randomOffset = Phaser.Math.FloatBetween(-0.15, 0.15);
        const finalAngle = Math.atan2(normalizedReflectedY, normalizedReflectedX) + randomOffset;
        
        // Set new velocity
        ball.body.setVelocity(
            Math.cos(finalAngle) * newSpeed,
            Math.sin(finalAngle) * newSpeed
        );
        ball.baseSpeed = newSpeed;
        
        // Push ball away from paddle to prevent stuck collisions
        const pushDistance = 12;
        const pushX = Math.cos(finalAngle) * pushDistance;
        const pushY = Math.sin(finalAngle) * pushDistance;
        ball.setPosition(ball.x + pushX, ball.y + pushY);
        
        // Update physics body position
        if (ball.body) {
            ball.body.x = ball.x;
            ball.body.y = ball.y;
        }
        
        this.createHitEffect(ball.x, ball.y);
        
        console.log('Ball bounced off paddle', paddleIndex, 'New velocity:', ball.body.velocity.x, ball.body.velocity.y);
    }


    movePaddle(position, angle) {
        const paddle = this.paddles[position];
        if (!paddle) {
            console.log('No paddle found for position:', position);
            return;
        }

        // Each player gets equal share of the circle - no gaps, no overlaps
        // For 4 players: each gets π/2 radians (90 degrees)
        const maxAngleOffset = Math.PI / this.numPlayers; // Full sector per player
        
        // Calculate boundaries - each player's area ends where the next starts
        // eslint-disable-next-line no-unused-vars
        const sectorStart = paddle.baseAngle - maxAngleOffset;
        // eslint-disable-next-line no-unused-vars
        const sectorEnd = paddle.baseAngle + maxAngleOffset;
        
        // Normalize the angle
        let angleDiff = Phaser.Math.Angle.Wrap(angle - paddle.baseAngle);
        
        // Adjust angle difference to be between -PI and PI
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Clamp the angle difference to stay within player's sector
        angleDiff = Phaser.Math.Clamp(angleDiff, -maxAngleOffset, maxAngleOffset);
        
        // Calculate new angle and position
        const newAngle = paddle.baseAngle + angleDiff;
        const paddleDistance = this.arenaRadius - 20;
        
        // Update paddle position and rotation
        const newX = this.centerX + Math.cos(newAngle) * paddleDistance;
        const newY = this.centerY + Math.sin(newAngle) * paddleDistance;
        
        paddle.sprite.setPosition(newX, newY);
        paddle.sprite.angle = (newAngle * 180 / Math.PI) + 90;
        paddle.currentAngle = newAngle;
        
        // CRITICAL: Update physics body position immediately
        if (paddle.sprite.body) {
            paddle.sprite.body.x = newX;
            paddle.sprite.body.y = newY;
            paddle.sprite.body.updateFromGameObject();
        }
    }

    checkManualCollisions(ball) {
        if (!ball.body) return;
        
        const ballX = ball.x;
        const ballY = ball.y;
        const ballRadius = 8;
        
        // Check collision with each paddle
        for (let i = 0; i < this.numPlayers; i++) {
            const paddle = this.paddles[i];
            if (!paddle || !paddle.sprite) continue;
            
            const paddleX = paddle.sprite.x;
            const paddleY = paddle.sprite.y;
            const paddleWidth = 60;
            const paddleHeight = 12;
            
            // Get paddle angle in radians (current angle, not visual angle)
            const paddleAngle = paddle.currentAngle;
            
            // Calculate distance from ball to paddle center
            const dx = ballX - paddleX;
            const dy = ballY - paddleY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Quick distance check - if too far, skip
            if (distance > paddleWidth / 2 + ballRadius + 20) continue;
            
            // Rotate ball position to paddle's local coordinate system
            const cos = Math.cos(-paddleAngle);
            const sin = Math.sin(-paddleAngle);
            const rotatedX = dx * cos - dy * sin;
            const rotatedY = dx * sin + dy * cos;
            
            // Check if ball overlaps with paddle rectangle
            const margin = 12; // Collision margin
            const halfWidth = paddleWidth / 2 + ballRadius + margin;
            const halfHeight = paddleHeight / 2 + ballRadius + margin;
            
            if (Math.abs(rotatedX) <= halfWidth && Math.abs(rotatedY) <= halfHeight) {
                // Ball is colliding with paddle
                // Check if ball is moving toward paddle (not away)
                const ballVelX = ball.body.velocity.x;
                const ballVelY = ball.body.velocity.y;
                const ballSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
                
                if (ballSpeed > 10) { // Minimum speed threshold
                    // Calculate dot product to check if moving toward paddle
                    const toPaddleX = dx / distance;
                    const toPaddleY = dy / distance;
                    const dotProduct = (ballVelX * toPaddleX + ballVelY * toPaddleY);
                    
                    // If dot product is negative, ball is moving toward paddle
                    if (dotProduct < 0) {
                        // Ball is moving toward paddle - handle collision
                        this.handleBallPaddleCollision(ball, paddle.sprite, i);
                        break; // Only handle one collision per frame
                    }
                } else {
                    // Ball is very slow or stopped, still bounce it
                    this.handleBallPaddleCollision(ball, paddle.sprite, i);
                    break;
                }
            }
        }
    }

    checkBallBounds(ball) {
        if (!ball.body || this.gameEnded) return;

        const dx = ball.x - this.centerX;
        const dy = ball.y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.arenaRadius + 20) {
            // Ball went out - determine which player's area it exited from
            // That player gets a goal scored AGAINST them (lower score is better)
            const exitAngle = Math.atan2(dy, dx);
            
            // Normalize exit angle to [0, 2π]
            let normalizedExitAngle = exitAngle;
            while (normalizedExitAngle < 0) normalizedExitAngle += 2 * Math.PI;
            while (normalizedExitAngle >= 2 * Math.PI) normalizedExitAngle -= 2 * Math.PI;
            
            // Find which player's sector the ball exited from
            let scoredAgainstPlayer = 0;
            let minDistance = Infinity;
            
            for (let i = 0; i < this.numPlayers; i++) {
                const paddle = this.paddles[i];
                const maxAngleOffset = Math.PI / this.numPlayers;
                const sectorStart = paddle.baseAngle - maxAngleOffset;
                const sectorEnd = paddle.baseAngle + maxAngleOffset;
                
                // Normalize sector boundaries
                const normalizeAngle = (angle) => {
                    let normalized = angle;
                    while (normalized < 0) normalized += 2 * Math.PI;
                    while (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;
                    return normalized;
                };
                
                const normalizedSectorStart = normalizeAngle(sectorStart);
                const normalizedSectorEnd = normalizeAngle(sectorEnd);
                
                // Check if exit angle is in this player's sector
                let inSector = false;
                if (normalizedSectorStart <= normalizedSectorEnd) {
                    inSector = normalizedExitAngle >= normalizedSectorStart && normalizedExitAngle <= normalizedSectorEnd;
                } else {
                    inSector = normalizedExitAngle >= normalizedSectorStart || normalizedExitAngle <= normalizedSectorEnd;
                }
                
                if (inSector) {
                    // Calculate distance from exit point to sector center
                    const sectorCenter = normalizeAngle(paddle.baseAngle);
                    let angleDiff = Math.abs(normalizedExitAngle - sectorCenter);
                    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                    
                    if (angleDiff < minDistance) {
                        minDistance = angleDiff;
                        scoredAgainstPlayer = i;
                    }
                }
            }
            
            // Increment goals against for the player whose area the ball exited from
            if (!this.scores[scoredAgainstPlayer]) this.scores[scoredAgainstPlayer] = 0;
            this.scores[scoredAgainstPlayer]++;
            this.updateScore(scoredAgainstPlayer, this.scores[scoredAgainstPlayer]);
            
            // Remove the ball
            this.removeBall(ball);
        }
    }

    removeBall(ball) {
        // Find and remove ball from array
        const index = this.balls.indexOf(ball);
        if (index > -1) {
            this.balls.splice(index, 1);
        }
        
        // Destroy the ball sprite
        if (ball && ball.body) {
            ball.body.setVelocity(0, 0);
        }
        if (ball) {
            ball.destroy();
        }
    }

    resetBall(ball) {
        if (ball.body) {
            ball.setPosition(this.centerX, this.centerY);
            ball.body.setVelocity(0, 0);
            ball.baseSpeed = this.ballSpeed;
            
            this.time.delayedCall(1000, () => {
                const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const velocityX = Math.cos(randomAngle) * this.ballSpeed;
                const velocityY = Math.sin(randomAngle) * this.ballSpeed;
                ball.body.setVelocity(velocityX, velocityY);
            });
        }
    }

    updateScore(playerIndex, goalsAgainst) {
        const scoreText = this.scoreTexts[playerIndex];
        if (scoreText) {
            const color = this.playerColors[playerIndex] || 0xFFFFFF;
            const colorHex = '#' + color.toString(16).padStart(6, '0');
            scoreText.setText(`P${playerIndex + 1}: ${goalsAgainst}`);
            scoreText.setStyle({ fill: colorHex });
        }
    }

    update(time, delta) {
        if (!this.gameStarted || this.gameEnded) return;

        // Update game timer
        this.gameTime += delta;
        const remainingTime = Math.max(0, Math.ceil((this.maxGameTime - this.gameTime) / 1000));
        
        if (this.timerText) {
            this.timerText.setText(remainingTime.toString());
            if (remainingTime <= 10) {
                this.timerText.setTint(0xFF0000); // Red when time is low
            }
        }

        // Check if game should end
        if (this.gameTime >= this.maxGameTime) {
            this.endGame();
            return;
        }

        // Spawn new balls periodically
        if (this.gameTime - this.lastBallSpawnTime >= this.ballSpawnInterval) {
            this.spawnBall();
            this.lastBallSpawnTime = this.gameTime;
        }

        // Update all balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            if (ball && ball.body) {
                this.checkBallBounds(ball);
                
                // Manual collision check for more reliable detection
                this.checkManualCollisions(ball);
            }
        }

        // Handle continuous keyboard input for human player
        if (this.playerPosition !== null && this.paddles[this.playerPosition]) {
            const paddle = this.paddles[this.playerPosition];
            const moveSpeed = 0.12; // Slightly faster for better responsiveness

            if (this.cursors.left.isDown) {
                const newAngle = paddle.currentAngle - moveSpeed;
                this.movePaddle(this.playerPosition, newAngle);
            }
            else if (this.cursors.right.isDown) {
                const newAngle = paddle.currentAngle + moveSpeed;
                this.movePaddle(this.playerPosition, newAngle);
            }
        }
        
        // Handle cursor control continuously in update loop (like 2-player version)
        if (this.playerPosition !== null && this.paddles[this.playerPosition] && this.gameStarted) {
            const pointer = this.input.activePointer || this.activePointer;
            if (pointer) {
                // Continuously track cursor position
                this.handleCursorControl(pointer);
            }
        }
        
        // Update AI players
        this.updateAI(delta);
        
        // Update all paddle physics bodies
        Object.values(this.paddles).forEach(paddle => {
            if (paddle.sprite.body) {
                paddle.sprite.body.updateFromGameObject();
            }
        });
    }

    updateAI(delta) {
        // AI tracks the closest ball to their sector
        if (this.balls.length === 0) return;

        // Find the closest ball to each AI player's sector
        const normalizeAngle = (angle) => {
            let normalized = angle;
            while (normalized < 0) normalized += 2 * Math.PI;
            while (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;
            return normalized;
        };

        // Update each AI player
        for (let i = 0; i < this.numPlayers; i++) {
            // Skip human player
            if (i === this.playerPosition) continue;
            
            const paddle = this.paddles[i];
            if (!paddle) continue;

            const maxAngleOffset = Math.PI / this.numPlayers;
            const sectorStart = paddle.baseAngle - maxAngleOffset;
            const sectorEnd = paddle.baseAngle + maxAngleOffset;
            
            // Find the most relevant ball for this AI player
            let closestBall = null;
            let closestDistance = Infinity;
            let closestBallAngle = 0;
            let closestBallSpeed = 0;
            let closestBallMovingOutward = false;
            
            for (const ball of this.balls) {
                if (!ball || !ball.body) continue;
                
                const ballX = ball.x;
                const ballY = ball.y;
                const ballVelX = ball.body.velocity.x;
                const ballVelY = ball.body.velocity.y;
                const ballSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
                
                const ballToCenterX = ballX - this.centerX;
                const ballToCenterY = ballY - this.centerY;
                const ballDistance = Math.sqrt(ballToCenterX * ballToCenterX + ballToCenterY * ballToCenterY);
                const ballAngle = Math.atan2(ballToCenterY, ballToCenterX);
                const ballMovingOutward = (ballVelX * ballToCenterX + ballVelY * ballToCenterY) > 0;
                
                const normalizedBallAngle = normalizeAngle(ballAngle);
                const normalizedSectorStart = normalizeAngle(sectorStart);
                const normalizedSectorEnd = normalizeAngle(sectorEnd);
                
                // Check if ball is in this player's sector
                let ballInSector = false;
                if (normalizedSectorStart <= normalizedSectorEnd) {
                    ballInSector = normalizedBallAngle >= normalizedSectorStart && normalizedBallAngle <= normalizedSectorEnd;
                } else {
                    ballInSector = normalizedBallAngle >= normalizedSectorStart || normalizedBallAngle <= normalizedSectorEnd;
                }
                
                // Prioritize balls in sector or moving toward it
                if (ballInSector || (ballMovingOutward && ballDistance < this.arenaRadius + 100)) {
                    if (ballDistance < closestDistance) {
                        closestDistance = ballDistance;
                        closestBall = ball;
                        closestBallAngle = ballAngle;
                        closestBallSpeed = ballSpeed;
                        closestBallMovingOutward = ballMovingOutward;
                    }
                }
            }
            
            if (!closestBall) continue;
            
            // Calculate target angle - where paddle should be to intercept ball
            let targetAngle = closestBallAngle;
            
            // Predict ball position when it reaches paddle radius (if moving outward)
            if (closestBallMovingOutward && closestDistance < this.arenaRadius + 100 && closestBallSpeed > 50) {
                const distanceToPaddle = this.arenaRadius - closestDistance;
                if (distanceToPaddle > 0) {
                    const timeToReach = distanceToPaddle / closestBallSpeed;
                    if (timeToReach > 0 && timeToReach < 3) {
                        // Predict future position
                        const futureX = closestBall.x + closestBall.body.velocity.x * timeToReach;
                        const futureY = closestBall.y + closestBall.body.velocity.y * timeToReach;
                        const futureAngle = Math.atan2(futureY - this.centerY, futureX - this.centerX);
                        targetAngle = futureAngle;
                    }
                }
            }
            
            // Calculate angle difference from paddle to target
            let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - paddle.currentAngle);
            
            // Determine if AI should react
            const ballNearSector = Math.abs(angleDiff) < maxAngleOffset * 2;
            const shouldReact = ballNearSector && 
                               closestDistance < this.arenaRadius + 150 &&
                               closestBallSpeed > 30;
            
            if (shouldReact) {
                // AI movement - faster and more accurate
                const aiSpeed = 0.18; // Base speed
                const moveAmount = Math.min(Math.abs(angleDiff), aiSpeed);
                
                // AI accuracy - 85% perfect reaction, 15% slight delay
                const reactionChance = 0.85;
                
                if (Math.random() < reactionChance && Math.abs(angleDiff) > 0.03) {
                    if (angleDiff > 0) {
                        // Move right (counter-clockwise)
                        const newAngle = paddle.currentAngle + moveAmount;
                        this.movePaddle(i, newAngle);
                    } else {
                        // Move left (clockwise)
                        const newAngle = paddle.currentAngle - moveAmount;
                        this.movePaddle(i, newAngle);
                    }
                }
            } else {
                // Ball is far away or not relevant - return to center of sector
                const centerAngle = paddle.baseAngle;
                const centerDiff = Phaser.Math.Angle.Wrap(centerAngle - paddle.currentAngle);
                
                if (Math.abs(centerDiff) > 0.05) {
                    const returnSpeed = 0.1;
                    const returnAmount = Math.min(Math.abs(centerDiff), returnSpeed);
                    const newAngle = centerDiff > 0 ? 
                        paddle.currentAngle + returnAmount : 
                        paddle.currentAngle - returnAmount;
                    this.movePaddle(i, newAngle);
                }
            }
        }
    }

    endGame() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.gameStarted = false;

        // Stop all balls
        this.balls.forEach(ball => {
            if (ball && ball.body) {
                ball.body.setVelocity(0, 0);
            }
        });

        // Determine winner - player with LEAST goals against wins
        let winner = 0;
        let minScore = this.scores[0] || 0;
        for (let i = 1; i < this.numPlayers; i++) {
            const score = this.scores[i] || 0;
            if (score < minScore) {
                minScore = score;
                winner = i;
            }
        }

        // Check for ties
        const winners = [];
        for (let i = 0; i < this.numPlayers; i++) {
            const score = this.scores[i] || 0;
            if (score === minScore) {
                winners.push(i);
            }
        }

        // Display winner message
        const winnerText = winners.length === 1 
            ? `Player ${winner + 1} Wins!`
            : `Tie! Players ${winners.map(w => w + 1).join(', ')}`;

        const gameOverText = this.add.text(this.centerX, this.centerY, winnerText, {
            fontSize: '48px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(20);

        // Show final scores (Goals Against - lower is better)
        let scoreDisplay = 'Goals Against (Lower is Better):\n';
        for (let i = 0; i < this.numPlayers; i++) {
            const score = this.scores[i] || 0;
            scoreDisplay += `Player ${i + 1}: ${score}\n`;
        }

        const scoresText = this.add.text(this.centerX, this.centerY + 80, scoreDisplay, {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        scoresText.setOrigin(0.5);
        scoresText.setDepth(20);

        // Call completion callback after 3 seconds
        this.time.delayedCall(3000, () => {
            if (this.onGameComplete) {
                this.onGameComplete({
                    winner: winners.length === 1 ? winner : null,
                    scores: this.scores,
                    isTie: winners.length > 1
                });
            }
        });
    }
}

export default MultiPongScene; 