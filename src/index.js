import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { GameSyncProvider } from './contexts/GameSyncContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <WebSocketProvider>
            <GameSyncProvider>
                <App />
            </GameSyncProvider>
        </WebSocketProvider>
    </React.StrictMode>
); 