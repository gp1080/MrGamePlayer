import Phaser from 'phaser';

class RacingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RacingScene' });
        this.cars = [];
        this.checkpoints = [];
        this.currentCheckpoint = 0;
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.trackWidth = 100;
        this.trackHeight = 400;
        this.speedIncrease = 0;
        this.maxSpeedIncreases = 3;
    }

    init(data) {
        this.playerPosition = data.playerPosition || 0;
        this.roomId = data.roomId;
        this.wsConnection = data.wsConnection;
        this.numPlayers = data.numPlayers || 2;
        this.gameType = data.gameType || 'racing';
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create track
        this.createTrack();
        this.createCars();
        this.createCheckpoints();
        this.createUI();
        this.setupInput();
        
        // Start countdown
        this.startCountdown();
    }

    createTrack() {
        // Create simple oval track
        const track = this.add.graphics();
        track.lineStyle(8, 0x666666);
        track.strokeEllipse(400, 300, 600, 400);
        
        // Track boundaries
        track.lineStyle(4, 0xFFFFFF);
        track.strokeEllipse(400, 300, 500, 300);
        track.strokeEllipse(400, 300, 700, 500);
    }

    createCars() {
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500, 0x800080];
        
        for (let i = 0; i < this.numPlayers; i++) {
            const car = this.add.rectangle(400, 100 + (i * 30), 20, 40, colors[i % colors.length]);
            this.physics.add.existing(car, true);
            
            this.cars.push({
                sprite: car,
                speed: 0,
                maxSpeed: 200,
                acceleration: 50,
                rotation: 0,
                lap: 0,
                checkpoint: 0,
                position: i
            });
        }
    }

    createCheckpoints() {
        // Create checkpoints around the track
        const checkpointPositions = [
            { x: 400, y: 100 }, // Top
            { x: 550, y: 200 }, // Right
            { x: 400, y: 500 }, // Bottom
            { x: 250, y: 200 }  // Left
        ];

        checkpointPositions.forEach((pos, index) => {
            const checkpoint = this.add.circle(pos.x, pos.y, 20, 0x00FF00, 0.3);
            checkpoint.setData('checkpoint', index);
            this.checkpoints.push(checkpoint);
        });
    }

    createUI() {
        // Game timer
        this.timerText = this.add.text(400, 20, '1:00', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Lap counter
        this.lapText = this.add.text(50, 50, 'Lap: 0/3', {
            fontSize: '20px',
            fill: '#fff'
        });

        // Position indicator
        this.positionText = this.add.text(50, 80, 'Position: 1st', {
            fontSize: '20px',
            fill: '#fff'
        });
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
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

        this.updatePlayerCar();
        this.updateAI();
        this.checkCheckpoints();
        this.updateUI();
        this.updateTimer();
        this.checkSpeedIncrease();
        this.checkGameEnd();
    }

    updatePlayerCar() {
        const playerCar = this.cars[this.playerPosition];
        
        // Acceleration
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            playerCar.speed = Math.min(playerCar.speed + playerCar.acceleration, playerCar.maxSpeed);
        } else {
            playerCar.speed = Math.max(playerCar.speed - 20, 0);
        }

        // Steering
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            playerCar.rotation -= 0.05;
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            playerCar.rotation += 0.05;
        }

        // Apply movement
        const velocityX = Math.cos(playerCar.rotation) * playerCar.speed;
        const velocityY = Math.sin(playerCar.rotation) * playerCar.speed;
        
        playerCar.sprite.x += velocityX * 0.1;
        playerCar.sprite.y += velocityY * 0.1;
        playerCar.sprite.rotation = playerCar.rotation;
    }

    updateAI() {
        // Simple AI for other cars
        this.cars.forEach((car, index) => {
            if (index === this.playerPosition) return;

            // Simple AI: follow track and avoid player
            const angleToCenter = Phaser.Math.Angle.Between(car.sprite.x, car.sprite.y, 400, 300);
            car.rotation = angleToCenter + Math.PI / 2;
            
            car.speed = Math.min(car.speed + 30, car.maxSpeed * 0.8);
            
            const velocityX = Math.cos(car.rotation) * car.speed;
            const velocityY = Math.sin(car.rotation) * car.speed;
            
            car.sprite.x += velocityX * 0.1;
            car.sprite.y += velocityY * 0.1;
            car.sprite.rotation = car.rotation;
        });
    }

    checkCheckpoints() {
        this.cars.forEach((car, _index) => {
            const checkpoint = this.checkpoints[car.checkpoint];
            const distance = Phaser.Math.Distance.Between(car.sprite.x, car.sprite.y, checkpoint.x, checkpoint.y);
            
            if (distance < 30) {
                car.checkpoint = (car.checkpoint + 1) % this.checkpoints.length;
                if (car.checkpoint === 0) {
                    car.lap++;
                }
            }
        });
    }

    updateUI() {
        const playerCar = this.cars[this.playerPosition];
        this.lapText.setText(`Lap: ${playerCar.lap}/3`);

        // Calculate position
        const sortedCars = [...this.cars].sort((a, b) => {
            if (a.lap !== b.lap) return b.lap - a.lap;
            return b.checkpoint - a.checkpoint;
        });
        
        const position = sortedCars.findIndex(car => car === playerCar) + 1;
        const positionText = position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : `${position}th`;
        this.positionText.setText(`Position: ${positionText}`);
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
        // Increase car speed if no one has completed a lap and we haven't reached max increases
        if (this.speedIncrease < this.maxSpeedIncreases) {
            const timeForSpeedIncrease = (this.speedIncrease + 1) * 15000; // Every 15 seconds
            if (this.gameTime >= timeForSpeedIncrease && this.cars.every(car => car.lap === 0)) {
                this.increaseCarSpeed();
            }
        }
    }
    
    increaseCarSpeed() {
        this.speedIncrease++;
        const speedMultiplier = 1 + (this.speedIncrease * 0.3); // 30% increase each time
        
        // Increase max speed for all cars
        this.cars.forEach(car => {
            car.maxSpeed = Math.min(400, car.maxSpeed * speedMultiplier);
            car.acceleration = Math.min(100, car.acceleration * speedMultiplier);
        });
        
        console.log(`Car speed increased! Level: ${this.speedIncrease}, New max speed: ${this.cars[0].maxSpeed}`);
    }

    checkGameEnd() {
        const playerCar = this.cars[this.playerPosition];
        if (playerCar.lap >= 3) {
            this.endGame();
        }

        if (this.gameTime >= this.maxGameTime) {
            this.endGame();
        }
    }

    endGame() {
        this.gameStarted = false;
        
        // Find winner based on laps and checkpoints
        const sortedCars = [...this.cars].sort((a, b) => {
            if (a.lap !== b.lap) return b.lap - a.lap;
            return b.checkpoint - a.checkpoint;
        });
        
        const winner = sortedCars[0];
        const isPlayerWinner = winner === this.cars[this.playerPosition];
        
        let result = '';
        let gameResult = '';
        
        if (this.gameTime >= this.maxGameTime) {
            // Time's up - highest position wins
            if (winner.lap > 0) {
                result = isPlayerWinner ? 'You Win!' : `Player ${winner.position + 1} Wins!`;
                gameResult = `Time's Up!\n${result}\nLaps: ${winner.lap}/3`;
            } else {
                // No one completed a lap - check for sudden death
                if (this.speedIncrease >= this.maxSpeedIncreases) {
                    result = 'Sudden Death!';
                    gameResult = 'Time\'s Up!\nSudden Death! First to complete a lap wins!';
                } else {
                    result = 'Tie!';
                    gameResult = `Time's Up!\nTie! No one completed a lap.`;
                }
            }
        } else {
            // Someone completed 3 laps
            result = isPlayerWinner ? 'You Win!' : `Player ${winner.position + 1} Wins!`;
            gameResult = `${result}\nRace Complete!\nLaps: ${winner.lap}/3`;
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
        if (this.lapText && this.lapText.active) {
            this.lapText.destroy();
            this.lapText = null;
        }
        if (this.positionText && this.positionText.active) {
            this.positionText.destroy();
            this.positionText = null;
        }
    }
    
    onDestroy() {
        this.onShutdown();
    }
}

export default RacingScene;
