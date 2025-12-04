import React from 'react';

const Card = ({ title, children, icon, gradient, onClick }) => {
    const gradients = {
        primary: 'linear-gradient(135deg, #00b4db, #0083b0)',
        success: 'linear-gradient(135deg, #43a047, #1b5e20)',
        warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
        danger: 'linear-gradient(135deg, #ff5252, #d32f2f)',
        info: 'linear-gradient(135deg, #2196f3, #1976d2)',
        dark: 'linear-gradient(135deg, #424242, #212121)',
    };

    return (
        <div 
            onClick={onClick}
            style={{
                background: '#1E1E1E',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #333',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
            }}>
            {gradient && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: gradients[gradient] || gradients.primary
                }} />
            )}
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                {icon && (
                    <span style={{
                        fontSize: '24px',
                        marginRight: '12px',
                        opacity: 0.9
                    }}>
                        {icon}
                    </span>
                )}
                <h3 style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: '500'
                }}>
                    {title}
                </h3>
            </div>
            
            <div style={{ color: '#ccc' }}>
                {children}
            </div>
        </div>
    );
};

export default Card; 