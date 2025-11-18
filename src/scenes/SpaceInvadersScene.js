import Phaser from 'phaser';

class SpaceInvadersScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SpaceInvadersScene' });
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.score = 0;
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 2;
        this.players = [];
        this.alivePlayers = 0;
        this.enemySpeed = 50;
        this.bulletSpeed = 300;
        this.lastEnemyShot = 0;
        this.enemyShotDelay = 2000;
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

        // Create enemies
        this.createEnemies();

        // Create player
        this.createPlayer();

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
        // Space background
        this.add.rectangle(400, 300, 800, 600, 0x000011);
        
        // Add some stars
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.Between(1, 3);
            this.add.circle(x, y, size, 0xffffff);
        }
    }

    createEnemies() {
        this.enemies = [];
        const enemyWidth = 40;
        const enemyHeight = 30;
        const enemySpacing = 50;
        const startX = 100;
        const startY = 100;
        const rows = 5;
        const cols = 10;

        const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * enemySpacing;
                const y = startY + row * enemySpacing;
                
                const enemy = this.add.rectangle(x, y, enemyWidth, enemyHeight, colors[row]);
                this.physics.add.existing(enemy, true);
                
                // Enemy properties
                enemy.points = (rows - row) * 10;
                enemy.direction = 1;
                enemy.speed = this.enemySpeed;
                
                this.enemies.push(enemy);
            }
        }
    }

    createPlayer() {
        // Create player ship
        this.player = this.add.rectangle(400, 550, 60, 30, 0x00ff00);
        this.physics.add.existing(this.player, true);
        
        // Add player details
        this.add.triangle(this.player.x, this.player.y - 15, 0, 0, -15, 15, 15, 15, 0x00ff00);
    }

    createUI() {
        // Score display
        this.scoreText = this.add.text(50, 50, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });

        // Enemies remaining
        this.enemiesText = this.add.text(50, 80, 'Enemies: 50', {
            fontSize: '20px',
            fill: '#fff'
        });

        // Game timer
        this.timerText = this.add.text(400, 50, '1:00', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Instructions
        this.instructionsText = this.add.text(400, 100, 'Use ARROW KEYS to move, SPACE to shoot', {
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
                        });
                    }
                }
            }
        });
    }

    update() {
        if (!this.gameStarted) return;

        // Update player
        this.updatePlayer();

        // Update enemies
        this.updateEnemies();

        // Update bullets
        this.updateBullets();

        // Update enemy bullets
        this.updateEnemyBullets();

        // Check collisions
        this.checkCollisions();

        // Update timer
        this.updateTimer();

        // Check game end
        if (this.gameTime >= this.maxGameTime || this.enemies.length === 0) {
            this.endGame();
        }
    }

    updatePlayer() {
        // Move player
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.x -= 300 * (16 / 1000);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.x += 300 * (16 / 1000);
        }

        // Keep player within bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 30, 770);

        // Shoot
        if (this.space.isDown && this.bullets.length < 3) {
            this.shoot();
        }
    }

    shoot() {
        const bullet = this.add.rectangle(this.player.x, this.player.y - 20, 4, 10, 0xffff00);
        this.physics.add.existing(bullet);
        bullet.body.setVelocityY(-this.bulletSpeed);
        this.bullets.push(bullet);
    }

    updateEnemies() {
        // Move enemies
        let shouldMoveDown = false;
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.x += enemy.speed * enemy.direction * (16 / 1000);
                
                // Check if enemy hit edge
                if (enemy.x <= 20 || enemy.x >= 780) {
                    shouldMoveDown = true;
                }
            }
        });

        // Move enemies down and change direction
        if (shouldMoveDown) {
            this.enemies.forEach(enemy => {
                if (enemy.active) {
                    enemy.y += 20;
                    enemy.direction *= -1;
                }
            });
        }

        // Enemy shooting
        if (this.time.now - this.lastEnemyShot > this.enemyShotDelay) {
            this.enemyShoot();
            this.lastEnemyShot = this.time.now;
        }
    }

    enemyShoot() {
        if (this.enemies.length > 0) {
            // Find bottom-most enemy in each column
            const columns = {};
            this.enemies.forEach(enemy => {
                if (enemy.active) {
                    const col = Math.floor(enemy.x / 50);
                    if (!columns[col] || enemy.y > columns[col].y) {
                        columns[col] = enemy;
                    }
                }
            });

            // Shoot from random bottom enemy
            const activeEnemies = Object.values(columns).filter(enemy => enemy.active);
            if (activeEnemies.length > 0) {
                const shooter = Phaser.Utils.Array.GetRandom(activeEnemies);
                const bullet = this.add.rectangle(shooter.x, shooter.y + 20, 4, 10, 0xff0000);
                this.physics.add.existing(bullet);
                bullet.body.setVelocityY(this.bulletSpeed * 0.5);
                this.enemyBullets.push(bullet);
            }
        }
    }

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            if (bullet.active) {
                // Remove bullets that are off screen
                if (bullet.y < 0) {
                    bullet.destroy();
                    this.bullets.splice(index, 1);
                }
            }
        });
    }

    updateEnemyBullets() {
        this.enemyBullets.forEach((bullet, index) => {
            if (bullet.active) {
                // Remove bullets that are off screen
                if (bullet.y > 600) {
                    bullet.destroy();
                    this.enemyBullets.splice(index, 1);
                }
            }
        });
    }

    checkCollisions() {
        // Player bullets vs Enemies
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.active) {
                this.enemies.forEach((enemy, enemyIndex) => {
                    if (enemy.active && this.physics.overlap(bullet, enemy)) {
                        this.hitEnemy(enemy, enemyIndex);
                        bullet.destroy();
                        this.bullets.splice(bulletIndex, 1);
                    }
                });
            }
        });

        // Enemy bullets vs Player
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (bullet.active && this.physics.overlap(bullet, this.player)) {
                this.hitPlayer();
                bullet.destroy();
                this.enemyBullets.splice(bulletIndex, 1);
            }
        });

        // Enemies vs Player (collision)
        this.enemies.forEach(enemy => {
            if (enemy.active && this.physics.overlap(enemy, this.player)) {
                this.hitPlayer();
            }
        });
    }

    hitEnemy(enemy, enemyIndex) {
        this.score += enemy.points;
        this.updateScore();
        enemy.destroy();
        this.enemies.splice(enemyIndex, 1);
        
        // Add explosion effect
        this.createExplosionEffect(enemy.x, enemy.y);
    }

    hitPlayer() {
        // Player hit - game over
        this.endGame();
    }

    createExplosionEffect(x, y) {
        // Create explosion particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 2, 0xffff00);
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
        
        if (this.enemiesText) {
            this.enemiesText.setText(`Enemies: ${this.enemies.length}`);
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
        
        if (this.enemies.length === 0) {
            result = 'All Enemies Destroyed!';
            gameResult = `Victory!\n${result}\nFinal Score: ${this.score}`;
        } else if (this.gameTime >= this.maxGameTime) {
            result = 'Time\'s Up!';
            gameResult = `${result}\nFinal Score: ${this.score}\nEnemies Remaining: ${this.enemies.length}`;
        } else {
            result = 'Game Over!';
            gameResult = `${result}\nFinal Score: ${this.score}`;
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

export default SpaceInvadersScene;
