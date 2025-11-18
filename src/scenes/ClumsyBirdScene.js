import Phaser from 'phaser';

class ClumsyBirdScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClumsyBirdScene' });
        this.bird = null;
        this.pipes = [];
        this.score = 0;
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.players = [];
        this.alivePlayers = 0;
        this.pipeGap = 200;
        this.pipeSpeed = 200;
        this.gravity = 600;
        this.jumpPower = -400;
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Set up physics - gravity will be applied to individual objects
        // this.physics.world.gravity.y = this.gravity;

        // Create background
        this.createBackground();

        // Create pipes
        this.createPipes();

        // Create players (gnomes)
        this.createPlayers();

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
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB); // Sky blue
        
        // Ground
        this.add.rectangle(400, 580, 800, 40, 0x8B4513); // Brown ground
    }

    createPipes() {
        this.pipes = [];
        this.pipeGroup = this.physics.add.group();
        
        // Create initial pipes
        for (let i = 0; i < 3; i++) {
            this.addPipe(600 + (i * 300));
        }
    }

    addPipe(x) {
        const pipeHeight = Phaser.Math.Between(100, 400);
        const gap = this.pipeGap;
        
        // Top pipe
        const topPipe = this.add.rectangle(x, pipeHeight / 2, 50, pipeHeight, 0x228B22);
        this.physics.add.existing(topPipe, true);
        
        // Bottom pipe
        const bottomPipe = this.add.rectangle(x, pipeHeight + gap + (600 - pipeHeight - gap) / 2, 50, 600 - pipeHeight - gap, 0x228B22);
        this.physics.add.existing(bottomPipe, true);
        
        this.pipes.push({ top: topPipe, bottom: bottomPipe, x: x, scored: false });
    }

    createPlayers() {
        const gnomeColors = [0x8B4513, 0x654321, 0x2F4F2F, 0x8B0000, 0x4B0082, 0x006400, 0x8B4513, 0x2F4F2F];
        
        for (let i = 0; i < this.numPlayers; i++) {
            const x = 100 + (i * 50);
            const y = 300;
            
            // Create gnome bird
            const gnome = this.add.circle(x, y, 15, gnomeColors[i]);
            this.physics.add.existing(gnome);
            gnome.body.setCollideWorldBounds(false);
            gnome.body.setBounce(0.1);
            gnome.body.setGravityY(0); // Start with no gravity
            
            // Add gnome hat
            const hat = this.add.triangle(x, y - 12, 0, 0, -8, 8, 8, 8, 0xFF0000);
            hat.setDepth(1);
            
            // Add gnome beard
            const beard = this.add.ellipse(x, y + 5, 12, 8, 0x654321);
            beard.setDepth(1);
            
            // Player properties
            gnome.score = 0;
            gnome.alive = true;
            gnome.id = i;
            gnome.name = `Gnome ${i + 1}`;
            gnome.hat = hat;
            gnome.beard = beard;
            gnome.distance = 0;
            
            this.players.push(gnome);
        }
        
        this.alivePlayers = this.numPlayers;
    }

    createUI() {
        // Score display
        this.scoreTexts = [];
        for (let i = 0; i < this.numPlayers; i++) {
            const scoreText = this.add.text(50, 50 + (i * 30), `Gnome ${i + 1}: 0`, {
                fontSize: '20px',
                fill: '#fff'
            });
            this.scoreTexts.push(scoreText);
        }

        // Game timer
        this.timerText = this.add.text(400, 50, '1:00', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Instructions
        this.instructionsText = this.add.text(400, 100, 'Press SPACE or UP to jump!', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5);
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Mobile touch controls - tap to jump
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Tap anywhere on screen to jump
        this.input.on('pointerdown', () => {
            this.touchJump = true;
            this.touchJumpJustPressed = true;
        });
        
        this.input.on('pointerup', () => {
            this.touchJump = false;
        });
        
        this.touchJump = false;
        this.touchJumpJustPressed = false;
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

        // Update players
        this.updatePlayers();

        // Update pipes
        this.updatePipes();

        // Check collisions
        this.checkCollisions();

        // Update timer
        this.updateTimer();

        // Check game end
        if (this.gameTime >= this.maxGameTime || this.alivePlayers <= 1) {
            this.endGame();
        }
    }

    updatePlayers() {
        this.players.forEach((player, index) => {
            if (!player.alive) return;

            // Handle input for human player - keyboard or touch
            if (index === this.playerPosition) {
                if (this.cursors.up.isDown || this.space.isDown || this.touchJumpJustPressed) {
                    player.body.setVelocityY(this.jumpPower);
                    this.touchJumpJustPressed = false; // Reset touch jump flag
                }
            } else {
                // AI behavior - simple but effective
                this.updateAI(player, index);
            }

            // Update distance
            player.distance += 1;

            // Sync gnome hat and beard with physics body
            if (player.hat) {
                player.hat.setPosition(player.x, player.y - 12);
            }
            if (player.beard) {
                player.beard.setPosition(player.x, player.y + 5);
            }
        });
    }

    updateAI(player, index) {
        // Simple AI: jump when there's a pipe ahead
        const nearestPipe = this.getNearestPipe(player);
        
        if (nearestPipe) {
            const distanceToPipe = nearestPipe.x - player.x;
            const pipeHeight = nearestPipe.top.y + nearestPipe.top.height / 2;
            const playerHeight = player.y;
            
            // Jump if pipe is close and player is too low
            if (distanceToPipe < 100 && playerHeight > pipeHeight - 50) {
                if (Math.random() < 0.3) { // 30% chance to jump
                    player.body.setVelocityY(this.jumpPower * 0.9);
                }
            }
            // Random jump to avoid pipes
            else if (Math.random() < 0.1) { // 10% chance for random jump
                player.body.setVelocityY(this.jumpPower * 0.8);
            }
        }
    }

    getNearestPipe(player) {
        let nearest = null;
        let minDistance = Infinity;

        this.pipes.forEach(pipe => {
            if (pipe.top.active) {
                const distance = pipe.x - player.x;
                if (distance > 0 && distance < minDistance) {
                    minDistance = distance;
                    nearest = pipe;
                }
            }
        });

        return nearest;
    }

    updatePipes() {
        this.pipes.forEach(pipe => {
            // Move pipes
            pipe.top.x -= this.pipeSpeed * (16 / 1000);
            pipe.bottom.x -= this.pipeSpeed * (16 / 1000);
            
            // Check for scoring
            if (!pipe.scored && pipe.x < 100) {
                pipe.scored = true;
                this.players.forEach(player => {
                    if (player.alive && player.x > pipe.x) {
                        player.score++;
                        this.updateScore(player.id);
                    }
                });
            }
            
            // Remove pipes that are off screen
            if (pipe.x < -50) {
                pipe.top.destroy();
                pipe.bottom.destroy();
                this.pipes.splice(this.pipes.indexOf(pipe), 1);
            }
        });

        // Add new pipes
        if (this.pipes.length < 3) {
            const lastPipe = this.pipes[this.pipes.length - 1];
            this.addPipe(lastPipe.x + 300);
        }
    }

    checkCollisions() {
        this.players.forEach((player, index) => {
            if (!player.alive) return;

            // Check collision with pipes
            this.pipes.forEach(pipe => {
                if (this.physics.overlap(player, pipe.top) || this.physics.overlap(player, pipe.bottom)) {
                    this.killPlayer(player, index);
                }
            });

            // Check collision with ground or ceiling
            if (player.y > 580 || player.y < 0) {
                this.killPlayer(player, index);
            }
        });
    }

    killPlayer(player, index) {
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
            this.scoreTexts[index].setText(`Gnome ${index + 1}: ${player.score} (DEAD)`);
            this.scoreTexts[index].setFill('#FF0000');
        }
        
        console.log(`Gnome ${index + 1} crashed! Final score: ${player.score}`);
    }

    updateScore(playerIndex) {
        if (this.scoreTexts[playerIndex]) {
            this.scoreTexts[playerIndex].setText(`Gnome ${playerIndex + 1}: ${this.players[playerIndex].score}`);
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
        
        // Find winner
        const alivePlayers = this.players.filter(p => p.alive);
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];
        const isPlayerWinner = winner && winner.id === this.playerPosition;
        
        let result = '';
        let gameResult = '';
        
        if (this.alivePlayers <= 1) {
            // Last gnome standing wins
            if (winner) {
                result = isPlayerWinner ? 'You Win!' : `${winner.name} Wins!`;
                gameResult = `Last Gnome Flying!\n${result}\nScore: ${winner.score}`;
            } else {
                result = 'All Gnomes Crashed!';
                gameResult = 'All Gnomes Crashed!\nNo Winner!';
            }
        } else if (this.gameTime >= this.maxGameTime) {
            // Time's up - highest score wins
            if (winner && winner.score > 0) {
                result = isPlayerWinner ? 'You Win!' : `${winner.name} Wins!`;
                gameResult = `Time's Up!\n${result}\nScore: ${winner.score}`;
            } else {
                result = 'Time\'s Up!';
                gameResult = `Time's Up!\nNo points scored!`;
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
        if (this.countdownEvent) {
            this.countdownEvent.destroy();
        }
    }

    onDestroy() {
        this.onShutdown();
    }
}

export default ClumsyBirdScene;
