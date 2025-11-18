import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

const Game = () => {
    useEffect(() => {
        const gameContainer = document.getElementById('phaser-game');
        
        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 300,
            backgroundColor: '#87CEEB',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: false
                }
            },
            scene: GameScene,
            parent: 'phaser-game',
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NO_CENTER,
                width: 400,
                height: 300
            },
            callbacks: {
                postBoot: (game) => {
                    // Force the game to stay within its container
                    game.scale.resize(400, 300);
                }
            }
        };

        const game = new Phaser.Game(config);

        // Additional containment
        if (gameContainer) {
            gameContainer.style.maxWidth = '400px';
            gameContainer.style.maxHeight = '300px';
            gameContainer.style.overflow = 'hidden';
        }

        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div 
            id="phaser-game" 
            style={{
                width: '400px',
                height: '300px',
                border: '2px solid #fff',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'blue'  // Debug color
            }}
        />
    );
};

export default Game; 