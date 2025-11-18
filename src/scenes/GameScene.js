import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.paddles = {};
        this.ball = null;
        this.scores = { left: 0, right: 0 };
        this.scoreText = {};
        this.gameStarted = false;
        this.playerSide = null; // 'left' or 'right'
    }

    init(data) {
        this.playerSide = data.playerSide || 'left';
        this.roomId = data.roomId;
        this.wsConnection = data.wsConnection;
    }

    preload() {
        // Create simple shapes instead of loading images
        this.load.image('ball', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEZ0BhghQAcxgEz/HhTX0AAAAASUVORK5CYII=');
    }

    create() {
        // Set up game objects
        this.createField();
        this.createPaddles();
        this.createBall();
        this.createScoreDisplay();
        this.setupInput();
        this.setupCollisions();
        this.setupWebSocket();
    }

    createField() {
        // Draw center line
        const centerLine = this.add.graphics();
        centerLine.lineStyle(2, 0xFFFFFF, 0.3);
        centerLine.beginPath();
        centerLine.moveTo(400, 0);
        centerLine.lineTo(400, 600);
        centerLine.strokePath();
    }

    createPaddles() {
        // Create paddles as rectangles
        this.paddles.left = this.add.rectangle(50, 300, 10, 100, 0xFFFFFF);
        this.paddles.right = this.add.rectangle(750, 300, 10, 100, 0xFFFFFF);

        // Add physics to paddles
        this.physics.add.existing(this.paddles.left, true);
        this.physics.add.existing(this.paddles.right, true);
    }

    createBall() {
        // Create ball
        this.ball = this.physics.add.sprite(400, 300, 'ball');
        this.ball.setCircle(4);
        this.ball.setBounce(1);
        this.ball.setCollideWorldBounds(true);
        this.resetBall();
    }

    createScoreDisplay() {
        const textStyle = {
            fontSize: '32px',
            fill: '#fff'
        };

        this.scoreText.left = this.add.text(300, 50, '0', textStyle);
        this.scoreText.right = this.add.text(500, 50, '0', textStyle);
    }

    setupInput() {
        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add mouse/touch control
        this.input.on('pointermove', (pointer) => {
            if (this.playerSide) {
                const paddle = this.paddles[this.playerSide];
                paddle.y = Phaser.Math.Clamp(pointer.y, 50, 550);
                this.sendPaddlePosition(paddle.y);
            }
        });
    }

    setupCollisions() {
        // Add colliders between ball and paddles
        this.physics.add.collider(this.ball, this.paddles.left, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.paddles.right, this.hitPaddle, null, this);
    }

    setupWebSocket() {
        if (this.wsConnection) {
            this.wsConnection.on('gameState', this.handleGameState.bind(this));
            this.wsConnection.on('paddleMove', this.handlePaddleMove.bind(this));
            this.wsConnection.on('ballSync', this.handleBallSync.bind(this));
            this.wsConnection.on('score', this.handleScore.bind(this));
        }
    }

    hitPaddle(ball, paddle) {
        let velocity = 400;
        let deltaY = ball.y - paddle.y;
        ball.setVelocityY(10 * deltaY);
    }

    resetBall() {
        this.ball.setPosition(400, 300);
        const angle = Math.random() * Math.PI / 2 - Math.PI / 4;
        const speed = 400;
        this.ball.setVelocity(
            Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
            Math.sin(angle) * speed
        );
    }

    handleGameState(state) {
        if (state.ball) {
            this.ball.setPosition(state.ball.x, state.ball.y);
            this.ball.setVelocity(state.ball.velocityX, state.ball.velocityY);
        }

        if (state.scores) {
            this.updateScore(state.scores);
        }
    }

    handlePaddleMove(data) {
        if (data.side !== this.playerSide) {
            this.paddles[data.side].y = data.y;
        }
    }

    handleBallSync(ballData) {
        this.ball.setPosition(ballData.x, ballData.y);
        this.ball.setVelocity(ballData.velocityX, ballData.velocityY);
    }

    handleScore(scores) {
        this.updateScore(scores);
        this.resetBall();
    }

    updateScore(scores) {
        this.scores = scores;
        this.scoreText.left.setText(scores.left.toString());
        this.scoreText.right.setText(scores.right.toString());
    }

    sendPaddlePosition(y) {
        if (this.wsConnection) {
            this.wsConnection.emit('paddleMove', {
                side: this.playerSide,
                y: y,
                roomId: this.roomId
            });
        }
    }

    update() {
        // Handle keyboard input
        if (this.playerSide) {
            const paddle = this.paddles[this.playerSide];
            if (this.cursors.up.isDown) {
                paddle.y = Phaser.Math.Clamp(paddle.y - 5, 50, 550);
                this.sendPaddlePosition(paddle.y);
            } else if (this.cursors.down.isDown) {
                paddle.y = Phaser.Math.Clamp(paddle.y + 5, 50, 550);
                this.sendPaddlePosition(paddle.y);
            }
        }

        // Check for scoring
        if (this.ball.x < 0) {
            this.scores.right++;
            this.updateScore(this.scores);
            this.resetBall();
        } else if (this.ball.x > 800) {
            this.scores.left++;
            this.updateScore(this.scores);
            this.resetBall();
        }
    }
}

export default GameScene; 