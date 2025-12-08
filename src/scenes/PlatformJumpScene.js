import Phaser from 'phaser';

class PlatformJumpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlatformJumpScene' });
        this.players = [];
        this.movingPlatforms = [];
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.speedIncrease = 0;
        this.maxSpeedIncreases = 3;
        this.gravity = 500;
        this.jumpPower = -400;
        this.moveSpeed = 200;
        this.platformSpeed = 100; // Speed of moving platforms
        this.alivePlayers = 0;
        this.platformsDisappearing = false;
        this.disappearOrder = [];
        this.currentDisappearIndex = 0;
        this.disappearTimer = 0;
        this.disappearInterval = 15000; // 15 seconds between disappearances (slower)
        this.coins = [];
        this.platformsMovingDown = false;
        this.downwardSpeed = 20; // Speed platforms move down
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Set up physics
        this.physics.world.gravity.y = this.gravity;

        // Create moving platforms
        this.createMovingPlatforms();

        // Create players
        this.createPlayers();

        // Create coins
        this.createCoins();

        // Set up platform collision
        this.setupPlatformCollision();

        // Create UI
        this.createUI();

        // Set up controls
        this.setupControls();

        // Start countdown
        this.startCountdown();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
    }

    createMovingPlatforms() {
        // Create simple moving platforms
        const platformConfigs = [
            { x: 100, y: 500, width: 150, speed: 50, direction: 1 },
            { x: 300, y: 450, width: 130, speed: 60, direction: -1 },
            { x: 500, y: 400, width: 120, speed: 70, direction: 1 },
            { x: 200, y: 350, width: 140, speed: 55, direction: -1 },
            { x: 400, y: 300, width: 160, speed: 65, direction: 1 },
            { x: 100, y: 250, width: 130, speed: 75, direction: -1 },
            { x: 600, y: 200, width: 120, speed: 80, direction: 1 },
            { x: 300, y: 150, width: 140, speed: 85, direction: -1 }
        ];

        platformConfigs.forEach((config, _index) => {
            const platform = this.add.rectangle(config.x, config.y, config.width, 20, 0x00FF00);
            this.physics.add.existing(platform, true);
            
            // Add platform properties
            platform.speed = config.speed;
            platform.direction = config.direction;
            platform.originalX = config.x;
            platform.width = config.width;
            platform.movingDown = false;
            
            this.movingPlatforms.push(platform);
        });

        // No ground platforms - players die if they reach the bottom
    }


    createPlayers() {
        // Create simple gnome players
        const gnomeColors = [0x8B4513, 0x654321, 0x2F4F2F, 0x8B0000, 0x4B0082, 0x006400, 0x8B4513, 0x2F4F2F];
        
        // Only create the local player for now (until WebSocket sync is implemented)
        // This prevents AI from controlling other players and causing desync
        const localPlayerIndex = this.playerPosition;
        
        // Start gnome on a platform
        const platformIndex = Math.min(localPlayerIndex, this.movingPlatforms.length - 1);
        const startPlatform = this.movingPlatforms[platformIndex];
        const x = startPlatform.x;
        const y = startPlatform.y - 30; // 30 pixels above the platform (more clearance)
        
        // Create simple gnome (circle with hat)
        const gnome = this.add.circle(x, y, 15, gnomeColors[localPlayerIndex]);
        this.physics.add.existing(gnome);
        gnome.body.setCollideWorldBounds(false); // No world bounds - can fall off
        gnome.body.setBounce(0.1);
        gnome.body.setGravityY(0); // Start with no gravity until game starts
        gnome.body.setSize(24, 24); // Collision box size
        gnome.body.setOffset(3, 3); // Offset to center the collision box
        
        // Add gnome hat
        const hat = this.add.triangle(x, y - 12, 0, 0, -8, 8, 8, 8, 0xFF0000); // Red hat
        hat.setDepth(1); // Make sure hat is on top
        
        // Add gnome beard
        const beard = this.add.ellipse(x, y + 5, 12, 8, 0x654321); // Brown beard
        beard.setDepth(1);
        
        // Player properties
        gnome.score = 0;
        gnome.currentPlatform = startPlatform; // Track which platform they're on
        gnome.alive = true;
        gnome.id = localPlayerIndex;
        gnome.name = `Gnome ${localPlayerIndex + 1}`;
        gnome.canJump = true;
        gnome.jumpCooldown = 0;
        gnome.survivalTime = 0; // Track how long they survived
        gnome.hat = hat; // Store reference to hat
        gnome.beard = beard; // Store reference to beard
        gnome.isOnPlatform = true; // Start on platform
        gnome.lastPlatformY = startPlatform.y; // Track platform position
        
        this.players.push(gnome);
        
        // Set alive players to numPlayers (even though we only create local player)
        // This prevents the game from ending immediately with "You Win"
        // The game will end when time runs out or player dies
        this.alivePlayers = this.numPlayers;
    }

    createCoins() {
        // Create simple coins
        const coinPositions = [
            { x: 200, y: 480 },
            { x: 400, y: 430 },
            { x: 600, y: 380 },
            { x: 300, y: 330 },
            { x: 500, y: 280 },
            { x: 150, y: 230 },
            { x: 650, y: 180 },
            { x: 100, y: 150 },
            { x: 700, y: 120 },
            { x: 400, y: 100 }
        ];

        coinPositions.forEach(pos => {
            const coin = this.add.circle(pos.x, pos.y, 8, 0xFFD700);
            // No physics for coins - just visual elements
            coin.collected = false;
            this.coins.push(coin);
        });
    }

    setupPlatformCollision() {
        // Store collider references for each platform
        this.platformColliders = [];
        
        // Set up basic collision between players and platforms
        this.players.forEach((player, _playerIndex) => {
            this.movingPlatforms.forEach((platform, platformIndex) => {
                const collider = this.physics.add.collider(player, platform, () => {
                    // Check if platform is still valid
                    if (!platform.active || !platform.visible || !platform.body || !platform.body.enable) {
                        return;
                    }
                    
                    // Check if player is on top of platform
                    if (player.body && player.body.touching && player.body.touching.down && player.y < platform.y) {
                        player.canJump = true;
                        player.jumpCooldown = 0;
                        player.isOnPlatform = true;
                        player.currentPlatform = platform;
                        player.lastPlatformY = platform.y;
                        
                        // Position player on top of platform
                        if (player.y > platform.y - 20) {
                            player.y = platform.y - 20;
                            if (player.body.velocity.y > 0) {
                                player.body.setVelocityY(0);
                            }
                        }
                    }
                }, null, (player, platform) => {
                    // Only collide if:
                    // 1. Platform is active and visible
                    // 2. Platform body is enabled
                    // 3. Player is above or on the platform
                    return platform.active && 
                           platform.visible && 
                           platform.body && 
                           platform.body.enable &&
                           player.y <= platform.y + 15;
                });
                
                // Store collider reference
                if (!this.platformColliders[platformIndex]) {
                    this.platformColliders[platformIndex] = [];
                }
                this.platformColliders[platformIndex].push(collider);
            });
        });
    }

    checkPlatformCollisions() {
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // If player is moving upward significantly, clear platform status
            if (player.body && player.body.velocity && player.body.velocity.y < -100) {
                player.isOnPlatform = false;
                player.canJump = false;
                // Don't clear currentPlatform yet - might land on it again
            }
            
            // Clear current platform if it's no longer valid
            if (player.currentPlatform && (
                !player.currentPlatform.active || 
                !player.currentPlatform.visible ||
                !player.currentPlatform.body ||
                !player.currentPlatform.body.enable
            )) {
                player.currentPlatform = null;
                player.isOnPlatform = false;
                player.canJump = false;
            }
            
            // Verify player is still actually on their tracked platform
            if (player.currentPlatform && player.isOnPlatform) {
                if (!this.isPlayerOnPlatform(player, player.currentPlatform)) {
                    // Player is no longer on the platform they were tracking
                    player.currentPlatform = null;
                    player.isOnPlatform = false;
                    player.canJump = false;
                }
            }
            
            // Check if player is on any platform for jump control
            let onPlatform = false;
            let _platformBelow = null;
            
            this.movingPlatforms.forEach(platform => {
                // Only check active, visible platforms with enabled physics
                if (platform.active && 
                    platform.visible && 
                    platform.body && 
                    platform.body.enable &&
                    this.isPlayerOnPlatform(player, platform)) {
                    onPlatform = true;
                    _platformBelow = platform;
                    player.canJump = true;
                    player.jumpCooldown = 0;
                    player.isOnPlatform = true;
                    player.currentPlatform = platform;
                    player.lastPlatformY = platform.y;
                    
                    // Keep player on top of platform (stricter positioning)
                    const platformTop = platform.y - 10; // Platform height / 2
                    const targetY = platformTop - 15; // Player radius
                    if (Math.abs(player.y - targetY) > 2) {
                        player.y = targetY;
                    }
                    if (player.body.velocity.y > 0) {
                        player.body.setVelocityY(0);
                    }
                }
            });
            
            // If not on platform, can't jump
            if (!onPlatform) {
                player.canJump = false;
                player.isOnPlatform = false;
                player.currentPlatform = null;
            }
        });
    }

    isPlayerOnPlatform(player, platform) {
        // Check if platform is valid, active, visible, and has enabled physics
        if (!platform || 
            !platform.active || 
            !platform.visible || 
            !platform.body || 
            !platform.body.enable) {
            return false;
        }
        
        // If player is moving upward (jumping), they're not on a platform
        if (player.body && player.body.velocity && player.body.velocity.y < -50) {
            return false;
        }
        
        const platformWidth = platform.width || 100;
        const platformHeight = 20;
        const playerRadius = 15;
        
        // Check if player is within platform X bounds (with some tolerance)
        const platformLeft = platform.x - platformWidth / 2;
        const platformRight = platform.x + platformWidth / 2;
        const isWithinX = player.x - playerRadius < platformRight && 
                         player.x + playerRadius > platformLeft;
        
        if (!isWithinX) {
            return false;
        }
        
        // Check if player is on top of platform (stricter vertical detection)
        const platformTop = platform.y - platformHeight / 2;
        const playerBottom = player.y + playerRadius;
        
        // Player must be very close to the platform top (within 3 pixels)
        // and not moving upward significantly
        const distanceToPlatform = playerBottom - platformTop;
        const isOnTop = distanceToPlatform >= -2 && distanceToPlatform <= 3;
        
        return isOnTop;
    }

    // Removed coin creation - no longer needed

    createUI() {
        // Score display (coins collected)
        this.scoreTexts = [];
        for (let i = 0; i < this.numPlayers; i++) {
            const scoreText = this.add.text(50, 50 + (i * 30), `Gnome ${i + 1}: 0 coins`, {
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
        
        // Alive players counter
        this.aliveText = this.add.text(400, 50, `Alive: ${this.alivePlayers}`, {
            fontSize: '18px',
            fill: '#00FF00'
        }).setOrigin(0.5);
        
        // Platform disappearing warning
        this.warningText = this.add.text(400, 80, '', {
            fontSize: '16px',
            fill: '#FF0000'
        }).setOrigin(0.5);
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Mobile touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Create touch control buttons for mobile
        const isMobile = this.sys.game.device.input.touch;
        if (!isMobile) return; // Only show on mobile devices
        
        // Left/Right movement buttons
        this.leftButton = this.add.rectangle(50, 550, 60, 60, 0x4A90E2, 0.2);
        this.leftButton.setInteractive({ useHandCursor: true });
        this.leftButton.setDepth(20);
        this.leftButton.setStrokeStyle(1, 0x000000, 0.5);
        this.leftButtonText = this.add.text(50, 550, '←', {
            fontSize: '24px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.leftButtonText.setOrigin(0.5);
        this.leftButtonText.setDepth(21);
        
        this.rightButton = this.add.rectangle(130, 550, 60, 60, 0x4A90E2, 0.2);
        this.rightButton.setInteractive({ useHandCursor: true });
        this.rightButton.setDepth(20);
        this.rightButton.setStrokeStyle(1, 0x000000, 0.5);
        this.rightButtonText = this.add.text(130, 550, '→', {
            fontSize: '24px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.rightButtonText.setOrigin(0.5);
        this.rightButtonText.setDepth(21);
        
        // Jump button
        this.jumpButton = this.add.rectangle(750, 550, 60, 60, 0x4A90E2, 0.2);
        this.jumpButton.setInteractive({ useHandCursor: true });
        this.jumpButton.setDepth(20);
        this.jumpButton.setStrokeStyle(1, 0x000000, 0.5);
        this.jumpButtonText = this.add.text(750, 550, '↑', {
            fontSize: '24px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.jumpButtonText.setOrigin(0.5);
        this.jumpButtonText.setDepth(21);
        
        // Touch state tracking
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchJumpJustPressed = false;
        
        // Touch events
        this.leftButton.on('pointerdown', () => { this.touchLeft = true; });
        this.leftButton.on('pointerup', () => { this.touchLeft = false; });
        this.leftButton.on('pointerout', () => { this.touchLeft = false; });
        
        this.rightButton.on('pointerdown', () => { this.touchRight = true; });
        this.rightButton.on('pointerup', () => { this.touchRight = false; });
        this.rightButton.on('pointerout', () => { this.touchRight = false; });
        
        this.jumpButton.on('pointerdown', () => { 
            this.touchJump = true; 
            this.touchJumpJustPressed = true;
        });
        this.jumpButton.on('pointerup', () => { 
            this.touchJump = false;
        });
        this.jumpButton.on('pointerout', () => { 
            this.touchJump = false;
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
                            
                            // Enable gravity for all players when game starts
                            this.players.forEach(player => {
                                if (player.body) {
                                    player.body.setGravityY(this.gravity);
                                }
                            });
                        });
                    }
                }
            }
        });
    }

    update() {
        if (!this.gameStarted) return;

        // Update moving platforms
        this.updateMovingPlatforms();

        // Check platform collisions (must be after platform movement)
        this.checkPlatformCollisions();

        // Update players
        this.updatePlayers();

        // Check coin collection
        this.checkCoins();

        // Check for fallen players
        this.checkFallenPlayers();

        // Handle platform disappearing
        this.handlePlatformDisappearing();

        // Handle platform downward movement
        this.handlePlatformDownwardMovement();

        // Update timer
        this.updateTimer();

        // Check speed increase
        this.checkSpeedIncrease();

        // Check game end
        if (this.gameTime >= this.maxGameTime || this.alivePlayers <= 1) {
            this.endGame();
        }
    }

    updateMovingPlatforms() {
        const delta = this.sys.game.loop.delta; // Use actual frame delta
        
        this.movingPlatforms.forEach(platform => {
            // Only update active, visible platforms with enabled physics
            if (!platform.active || !platform.visible || !platform.body || !platform.body.enable) return;
            
            // Calculate new position
            const deltaX = platform.speed * platform.direction * (delta / 1000);
            let newX = platform.x + deltaX;
            let newY = platform.y;
            
            // Move platform downward if enabled
            if (platform.movingDown) {
                newY += this.downwardSpeed * (delta / 1000);
            }
            
            // Reverse direction when hitting screen edges
            if (newX <= platform.width / 2) {
                platform.direction = 1;
                newX = platform.width / 2;
            } else if (newX >= 800 - platform.width / 2) {
                platform.direction = -1;
                newX = 800 - platform.width / 2;
            }
            
            // Update platform position using setPosition to update both sprite and physics body
            platform.setPosition(newX, newY);
            
            // Explicitly update physics body position for static bodies
            if (platform.body) {
                platform.body.x = newX;
                platform.body.y = newY;
                platform.body.updateFromGameObject();
            }
            
            // Update players on this platform (only if platform is still valid)
            this.players.forEach(player => {
                if (player.alive && player.currentPlatform === platform && player.isOnPlatform) {
                    // Verify platform is still valid before moving player
                    if (platform.active && platform.visible && platform.body && platform.body.enable) {
                        // Move player with platform horizontally
                        player.x += deltaX;
                        
                        // Update platform Y position reference
                        if (platform.movingDown) {
                            const platformDeltaY = this.downwardSpeed * (delta / 1000);
                            player.y += platformDeltaY;
                            player.lastPlatformY = platform.y;
                        }
                    } else {
                        // Platform disappeared, clear player's platform reference
                        player.currentPlatform = null;
                        player.isOnPlatform = false;
                        player.canJump = false;
                    }
                }
            });
        });
    }

    updatePlayers() {
        this.players.forEach((player, _index) => {
            if (!player.alive) return;

            // Track survival time
            const delta = this.sys.game.loop.delta;
            player.survivalTime += delta;

            // Update jump cooldown
            if (player.jumpCooldown > 0) {
                player.jumpCooldown -= delta;
            }

            // Only handle input for local player (use player.id instead of index)
            // player.id is set to this.playerPosition when the player is created
            if (player.id === this.playerPosition) {
                // Player controls - keyboard or touch
                if (this.cursors.left.isDown || this.wasd.A.isDown || this.touchLeft) {
                    player.body.setVelocityX(-this.moveSpeed);
                } else if (this.cursors.right.isDown || this.wasd.D.isDown || this.touchRight) {
                    player.body.setVelocityX(this.moveSpeed);
                } else {
                    player.body.setVelocityX(0);
                }

                // Jump - only when on a platform surface and cooldown is ready
                const jumpPressed = this.cursors.up.isDown || this.wasd.W.isDown || this.space.isDown || this.touchJumpJustPressed;
                if (jumpPressed && player.canJump && player.isOnPlatform && player.jumpCooldown <= 0) {
                    player.body.setVelocityY(this.jumpPower);
                    player.canJump = false; // Can only jump once until landing on platform
                    player.isOnPlatform = false; // No longer on platform after jumping
                    player.jumpCooldown = 300; // Cooldown to prevent multiple jumps (increased)
                    this.touchJumpJustPressed = false; // Reset touch jump flag
                }
            } else {
                // Other players will be controlled via WebSocket sync (not implemented yet)
                // For now, just stop their movement to prevent AI desync
                // This should never happen since we only create the local player, but just in case
                player.body.setVelocityX(0);
                player.body.setVelocityY(0);
            }

            // Sync gnome hat and beard with physics body
            if (player.hat) {
                player.hat.setPosition(player.x, player.y - 12);
            }
            if (player.beard) {
                player.beard.setPosition(player.x, player.y + 5);
            }
        });
    }

    checkCoins() {
        this.players.forEach((player, index) => {
            if (!player.alive) return;

            this.coins.forEach(coin => {
                if (coin && !coin.collected) {
                    // Simple distance check instead of physics overlap
                    const distance = Phaser.Math.Distance.Between(player.x, player.y, coin.x, coin.y);
                    if (distance < 25) { // 25 pixel radius for collection
                        // Collect coin
                        coin.collected = true;
                        coin.setVisible(false);
                        player.score++;
                        this.updateScore(index);
                        
                        // Create new coin at random position
                        const newCoin = this.add.circle(
                            Phaser.Math.Between(50, 750), 
                            Phaser.Math.Between(100, 500), 
                            8, 
                            0xFFD700
                        );
                        newCoin.collected = false;
                        
                        // Replace old coin with new one
                        const coinIndex = this.coins.indexOf(coin);
                        this.coins[coinIndex] = newCoin;
                        coin.destroy();
                        
                        console.log(`Gnome ${index + 1} collected a coin! Total: ${player.score}`);
                    }
                }
            });
        });
    }

    // Removed respawnCoin function - no longer needed

    updateScore(playerIndex) {
        if (this.scoreTexts[playerIndex]) {
            this.scoreTexts[playerIndex].setText(`Gnome ${playerIndex + 1}: ${this.players[playerIndex].score} coins`);
        }
    }

    handlePlatformDownwardMovement() {
        // Start moving platforms down when 30 seconds remain (30 seconds into a 60-second game)
        const timeToStartMovingDown = this.maxGameTime - 30000; // 30 seconds remaining
        if (this.gameTime >= timeToStartMovingDown && !this.platformsMovingDown) {
            this.platformsMovingDown = true;
            this.movingPlatforms.forEach(platform => {
                if (platform.active && platform.visible && platform.body && platform.body.enable) {
                    platform.movingDown = true;
                }
            });
            console.log('Platforms are now moving downward!');
        }
    }

    checkFallenPlayers() {
        this.players.forEach((player, index) => {
            if (!player.alive) return;

            // Check if player reached the bottom of the screen (dies immediately)
            if (player.y > 600) {
                player.alive = false;
                player.setVisible(false);
                
                // Hide gnome hat and beard
                if (player.hat) {
                    player.hat.setVisible(false);
                }
                if (player.beard) {
                    player.beard.setVisible(false);
                }
                
                this.alivePlayers--;
                
                // Update UI
                if (this.scoreTexts[index]) {
                    this.scoreTexts[index].setText(`Gnome ${index + 1}: FELL!`);
                    this.scoreTexts[index].setFill('#FF0000');
                }
                
                // Update alive counter
                if (this.aliveText) {
                    this.aliveText.setText(`Alive: ${this.alivePlayers}`);
                }
                
                console.log(`Gnome ${index + 1} fell and is out!`);
            }
        });
    }

    handlePlatformDisappearing() {
        // Start disappearing when 30 seconds remain (30 seconds into a 60-second game)
        const timeToStartDisappearing = this.maxGameTime - 30000; // 30 seconds remaining
        if (this.gameTime >= timeToStartDisappearing && !this.platformsDisappearing) {
            this.startPlatformDisappearing();
        }

        if (this.platformsDisappearing) {
            const delta = this.sys.game.loop.delta;
            this.disappearTimer += delta;
            
            if (this.disappearTimer >= this.disappearInterval && this.currentDisappearIndex < this.disappearOrder.length) {
                this.disappearNextPlatform();
                this.disappearTimer = 0;
            }
        }
    }

    startPlatformDisappearing() {
        this.platformsDisappearing = true;
        
        // Create random order for platform disappearance
        this.disappearOrder = [...Array(this.movingPlatforms.length).keys()];
        this.disappearOrder = this.shuffleArray(this.disappearOrder);
        
        // Show warning
        if (this.warningText) {
            this.warningText.setText('⚠️ PLATFORMS WILL DISAPPEAR! ⚠️');
        }
        
        console.log('Platforms will start disappearing in random order:', this.disappearOrder);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    disappearNextPlatform() {
        if (this.currentDisappearIndex < this.disappearOrder.length) {
            const platformIndex = this.disappearOrder[this.currentDisappearIndex];
            const platform = this.movingPlatforms[platformIndex];
            
            if (platform && platform.active) {
                // Show warning before disappearing
                if (this.warningText) {
                    this.warningText.setText(`⚠️ PLATFORM ${platformIndex + 1} DISAPPEARING! ⚠️`);
                }
                
                // Clear any players on this platform before it disappears
                this.players.forEach(player => {
                    if (player.currentPlatform === platform) {
                        player.currentPlatform = null;
                        player.isOnPlatform = false;
                        player.canJump = false;
                    }
                });
                
                // Disable platform physics body immediately
                if (platform.body) {
                    platform.body.enable = false;
                }
                
                // Disable all colliders for this platform
                if (this.platformColliders && this.platformColliders[platformIndex]) {
                    this.platformColliders[platformIndex].forEach(collider => {
                        if (collider && collider.active) {
                            collider.destroy();
                        }
                    });
                    this.platformColliders[platformIndex] = [];
                }
                
                // Make platform disappear with animation
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 500,
                    onComplete: () => {
                        platform.setActive(false);
                        platform.setVisible(false);
                        
                        // Ensure collision is completely disabled
                        if (platform.body) {
                            platform.body.enable = false;
                        }
                        
                        // Remove any remaining colliders
                        if (this.platformColliders && this.platformColliders[platformIndex]) {
                            this.platformColliders[platformIndex].forEach(collider => {
                                if (collider && collider.active) {
                                    collider.destroy();
                                }
                            });
                            this.platformColliders[platformIndex] = [];
                        }
                        
                        // Update warning text
                        if (this.warningText) {
                            this.warningText.setText('⚠️ PLATFORMS WILL DISAPPEAR! ⚠️');
                        }
                    }
                });
                
                console.log(`Platform ${platformIndex + 1} is disappearing!`);
                this.currentDisappearIndex++;
            }
        }
    }

    updateAI(player, _index) {
        // Simple but effective AI
        const nearestPlatform = this.getNearestPlatform(player);
        
        if (nearestPlatform) {
            const distance = nearestPlatform.x - player.x;
            
            // Always move towards the nearest platform
            if (Math.abs(distance) > 20) {
                if (distance > 0) {
                    player.body.setVelocityX(this.moveSpeed * 0.9);
                } else {
                    player.body.setVelocityX(-this.moveSpeed * 0.9);
                }
            } else {
                player.body.setVelocityX(0);
            }

            // Jump only when on platform and cooldown is ready
            if (player.canJump && player.isOnPlatform && player.jumpCooldown <= 0 && Math.random() < 0.3) {
                player.body.setVelocityY(this.jumpPower * 1.0); // Full jump power
                player.canJump = false;
                player.isOnPlatform = false;
                player.jumpCooldown = 300;
            }
        } else {
            // If no platform nearby, move more aggressively
            if (Math.random() < 0.3) {
                const direction = Math.random() < 0.5 ? 1 : -1;
                player.body.setVelocityX(this.moveSpeed * 0.8 * direction);
            } else {
                player.body.setVelocityX(0);
            }
            
            // Jump more frequently to try to reach platforms (but only if on a platform)
            if (player.canJump && player.isOnPlatform && player.jumpCooldown <= 0 && Math.random() < 0.4) {
                player.body.setVelocityY(this.jumpPower * 0.9);
                player.canJump = false;
                player.isOnPlatform = false;
                player.jumpCooldown = 300;
            }
        }
    }


    getNearestPlatform(player) {
        let nearest = null;
        let minDistance = Infinity;

        this.movingPlatforms.forEach(platform => {
            // Only consider active, visible platforms with enabled physics
            if (platform.active && 
                platform.visible && 
                platform.body && 
                platform.body.enable) {
                const distance = Phaser.Math.Distance.Between(player.x, player.y, platform.x, platform.y);
                if (distance < minDistance && distance < 200) {
                    minDistance = distance;
                    nearest = platform;
                }
            }
        });

        return nearest;
    }

    // Removed coin-related methods - no longer needed

    updateTimer() {
        const delta = this.sys.game.loop.delta; // Use actual frame delta
        this.gameTime += delta;
        
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
        // Increase platform speed if we haven't reached max increases
        if (this.speedIncrease < this.maxSpeedIncreases) {
            const timeForSpeedIncrease = (this.speedIncrease + 1) * 15000; // Every 15 seconds
            if (this.gameTime >= timeForSpeedIncrease) {
                this.increasePlatformSpeed();
            }
        }
    }

    increasePlatformSpeed() {
        this.speedIncrease++;
        const speedMultiplier = 1 + (this.speedIncrease * 0.4); // 40% increase each time
        
        // Increase platform movement speed
        this.movingPlatforms.forEach(platform => {
            platform.speed *= speedMultiplier;
        });
        
        console.log(`Platform speed increased! Level: ${this.speedIncrease}`);
    }

    endGame() {
        this.gameStarted = false;
        
        // Find all alive players
        const alivePlayers = this.players.filter(p => p.alive);
        
        let result = '';
        let gameResult = '';
        
        // Only end game when time is up or player died
        // Don't end immediately just because there's only one local player
        if (this.gameTime >= this.maxGameTime) {
            // Time's up - determine winner by coin count
            // Sort players by coin count (descending), then by survival time if tied
            const sortedPlayers = [...alivePlayers].sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // Higher coins first
                }
                return b.survivalTime - a.survivalTime; // Longer survival if tied
            });
            
            const coinWinner = sortedPlayers[0];
            const isCoinWinner = coinWinner && coinWinner.id === this.playerPosition;
            
            // Check if there's a tie
            const topScore = coinWinner ? coinWinner.score : 0;
            const tiedPlayers = sortedPlayers.filter(p => p.score === topScore);
            
            if (coinWinner) {
                if (tiedPlayers.length > 1) {
                    // Tie - show all tied players
                    const tiedNames = tiedPlayers.map(p => 
                        p.id === this.playerPosition ? 'You' : p.name
                    ).join(', ');
                    result = 'Tie!';
                    gameResult = `Time's Up!\n${result}\nTied Players: ${tiedNames}\nCoins: ${topScore}`;
                } else {
                    // Clear winner by coins
                    result = isCoinWinner ? 'You Win!' : `${coinWinner.name} Wins!`;
                    gameResult = `Time's Up!\n${result}\nCoins: ${coinWinner.score}`;
                }
            } else {
                result = 'Time\'s Up!';
                gameResult = `Time's Up!\nNo coins collected!`;
            }
        } else if (alivePlayers.length === 0) {
            // All players died (shouldn't happen with only local player, but handle it)
            result = 'All Gnomes Fell!';
            gameResult = 'All Gnomes Fell!\nNo Winner!';
        }
        
        const _gameOverText = this.add.text(400, 300, gameResult, {
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

export default PlatformJumpScene;
