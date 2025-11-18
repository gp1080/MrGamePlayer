import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';

const GameBetting = ({ 
    gameType, 
    playerCount, 
    onBetPlaced, 
    onGameStart, 
    onGameComplete,
    roomId: _roomId,
    roomSettings = { useTokens: true, betAmount: '10' }
}) => {
    const { account } = useWallet();
    const { contract } = useContract();
    const [betAmount, setBetAmount] = useState(
        roomSettings.useTokens && roomSettings.betAmount ? parseFloat(roomSettings.betAmount) : 10
    );
    const [totalPot, setTotalPot] = useState(0);
    const [players, setPlayers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [commission, setCommission] = useState(0);
    const [userBalance, setUserBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Commission rate - 7.5% for all games
    const COMMISSION_RATE = 7.5;

    const MIN_BET = 60;  // Minimum 60 MGP (6 MATIC per contract: 1 MGP = 0.1 MATIC)
    const MAX_BET = 1000; // Maximum 1000 tokens

    const fetchUserBalance = React.useCallback(async () => {
        try {
            if (contract && account) {
                const balance = await contract.balanceOf(account);
                setUserBalance(parseInt(balance.toString()) / 1e18);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    }, [contract, account]);

    useEffect(() => {
        if (account && contract) {
            fetchUserBalance();
        }
    }, [account, contract, fetchUserBalance]);

    const handleBetChange = (amount) => {
        const numAmount = parseFloat(amount);
        if (numAmount >= MIN_BET && numAmount <= MAX_BET) {
            setBetAmount(numAmount);
        } else if (numAmount < MIN_BET) {
            // Show warning if below minimum
            setBetAmount(numAmount);
        }
    };

    const placeBet = async () => {
        if (!account || !contract) {
            alert('Please connect your wallet first');
            return;
        }

        if (betAmount > userBalance) {
            alert('Insufficient token balance');
            return;
        }

        setIsLoading(true);
        try {
            // Convert to wei
            const betAmountWei = (betAmount * 1e18).toString();
            
            // Approve tokens for betting contract
            const approveTx = await contract.approve(process.env.REACT_APP_BETTING_CONTRACT, betAmountWei);
            await approveTx.wait();

            // Place bet (this would call your betting contract)
            // For now, we'll simulate the bet placement
            const newPlayer = {
                address: account,
                betAmount: betAmount,
                timestamp: Date.now()
            };

            setPlayers(prev => [...prev, newPlayer]);
            setTotalPot(prev => prev + betAmount);
            
            if (onBetPlaced) {
                onBetPlaced(newPlayer);
            }

            // Check if we have enough players to start
            if (players.length + 1 >= playerCount) {
                startGame();
            }

        } catch (error) {
            console.error('Error placing bet:', error);
            alert('Failed to place bet. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const startGame = () => {
        setGameStarted(true);
        if (onGameStart) {
            onGameStart();
        }
    };

    const completeGame = (winnerAddress) => {
        setGameCompleted(true);
        setWinner(winnerAddress);
        
        // Calculate commission (7.5% for all games)
        const totalCommission = (totalPot * COMMISSION_RATE) / 100;
        const winnerReward = totalPot - totalCommission;
        
        setCommission(totalCommission);
        
        if (onGameComplete) {
            onGameComplete({
                winner: winnerAddress,
                totalPot: totalPot,
                winnerReward: winnerReward,
                commission: totalCommission,
                players: players
            });
        }
    };

    const resetGame = () => {
        setPlayers([]);
        setTotalPot(0);
        setGameStarted(false);
        setGameCompleted(false);
        setWinner(null);
        setCommission(0);
    };

    const formatTokens = (amount) => {
        return `${amount} MGP`;
    };

    if (gameCompleted) {
        return (
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '20px', color: '#4CAF50' }}>
                    🎉 Game Complete!
                </h2>
                
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                        Winner: {winner === account ? 'You!' : `${winner?.slice(0, 6)}...${winner?.slice(-4)}`}
                    </div>
                    <div style={{ color: '#4CAF50', fontSize: '24px', fontWeight: 'bold' }}>
                        +{formatTokens(totalPot - commission)} MGP
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <div style={{ color: '#999' }}>
                        Total Pot: {formatTokens(totalPot)}
                    </div>
                    <div style={{ color: '#FF9800' }}>
                        Commission: {formatTokens(commission)}
                    </div>
                </div>

                <button
                    onClick={resetGame}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Play Again
                </button>
            </div>
        );
    }

    if (gameStarted) {
        return (
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '20px' }}>
                    🎮 Game in Progress
                </h2>
                
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                        Total Pot: {formatTokens(totalPot)}
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        Players: {players.length}/{playerCount}
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => completeGame(account)} // Simulate winning
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginRight: '10px'
                        }}
                    >
                        🏆 I Won!
                    </button>
                    <button
                        onClick={() => completeGame(players[0]?.address)} // Simulate losing
                        style={{
                            backgroundColor: '#F44336',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        😞 I Lost
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '30px',
            color: 'white'
        }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                💰 Place Your Bet
            </h2>

            {/* Game Info */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                    {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game
                </div>
                <div style={{ color: '#999', fontSize: '14px' }}>
                    Players: {players.length}/{playerCount} • Commission: {COMMISSION_RATE}%
                </div>
            </div>

            {/* Bet Amount */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Bet Amount (MGP Tokens):
                    {roomSettings.useTokens && roomSettings.betAmount && (
                        <span style={{ 
                            fontSize: '12px', 
                            color: '#999', 
                            marginLeft: '10px',
                            fontWeight: 'normal'
                        }}>
                            Room bet: {roomSettings.betAmount} MGP
                        </span>
                    )}
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => handleBetChange(e.target.value)}
                        min={MIN_BET}
                        max={MAX_BET}
                        disabled={roomSettings.useTokens && roomSettings.betAmount ? true : false}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: roomSettings.useTokens && roomSettings.betAmount ? '#2d2d2d' : '#333',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: roomSettings.useTokens && roomSettings.betAmount ? '#999' : 'white',
                            fontSize: '16px',
                            cursor: roomSettings.useTokens && roomSettings.betAmount ? 'not-allowed' : 'text'
                        }}
                    />
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        Balance: {userBalance.toFixed(2)} MGP
                    </div>
                </div>
                {roomSettings.useTokens && roomSettings.betAmount && (
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#4CAF50', 
                        marginTop: '5px',
                        padding: '8px',
                        backgroundColor: '#1a3a1a',
                        borderRadius: '4px'
                    }}>
                        ℹ️ This room uses a fixed bet amount of {roomSettings.betAmount} MGP per player
                    </div>
                )}
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    Min: {MIN_BET} MGP • Max: {MAX_BET} MGP
                </div>
            </div>

            {/* Current Pot */}
            {totalPot > 0 && (
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>
                        Current Pot: {formatTokens(totalPot)}
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        Winner takes: {formatTokens(totalPot - (totalPot * COMMISSION_RATE) / 100)}
                    </div>
                </div>
            )}

            {/* Players List */}
            {players.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Players ({players.length}):</h4>
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {players.map((player, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px',
                                backgroundColor: '#333',
                                borderRadius: '4px',
                                marginBottom: '5px',
                                fontSize: '14px'
                            }}>
                                <span>
                                    {player.address === account ? 'You' : `${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
                                </span>
                                <span style={{ color: '#4CAF50' }}>
                                    {formatTokens(player.betAmount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Minimum Bet Warning */}
            {betAmount < MIN_BET && betAmount > 0 && (
                <div style={{
                    backgroundColor: '#3a1a1a',
                    border: '1px solid #F44336',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    color: '#F44336'
                }}>
                    ⚠️ Minimum bet is {MIN_BET} MGP (or $1 USD equivalent)
                </div>
            )}

            {/* Place Bet Button */}
            <button
                onClick={placeBet}
                disabled={isLoading || betAmount > userBalance || betAmount < MIN_BET}
                style={{
                    width: '100%',
                    backgroundColor: betAmount > userBalance || betAmount < MIN_BET ? '#666' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '8px',
                    cursor: betAmount > userBalance || betAmount < MIN_BET ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }}
            >
                {isLoading ? 'Placing Bet...' : `Place Bet (${formatTokens(betAmount)})`}
            </button>

            {/* Play for Fun Button */}
            <button
                onClick={() => onGameStart && onGameStart()}
                style={{
                    width: '100%',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
            >
                🎮 Play for Fun (No Tokens)
            </button>

            {/* Commission Info */}
            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#333',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#999',
                textAlign: 'center'
            }}>
                💡 House commission: {COMMISSION_RATE}% • Winner gets: {100 - COMMISSION_RATE}% of total pot
            </div>
        </div>
    );
};

export default GameBetting;
