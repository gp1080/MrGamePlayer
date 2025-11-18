import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
                maxWidth: '1000px',
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
                        Terms & Conditions
                    </h1>
                    <p style={{
                        fontSize: 'var(--text-lg)',
                        color: '#ccc',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Please read these terms carefully before using MrGamePlayer
                    </p>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: '#999',
                        marginTop: '10px'
                    }}>
                        Last updated: {new Date().toLocaleDateString()}
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
                        onClick={() => navigate('/welcome')}
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
                        👋 Welcome
                    </button>
                    <button
                        onClick={() => navigate('/rules')}
                        style={{
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F57C00'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#FF9800'}
                    >
                        📋 Rules
                    </button>
                </div>

                {/* Terms Content */}
                <div style={{
                    display: 'grid',
                    gap: '30px'
                }}>
                    {/* Acceptance */}
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
                            1. Acceptance of Terms
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            By accessing and using MrGamePlayer ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                        <p style={{ lineHeight: 'var(--leading-relaxed)' }}>
                            These terms apply to all visitors, users, and others who access or use the Platform.
                        </p>
                    </div>

                    {/* Service Description */}
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
                            2. Service Description
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            MrGamePlayer is a blockchain-based multiplayer gaming platform that allows users to:
                        </p>
                        <ul style={{ paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                            <li>Play multiplayer games including Multi-Pong, Battle Snake, Rock Paper Scissors, Platform Jump, Clumsy Bird, Endless Runner, Tic Tac Toe, Tower Building, Chess, and Tetris</li>
                            <li>Participate in token-based betting and competitions (2-player and 4-player games available)</li>
                            <li>Earn and trade MGP tokens</li>
                            <li>Connect with other players through our platform</li>
                        </ul>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginTop: '15px', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                            <strong>4-Player Games:</strong> Multi-Pong, Battle Snake, Platform Jump, Clumsy Bird, Tower Building<br/>
                            <strong>2-Player Games:</strong> Tic Tac Toe, Chess, Tetris, Rock Paper Scissors, Endless Runner
                        </p>
                    </div>

                    {/* User Accounts */}
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
                            3. User Accounts & Wallet Connection
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            To use certain features of the Platform, you may need to connect a cryptocurrency wallet (such as MetaMask). You are responsible for:
                        </p>
                        <ul style={{ paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                            <li>Maintaining the security of your wallet and private keys</li>
                            <li>All activities that occur under your wallet address</li>
                            <li>Ensuring you have sufficient tokens for transactions</li>
                            <li>Understanding the risks associated with cryptocurrency transactions</li>
                        </ul>
                    </div>

                    {/* Token Usage */}
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
                            color: '#9C27B0'
                        }}>
                            4. MGP Token Usage & Betting
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            The Platform uses MGP tokens for betting and rewards. By participating in token-based games, you acknowledge that:
                        </p>
                        <ul style={{ paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                            <li>All bets are final and cannot be refunded once placed</li>
                            <li>The Platform takes a <strong>7.5% commission</strong> from each game</li>
                            <li>Minimum bet: <strong>60 MGP tokens</strong> (or equivalent to $1 USD)</li>
                            <li>Token values may fluctuate and are not guaranteed</li>
                            <li>You are responsible for any tax implications of your winnings</li>
                            <li>Gambling laws may apply in your jurisdiction</li>
                            <li>Winner receives the total pot minus the 7.5% platform commission</li>
                        </ul>
                    </div>

                    {/* Prohibited Uses */}
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
                            5. Prohibited Uses
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            You may not use the Platform:
                        </p>
                        <ul style={{ paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                            <li>To submit false or misleading information</li>
                            <li>To upload or transmit viruses or any other type of malicious code</li>
                            <li>To attempt to gain unauthorized access to the Platform or related systems</li>
                        </ul>
                    </div>

                    {/* Disclaimers */}
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
                            color: '#FF5722'
                        }}>
                            6. Disclaimers & Limitation of Liability
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                        </p>
                        <ul style={{ paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                            <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                            <li>Warranties regarding the accuracy, reliability, or completeness of content</li>
                            <li>Warranties that the Platform will be uninterrupted, secure, or error-free</li>
                        </ul>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginTop: '15px' }}>
                            IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                        </p>
                    </div>

                    {/* Privacy */}
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
                            color: '#00BCD4'
                        }}>
                            7. Privacy & Data Protection
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)', marginBottom: '15px' }}>
                            Your privacy is important to us. We collect and process personal data in accordance with applicable privacy laws. By using the Platform, you consent to:
                        </p>
                        <ul style={{ paddingLeft: '20px', lineHeight: 'var(--leading-relaxed)' }}>
                            <li>Collection of wallet addresses and transaction data</li>
                            <li>Storage of game statistics and performance data</li>
                            <li>Use of cookies and similar technologies</li>
                            <li>Sharing of anonymized data for platform improvement</li>
                        </ul>
                    </div>

                    {/* Termination */}
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
                            color: '#795548'
                        }}>
                            8. Termination
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)' }}>
                            We may terminate or suspend your access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Platform will cease immediately.
                        </p>
                    </div>

                    {/* Changes */}
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
                            color: '#607D8B'
                        }}>
                            9. Changes to Terms
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)' }}>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms.
                        </p>
                    </div>

                    {/* Contact */}
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
                            10. Contact Information
                        </h2>
                        <p style={{ lineHeight: 'var(--leading-relaxed)' }}>
                            If you have any questions about these Terms & Conditions, please contact us through our support channels or visit our help center.
                        </p>
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
                    <p style={{ color: '#999', fontSize: 'var(--text-base)', marginBottom: '20px' }}>
                        By using MrGamePlayer, you agree to these terms and conditions.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                fontSize: 'var(--text-base)',
                                cursor: 'pointer'
                            }}
                        >
                            I Accept - Start Playing
                        </button>
                        <button
                            onClick={() => navigate('/rules')}
                            style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                fontSize: 'var(--text-base)',
                                cursor: 'pointer'
                            }}
                        >
                            View Game Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
