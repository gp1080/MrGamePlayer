import Phaser from 'phaser';

class RockPaperScissorsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RockPaperScissorsScene' });
        this.playerChoice = null;
        this.aiChoice = null;
        this.playerScore = 0;
        this.aiScore = 0;
        this.round = 1;
        this.maxRounds = 3;
        this.gameOver = false;
        this.winner = null;
        this.choices = ['rock', 'paper', 'scissors'];
        this.choiceButtons = {};
        this.statusText = null;
        this.scoreText = null;
        this.roundText = null;
        this.resultText = null;
        this.playerChoiceDisplay = null;
        this.aiChoiceDisplay = null;
        this.onGameComplete = null;
        this.suddenDeath = false;
        this.backgroundGraphics = null;
    }

    init(data) {
        this.playerPosition = data.playerPosition || 0;
        this.numPlayers = data.numPlayers || 2;
        this.players = data.players || [];
        this.alivePlayers = data.alivePlayers || 0;
        this.onGameComplete = data.onGameComplete || null;
        this.roomId = data.roomId;
        this.wsConnection = data.wsConnection;
        this.waitingForOpponent = false;
        this.opponentChoice = null;
    }

    create() {
        // Create styled background
        this.createBackground();
        
        // Create title with gradient effect
        this.createTitle();

        // Create round display
        this.roundText = this.add.text(400, 100, `Round ${this.round} of ${this.maxRounds}`, {
            fontSize: '24px',
            fill: '#ffd700',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create score display with better styling
        this.scoreText = this.add.text(400, 140, `Player: ${this.playerScore} | AI: ${this.aiScore}`, {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create status text
        this.statusText = this.add.text(400, 200, 'Choose your move!', {
            fontSize: '24px',
            fill: '#4CAF50',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create choice buttons
        this.createChoiceButtons();

        // Create choice displays
        this.createChoiceDisplays();

        // Create result text
        this.resultText = this.add.text(400, 450, '', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create continue button (initially hidden)
        this.continueButton = this.add.text(400, 500, 'Continue', {
            fontSize: '18px',
            fill: '#4CAF50',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 },
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5).setInteractive().setVisible(false);

        this.continueButton.on('pointerdown', () => {
            this.nextRound();
        });

        this.continueButton.on('pointerover', () => {
            this.continueButton.setStyle({ backgroundColor: '#555' });
        });

        this.continueButton.on('pointerout', () => {
            this.continueButton.setStyle({ backgroundColor: '#333' });
        });
    }

    createBackground() {
        // Set background color
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Create decorative graphics
        this.backgroundGraphics = this.add.graphics();

        // Add decorative circles
        this.backgroundGraphics.lineStyle(2, 0x4CAF50, 0.3);
        for (let i = 0; i < 5; i++) {
            const x = 100 + (i * 150);
            const y = 100 + (i * 80);
            this.backgroundGraphics.strokeCircle(x, y, 30 + (i * 10));
        }

        // Add some floating particles
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            const size = Math.random() * 3 + 1;
            this.backgroundGraphics.fillStyle(0x4CAF50, 0.2);
            this.backgroundGraphics.fillCircle(x, y, size);
        }

        // Add gradient overlay effect using rectangles
        this.backgroundGraphics.fillStyle(0x16213e, 0.3);
        this.backgroundGraphics.fillRect(0, 0, 800, 200);
        
        this.backgroundGraphics.fillStyle(0x0f3460, 0.2);
        this.backgroundGraphics.fillRect(0, 400, 800, 200);
    }

    createTitle() {
        // Create title with shadow effect
        this.add.text(402, 52, '🪨 Rock Paper Scissors 🪨', {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 50, '🪨 Rock Paper Scissors 🪨', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    createChoiceButtons() {
        const buttonY = 350; // Lowered from 300
        const buttonSpacing = 120;
        const totalWidth = (this.choices.length - 1) * buttonSpacing;
        const startX = 400 - (totalWidth / 2); // Properly centered

        this.choices.forEach((choice, index) => {
            const x = startX + (index * buttonSpacing);
            const emoji = this.getChoiceEmoji(choice);
            
            // Create button background
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x333333);
            buttonBg.fillRoundedRect(x - 50, buttonY - 30, 100, 60, 10);
            buttonBg.lineStyle(2, 0x4CAF50, 0.8);
            buttonBg.strokeRoundedRect(x - 50, buttonY - 30, 100, 60, 10);
            
            this.choiceButtons[choice] = this.add.text(x, buttonY, `${emoji}\n${choice.toUpperCase()}`, {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: 'Arial, sans-serif',
                align: 'center',
                stroke: '#000',
                strokeThickness: 1
            }).setOrigin(0.5).setInteractive();

            this.choiceButtons[choice].on('pointerdown', () => {
                this.makeChoice(choice);
            });

            this.choiceButtons[choice].on('pointerover', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x555555);
                buttonBg.fillRoundedRect(x - 50, buttonY - 30, 100, 60, 10);
                buttonBg.lineStyle(3, 0x4CAF50, 1);
                buttonBg.strokeRoundedRect(x - 50, buttonY - 30, 100, 60, 10);
            });

            this.choiceButtons[choice].on('pointerout', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x333333);
                buttonBg.fillRoundedRect(x - 50, buttonY - 30, 100, 60, 10);
                buttonBg.lineStyle(2, 0x4CAF50, 0.8);
                buttonBg.strokeRoundedRect(x - 50, buttonY - 30, 100, 60, 10);
            });
        });
    }

    createChoiceDisplays() {
        // Player choice display with background - lowered position
        const playerBg = this.add.graphics();
        playerBg.fillStyle(0x2d2d2d, 0.8);
        playerBg.fillRoundedRect(120, 420, 160, 60, 10); // Lowered from 320 to 420
        playerBg.lineStyle(2, 0x4CAF50, 0.8);
        playerBg.strokeRoundedRect(120, 420, 160, 60, 10);

        this.playerChoiceDisplay = this.add.text(200, 450, 'Player Choice:\n?', { // Lowered from 350 to 450
            fontSize: '16px',
            fill: '#4CAF50',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // AI choice display with background - lowered position
        const aiBg = this.add.graphics();
        aiBg.fillStyle(0x2d2d2d, 0.8);
        aiBg.fillRoundedRect(520, 420, 160, 60, 10); // Lowered from 320 to 420
        aiBg.lineStyle(2, 0xff6b6b, 0.8);
        aiBg.strokeRoundedRect(520, 420, 160, 60, 10);

        this.aiChoiceDisplay = this.add.text(600, 450, 'AI Choice:\n?', { // Lowered from 350 to 450
            fontSize: '16px',
            fill: '#ff6b6b',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5);
    }

    getChoiceEmoji(choice) {
        const emojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };
        return emojis[choice] || '?';
    }

    makeChoice(choice) {
        if (this.gameOver) return;

        this.playerChoice = choice;
        this.playerChoiceDisplay.setText(`Player Choice:\n${this.getChoiceEmoji(choice)}\n${choice.toUpperCase()}`);

        // Disable buttons
        Object.values(this.choiceButtons).forEach(button => {
            button.setStyle({ fill: '#666' });
            button.disableInteractive();
        });

        // Send choice to other player via WebSocket (if available)
        if (this.wsConnection && this.wsConnection.emit) {
            this.wsConnection.emit({
                type: 'RPS_CHOICE',
                data: {
                    roomId: this.roomId,
                    playerPosition: this.playerPosition,
                    choice: choice
                }
            });
        }
        
        this.statusText.setText('Waiting for opponent...');
        
        // For now, wait for opponent choice via WebSocket
        // TODO: Implement WebSocket sync for opponent choice
        // Temporarily use AI as fallback until WebSocket sync is implemented
        this.waitingForOpponent = true;
        this.time.delayedCall(5000, () => {
            if (this.waitingForOpponent) {
                // Timeout - use AI as fallback
                this.aiMakeChoice();
            }
        });
    }

    aiMakeChoice() {
        // AI makes random choice
        this.aiChoice = Phaser.Utils.Array.GetRandom(this.choices);
        this.aiChoiceDisplay.setText(`AI Choice:\n${this.getChoiceEmoji(this.aiChoice)}\n${this.aiChoice.toUpperCase()}`);

        this.determineWinner();
    }

    determineWinner() {
        const result = this.getGameResult(this.playerChoice, this.aiChoice);
        
        let resultText = '';
        let resultColor = '#fff';

        switch (result) {
            case 'win':
                this.playerScore++;
                if (this.suddenDeath) {
                    resultText = '⚡ SUDDEN DEATH WIN! ⚡';
                    resultColor = '#4CAF50';
                    this.endGame();
                    return;
                } else {
                    resultText = 'You Win! 🎉';
                    resultColor = '#4CAF50';
                }
                break;
            case 'lose':
                this.aiScore++;
                if (this.suddenDeath) {
                    resultText = '⚡ SUDDEN DEATH LOSS! ⚡';
                    resultColor = '#ff6b6b';
                    this.endGame();
                    return;
                } else {
                    resultText = 'AI Wins! 😢';
                    resultColor = '#ff6b6b';
                }
                break;
            case 'tie':
                if (this.suddenDeath) {
                    resultText = "⚡ SUDDEN DEATH TIE! ⚡\nPlay Again!";
                    resultColor = '#ffd700';
                    this.continueButton.setText('Play Again').setVisible(true);
                } else {
                    resultText = "It's a Tie! 🤝";
                    resultColor = '#ffd700';
                }
                break;
            default:
                break;
        }

        this.resultText.setText(resultText).setStyle({ fill: resultColor });
        this.statusText.setText(resultText).setStyle({ fill: resultColor });

        // Update score
        this.scoreText.setText(`Player: ${this.playerScore} | AI: ${this.aiScore}`);

        // Check if game is over
        if (this.round >= this.maxRounds) {
            this.checkForSuddenDeath();
        } else {
            this.continueButton.setVisible(true);
        }
    }

    getGameResult(player, ai) {
        if (player === ai) return 'tie';
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        
        return winConditions[player] === ai ? 'win' : 'lose';
    }

    nextRound() {
        this.round++;
        
        if (this.suddenDeath) {
            this.roundText.setText('⚡ SUDDEN DEATH ⚡');
        } else {
            this.roundText.setText(`Round ${this.round} of ${this.maxRounds}`);
        }
        
        // Reset for next round
        this.playerChoice = null;
        this.aiChoice = null;
        this.resultText.setText('');
        this.statusText.setText('Choose your move!').setStyle({ fill: '#4CAF50' });
        this.playerChoiceDisplay.setText('Player Choice:\n?');
        this.aiChoiceDisplay.setText('AI Choice:\n?');
        this.continueButton.setVisible(false);

        // Re-enable buttons
        Object.values(this.choiceButtons).forEach(button => {
            button.setStyle({ fill: '#fff' });
            button.setInteractive();
        });
    }

    checkForSuddenDeath() {
        if (this.playerScore === this.aiScore) {
            // It's a tie! Start sudden death
            this.suddenDeath = true;
            this.statusText.setText('⚡ SUDDEN DEATH! ⚡ First to win wins!').setStyle({ fill: '#ff6b6b' });
            this.roundText.setText('⚡ SUDDEN DEATH ⚡');
            this.continueButton.setText('Start Sudden Death').setVisible(true);
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.gameOver = true;
        
        // Determine overall winner
        if (this.playerScore > this.aiScore) {
            this.winner = 'player';
            this.statusText.setText('🎉 You Win the Game! 🎉').setStyle({ fill: '#4CAF50' });
        } else if (this.aiScore > this.playerScore) {
            this.winner = 'ai';
            this.statusText.setText('😢 AI Wins the Game! 😢').setStyle({ fill: '#ff6b6b' });
        } else {
            this.winner = 'tie';
            this.statusText.setText('🤝 It\'s a Tie Game! 🤝').setStyle({ fill: '#ffd700' });
        }

        this.resultText.setText(`Final Score: Player ${this.playerScore} - ${this.aiScore} AI`);
        
        // Show restart button
        this.continueButton.setText('Play Again').setVisible(true);
        this.continueButton.on('pointerdown', () => {
            this.restartGame();
        });

        // Call game complete callback
        if (this.onGameComplete) {
            this.time.delayedCall(2000, () => {
                this.onGameComplete();
            });
        }
    }

    restartGame() {
        // Reset game state
        this.playerScore = 0;
        this.aiScore = 0;
        this.round = 1;
        this.gameOver = false;
        this.winner = null;
        this.playerChoice = null;
        this.aiChoice = null;
        this.suddenDeath = false;

        // Reset UI
        this.roundText.setText(`Round ${this.round} of ${this.maxRounds}`);
        this.scoreText.setText(`Player: ${this.playerScore} | AI: ${this.aiScore}`);
        this.statusText.setText('Choose your move!').setStyle({ fill: '#4CAF50' });
        this.resultText.setText('');
        this.playerChoiceDisplay.setText('Player Choice:\n?');
        this.aiChoiceDisplay.setText('AI Choice:\n?');
        this.continueButton.setText('Continue').setVisible(false);

        // Re-enable buttons
        Object.values(this.choiceButtons).forEach(button => {
            button.setStyle({ fill: '#fff' });
            button.setInteractive();
        });
    }

    update() {
        // Game logic is handled in event callbacks
    }
}

export default RockPaperScissorsScene;