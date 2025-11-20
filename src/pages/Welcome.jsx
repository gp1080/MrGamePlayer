import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import GnomeMascot from '../components/common/GnomeMascot';

const Welcome = () => {
    const navigate = useNavigate();
    const { account, connectWallet, isConnecting, error } = useWallet();
    const [videoError, setVideoError] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: 'white',
            fontFamily: 'var(--font-primary)'
        }}>
            {/* Hero Section */}
            <div style={{
                textAlign: 'center',
                maxWidth: '1200px',
                marginBottom: '60px',
                width: '100%'
            }}>
                {/* Video Animation */}
                <div style={{
                    marginBottom: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '300px'
                }}>
                    {!videoError ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            onError={(e) => {
                                console.error('Video loading error:', e);
                                console.error('Video element:', e.target);
                                console.error('Video error details:', e.target.error);
                                setVideoError(true);
                            }}
                            onLoadedData={() => {
                                console.log('Video loaded successfully');
                            }}
                            onLoadStart={() => {
                                console.log('Video loading started');
                            }}
                            onCanPlay={() => {
                                console.log('Video can play');
                            }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                                border: '3px solid #4CAF50',
                                backgroundColor: '#1a1a1a',
                                display: 'block'
                            }}
                        >
                            <source src={`${process.env.PUBLIC_URL || ''}/generated_video.mp4`} type="video/mp4" />
                            <source src="/generated_video.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div style={{
                            width: '100%',
                            maxWidth: '800px',
                            height: '400px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                            border: '3px solid #4CAF50',
                            backgroundColor: '#1a1a1a',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '40px'
                        }}>
                            <div style={{ fontSize: '80px' }}>🎮</div>
                            <h2 style={{
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 'var(--font-bold)',
                                background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Welcome to MrGamePlayer
                            </h2>
                            <p style={{ color: '#999', textAlign: 'center' }}>
                                Get ready for an amazing gaming experience!
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <GnomeMascot size="xl" color="brown" animated={true} />
                    <h1 style={{
                        fontSize: 'var(--text-6xl)',
                        fontWeight: 'var(--font-extrabold)',
                        background: 'linear-gradient(45deg, #4CAF50, #2196F3, #FF9800)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 'var(--leading-tight)'
                    }}>
                        Welcome to MrGamePlayer
                    </h1>
                    <GnomeMascot size="xl" color="green" animated={true} />
                </div>
                
                <p style={{
                    fontSize: 'var(--text-xl)',
                    color: '#ccc',
                    marginBottom: '40px',
                    lineHeight: 'var(--leading-relaxed)'
                }}>
                    The ultimate multiplayer gaming platform where you can play, compete, and earn tokens!
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '30px',
                    marginBottom: '50px'
                }}>
                    <div style={{
                        backgroundColor: '#2d2d2d',
                        padding: '30px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '2px solid #333'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎮</div>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '10px' }}>Play Games</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: '#999' }}>
                            Enjoy classic games like Pong, Snake, Rock Paper Scissors, and Platform Jump
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        padding: '30px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '2px solid #333'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '10px' }}>Compete</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: '#999' }}>
                            Battle against other players in real-time multiplayer games
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#2d2d2d',
                        padding: '30px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '2px solid #333'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>💰</div>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '10px' }}>Earn Tokens</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: '#999' }}>
                            Win games to earn MGP tokens and climb the leaderboard
                        </p>
                    </div>
                </div>
            </div>

            {/* Wallet Connection Section */}
            {!account && (
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    padding: '30px',
                    marginBottom: '40px',
                    textAlign: 'center',
                    border: '2px solid #333'
                }}>
                    <h3 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-semibold)',
                        marginBottom: '15px',
                        color: '#4CAF50'
                    }}>
                        🔗 Connect Your Wallet
                    </h3>
                    <p style={{
                        color: '#ccc',
                        marginBottom: '20px',
                        fontSize: 'var(--text-base)'
                    }}>
                        Connect your Web3 wallet (MetaMask, Phantom, etc.) to start playing and earning tokens!
                    </p>
                    
                    {error && (
                        <div style={{
                            backgroundColor: '#F44336',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                            fontSize: 'var(--text-sm)'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        style={{
                            backgroundColor: isConnecting ? '#666' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '8px',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-semibold)',
                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isConnecting) {
                                e.target.style.backgroundColor = '#45a049';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isConnecting) {
                                e.target.style.backgroundColor = '#4CAF50';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                            }
                        }}
                    >
                        {isConnecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
                    </button>
                </div>
            )}

            {/* Connected Wallet Info */}
            {account && (
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '40px',
                    textAlign: 'center',
                    border: '2px solid #4CAF50'
                }}>
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        marginBottom: '10px',
                        color: '#4CAF50'
                    }}>
                        ✅ Wallet Connected
                    </h3>
                    <p style={{
                        color: '#ccc',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => navigate('/lobby')}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#45a049';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4CAF50';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                    }}
                >
                    🎮 Start Playing
                </button>

                <button
                    onClick={() => navigate('/rules')}
                    style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1976D2';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#2196F3';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
                    }}
                >
                    📋 View Rules
                </button>

                <button
                    onClick={() => navigate('/terms')}
                    style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#555';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#666';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    📄 Terms & Conditions
                </button>
            </div>

            {/* Social Media Links */}
            <div style={{
                marginTop: '60px',
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-semibold)',
                    marginBottom: '20px',
                    color: '#fff'
                }}>
                    Join Our Community
                </h3>
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <a
                        href="https://discord.gg/sNxT6X7t"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: '#5865F2',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(88, 101, 242, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#4752C4';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(88, 101, 242, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#5865F2';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(88, 101, 242, 0.3)';
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>💬</span>
                        Discord
                    </a>
                    
                    <a
                        href="https://x.com/MrGamePlayer10"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: '#000000',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            border: '1px solid #333'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1a1a1a';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#000000';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>🐦</span>
                        Follow us on X
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '40px',
                textAlign: 'center',
                color: '#999',
                fontSize: 'var(--text-sm)'
            }}>
                <p>Ready to start your gaming journey? Let's play! 🚀</p>
            </div>
        </div>
    );
};

export default Welcome;
