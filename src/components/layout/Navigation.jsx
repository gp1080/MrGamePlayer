import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const navItems = [
        { path: '/', label: 'Welcome', icon: '👋' },
        { path: '/lobby', label: 'Game Lobby', icon: '🎮' },
        { path: '/profile', label: 'Profile', icon: '👤' },
        { path: '/rules', label: 'Rules', icon: '📋' },
        { path: '/terms', label: 'Terms', icon: '📄' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/token', label: 'Token', icon: '💎' }
    ];

    const collapsedWidth = '70px';
    const expandedWidth = '250px';

    return (
        <nav 
            style={{
                backgroundColor: '#1E1E1E',
                padding: '15px 0',
                position: 'fixed',
                width: isExpanded ? expandedWidth : collapsedWidth,
                height: '100vh',
                left: 0,
                top: 0,
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
                transition: 'width 0.3s ease',
                zIndex: 1000,
                overflow: 'hidden'
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div style={{
                padding: '20px',
                marginBottom: '30px',
                borderBottom: '1px solid #333',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
            }}>
                <h1 style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: isExpanded ? '24px' : '0px',
                    fontWeight: 'bold',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'all 0.3s ease',
                    width: isExpanded ? 'auto' : '0px'
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
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            padding: '12px 20px',
                            color: location.pathname === item.path ? '#4CAF50' : '#fff',
                            textDecoration: 'none',
                            backgroundColor: isHovered === index ? '#2d2d2d' : 
                                          location.pathname === item.path ? '#2d2d2d' : 'transparent',
                            borderRadius: '8px',
                            margin: '5px 0',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                        onMouseEnter={() => setIsHovered(index)}
                        onMouseLeave={() => setIsHovered(null)}
                        title={!isExpanded ? item.label : ''}
                    >
                        <span style={{ 
                            fontSize: '20px',
                            minWidth: '24px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            {item.icon}
                        </span>
                        <span style={{ 
                            fontSize: '16px',
                            marginLeft: isExpanded ? '12px' : '0px',
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? 'auto' : '0px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease'
                        }}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navigation; 