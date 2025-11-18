import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(null);

    const navItems = [
        { path: '/', label: 'Welcome', icon: '👋' },
        { path: '/lobby', label: 'Game Lobby', icon: '🎮' },
        { path: '/profile', label: 'Profile', icon: '👤' },
        { path: '/rules', label: 'Rules', icon: '📋' },
        { path: '/terms', label: 'Terms', icon: '📄' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/token', label: 'Token', icon: '💎' }
    ];

    return (
        <nav style={{
            backgroundColor: '#1E1E1E',
            padding: '15px 0',
            position: 'fixed',
            width: '250px',
            height: '100vh',
            left: 0,
            top: 0,
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)'
        }}>
            <div style={{
                padding: '20px',
                marginBottom: '30px',
                borderBottom: '1px solid #333'
            }}>
                <h1 style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 'bold'
                }}>
                    Mr Game Player
                </h1>
            </div>

            <div style={{ padding: '0 10px' }}>
                {navItems.map((item, index) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 20px',
                            color: location.pathname === item.path ? '#4CAF50' : '#fff',
                            textDecoration: 'none',
                            backgroundColor: isHovered === index ? '#2d2d2d' : 
                                          location.pathname === item.path ? '#2d2d2d' : 'transparent',
                            borderRadius: '8px',
                            margin: '5px 0',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={() => setIsHovered(index)}
                        onMouseLeave={() => setIsHovered(null)}
                    >
                        <span style={{ marginRight: '12px', fontSize: '20px' }}>{item.icon}</span>
                        <span style={{ fontSize: '16px' }}>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navigation; 