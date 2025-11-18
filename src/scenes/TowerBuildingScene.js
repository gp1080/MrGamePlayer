import Phaser from 'phaser';

class TowerBuildingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TowerBuildingScene' });
        // Tower blocks for all 4 players
        this.towerBlocks1 = []; // Player 1 tower blocks
        this.towerBlocks2 = []; // Player 2 tower blocks
        this.towerBlocks3 = []; // Player 3 tower blocks
        this.towerBlocks4 = []; // Player 4 tower blocks
        
        // Current moving blocks for all 4 players
        this.currentBlock1 = null;
        this.currentBlock2 = null;
        this.currentBlock3 = null;
        this.currentBlock4 = null;
        
        // Scores and heights for all 4 players
        this.score1 = 0;
        this.score2 = 0;
        this.score3 = 0;
        this.score4 = 0;
        this.towerHeight1 = 0;
        this.towerHeight2 = 0;
        this.towerHeight3 = 0;
        this.towerHeight4 = 0;
        
        this.gameStarted = false;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minute
        this.onGameComplete = null;
        this.playerPosition = 0;
        this.numPlayers = 4; // Default to 4 players
        this.blockWidth = 90; // Slightly smaller for 4-player layout
        this.blockHeight = 25;
        this.groundY1 = 280; // Top row ground
        this.groundY2 = 580; // Bottom row ground
        this.moveSpeed = 200;
        this.fallSpeed = 400;
        this.gameEnded = false;
        this.countdownEvent = null;
        this.countdownText = null;
        this.countdownActive = false;
        this.countdownTimer = 0;
        this.moveDirection1 = 1; // 1 = right, -1 = left
        this.moveDirection2 = 1;
        this.moveDirection3 = 1;
        this.moveDirection4 = 1;
        this.isTiebreaker = false;
        this.tiebreakerStartHeight1 = 0;
        this.tiebreakerStartHeight2 = 0;
        this.tiebreakerStartHeight3 = 0;
        this.tiebreakerStartHeight4 = 0;
        this.losingPlayer = null; // Track which player placed a block that fell off
        
        // 4-player grid layout: 2x2 grid
        // Player 1: Top-left
        this.player1Area = { left: 0, right: 400, top: 0, bottom: 300, center: 200, spawnY: 80, groundY: 280 };
        // Player 2: Top-right
        this.player2Area = { left: 400, right: 800, top: 0, bottom: 300, center: 600, spawnY: 80, groundY: 280 };
        // Player 3: Bottom-left
        this.player3Area = { left: 0, right: 400, top: 300, bottom: 600, center: 200, spawnY: 380, groundY: 580 };
        // Player 4: Bottom-right
        this.player4Area = { left: 400, right: 800, top: 300, bottom: 600, center: 600, spawnY: 380, groundY: 580 };
    }

    init(data) {
        this.numPlayers = data.numPlayers || 2;
        this.playerPosition = data.playerPosition || 0;
        this.onGameComplete = data.onGameComplete;
    }

    create() {
        // Create background
        this.createBackground();

        // Create ground for both players
        this.createGround();

        // Create divider line
        this.createDivider();

        // Create UI
        this.createUI();

        // Start countdown
        this.startCountdown();
    }

    createBackground() {
        // 4-player grid: 2x2 layout
        // Player 1: Top-left (Light blue)
        this.add.rectangle(200, 150, 400, 300, 0xE8F4F8);
        // Player 2: Top-right (Light pink)
        this.add.rectangle(600, 150, 400, 300, 0xF8E8F4);
        // Player 3: Bottom-left (Light green)
        this.add.rectangle(200, 450, 400, 300, 0xE8F8E8);
        // Player 4: Bottom-right (Light yellow)
        this.add.rectangle(600, 450, 400, 300, 0xF8F8E8);
    }

    createGround() {
        // Ground for top row (Players 1 & 2)
        this.ground1 = this.add.rectangle(200, this.groundY1, 400, 20, 0x8B4513);
        this.ground2 = this.add.rectangle(600, this.groundY1, 400, 20, 0x8B4513);
        
        // Ground for bottom row (Players 3 & 4)
        this.ground3 = this.add.rectangle(200, this.groundY2, 400, 20, 0x8B4513);
        this.ground4 = this.add.rectangle(600, this.groundY2, 400, 20, 0x8B4513);
    }

    createDivider() {
        // Vertical divider line (middle)
        this.add.line(0, 0, 400, 0, 400, 600, 0x000000, 1).setLineWidth(3).setDepth(5);
        // Horizontal divider line (middle)
        this.add.line(0, 0, 0, 300, 800, 300, 0x000000, 1).setLineWidth(3).setDepth(5);
    }

    createUI() {
        // Player 1 UI (top-left)
        this.score1Text = this.add.text(10, 10, 'P1: 0', {
            fontSize: '18px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.score1Text.setDepth(10);
        this.height1Text = this.add.text(10, 32, 'H: 0', {
            fontSize: '14px',
            fill: '#000'
        });
        this.height1Text.setDepth(10);

        // Player 2 UI (top-right)
        this.score2Text = this.add.text(410, 10, 'P2: 0', {
            fontSize: '18px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.score2Text.setDepth(10);
        this.height2Text = this.add.text(410, 32, 'H: 0', {
            fontSize: '14px',
            fill: '#000'
        });
        this.height2Text.setDepth(10);

        // Player 3 UI (bottom-left)
        this.score3Text = this.add.text(10, 310, 'P3: 0', {
            fontSize: '18px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.score3Text.setDepth(10);
        this.height3Text = this.add.text(10, 332, 'H: 0', {
            fontSize: '14px',
            fill: '#000'
        });
        this.height3Text.setDepth(10);

        // Player 4 UI (bottom-right)
        this.score4Text = this.add.text(410, 310, 'P4: 0', {
            fontSize: '18px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.score4Text.setDepth(10);
        this.height4Text = this.add.text(410, 332, 'H: 0', {
            fontSize: '14px',
            fill: '#000'
        });
        this.height4Text.setDepth(10);

        // Timer text (centered)
        this.timerText = this.add.text(400, 300, '60', {
            fontSize: '32px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setDepth(10);

        // Instructions (at the bottom center)
        this.instructionsText = this.add.text(400, 585, 'Click/Tap to drop blocks!', {
            fontSize: '16px',
            fill: '#000',
            fontStyle: 'bold'
        });
        this.instructionsText.setOrigin(0.5);
        this.instructionsText.setDepth(10);
        
        // Tiebreaker message (centered, hidden initially)
        this.tiebreakerText = this.add.text(400, 300, '⚡ TIEBREAKER ROUND ⚡', {
            fontSize: '24px',
            fill: '#FF0000',
            fontStyle: 'bold'
        });
        this.tiebreakerText.setOrigin(0.5);
        this.tiebreakerText.setDepth(10);
        this.tiebreakerText.setVisible(false);
    }

    startCountdown() {
        this.countdownActive = true;
        this.countdownTimer = 3;
        this.countdownEvent = null;
        
        this.countdownText = this.add.text(400, 300, '3', {
            fontSize: '64px',
            fill: '#FF0000',
            fontStyle: 'bold'
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
                        
                        // Spawn initial blocks for all players
                        this.spawnNewBlock(1);
                        this.spawnNewBlock(2);
                        if (this.numPlayers >= 3) this.spawnNewBlock(3);
                        if (this.numPlayers >= 4) this.spawnNewBlock(4);
                        
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

    spawnNewBlock(playerNum) {
        const area = this.getPlayerArea(playerNum);
        const towerBlocks = this.getTowerBlocks(playerNum);
        
        // Determine block width based on current tower
        let blockWidth = this.blockWidth;
        if (towerBlocks.length > 0) {
            // Use the width of the last block (which may have been cut)
            const lastBlock = towerBlocks[towerBlocks.length - 1];
            blockWidth = lastBlock.width || this.blockWidth;
        }
        
        // Determine starting X position - start from center of last block
        let startX = area.center;
        if (towerBlocks.length > 0) {
            const lastBlock = towerBlocks[towerBlocks.length - 1];
            startX = lastBlock.x;
        }
        
        // Random color
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8, 0xF7DC6F, 0xBB8FCE];
        const color = Phaser.Utils.Array.GetRandom(colors);
        
        // Create moving block with current tower width
        const block = this.add.rectangle(startX, area.spawnY, blockWidth, this.blockHeight, color);
        block.setStrokeStyle(2, 0x000000);
        block.setInteractive();
        block.setData('player', playerNum);
        block.setData('falling', false);
        block.setData('moving', true);
        block.width = blockWidth; // Store width
        block.originalWidth = this.blockWidth; // Store original width for reference
        
        // Add click/tap handler to drop the block
        block.on('pointerdown', () => {
            if (this.gameStarted && !this.gameEnded && block.getData('moving')) {
                this.dropBlock(block, playerNum);
            }
        });
        
        // Store reference to current block
        if (playerNum === 1) {
            this.currentBlock1 = block;
        } else if (playerNum === 2) {
            this.currentBlock2 = block;
        } else if (playerNum === 3) {
            this.currentBlock3 = block;
        } else if (playerNum === 4) {
            this.currentBlock4 = block;
        }
    }

    getPlayerArea(playerNum) {
        if (playerNum === 1) return this.player1Area;
        if (playerNum === 2) return this.player2Area;
        if (playerNum === 3) return this.player3Area;
        if (playerNum === 4) return this.player4Area;
        return this.player1Area; // Default
    }

    getTowerBlocks(playerNum) {
        if (playerNum === 1) return this.towerBlocks1;
        if (playerNum === 2) return this.towerBlocks2;
        if (playerNum === 3) return this.towerBlocks3;
        if (playerNum === 4) return this.towerBlocks4;
        return this.towerBlocks1; // Default
    }

    getCurrentBlock(playerNum) {
        if (playerNum === 1) return this.currentBlock1;
        if (playerNum === 2) return this.currentBlock2;
        if (playerNum === 3) return this.currentBlock3;
        if (playerNum === 4) return this.currentBlock4;
        return null;
    }

    setCurrentBlock(playerNum, block) {
        if (playerNum === 1) this.currentBlock1 = block;
        else if (playerNum === 2) this.currentBlock2 = block;
        else if (playerNum === 3) this.currentBlock3 = block;
        else if (playerNum === 4) this.currentBlock4 = block;
    }

    dropBlock(block, playerNum) {
        if (!block.getData('moving')) return;
        
        block.setData('moving', false);
        block.disableInteractive();
        
        const area = this.getPlayerArea(playerNum);
        const towerBlocks = this.getTowerBlocks(playerNum);
        
        // Calculate where block should land (use area-specific ground Y)
        let landingY = area.groundY - this.blockHeight / 2;
        
        if (towerBlocks.length > 0) {
            // Place on top of the last block
            const lastBlock = towerBlocks[towerBlocks.length - 1];
            landingY = lastBlock.y - this.blockHeight;
        }
        
        // Check alignment with previous block and cut off overhang
        if (towerBlocks.length > 0) {
            const lastBlock = towerBlocks[towerBlocks.length - 1];
            // Get actual width from last block (it may have been cut)
            const lastBlockWidth = lastBlock.width || this.blockWidth;
            const lastLeft = lastBlock.x - lastBlockWidth / 2;
            const lastRight = lastBlock.x + lastBlockWidth / 2;
            // Get current block width (may have been cut from previous blocks)
            const currentBlockWidth = block.width || this.blockWidth;
            const currentLeft = block.x - currentBlockWidth / 2;
            const currentRight = block.x + currentBlockWidth / 2;
            
            // Calculate overlap
            const overlapLeft = Math.max(lastLeft, currentLeft);
            const overlapRight = Math.min(lastRight, currentRight);
            const overlapWidth = Math.max(0, overlapRight - overlapLeft);
            
            // If there's no overlap or very small overlap, game over for this player
            if (overlapWidth <= 5) {
                this.endGameForPlayer(playerNum);
                return;
            }
            
            // Adjust block width and position based on overlap
            const newWidth = overlapWidth;
            const newX = (overlapLeft + overlapRight) / 2;
            
            // Store original width for reference
            block.originalWidth = this.blockWidth;
            block.width = newWidth;
            
            // Destroy old rectangle and create new one with correct size
            const color = block.fillColor;
            const strokeColor = block.strokeColor;
            const strokeWidth = block.lineWidth;
            
            block.destroy();
            
            // Create new block with cut size
            const newBlock = this.add.rectangle(newX, landingY, newWidth, this.blockHeight, color);
            newBlock.setStrokeStyle(strokeWidth, strokeColor);
            newBlock.setData('player', playerNum);
            newBlock.setData('falling', false);
            newBlock.setData('moving', false);
            newBlock.width = newWidth;
            newBlock.originalWidth = this.blockWidth;
            
            // Replace in array
            const blockIndex = towerBlocks.indexOf(block);
            if (blockIndex > -1) {
                towerBlocks[blockIndex] = newBlock;
            } else {
                towerBlocks.push(newBlock);
            }
            
            // Update reference if it's the current block
            this.setCurrentBlock(playerNum, null);
            
            // Update score based on alignment quality
            // Use the current block's original width for percentage calculation
            const originalWidth = block.originalWidth || this.blockWidth;
            const alignmentPercent = (overlapWidth / originalWidth) * 100;
            let points = Math.floor(10 * (alignmentPercent / 100));
            if (points < 5) points = 5; // Minimum 5 points
            
            if (playerNum === 1) {
                this.score1 += points;
            } else if (playerNum === 2) {
                this.score2 += points;
            } else if (playerNum === 3) {
                this.score3 += points;
            } else if (playerNum === 4) {
                this.score4 += points;
            }
            
            // Update tower height
            this.updateTowerHeight(playerNum);
            this.updateUI();
            
            // Spawn next block after a short delay
            this.time.delayedCall(300, () => {
                if (this.gameStarted && !this.gameEnded) {
                    this.spawnNewBlock(playerNum);
                }
            });
        } else {
            // First block - just place it
            block.y = landingY;
            towerBlocks.push(block);
            
            // Update score
            if (playerNum === 1) {
                this.score1 += 10;
            } else if (playerNum === 2) {
                this.score2 += 10;
            } else if (playerNum === 3) {
                this.score3 += 10;
            } else if (playerNum === 4) {
                this.score4 += 10;
            }
            
            // Update tower height
            this.updateTowerHeight(playerNum);
            this.updateUI();
            
            // Spawn next block after a short delay
            this.time.delayedCall(300, () => {
                if (this.gameStarted && !this.gameEnded) {
                    this.spawnNewBlock(playerNum);
                }
            });
        }
    }

    updateTowerHeight(playerNum) {
        const towerBlocks = this.getTowerBlocks(playerNum);
        const area = this.getPlayerArea(playerNum);
        
        if (towerBlocks.length === 0) {
            if (playerNum === 1) {
                this.towerHeight1 = 0;
            } else if (playerNum === 2) {
                this.towerHeight2 = 0;
            } else if (playerNum === 3) {
                this.towerHeight3 = 0;
            } else if (playerNum === 4) {
                this.towerHeight4 = 0;
            }
            return;
        }
        
        // Calculate height from ground to top of highest block
        const topBlock = towerBlocks[towerBlocks.length - 1];
        const blockTop = topBlock.y - this.blockHeight / 2;
        const heightInBlocks = Math.ceil((area.groundY - blockTop) / this.blockHeight);
        
        if (playerNum === 1) {
            this.towerHeight1 = Math.max(0, heightInBlocks);
        } else if (playerNum === 2) {
            this.towerHeight2 = Math.max(0, heightInBlocks);
        } else if (playerNum === 3) {
            this.towerHeight3 = Math.max(0, heightInBlocks);
        } else if (playerNum === 4) {
            this.towerHeight4 = Math.max(0, heightInBlocks);
        }
    }

    update(time, delta) {
        if (!this.gameStarted || this.gameEnded) {
            return;
        }

        // Update moving blocks for all players
        this.updateMovingBlock(delta, 1);
        this.updateMovingBlock(delta, 2);
        if (this.numPlayers >= 3) this.updateMovingBlock(delta, 3);
        if (this.numPlayers >= 4) this.updateMovingBlock(delta, 4);

        // Update timer
        this.updateTimer(delta);

        // Check game end
        if (this.gameTime >= this.maxGameTime) {
            this.checkGameEnd();
        }
    }

    updateMovingBlock(delta, playerNum) {
        const block = this.getCurrentBlock(playerNum);
        if (!block || !block.active || !block.getData('moving')) {
            return;
        }
        
        const area = this.getPlayerArea(playerNum);
        let moveDirection;
        if (playerNum === 1) moveDirection = this.moveDirection1;
        else if (playerNum === 2) moveDirection = this.moveDirection2;
        else if (playerNum === 3) moveDirection = this.moveDirection3;
        else if (playerNum === 4) moveDirection = this.moveDirection4;
        else return;
        const deltaSeconds = delta / 1000;
        
        // Get actual block width (may have been cut)
        const blockWidth = block.width || this.blockWidth;
        
        // Move block horizontally
        block.x += this.moveSpeed * moveDirection * deltaSeconds;
        
        // Bounce off edges
        const blockLeft = block.x - blockWidth / 2;
        const blockRight = block.x + blockWidth / 2;
        
        if (blockRight >= area.right - 10) {
            block.x = area.right - 10 - blockWidth / 2;
            if (playerNum === 1) this.moveDirection1 = -1;
            else if (playerNum === 2) this.moveDirection2 = -1;
            else if (playerNum === 3) this.moveDirection3 = -1;
            else if (playerNum === 4) this.moveDirection4 = -1;
        } else if (blockLeft <= area.left + 10) {
            block.x = area.left + 10 + blockWidth / 2;
            if (playerNum === 1) this.moveDirection1 = 1;
            else if (playerNum === 2) this.moveDirection2 = 1;
            else if (playerNum === 3) this.moveDirection3 = 1;
            else if (playerNum === 4) this.moveDirection4 = 1;
        }
    }

    updateTimer(delta) {
        this.gameTime += delta;
        const remainingTime = Math.max(0, Math.floor((this.maxGameTime - this.gameTime) / 1000));
        if (this.timerText && this.timerText.active) {
            this.timerText.setText(remainingTime.toString());
            
            // Change color when time is low
            if (remainingTime <= 10) {
                this.timerText.setFill('#FF0000');
            } else {
                this.timerText.setFill('#000000');
            }
        }
    }

    updateUI() {
        if (this.score1Text && this.score1Text.active) {
            this.score1Text.setText('P1: ' + this.score1);
        }
        if (this.height1Text && this.height1Text.active) {
            this.height1Text.setText('H: ' + this.towerHeight1);
        }
        if (this.score2Text && this.score2Text.active) {
            this.score2Text.setText('P2: ' + this.score2);
        }
        if (this.height2Text && this.height2Text.active) {
            this.height2Text.setText('H: ' + this.towerHeight2);
        }
        if (this.score3Text && this.score3Text.active) {
            this.score3Text.setText('P3: ' + this.score3);
        }
        if (this.height3Text && this.height3Text.active) {
            this.height3Text.setText('H: ' + this.towerHeight3);
        }
        if (this.score4Text && this.score4Text.active) {
            this.score4Text.setText('P4: ' + this.score4);
        }
        if (this.height4Text && this.height4Text.active) {
            this.height4Text.setText('H: ' + this.towerHeight4);
        }
    }

    endGameForPlayer(playerNum) {
        // Player's block fell off - they lose
        this.losingPlayer = playerNum; // Mark this player as the loser
        
        // Clear current block for this player
        this.setCurrentBlock(playerNum, null);
        
        // End game immediately (no tiebreaker if someone falls)
        this.endGame();
    }
    
    checkGameEnd() {
        // Determine winner - highest tower wins, then highest score
        // For 4 players, find the player with the highest tower
        let winner = null;
        let _maxHeight = -1;
        let _maxScore = -1;
        
        // Find highest tower
        const heights = [
            { player: 1, height: this.towerHeight1, score: this.score1 },
            { player: 2, height: this.towerHeight2, score: this.score2 },
            { player: 3, height: this.towerHeight3, score: this.score3 },
            { player: 4, height: this.towerHeight4, score: this.score4 }
        ];
        
        // Sort by height, then by score
        heights.sort((a, b) => {
            if (b.height !== a.height) return b.height - a.height;
            return b.score - a.score;
        });
        
        // Check if there's a clear winner
        const topPlayer = heights[0];
        const secondPlayer = heights[1];
        
        if (topPlayer.height > secondPlayer.height) {
            winner = topPlayer.player;
        } else if (topPlayer.height === secondPlayer.height) {
            // Same height - check score
            if (topPlayer.score > secondPlayer.score) {
                winner = topPlayer.player;
            } else {
                // Tied - need tiebreaker
                winner = null;
            }
        }
        
        // If tied and not already in tiebreaker, start tiebreaker round
        if (winner === null && !this.isTiebreaker) {
            this.startTiebreakerRound();
        } else {
            // Game ends normally
            this.endGame();
        }
    }
    
    startTiebreakerRound() {
        console.log('Starting tiebreaker round!');
        
        this.isTiebreaker = true;
        
        // Store starting heights for tiebreaker for all players
        this.tiebreakerStartHeight1 = this.towerHeight1;
        this.tiebreakerStartHeight2 = this.towerHeight2;
        this.tiebreakerStartHeight3 = this.towerHeight3;
        this.tiebreakerStartHeight4 = this.towerHeight4;
        
        // Reset timer for 30 seconds
        this.gameTime = 0;
        this.maxGameTime = 30000; // 30 seconds
        
        // Show tiebreaker message
        if (this.tiebreakerText) {
            this.tiebreakerText.setVisible(true);
        }
        
        // Update instructions
        if (this.instructionsText) {
            this.instructionsText.setText('⚡ TIEBREAKER ROUND ⚡ - 30 seconds! Build higher!');
        }
        
        // Continue game - blocks should keep spawning if they exist
        // If no blocks are moving, spawn new ones for all players
        if (!this.currentBlock1 || !this.currentBlock1.active) {
            this.spawnNewBlock(1);
        }
        if (!this.currentBlock2 || !this.currentBlock2.active) {
            this.spawnNewBlock(2);
        }
        if (this.numPlayers >= 3 && (!this.currentBlock3 || !this.currentBlock3.active)) {
            this.spawnNewBlock(3);
        }
        if (this.numPlayers >= 4 && (!this.currentBlock4 || !this.currentBlock4.active)) {
            this.spawnNewBlock(4);
        }
    }

    endGame() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        
        console.log('Game completed: TowerBuildingScene');
        
        // Stop the game
        this.gameStarted = false;
        
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
        
        // Hide instructions and tiebreaker text
        if (this.instructionsText) {
            this.instructionsText.setVisible(false);
        }
        if (this.tiebreakerText) {
            this.tiebreakerText.setVisible(false);
        }
        
        // Clean up moving blocks for all players
        if (this.currentBlock1 && this.currentBlock1.active) {
            this.currentBlock1.destroy();
            this.currentBlock1 = null;
        }
        if (this.currentBlock2 && this.currentBlock2.active) {
            this.currentBlock2.destroy();
            this.currentBlock2 = null;
        }
        if (this.currentBlock3 && this.currentBlock3.active) {
            this.currentBlock3.destroy();
            this.currentBlock3 = null;
        }
        if (this.currentBlock4 && this.currentBlock4.active) {
            this.currentBlock4.destroy();
            this.currentBlock4 = null;
        }
        
        // Determine winner
        let winner = null;
        
        // If a player placed a block that fell off, they lose
        if (this.losingPlayer !== null) {
            // The player who placed the block that fell off loses
            // Find the winner among remaining players
            const players = [
                { player: 1, height: this.towerHeight1, score: this.score1 },
                { player: 2, height: this.towerHeight2, score: this.score2 },
                { player: 3, height: this.towerHeight3, score: this.score3 },
                { player: 4, height: this.towerHeight4, score: this.score4 }
            ].filter(p => p.player !== this.losingPlayer);
            
            // Sort remaining players by height, then score
            players.sort((a, b) => {
                if (b.height !== a.height) return b.height - a.height;
                return b.score - a.score;
            });
            
            winner = players[0] ? players[0].player : null;
        } else if (this.isTiebreaker) {
            // In tiebreaker, compare height gained during the round
            const heightGained = [
                { player: 1, gained: this.towerHeight1 - this.tiebreakerStartHeight1, height: this.towerHeight1, score: this.score1 },
                { player: 2, gained: this.towerHeight2 - this.tiebreakerStartHeight2, height: this.towerHeight2, score: this.score2 },
                { player: 3, gained: this.towerHeight3 - this.tiebreakerStartHeight3, height: this.towerHeight3, score: this.score3 },
                { player: 4, gained: this.towerHeight4 - this.tiebreakerStartHeight4, height: this.towerHeight4, score: this.score4 }
            ];
            
            // Sort by height gained, then total height, then score
            heightGained.sort((a, b) => {
                if (b.gained !== a.gained) return b.gained - a.gained;
                if (b.height !== a.height) return b.height - a.height;
                return b.score - a.score;
            });
            
            winner = heightGained[0].player;
        } else {
            // Normal game end (time ran out) - find highest tower
            const players = [
                { player: 1, height: this.towerHeight1, score: this.score1 },
                { player: 2, height: this.towerHeight2, score: this.score2 },
                { player: 3, height: this.towerHeight3, score: this.score3 },
                { player: 4, height: this.towerHeight4, score: this.score4 }
            ];
            
            // Sort by height, then score
            players.sort((a, b) => {
                if (b.height !== a.height) return b.height - a.height;
                return b.score - a.score;
            });
            
            winner = players[0].player;
        }
        
        // Display game over message
        const bg = this.add.rectangle(400, 300, 700, 400, 0x000000, 0.85);
        bg.setDepth(99);
        
        let gameOverText;
        if (this.isTiebreaker) {
            gameOverText = this.add.text(400, 200, 'Tiebreaker Over!', {
                fontSize: '48px',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            });
        } else {
            gameOverText = this.add.text(400, 200, 'Game Over!', {
                fontSize: '48px',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            });
        }
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(100);
        
        let winnerText;
        if (winner === 1) {
            winnerText = this.add.text(400, 280, 'Player 1 Wins!', {
                fontSize: '36px',
                fill: '#4ECDC4',
                fontStyle: 'bold'
            });
        } else if (winner === 2) {
            winnerText = this.add.text(400, 280, 'Player 2 Wins!', {
                fontSize: '36px',
                fill: '#FF6B6B',
                fontStyle: 'bold'
            });
        } else if (winner === 3) {
            winnerText = this.add.text(400, 280, 'Player 3 Wins!', {
                fontSize: '36px',
                fill: '#90EE90',
                fontStyle: 'bold'
            });
        } else if (winner === 4) {
            winnerText = this.add.text(400, 280, 'Player 4 Wins!', {
                fontSize: '36px',
                fill: '#FFFF99',
                fontStyle: 'bold'
            });
        } else {
            winnerText = this.add.text(400, 280, 'Tie Game!', {
                fontSize: '36px',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            });
        }
        winnerText.setOrigin(0.5);
        winnerText.setDepth(100);
        
        // Display stats for all players
        const statsY = [330, 360, 390, 420];
        
        if (this.numPlayers >= 1) {
            const p1Stats = this.add.text(400, statsY[0], `P1: ${this.towerHeight1} blocks, ${this.score1} pts`, {
                fontSize: '20px',
                fill: '#FFFFFF'
            });
            p1Stats.setOrigin(0.5);
            p1Stats.setDepth(100);
        }
        
        if (this.numPlayers >= 2) {
            const p2Stats = this.add.text(400, statsY[1], `P2: ${this.towerHeight2} blocks, ${this.score2} pts`, {
                fontSize: '20px',
                fill: '#FFFFFF'
            });
            p2Stats.setOrigin(0.5);
            p2Stats.setDepth(100);
        }
        
        if (this.numPlayers >= 3) {
            const p3Stats = this.add.text(400, statsY[2], `P3: ${this.towerHeight3} blocks, ${this.score3} pts`, {
                fontSize: '20px',
                fill: '#FFFFFF'
            });
            p3Stats.setOrigin(0.5);
            p3Stats.setDepth(100);
        }
        
        if (this.numPlayers >= 4) {
            const p4Stats = this.add.text(400, statsY[3], `P4: ${this.towerHeight4} blocks, ${this.score4} pts`, {
                fontSize: '20px',
                fill: '#FFFFFF'
            });
            p4Stats.setOrigin(0.5);
            p4Stats.setDepth(100);
        }
        
        // Wait before calling callback
        this.time.delayedCall(3000, () => {
            if (this.onGameComplete) {
                this.onGameComplete({
                    gameType: 'towerbuilding',
                    score: this.score1,
                    score2: this.score2,
                    score3: this.score3,
                    score4: this.score4,
                    height: this.towerHeight1,
                    height2: this.towerHeight2,
                    height3: this.towerHeight3,
                    height4: this.towerHeight4,
                    blocksPlaced: this.towerBlocks1.length,
                    blocksPlaced2: this.towerBlocks2.length,
                    blocksPlaced3: this.towerBlocks3.length,
                    blocksPlaced4: this.towerBlocks4.length,
                    winner: winner,
                    time: Math.floor(this.gameTime / 1000),
                    tiebreaker: this.isTiebreaker
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

export default TowerBuildingScene;
