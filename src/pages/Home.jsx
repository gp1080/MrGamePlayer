import React from 'react';
// import Game from '../components/Game';  // Temporarily comment out
import TokenInterface from '../components/token/TokenInterface';

const Home = () => {
    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#1a1a1a',
            padding: '20px',
            paddingTop: '80px'  // Space for header
        }}>
            {/* Token Interface */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: '#1F2937',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h1 style={{
                    color: 'white',
                    marginBottom: '20px',
                    fontSize: '24px'
                }}>
                    Mr Game Player Token (MGP)
                </h1>
                <TokenInterface />
            </div>
        </div>
    );
};

export default Home; 