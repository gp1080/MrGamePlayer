import React from 'react';
import Game from './Game';

const App = () => {
    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#333'
        }}>
            <Game />
        </div>
    );
};

export default App; 