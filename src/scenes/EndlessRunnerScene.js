import Phaser from 'phaser';

class EndlessRunnerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndlessRunnerScene' });
        this.player = null;
        this.player2 = null; // Second player for 1v1
        this.obstacles = [];
        this.coins = [];
        this.score = 0;
        this.score2 = 0; // Second player score
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.player1SurvivalTime = 0; // Track when player 1 died (or current time if alive)
        this.player2SurvivalTime = 0; // Track when player 2 died (or current time if alive)
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.players = [];
        this.alivePlayers = 0;
        this.playerHat2 = null;
        this.playerBeard2 = null;
        this.groundY = 500;
        this.jumpPower = -650; // Balanced jump power for good jump height
        this.gravity = 1500; // Balanced gravity for faster landing
        this.gameSpeed = 200;
        this.baseGameSpeed = 200; // Base speed for speed increase over time
        this.obstacleSpawnRate = 0.03; // Balanced spawn rate for playable gameplay
        this.coinSpawnRate = 0.02;
        this.speedIncreaseRate = 0.3; // Speed increase per second
        this.lastObstacleX = 0; // Track last obstacle position for spacing
        this.minObstacleDistance = 150; // Reasonable minimum distance for playable gameplay
        this.cursors = null;
        this.space = null;
        this.downKey = null; // Down arrow or S for player 1 crouch
        this.sKey = null;
        this.upKey = null; // Arrow up or W for player 2
        this.wKey = null;
        // Player 2 uses different keys for crouch to avoid conflicts
        // P2 crouch: X key (or we can use a different approach)
        this.playerHat = null;
        this.playerBeard = null;
        this.scoreText = null;
        this.timerText = null;
        this.countdownText = null;
        this.countdownTimer = 0;
        this.countdownActive = false;
        this.countdownEvent = null;
        this.gameEnded = false;
        this.obstacleColliders = []; // Store collider references
        this.spaceKeyWasDown = false; // Track space key state
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Set up physics
        this.physics.world.gravity.y = this.gravity;
        console.log('Physics world gravity set to:', this.physics.world.gravity.y);
        console.log('Game configured for online token betting - 1v1 competitive mode');

        // Create background
        this.createBackground();

        // Create ground
        this.createGround();

        // Create players (1v1)
        this.createPlayer();
        this.createPlayer2();

        // Create UI
        this.createUI();

        // Set up controls
        this.setupControls();

        // Start countdown
        this.startCountdown();
    }

    createBackground() {
        // Create a simple background
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB); // Sky blue
    }

    createGround() {
        // Ground platform
        this.ground = this.add.rectangle(400, this.groundY, 800, 100, 0x8B4513);
        this.physics.add.existing(this.ground, true);
    }

    createPlayer() {
        // Create gnome runner - position on ground surface
        // Ground top is at groundY - 50 = 450
        // Player radius is 20, so player center should be at 450 - 20 = 430
        const groundTop = this.groundY - 50;
        this.player = this.add.circle(100, groundTop - 20, 20, 0x4A90E2); // Blue color, positioned on ground
        this.player.setStrokeStyle(3, 0x000000); // Black border for visibility
        this.physics.add.existing(this.player);
        
        // Track if player is on ground - start on ground
        this.player.isOnGround = true; // Start on ground
        this.player.alive = true;
        this.player.score = 0;
        this.player.distance = 0;
        this.player.canJump = true;
        this.player.isCrouching = false;
        this.player.normalHeight = 40; // Normal collision height
        this.player.crouchHeight = 15; // Crouch collision height (reduced for better triangle clearance)
        
        // Set up physics body properties on next frame to ensure body is ready
        this.time.delayedCall(50, () => {
            if (this.player && this.player.body) {
                this.player.body.setBounce(0.1);
                this.player.body.setCollideWorldBounds(false);
                this.player.body.setSize(40, 40);
                this.player.body.setOffset(-20, -20);
                
                // Add ground collision - use collider for physics but also check position
                this.physics.add.collider(this.player, this.ground, () => {
                    // This helps with physics, but we'll use position-based check for jump
                    if (this.player.body.velocity.y >= 0) {
                        this.player.isOnGround = true;
                        this.player.canJump = true;
                    }
                });
            }
        });
        
        // Add gnome hat (bright red for visibility)
        this.playerHat = this.add.triangle(this.player.x, this.player.y - 25, 0, 0, -10, 10, 10, 10, 0xFF0000);
        this.playerHat.setDepth(1);
        this.playerHat.setStrokeStyle(2, 0x000000); // Black border for visibility
        
        // Add gnome beard (darker brown for contrast)
        this.playerBeard = this.add.ellipse(this.player.x, this.player.y + 5, 16, 10, 0x8B4513);
        this.playerBeard.setDepth(1);
        this.playerBeard.setStrokeStyle(1, 0x000000); // Black border
        
        console.log('Player 1 created at:', this.player.x, this.player.y);
    }

    createPlayer2() {
        // Create second gnome runner - position on ground surface, close to player 1
        const groundTop = this.groundY - 50;
        this.player2 = this.add.circle(150, groundTop - 20, 20, 0xFF6B6B); // Red color for player 2, close to player 1
        this.player2.setStrokeStyle(3, 0x000000); // Black border for visibility
        this.physics.add.existing(this.player2);
        
        // Track if player is on ground - start on ground
        this.player2.isOnGround = true;
        this.player2.alive = true;
        this.player2.score = 0;
        this.player2.distance = 0;
        this.player2.canJump = true;
        this.player2.isCrouching = false;
        this.player2.normalHeight = 40; // Normal collision height
        this.player2.crouchHeight = 15; // Crouch collision height (reduced for better triangle clearance)
        
        // Set up physics body properties on next frame to ensure body is ready
        this.time.delayedCall(50, () => {
            if (this.player2 && this.player2.body) {
                this.player2.body.setBounce(0.1);
                this.player2.body.setCollideWorldBounds(false);
                this.player2.body.setSize(40, 40);
                this.player2.body.setOffset(-20, -20);
                
                // Add ground collision
                this.physics.add.collider(this.player2, this.ground, () => {
                    if (this.player2.body.velocity.y >= 0) {
                        this.player2.isOnGround = true;
                        this.player2.canJump = true;
                    }
                });
            }
        });
        
        // Add gnome hat (green for player 2)
        this.playerHat2 = this.add.triangle(this.player2.x, this.player2.y - 25, 0, 0, -10, 10, 10, 10, 0x00FF00);
        this.playerHat2.setDepth(1);
        this.playerHat2.setStrokeStyle(2, 0x000000);
        
        // Add gnome beard
        this.playerBeard2 = this.add.ellipse(this.player2.x, this.player2.y + 5, 16, 10, 0x8B4513);
        this.playerBeard2.setDepth(1);
        this.playerBeard2.setStrokeStyle(1, 0x000000);
        
        console.log('Player 2 created at:', this.player2.x, this.player2.y);
    }

    createUI() {
        // Player 1 score text
        this.scoreText = this.add.text(16, 16, 'P1 Score: 0', {
            fontSize: '32px',
            fill: '#000'
        });
        this.scoreText.setDepth(10);

        // Timer text
        this.timerText = this.add.text(16, 50, 'Time: 60', {
            fontSize: '24px',
            fill: '#000'
        });
        this.timerText.setDepth(10);
        
        // Instructions (only show on desktop, mobile uses touch buttons)
        const isMobile = this.sys.game.device.input.touch;
        if (!isMobile) {
            this.instructionsText = this.add.text(400, 550, 'P1: SPACE (jump), DOWN/S (crouch) | P2: UP/W (jump), X (crouch)', {
                fontSize: '16px',
                fill: '#000',
                fontStyle: 'bold'
            });
            this.instructionsText.setOrigin(0.5);
            this.instructionsText.setDepth(10);
        }
        
        // Player 2 score text
        this.score2Text = this.add.text(16, 90, 'P2 Score: 0', {
            fontSize: '32px',
            fill: '#000'
        });
        this.score2Text.setDepth(10);
    }

    setupControls() {
        // Keyboard controls - Player 1: SPACE (jump), DOWN/S (crouch)
        // Player 2: UP/W (jump), X (crouch)
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        // Player 2 crouch uses X key to avoid conflict with Player 1
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // Prevent keys from scrolling the page
        this.input.keyboard.on('keydown', (event) => {
            if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW' || 
                event.code === 'ArrowDown' || event.code === 'KeyS' || event.code === 'KeyX') {
                event.preventDefault();
            }
        });
        
        // Track key states
        this.spaceKeyWasDown = false;
        this.downKeyWasDown = false;
        this.sKeyWasDown = false;
        this.upKeyWasDown = false;
        this.wKeyWasDown = false;
        this.xKeyWasDown = false;
        
        // Mobile touch controls
        this.setupTouchControls();
        
        console.log('Controls set up - P1: SPACE (jump), DOWN/S (crouch) | P2: UP/W (jump), X (crouch)');
    }

    setupTouchControls() {
        // Create touch zones for mobile devices - only show controls for the current player
        // Since players are on different devices via WebSocket, each device only needs its own controls
        
        // Determine which player this device controls (0 = Player 1, 1 = Player 2)
        const isPlayer1 = this.playerPosition === 0;
        
        // Touch state tracking
        this.p1JumpPressed = false;
        this.p1CrouchPressed = false;
        this.p2JumpPressed = false;
        this.p2CrouchPressed = false;
        this.p1JumpJustPressed = false;
        this.p2JumpJustPressed = false;
        
        if (isPlayer1) {
            // Player 1 controls - positioned at bottom corners to be less intrusive
            // Jump button (bottom left)
            this.p1JumpZone = this.add.rectangle(60, 550, 60, 60, 0x4A90E2, 0.15);
            this.p1JumpZone.setInteractive({ useHandCursor: true });
            this.p1JumpZone.setDepth(20);
            this.p1JumpZone.setStrokeStyle(1, 0x000000, 0.5);
            this.p1JumpText = this.add.text(60, 550, '↑', {
                fontSize: '24px',
                fill: '#000',
                fontStyle: 'bold',
                align: 'center'
            });
            this.p1JumpText.setOrigin(0.5);
            this.p1JumpText.setDepth(21);
            
            // Crouch button (bottom left, below jump)
            this.p1CrouchZone = this.add.rectangle(60, 520, 60, 60, 0x4A90E2, 0.15);
            this.p1CrouchZone.setInteractive({ useHandCursor: true });
            this.p1CrouchZone.setDepth(20);
            this.p1CrouchZone.setStrokeStyle(1, 0x000000, 0.5);
            this.p1CrouchText = this.add.text(60, 520, '↓', {
                fontSize: '24px',
                fill: '#000',
                fontStyle: 'bold',
                align: 'center'
            });
            this.p1CrouchText.setOrigin(0.5);
            this.p1CrouchText.setDepth(21);
            
            // Player 1 jump touch events
            this.p1JumpZone.on('pointerdown', () => {
                this.p1JumpPressed = true;
                this.p1JumpJustPressed = true;
            });
            this.p1JumpZone.on('pointerup', () => {
                this.p1JumpPressed = false;
            });
            this.p1JumpZone.on('pointerout', () => {
                this.p1JumpPressed = false;
            });
            
            // Player 1 crouch touch events
            this.p1CrouchZone.on('pointerdown', () => {
                this.p1CrouchPressed = true;
            });
            this.p1CrouchZone.on('pointerup', () => {
                this.p1CrouchPressed = false;
            });
            this.p1CrouchZone.on('pointerout', () => {
                this.p1CrouchPressed = false;
            });
        } else {
            // Player 2 controls - positioned at bottom corners to be less intrusive
            // Jump button (bottom right)
            this.p2JumpZone = this.add.rectangle(740, 550, 60, 60, 0xFF6B6B, 0.15);
            this.p2JumpZone.setInteractive({ useHandCursor: true });
            this.p2JumpZone.setDepth(20);
            this.p2JumpZone.setStrokeStyle(1, 0x000000, 0.5);
            this.p2JumpText = this.add.text(740, 550, '↑', {
                fontSize: '24px',
                fill: '#000',
                fontStyle: 'bold',
                align: 'center'
            });
            this.p2JumpText.setOrigin(0.5);
            this.p2JumpText.setDepth(21);
            
            // Crouch button (bottom right, below jump)
            this.p2CrouchZone = this.add.rectangle(740, 520, 60, 60, 0xFF6B6B, 0.15);
            this.p2CrouchZone.setInteractive({ useHandCursor: true });
            this.p2CrouchZone.setDepth(20);
            this.p2CrouchZone.setStrokeStyle(1, 0x000000, 0.5);
            this.p2CrouchText = this.add.text(740, 520, '↓', {
                fontSize: '24px',
                fill: '#000',
                fontStyle: 'bold',
                align: 'center'
            });
            this.p2CrouchText.setOrigin(0.5);
            this.p2CrouchText.setDepth(21);
            
            // Player 2 jump touch events
            this.p2JumpZone.on('pointerdown', () => {
                this.p2JumpPressed = true;
                this.p2JumpJustPressed = true;
            });
            this.p2JumpZone.on('pointerup', () => {
                this.p2JumpPressed = false;
            });
            this.p2JumpZone.on('pointerout', () => {
                this.p2JumpPressed = false;
            });
            
            // Player 2 crouch touch events
            this.p2CrouchZone.on('pointerdown', () => {
                this.p2CrouchPressed = true;
            });
            this.p2CrouchZone.on('pointerup', () => {
                this.p2CrouchPressed = false;
            });
            this.p2CrouchZone.on('pointerout', () => {
                this.p2CrouchPressed = false;
            });
        }
    }

    startCountdown() {
        this.countdownActive = true;
        this.countdownTimer = 3;
        
        this.countdownText = this.add.text(400, 300, '3', {
            fontSize: '64px',
            fill: '#FF0000'
        });
        this.countdownText.setOrigin(0.5);
        this.countdownText.setDepth(10);
        
        // Countdown timer - store reference to event
        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                // Safety check - if text is destroyed, remove event
                if (!this.countdownText || !this.countdownText.active) {
                    if (this.countdownEvent) {
                        this.countdownEvent.remove();
                        this.countdownEvent = null;
                    }
                    return;
                }
                
                this.countdownTimer--;
                if (this.countdownTimer > 0) {
                    if (this.countdownText && this.countdownText.active) {
                        this.countdownText.setText(this.countdownTimer.toString());
                    }
                } else {
                    if (this.countdownText && this.countdownText.active) {
                        this.countdownText.setText('GO!');
                    }
                    this.time.delayedCall(500, () => {
                        if (this.countdownText && this.countdownText.active) {
                            this.countdownText.destroy();
                        }
                        this.countdownText = null;
                        this.countdownActive = false;
                        this.gameStarted = true;
                        
                        // Remove countdown event
                        if (this.countdownEvent) {
                            this.countdownEvent.remove();
                            this.countdownEvent = null;
                        }
                        
                        console.log('Game started!');
                    });
                }
            },
            repeat: 3
        });
    }

    update(time, delta) {
        if (!this.gameStarted) {
            return;
        }

        // Update players
        this.updatePlayer(delta);
        this.updatePlayer2(delta);

        // Update player 1 hat and beard to follow player
        if (this.player && this.player.alive) {
            if (this.playerHat) {
                this.playerHat.x = this.player.x;
                this.playerHat.y = this.player.y - 25;
            }
            if (this.playerBeard) {
                this.playerBeard.x = this.player.x;
                this.playerBeard.y = this.player.y + 5;
            }
        }
        
        // Update player 2 hat and beard to follow player
        if (this.player2 && this.player2.alive) {
            if (this.playerHat2) {
                this.playerHat2.x = this.player2.x;
                this.playerHat2.y = this.player2.y - 25;
            }
            if (this.playerBeard2) {
                this.playerBeard2.x = this.player2.x;
                this.playerBeard2.y = this.player2.y + 5;
            }
        }

        // Spawn obstacles and coins
        this.spawnObjects();

        // Update obstacles
        this.updateObstacles(delta);

        // Update coins
        this.updateCoins(delta);

        // Check collisions
        this.checkCollisions();

        // Update timer
        this.updateTimer(delta);
        
        // Increase game speed over time
        this.updateGameSpeed(delta);

        // Check game end
        const bothDead = (!this.player || !this.player.alive) && (!this.player2 || !this.player2.alive);
        if (this.gameTime >= this.maxGameTime || bothDead) {
            this.endGame();
        }
    }

    updatePlayer(delta) {
        if (!this.player || !this.player.alive || !this.player.body) return;
        if (!this.gameStarted) return;

        // Check if player is on ground
        const playerBottom = this.player.y + 20;
        const groundTop = this.groundY - 50;
        this.player.isOnGround = Math.abs(playerBottom - groundTop) <= 5 && this.player.body.velocity.y >= -10;
        
        if (this.player.isOnGround) {
            this.player.canJump = true;
        }

        // Handle crouching - can only crouch when on ground (keyboard or touch)
        const downPressed = (this.downKey && this.downKey.isDown) || (this.sKey && this.sKey.isDown) || this.p1CrouchPressed;
        if (downPressed && this.player.isOnGround && !this.player.isCrouching) {
            this.player.isCrouching = true;
            // Adjust collision box for crouching
            if (this.player.body) {
                this.player.body.setSize(40, this.player.crouchHeight);
                this.player.body.setOffset(-20, 20 - this.player.crouchHeight / 2);
            }
            // Make visual smaller (scale down)
            this.player.setScale(1, 0.5);
        } else if (!downPressed && this.player.isCrouching) {
            this.player.isCrouching = false;
            // Restore normal collision box
            if (this.player.body) {
                this.player.body.setSize(40, this.player.normalHeight);
                this.player.body.setOffset(-20, -20);
            }
            // Restore visual scale
            this.player.setScale(1, 1);
        }

        // Handle jumping - can't jump while crouching (keyboard or touch)
        const spacePressed = (this.space && this.space.isDown) || this.p1JumpPressed;
        const spaceJustPressed = (spacePressed && !this.spaceKeyWasDown) || this.p1JumpJustPressed;
        const canJumpNow = this.player.isOnGround && !this.player.isCrouching;
        
        if (spaceJustPressed && canJumpNow) {
            this.player.body.setVelocityY(this.jumpPower);
            this.player.canJump = false;
            this.player.isOnGround = false;
        }
        
        // Update key states
        this.spaceKeyWasDown = spacePressed;
        this.downKeyWasDown = (this.downKey && this.downKey.isDown) || false;
        this.sKeyWasDown = (this.sKey && this.sKey.isDown) || false;
        this.p1JumpJustPressed = false; // Reset just-pressed flag

        // Update distance
        const deltaSeconds = delta / 1000;
        this.player.distance += this.gameSpeed * deltaSeconds;
    }

    updatePlayer2(delta) {
        if (!this.player2 || !this.player2.alive || !this.player2.body) return;
        if (!this.gameStarted) return;

        // Check if player is on ground
        const playerBottom = this.player2.y + 20;
        const groundTop = this.groundY - 50;
        this.player2.isOnGround = Math.abs(playerBottom - groundTop) <= 5 && this.player2.body.velocity.y >= -10;
        
        if (this.player2.isOnGround) {
            this.player2.canJump = true;
        }

        // Handle crouching - can only crouch when on ground (keyboard or touch)
        const xPressed = (this.xKey && this.xKey.isDown) || this.p2CrouchPressed;
        if (xPressed && this.player2.isOnGround && !this.player2.isCrouching) {
            this.player2.isCrouching = true;
            // Adjust collision box for crouching
            if (this.player2.body) {
                this.player2.body.setSize(40, this.player2.crouchHeight);
                this.player2.body.setOffset(-20, 20 - this.player2.crouchHeight / 2);
            }
            // Make visual smaller (scale down)
            this.player2.setScale(1, 0.5);
        } else if (!xPressed && this.player2.isCrouching) {
            this.player2.isCrouching = false;
            // Restore normal collision box
            if (this.player2.body) {
                this.player2.body.setSize(40, this.player2.normalHeight);
                this.player2.body.setOffset(-20, -20);
            }
            // Restore visual scale
            this.player2.setScale(1, 1);
        }

        // Handle jumping - UP arrow or W key or touch - can't jump while crouching
        const upPressed = (this.upKey && this.upKey.isDown) || (this.wKey && this.wKey.isDown) || this.p2JumpPressed;
        const upJustPressed = (upPressed && !this.upKeyWasDown && !this.wKeyWasDown) || this.p2JumpJustPressed;
        const canJumpNow = this.player2.isOnGround && !this.player2.isCrouching;
        
        if (upJustPressed && canJumpNow) {
            this.player2.body.setVelocityY(this.jumpPower);
            this.player2.canJump = false;
            this.player2.isOnGround = false;
        }
        
        // Update key states
        this.upKeyWasDown = (this.upKey && this.upKey.isDown) || false;
        this.wKeyWasDown = (this.wKey && this.wKey.isDown) || false;
        this.xKeyWasDown = (this.xKey && this.xKey.isDown) || false;
        this.p2JumpJustPressed = false; // Reset just-pressed flag

        // Update distance
        const deltaSeconds = delta / 1000;
        this.player2.distance += this.gameSpeed * deltaSeconds;
    }

    spawnObjects() {
        // Spawn obstacles with minimum distance between them
        const spawnX = 900; // Spawn position
        
        // Find the rightmost obstacle position (closest to spawn point)
        let rightmostObstacleX = 0;
        if (this.obstacles.length > 0) {
            this.obstacles.forEach(obstacle => {
                if (obstacle && obstacle.active && obstacle.x > rightmostObstacleX) {
                    rightmostObstacleX = obstacle.x;
                }
            });
        }
        
        // Check if enough distance from rightmost obstacle to spawn point
        // If no obstacles yet (rightmostObstacleX is 0), allow first spawn
        // Otherwise, check if rightmost obstacle has moved far enough left
        const distanceFromLast = spawnX - rightmostObstacleX;
        const canSpawn = rightmostObstacleX === 0 || distanceFromLast >= this.minObstacleDistance;
        
        // High spawn rate - spawn obstacles frequently when distance allows
        if (canSpawn && Math.random() < this.obstacleSpawnRate) {
            this.spawnObstacle();
        }

        // Spawn coins
        if (Math.random() < this.coinSpawnRate) {
            this.spawnCoin();
        }
    }

    spawnObstacle() {
        const groundTop = this.groundY - 50;
        const obstacleType = Math.random() < 0.5 ? 'rectangle' : 'triangle';
        let obstacle;
        
        if (obstacleType === 'rectangle') {
            // Smaller rectangle obstacle
            const obstacleHeight = 45; // Reduced from 60
            const obstacleWidth = 25; // Reduced from 30
            const obstacleY = groundTop - obstacleHeight / 2; // Center obstacle so bottom is at ground top
            obstacle = this.add.rectangle(900, obstacleY, obstacleWidth, obstacleHeight, 0xff0000);
            obstacle.setStrokeStyle(2, 0x000000); // Black border for visibility
            obstacle.obstacleType = 'rectangle';
            obstacle.obstacleWidth = obstacleWidth;
            obstacle.obstacleHeight = obstacleHeight;
            
            this.physics.add.existing(obstacle, true);
            
            // Ensure obstacle has proper collision body
            if (obstacle.body) {
                obstacle.body.setSize(obstacleWidth, obstacleHeight);
                obstacle.body.setOffset(0, 0);
            }
        } else {
            // Triangle obstacle (pointing up) - positioned higher so crouching players can pass under
            // Crouch height is 15, so triangle should be taller and positioned higher
            const triangleHeight = 70; // Increased to 70 for more clearance
            const triangleWidth = 30;
            // Position triangle so its bottom is above ground, allowing crouching players to pass under
            // Triangle bottom should be at least 30px above ground for better crouch clearance
            const triangleBottomOffset = 30; // Increased from 20 to 30px for more clearance
            const obstacleY = groundTop - triangleBottomOffset - triangleHeight / 2;
            
            // Create triangle using polygon (pointing upward)
            obstacle = this.add.polygon(900, obstacleY, [
                0, triangleHeight / 2,           // Bottom left
                -triangleWidth / 2, -triangleHeight / 2,  // Top left
                triangleWidth / 2, -triangleHeight / 2     // Top right
            ], 0xff6600); // Orange color for triangles
            obstacle.setStrokeStyle(2, 0x000000); // Black border
            obstacle.obstacleType = 'triangle';
            obstacle.obstacleWidth = triangleWidth;
            obstacle.obstacleHeight = triangleHeight;
            
            this.physics.add.existing(obstacle, true);
            
            // Set up collision body for triangle
            if (obstacle.body) {
                obstacle.body.setSize(triangleWidth, triangleHeight);
                obstacle.body.setOffset(-triangleWidth / 2, -triangleHeight / 2);
            }
        }
        
        // Note: We're using manual collision detection in checkCollisions() instead of Phaser overlap
        // This gives us more control over crouch detection and prevents false positives
        
        this.obstacles.push(obstacle);
    }

    spawnCoin() {
        // Position coin above ground, at jumpable height
        const groundTop = this.groundY - 50;
        const coinY = groundTop - 60; // Position coin at jump height
        const coin = this.add.circle(900, coinY, 10, 0xFFD700);
        this.physics.add.existing(coin, true);
        coin.collected = false;
        
        // Set up coin collision body
        if (coin.body) {
            coin.body.setSize(20, 20);
        }
        
        this.coins.push(coin);
    }

    updateObstacles(delta) {
        const deltaSeconds = delta / 1000;
        this.obstacles.forEach((obstacle, index) => {
            if (obstacle && obstacle.active) {
                const newX = obstacle.x - this.gameSpeed * deltaSeconds;
                obstacle.x = newX;
                
                // Update physics body position for collision detection
                if (obstacle.body) {
                    obstacle.body.x = newX;
                    obstacle.body.updateFromGameObject();
                }
                
                // Don't update lastObstacleX here - it's tracked in spawnObjects based on spawn position
                
                if (obstacle.x < -50) {
                    // Remove collider before destroying (if any exist)
                    const colliderIndex = this.obstacleColliders.findIndex(c => c && (c.gameObject1 === obstacle || c.gameObject2 === obstacle));
                    if (colliderIndex > -1) {
                        const collider = this.obstacleColliders[colliderIndex];
                        if (collider) {
                            this.physics.world.removeCollider(collider);
                        }
                        this.obstacleColliders.splice(colliderIndex, 1);
                    }
                    obstacle.destroy();
                    this.obstacles.splice(index, 1);
                }
            }
        });
    }

    updateCoins(delta) {
        const deltaSeconds = delta / 1000;
        this.coins.forEach((coin, index) => {
            if (coin && coin.active && !coin.collected) {
                const newX = coin.x - this.gameSpeed * deltaSeconds;
                coin.x = newX;
                
                // Update physics body position
                if (coin.body) {
                    coin.body.x = newX;
                    coin.body.updateFromGameObject();
                }
                
                if (coin.x < -50) {
                    coin.destroy();
                    this.coins.splice(index, 1);
                }
            }
        });
    }

    checkCollisions() {
        const groundTop = this.groundY - 50;
        
        // Player 1 ground collision
        if (this.player && this.player.alive && this.player.body) {
            const playerBottom = this.player.y + 20;
            if (playerBottom >= groundTop) {
                this.player.y = groundTop - 20;
                if (this.player.body.velocity.y >= 0) {
                    this.player.body.setVelocityY(0);
                }
                this.player.isOnGround = true;
                this.player.canJump = true;
            }
        }
        
        // Player 2 ground collision
        if (this.player2 && this.player2.alive && this.player2.body) {
            const player2Bottom = this.player2.y + 20;
            if (player2Bottom >= groundTop) {
                this.player2.y = groundTop - 20;
                if (this.player2.body.velocity.y >= 0) {
                    this.player2.body.setVelocityY(0);
                }
                this.player2.isOnGround = true;
                this.player2.canJump = true;
            }
        }

        // Player vs Obstacles - manual check every frame
        for (let index = 0; index < this.obstacles.length; index++) {
            const obstacle = this.obstacles[index];
            if (obstacle && obstacle.active && obstacle.body) {
                const obstacleWidth = obstacle.obstacleWidth || 25;
                const obstacleHeight = obstacle.obstacleHeight || 45;
                const obstacleType = obstacle.obstacleType || 'rectangle';
                
                // Player 1 collision
                if (this.player && this.player.alive && this.player.body) {
                    // Get player bounds based on crouch state
                    const playerRadius = 20;
                    const playerLeft = this.player.x - playerRadius;
                    const playerRight = this.player.x + playerRadius;
                    let playerTop, playerBottom;
                    
                    if (this.player.isCrouching) {
                        // When crouching, player is lower and smaller
                        playerTop = this.player.y - this.player.crouchHeight / 2;
                        playerBottom = this.player.y + this.player.crouchHeight / 2;
                    } else {
                        // Normal player bounds
                        playerTop = this.player.y - playerRadius;
                        playerBottom = this.player.y + playerRadius;
                    }
                    
                    // For triangles, check if player has passed FIRST (before proximity check)
                    if (obstacleType === 'triangle') {
                        const obstacleRight = obstacle.x + obstacleWidth / 2;
                        // IMPORTANT: If player has completely passed the triangle (their RIGHT edge is past triangle's RIGHT edge),
                        // they are safe to uncrouch - no collision check needed
                        // Use a small buffer (15px) to ensure they're fully clear
                        const hasPassedTriangle = playerRight > (obstacleRight + 15);
                        
                        if (hasPassedTriangle) {
                            // Player has completely passed the triangle - safe to uncrouch, skip collision entirely
                            continue;
                        }
                    }
                    
                    // Only check collision if player is close enough (reduce false positives)
                    const dx = Math.abs(this.player.x - obstacle.x);
                    const dy = Math.abs(this.player.y - obstacle.y);
                    
                    if (dx < 35 && dy < 60) {
                        let obstacleLeft, obstacleRight, obstacleTop, obstacleBottom;
                        
                        if (obstacleType === 'triangle') {
                            // Triangle collision - use bounding box
                            obstacleLeft = obstacle.x - obstacleWidth / 2;
                            obstacleRight = obstacle.x + obstacleWidth / 2;
                            obstacleTop = obstacle.y - obstacleHeight / 2;
                            obstacleBottom = obstacle.y + obstacleHeight / 2;
                            
                            // Only check collision if player hasn't passed the triangle yet
                            // Check horizontal overlap
                            if (playerRight > obstacleLeft && playerLeft < obstacleRight) {
                                if (this.player.isCrouching) {
                                    // When crouching, player can pass under if their top is below triangle bottom
                                    const crouchPlayerTop = this.player.y - this.player.crouchHeight / 2;
                                    const crouchPlayerBottom = this.player.y + this.player.crouchHeight / 2;
                                    
                                    // Player can pass under if their crouch top is below triangle bottom (with clearance)
                                    const canPassUnder = crouchPlayerTop < obstacleBottom - 8; // 8px clearance for safety
                                    
                                    // Only check collision if player cannot pass under AND their body overlaps with triangle
                                    if (!canPassUnder && crouchPlayerBottom > obstacleTop && crouchPlayerTop < obstacleBottom) {
                                        this.killPlayer();
                                        return;
                                    }
                                    // If canPassUnder is true, player passes under safely - no collision at all
                                } else {
                                    // When standing, player always collides with triangle if overlapping
                                    if (playerBottom > obstacleTop && playerTop < obstacleBottom) {
                                        this.killPlayer();
                                        return;
                                    }
                                }
                            }
                        } else {
                            // Rectangle collision - use tighter bounds
                            obstacleLeft = obstacle.x - obstacleWidth / 2;
                            obstacleRight = obstacle.x + obstacleWidth / 2;
                            obstacleTop = obstacle.y - obstacleHeight / 2;
                            obstacleBottom = obstacle.y + obstacleHeight / 2;
                            
                            // Only collide if there's actual overlap (not just proximity)
                            if (playerRight > obstacleLeft && playerLeft < obstacleRight &&
                                playerBottom > obstacleTop && playerTop < obstacleBottom) {
                                this.killPlayer();
                                return;
                            }
                        }
                    }
                }
                
                // Player 2 collision
                if (this.player2 && this.player2.alive && this.player2.body) {
                    // Get player bounds based on crouch state
                    const playerRadius = 20;
                    const player2Left = this.player2.x - playerRadius;
                    const player2Right = this.player2.x + playerRadius;
                    let player2Top, player2Bottom;
                    
                    if (this.player2.isCrouching) {
                        // When crouching, player is lower and smaller
                        player2Top = this.player2.y - this.player2.crouchHeight / 2;
                        player2Bottom = this.player2.y + this.player2.crouchHeight / 2;
                    } else {
                        // Normal player bounds
                        player2Top = this.player2.y - playerRadius;
                        player2Bottom = this.player2.y + playerRadius;
                    }
                    
                    // For triangles, check if player has passed FIRST (before proximity check)
                    if (obstacleType === 'triangle') {
                        const obstacleRight = obstacle.x + obstacleWidth / 2;
                        // IMPORTANT: If player has completely passed the triangle (their RIGHT edge is past triangle's RIGHT edge),
                        // they are safe to uncrouch - no collision check needed
                        // Use a small buffer (15px) to ensure they're fully clear
                        const hasPassedTriangle = player2Right > (obstacleRight + 15);
                        
                        if (hasPassedTriangle) {
                            // Player has completely passed the triangle - safe to uncrouch, skip collision entirely
                            continue;
                        }
                    }
                    
                    // Only check collision if player is close enough (reduce false positives)
                    const dx = Math.abs(this.player2.x - obstacle.x);
                    const dy = Math.abs(this.player2.y - obstacle.y);
                    
                    if (dx < 35 && dy < 60) {
                        let obstacleLeft, obstacleRight, obstacleTop, obstacleBottom;
                        
                        if (obstacleType === 'triangle') {
                            // Triangle collision - use bounding box
                            obstacleLeft = obstacle.x - obstacleWidth / 2;
                            obstacleRight = obstacle.x + obstacleWidth / 2;
                            obstacleTop = obstacle.y - obstacleHeight / 2;
                            obstacleBottom = obstacle.y + obstacleHeight / 2;
                            
                            // Only check collision if player hasn't passed the triangle yet
                            // Check horizontal overlap
                            if (player2Right > obstacleLeft && player2Left < obstacleRight) {
                                if (this.player2.isCrouching) {
                                    // When crouching, player can pass under if their top is below triangle bottom
                                    const crouchPlayer2Top = this.player2.y - this.player2.crouchHeight / 2;
                                    const crouchPlayer2Bottom = this.player2.y + this.player2.crouchHeight / 2;
                                    
                                    // Player can pass under if their crouch top is below triangle bottom (with clearance)
                                    const canPassUnder = crouchPlayer2Top < obstacleBottom - 8; // 8px clearance for safety
                                    
                                    // Only check collision if player cannot pass under AND their body overlaps with triangle
                                    if (!canPassUnder && crouchPlayer2Bottom > obstacleTop && crouchPlayer2Top < obstacleBottom) {
                                        this.killPlayer2();
                                        return;
                                    }
                                    // If canPassUnder is true, player passes under safely - no collision at all
                                } else {
                                    // When standing, player always collides with triangle if overlapping
                                    if (player2Bottom > obstacleTop && player2Top < obstacleBottom) {
                                        this.killPlayer2();
                                        return;
                                    }
                                }
                            }
                        } else {
                            // Rectangle collision - use tighter bounds
                            obstacleLeft = obstacle.x - obstacleWidth / 2;
                            obstacleRight = obstacle.x + obstacleWidth / 2;
                            obstacleTop = obstacle.y - obstacleHeight / 2;
                            obstacleBottom = obstacle.y + obstacleHeight / 2;
                            
                            // Only collide if there's actual overlap (not just proximity)
                            if (player2Right > obstacleLeft && player2Left < obstacleRight &&
                                player2Bottom > obstacleTop && player2Top < obstacleBottom) {
                                this.killPlayer2();
                                return;
                            }
                        }
                    }
                }
            }
        }

        // Player vs Coins - check both players
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (coin && coin.active && !coin.collected && coin.body) {
                // Player 1 coin collection
                if (this.player && this.player.alive && this.player.body) {
                    const dx = Math.abs(this.player.x - coin.x);
                    const dy = Math.abs(this.player.y - coin.y);
                    if (dx < 30 && dy < 30) {
                        this.collectCoin(coin, i, 1);
                        break;
                    }
                }
                
                // Player 2 coin collection
                if (this.player2 && this.player2.alive && this.player2.body) {
                    const dx = Math.abs(this.player2.x - coin.x);
                    const dy = Math.abs(this.player2.y - coin.y);
                    if (dx < 30 && dy < 30) {
                        this.collectCoin(coin, i, 2);
                        break;
                    }
                }
            }
        }
    }

    collectCoin(coin, index, playerNum) {
        if (!coin || coin.collected) return;
        
        coin.collected = true;
        
        // Remove from array first
        if (index > -1 && index < this.coins.length) {
            this.coins.splice(index, 1);
        }
        
        // Then destroy the coin
        if (coin.active) {
            coin.setVisible(false);
            coin.destroy();
        }
        
        // Update score for the correct player
        if (playerNum === 1) {
            this.score += 10;
            if (this.scoreText && this.scoreText.active) {
                this.scoreText.setText('P1 Score: ' + this.score);
            }
        } else if (playerNum === 2) {
            this.score2 += 10;
            if (this.score2Text && this.score2Text.active) {
                this.score2Text.setText('P2 Score: ' + this.score2);
            }
        }
    }

    killPlayer() {
        if (!this.player || !this.player.alive) return;
        this.player.alive = false;
        this.player.setVisible(false);
        
        // Record survival time when player dies
        this.player1SurvivalTime = this.gameTime;
        
        // Hide gnome hat and beard
        if (this.playerHat) {
            this.playerHat.setVisible(false);
        }
        if (this.playerBeard) {
            this.playerBeard.setVisible(false);
        }
        
        console.log('Player 1 crashed! Final score: ' + this.score + ', Survival time: ' + Math.floor(this.player1SurvivalTime / 1000) + 's');
        
        // Check if both players are dead
        if (!this.player2 || !this.player2.alive) {
            this.endGame();
        }
    }

    killPlayer2() {
        if (!this.player2 || !this.player2.alive) return;
        this.player2.alive = false;
        this.player2.setVisible(false);
        
        // Record survival time when player dies
        this.player2SurvivalTime = this.gameTime;
        
        // Hide gnome hat and beard
        if (this.playerHat2) {
            this.playerHat2.setVisible(false);
        }
        if (this.playerBeard2) {
            this.playerBeard2.setVisible(false);
        }
        
        console.log('Player 2 crashed! Final score: ' + this.score2 + ', Survival time: ' + Math.floor(this.player2SurvivalTime / 1000) + 's');
        
        // Check if both players are dead
        if (!this.player || !this.player.alive) {
            this.endGame();
        }
    }

    updateTimer(delta) {
        this.gameTime += delta;
        const remainingTime = Math.max(0, Math.floor((this.maxGameTime - this.gameTime) / 1000));
        if (this.timerText && this.timerText.active) {
            this.timerText.setText('Time: ' + remainingTime);
        }
    }

    updateGameSpeed(delta) {
        // Increase game speed over time for more challenge
        const _deltaSeconds = delta / 1000;
        const timeElapsed = this.gameTime / 1000; // Time in seconds
        this.gameSpeed = this.baseGameSpeed + (this.speedIncreaseRate * timeElapsed);
        
        // Cap maximum speed
        const maxSpeed = 500;
        if (this.gameSpeed > maxSpeed) {
            this.gameSpeed = maxSpeed;
        }
    }

    endGame() {
        if (this.gameEnded) return; // Prevent multiple calls
        this.gameEnded = true;
        
        console.log('Game completed: EndlessRunnerScene');
        
        // Stop the game
        this.gameStarted = false;
        
        // Clean up obstacle colliders
        this.obstacleColliders.forEach(collider => {
            if (collider) {
                this.physics.world.removeCollider(collider);
            }
        });
        this.obstacleColliders = [];
        
        // Clean up obstacles and coins
        this.obstacles.forEach(obstacle => {
            if (obstacle && obstacle.active) {
                obstacle.destroy();
            }
        });
        this.obstacles = [];
        
        this.coins.forEach(coin => {
            if (coin && coin.active) {
                coin.destroy();
            }
        });
        this.coins = [];
        
        // Determine winner - check survival first, then score, then distance
        let winner = null;
        
        // If one player is alive and the other is dead, alive player wins
        const p1Alive = this.player && this.player.alive;
        const p2Alive = this.player2 && this.player2.alive;
        
        if (p1Alive && !p2Alive) {
            winner = 1;
        } else if (p2Alive && !p1Alive) {
            winner = 2;
        } else if (!p1Alive && !p2Alive) {
            // Both dead - check score
            if (this.score > this.score2) {
                winner = 1;
            } else if (this.score2 > this.score) {
                winner = 2;
            } else {
                // Same score - check distance
                const p1Distance = this.player ? this.player.distance : 0;
                const p2Distance = this.player2 ? this.player2.distance : 0;
                if (p1Distance > p2Distance) {
                    winner = 1;
                } else if (p2Distance > p1Distance) {
                    winner = 2;
                }
                // If still tied, winner is null (tie)
            }
        } else {
            // Both alive (time ran out) - check coins first, then survival time
            // Update survival times to current gameTime since both are still alive
            // Both players survived the full time, so survival time is the same
            this.player1SurvivalTime = this.gameTime;
            this.player2SurvivalTime = this.gameTime;
            
            // First priority: coins (score)
            if (this.score > this.score2) {
                winner = 1;
            } else if (this.score2 > this.score) {
                winner = 2;
            } else {
                // Same coins - check survival time (who lasted longer)
                // Since both are alive, they both lasted the full time (same survival time)
                // Use distance as final tiebreaker
                const p1Distance = this.player ? this.player.distance : 0;
                const p2Distance = this.player2 ? this.player2.distance : 0;
                if (p1Distance > p2Distance) {
                    winner = 1;
                } else if (p2Distance > p1Distance) {
                    winner = 2;
                }
                // If still tied on coins, survival time, and distance, winner is null (tie)
            }
        }
        
        // Wait a moment before calling callback
        this.time.delayedCall(1000, () => {
            if (this.onGameComplete) {
                this.onGameComplete({
                    gameType: 'endlessrunner',
                    score: this.score,
                    score2: this.score2,
                    winner: winner,
                    distance: Math.floor(this.player ? this.player.distance : 0),
                    distance2: Math.floor(this.player2 ? this.player2.distance : 0),
                    time: Math.floor(this.gameTime / 1000)
                });
            }
        });
    }

    shutdown() {
        // Clean up countdown event
        if (this.countdownEvent) {
            this.countdownEvent.remove();
            this.countdownEvent = null;
        }
        
        // Clean up countdown text
        if (this.countdownText && this.countdownText.active) {
            this.countdownText.destroy();
            this.countdownText = null;
        }
        
        this.gameStarted = false;
    }

    destroy() {
        this.shutdown();
    }
}

export default EndlessRunnerScene;