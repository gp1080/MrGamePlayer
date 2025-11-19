import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ContractProvider } from './contexts/ContractContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { FriendsProvider } from './contexts/FriendsContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Welcome from './pages/Welcome';
import Rules from './pages/Rules';
import Terms from './pages/Terms';
import GameLobby from './components/game/GameLobby';
import GameRoom from './components/game/GameRoom';
import GameTestMode from './components/game/GameTestMode';
import Dashboard from './components/dashboard/Dashboard';
import TokenInterface from './components/token/TokenInterface';
import Profile from './pages/Profile';
import GameInvites from './components/friends/GameInvites';
import './styles/global.css';

const App = () => {
    return (
        <WalletProvider>
            <WebSocketProvider>
                <ContractProvider>
                    <UserProfileProvider>
                        <FriendsProvider>
                        <Router>
                            <div style={{
                                minHeight: '100vh',
                                backgroundColor: '#121212',
                                display: 'flex'
                            }}>
                                <Navigation />
                                
                                <div style={{
                                    flex: 1,
                                    marginLeft: '70px', // Match collapsed navigation width
                                    minHeight: '100vh',
                                    position: 'relative',
                                    transition: 'margin-left 0.3s ease'
                                }}>
                                    <Header />
                                    
                                    {/* Game Invites - Shows globally */}
                                    <GameInvites />
                                    
                                    <main style={{
                                        padding: '90px 30px 30px',
                                        maxWidth: '1400px',
                                        margin: '0 auto'
                                    }}>
                                               <Routes>
                                                   <Route path="/" element={<Welcome />} />
                                                   <Route path="/welcome" element={<Welcome />} />
                                                   <Route path="/rules" element={<Rules />} />
                                                   <Route path="/terms" element={<Terms />} />
                                                   <Route path="/lobby" element={<GameLobby />} />
                                                   <Route path="/room/:roomId" element={<GameRoom />} />
                                                   <Route path="/test" element={<GameTestMode />} />
                                                   <Route path="/dashboard" element={<Dashboard />} />
                                                   <Route path="/token" element={<TokenInterface />} />
                                                   <Route path="/profile" element={<Profile />} />
                                               </Routes>
                                    </main>
                                </div>
                            </div>
                        </Router>
                        </FriendsProvider>
                    </UserProfileProvider>
                </ContractProvider>
            </WebSocketProvider>
        </WalletProvider>
    );
};

// Styles
// eslint-disable-next-line no-unused-vars
const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    ':hover': {
        backgroundColor: '#3d3d3d'
    }
};

// Helper Components
// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '15px',
        borderRadius: '6px',
        color: 'white'
    }}>
        <div style={{ fontSize: '14px', color: '#999' }}>{title}</div>
        <div style={{ fontSize: '18px', marginTop: '5px' }}>{value}</div>
    </div>
);

// eslint-disable-next-line no-unused-vars
const ActionButton = ({ children }) => (
    <button style={{
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#45a049'
        }
    }}>
        {children}
    </button>
);

export default App; 