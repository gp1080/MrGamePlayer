import Phaser from 'phaser';
// These imports are used dynamically via this.scene.start()
// eslint-disable-next-line no-unused-vars
import SimplePongScene from './SimplePongScene';
// eslint-disable-next-line no-unused-vars
import MultiPongScene from './MultiPongScene';
// eslint-disable-next-line no-unused-vars
import RockPaperScissorsScene from './RockPaperScissorsScene';
// eslint-disable-next-line no-unused-vars
import SnakeScene from './SnakeScene';
// eslint-disable-next-line no-unused-vars
import PlatformJumpScene from './PlatformJumpScene';
// eslint-disable-next-line no-unused-vars
import ClumsyBirdScene from './ClumsyBirdScene';
// eslint-disable-next-line no-unused-vars
import TicTacToeScene from './TicTacToeScene';
// eslint-disable-next-line no-unused-vars
import TowerBuildingScene from './TowerBuildingScene';
// eslint-disable-next-line no-unused-vars
import EndlessRunnerScene from './EndlessRunnerScene';
// eslint-disable-next-line no-unused-vars
import ChessScene from './ChessScene';
// eslint-disable-next-line no-unused-vars
import TetrisScene from './TetrisScene';

class GameManager extends Phaser.Scene {
    constructor() {
        super({ key: 'GameManager' });
        this.currentGame = null;
        this.gameData = null;
        this.onGameComplete = null;
    }

    init(data) {
        this.gameData = data;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Start the appropriate game based on gameType
        this.startGame(this.gameData.gameType);
    }

    startGame(gameType) {
        console.log('Starting game:', gameType);
        console.log('Game type received:', JSON.stringify(gameType));
        console.log('Game type length:', gameType ? gameType.length : 'undefined');
        
        switch (gameType) {
            case 'pong':
                // Use MultiPongScene for 4+ players, SimplePongScene for 2 players
                const numPlayers = this.gameData.numPlayers || 2;
                if (numPlayers > 2) {
                    this.currentGame = 'MultiPongScene';
                    this.scene.start('MultiPongScene', {
                        ...this.gameData,
                        onGameComplete: () => this.handleGameComplete()
                    });
                } else {
                    this.currentGame = 'SimplePongScene';
                    // Determine playerSide based on playerPosition (0 = left, 1 = right)
                    const playerSide = (this.gameData.playerPosition === 0 || this.gameData.playerPosition % 2 === 0) ? 'left' : 'right';
                    this.scene.start('SimplePongScene', {
                        ...this.gameData,
                        playerSide: playerSide,
                        onGameComplete: () => this.handleGameComplete()
                    });
                }
                break;
            case 'racing':
            case 'race':
            case 'rps':
                this.currentGame = 'RockPaperScissorsScene';
                this.scene.start('RockPaperScissorsScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
                   case 'snake':
                       this.currentGame = 'SnakeScene';
                       this.scene.start('SnakeScene', {
                           ...this.gameData,
                           onGameComplete: () => this.handleGameComplete()
                       });
                       break;
            case 'platform':
                console.log('Platform case matched! Starting PlatformJumpScene');
                this.currentGame = 'PlatformJumpScene';
                this.scene.start('PlatformJumpScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'clumsybird':
            case 'flappy':
            case 'bird':
                console.log('Clumsy Bird case matched! Starting ClumsyBirdScene');
                this.currentGame = 'ClumsyBirdScene';
                this.scene.start('ClumsyBirdScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'tictactoe':
            case 'blockbreaker':
            case 'arkanoid':
            case 'breakout':
                console.log('Tic Tac Toe case matched! Starting TicTacToeScene');
                this.currentGame = 'TicTacToeScene';
                this.scene.start('TicTacToeScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'towerbuilding':
            case 'tower':
            case 'stacking':
            case 'blocks':
            case 'spaceinvaders':
            case 'invaders':
            case 'space':
                console.log('Tower Building case matched! Starting TowerBuildingScene');
                this.currentGame = 'TowerBuildingScene';
                this.scene.start('TowerBuildingScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'endlessrunner':
            case 'runner':
            case 'endless':
                console.log('Endless Runner case matched! Starting EndlessRunnerScene');
                this.currentGame = 'EndlessRunnerScene';
                this.scene.start('EndlessRunnerScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'tetris':
                console.log('Tetris case matched! Starting TetrisScene');
                this.currentGame = 'TetrisScene';
                this.scene.start('TetrisScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'chess':
                console.log('Chess case matched! Starting ChessScene');
                this.currentGame = 'ChessScene';
                this.scene.start('ChessScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'bomberman':
                // For now, use racing as placeholder
                this.currentGame = 'RacingScene';
                this.scene.start('RacingScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'tank':
                // For now, use pong as placeholder
                this.currentGame = 'SimplePongScene';
                this.scene.start('SimplePongScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'puzzle':
                // For now, use snake as placeholder
                this.currentGame = 'SnakeScene';
                this.scene.start('SnakeScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'shooter':
                // For now, use racing as placeholder
                this.currentGame = 'RacingScene';
                this.scene.start('RacingScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            case 'maze':
                // For now, use pong as placeholder
                this.currentGame = 'SimplePongScene';
                this.scene.start('SimplePongScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
                break;
            default:
                // Default to pong
                console.log('Default case reached! Game type was:', gameType);
                this.currentGame = 'SimplePongScene';
                this.scene.start('SimplePongScene', {
                    ...this.gameData,
                    onGameComplete: () => this.handleGameComplete()
                });
        }
    }

    handleGameComplete() {
        console.log('Game completed:', this.currentGame);
        if (this.onGameComplete) {
            this.onGameComplete();
        }
    }
}

export default GameManager;
