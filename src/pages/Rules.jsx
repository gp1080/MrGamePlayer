import React from 'react';
import { useNavigate } from 'react-router-dom';

const Rules = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            padding: '40px 20px',
            color: 'white',
            fontFamily: 'var(--font-primary)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '50px'
                }}>
                    <h1 style={{
                        fontSize: 'var(--text-5xl)',
                        fontWeight: 'var(--font-extrabold)',
                        marginBottom: '20px',
                        background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Game Rules & Guidelines
                    </h1>
                    <p style={{
                        fontSize: 'var(--text-lg)',
                        color: '#ccc',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Everything you need to know about playing on MrGamePlayer
                    </p>
                </div>

                {/* Mobile Compatibility Notice */}
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    padding: '25px',
                    border: '2px solid #4CAF50',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: '15px',
                        color: '#4CAF50'
                    }}>
                        📱 Mobile Compatible
                    </h2>
                    <p style={{
                        fontSize: 'var(--text-base)',
                        lineHeight: 'var(--leading-relaxed)',
                        color: '#ccc'
                    }}>
                        <strong>All games are fully playable on mobile devices!</strong> Touch controls are available for all games. 
                        Simply tap/click on-screen buttons or use touch gestures to play. Games automatically adapt to your device's screen size.
                    </p>
                </div>

                {/* Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                    marginBottom: '40px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                    >
                        🏠 Home
                    </button>
                    <button
                        onClick={() => navigate('/lobby')}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
                    >
                        🎮 Start Playing
                    </button>
                </div>

                {/* Rules Content */}
                <div style={{
                    display: 'grid',
                    gap: '30px'
                }}>
                    {/* General Rules */}
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '30px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-bold)',
                            marginBottom: '20px',
                            color: '#4CAF50'
                        }}>
                            🎮 General Game Rules
                        </h2>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            lineHeight: 'var(--leading-relaxed)'
                        }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#4CAF50' }}>•</span>
                                <span>Most games have a <strong>1-minute time limit</strong> (some games like Chess and Tetris have 5 minutes)</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#4CAF50' }}>•</span>
                                <span>Players can choose between <strong>1, 2, 4, or 8 players</strong> per game session (varies by game)</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#4CAF50' }}>•</span>
                                <span>Games can be played <strong>for fun (no chips)</strong> or <strong>with gaming chips (MGP Chips)</strong></span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#4CAF50' }}>•</span>
                                <span>Random game selection is available for quick gameplay</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#4CAF50' }}>•</span>
                                <span><strong>All games support mobile devices</strong> with touch controls</span>
                            </li>
                        </ul>
                    </div>

                    {/* Game-Specific Rules */}
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '30px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-bold)',
                            marginBottom: '20px',
                            color: '#2196F3'
                        }}>
                            🎯 Game-Specific Rules
                        </h2>
                        
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {/* Multi-Pong */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🏓 Multi-Pong (2-8 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Arrow keys or WASD to move paddle (Mobile: Touch buttons)</li>
                                    <li><strong>Objective:</strong> Hit the ball past opponents to score points</li>
                                    <li><strong>Winning:</strong> Player with most points when time runs out wins</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls</li>
                                </ul>
                            </div>

                            {/* Rock Paper Scissors */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🪨 Rock Paper Scissors (2 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Keys 1 (Rock), 2 (Paper), 3 (Scissors) (Mobile: Touch buttons)</li>
                                    <li><strong>Format:</strong> Best of 3 rounds</li>
                                    <li><strong>Winning:</strong> First player to win 2 rounds wins the game</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch buttons</li>
                                </ul>
                            </div>

                            {/* Battle Snake */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🐍 Battle Snake (2-8 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Arrow keys or WASD to change direction (Mobile: Swipe gestures)</li>
                                    <li><strong>Objective:</strong> Collect yellow food to grow and score points</li>
                                    <li><strong>Winning:</strong> Last snake standing wins, or highest score if time runs out</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with swipe controls</li>
                                </ul>
                            </div>

                            {/* Platform Jump */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🦘 Platform Jump (2-4 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Arrow keys/WASD to move, Space/Up to jump (Mobile: Touch buttons)</li>
                                    <li><strong>Objective:</strong> Collect golden coins and stay on platforms</li>
                                    <li><strong>Winning:</strong> Player with most coins wins. If tied, longest survival time wins</li>
                                    <li><strong>Special:</strong> Platforms start moving down and disappearing when 30 seconds remain</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls</li>
                                </ul>
                            </div>

                            {/* Clumsy Bird */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🐦 Clumsy Bird (2-8 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Space or Up arrow to flap (Mobile: Tap screen)</li>
                                    <li><strong>Objective:</strong> Fly through pipes without hitting them</li>
                                    <li><strong>Winning:</strong> Last bird flying wins, or highest score if time runs out</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with tap controls</li>
                                </ul>
                            </div>

                            {/* Tic Tac Toe */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>⭕ Tic Tac Toe (2 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Format:</strong> 3 rounds with increasing difficulty</li>
                                    <li><strong>Round 1:</strong> 3x3 board, connect 3 to win</li>
                                    <li><strong>Round 2:</strong> 5x5 board, connect 4 to win</li>
                                    <li><strong>Round 3:</strong> 10x10 board, connect 5 to win</li>
                                    <li><strong>Tiebreaker:</strong> If tied after 3 rounds, play another 10x10 round</li>
                                    <li><strong>Controls:</strong> Click/tap on squares to place your mark (Mobile: Touch squares)</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls</li>
                                </ul>
                            </div>

                            {/* Tower Building */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🏗️ Tower Building (2-4 players)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Click/Tap to drop blocks (Mobile: Touch to drop)</li>
                                    <li><strong>Objective:</strong> Build the tallest tower by stacking blocks</li>
                                    <li><strong>Winning:</strong> Tallest tower wins. If tied, 30-second tiebreaker round</li>
                                    <li><strong>Important:</strong> If your block falls off the tower, you lose immediately</li>
                                    <li><strong>Difficulty:</strong> Blocks get narrower as you build higher</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls</li>
                                </ul>
                            </div>

                            {/* Endless Runner */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🏃 Endless Runner (1v1)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Player 1 Controls:</strong> SPACE to jump, DOWN/S to crouch (Mobile: Touch buttons)</li>
                                    <li><strong>Player 2 Controls:</strong> UP/W to jump, X to crouch (Mobile: Touch buttons)</li>
                                    <li><strong>Objective:</strong> Run, jump over rectangles, crouch under triangles, collect coins</li>
                                    <li><strong>Winning:</strong> If time runs out and both alive: most coins wins, then longest survival time</li>
                                    <li><strong>Obstacles:</strong> Rectangles (jump over), Triangles (crouch under)</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls (only shows controls for your player)</li>
                                </ul>
                            </div>

                            {/* Chess */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>♟️ Chess (2 players, 5 minutes)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Controls:</strong> Click piece then click destination (Mobile: Touch piece then touch destination)</li>
                                    <li><strong>Objective:</strong> Checkmate opponent's king or capture the king</li>
                                    <li><strong>Winning:</strong> Checkmate, king capture, or opponent's time runs out</li>
                                    <li><strong>Special Rules:</strong> When in check, only moves that resolve check are allowed</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls</li>
                                </ul>
                            </div>

                            {/* Tetris */}
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <h3 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '18px' }}>🧩 Tetris (2 players, 5 minutes)</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                                    <li><strong>Player 1 Controls:</strong> Arrow keys (move/down), SPACE (hard drop), R (rotate)</li>
                                    <li><strong>Player 2 Controls:</strong> WASD (move/down), E (hard drop), Q (rotate)</li>
                                    <li><strong>Objective:</strong> Clear lines by filling rows completely</li>
                                    <li><strong>Winning:</strong> Highest score when time runs out wins</li>
                                    <li><strong>Scoring:</strong> More lines cleared at once = more points</li>
                                    <li><strong>Mobile:</strong> ✅ Fully supported with touch controls</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Token Rules */}
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '30px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-bold)',
                            marginBottom: '20px',
                            color: '#FF9800'
                        }}>
                            🎴 MGP Chips & Gaming Infrastructure Rules
                        </h2>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            lineHeight: 'var(--leading-relaxed)'
                        }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span><strong>MGP Chips</strong> are ERC-1155 NFTs representing gaming power (1 Chip = 1 MGP value)</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>Acquire chips by converting POL (or USDC) into transferable gaming chips</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>No minimum bet required - play with any amount of gaming chips</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>Platform takes a <strong>7.5% infrastructure fee</strong> from each game (minted as chips to treasury)</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>Winners receive gaming chips from the prize pool</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>Gaming chips are fully transferable NFTs - send chips to friends or other players</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>Redeem chips back to POL at current market price from QuickSwap</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#FF9800' }}>•</span>
                                <span>All transactions are recorded on the blockchain for transparency</span>
                            </li>
                        </ul>
                    </div>

                    {/* Fair Play */}
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        padding: '30px',
                        border: '2px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-bold)',
                            marginBottom: '20px',
                            color: '#F44336'
                        }}>
                            ⚖️ Fair Play & Conduct
                        </h2>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            lineHeight: 'var(--leading-relaxed)'
                        }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#F44336' }}>•</span>
                                <span>No cheating, hacking, or exploiting game mechanics</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#F44336' }}>•</span>
                                <span>Respect other players and maintain good sportsmanship</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#F44336' }}>•</span>
                                <span>No inappropriate language or behavior in chat</span>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', color: '#F44336' }}>•</span>
                                <span>Violations may result in temporary or permanent bans</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '50px',
                    padding: '30px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    border: '2px solid #333'
                }}>
                    <p style={{ color: '#999', fontSize: 'var(--text-base)' }}>
                        Questions about the rules? Contact our support team or check our Terms & Conditions.
                    </p>
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={() => navigate('/terms')}
                            style={{
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                marginRight: '10px'
                            }}
                        >
                            Terms & Conditions
                        </button>
                        <button
                            onClick={() => navigate('/lobby')}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer'
                            }}
                        >
                            Start Playing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rules;
