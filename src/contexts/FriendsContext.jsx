import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useUserProfile } from './UserProfileContext';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
    const { account } = useWallet();
    const { getNickname, getDisplayName } = useUserProfile();
    const [friends, setFriends] = useState([]);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [gameInvites, setGameInvites] = useState([]);

    // Simulate fetching friends list
    useEffect(() => {
        if (account) {
            // Load friends from localStorage
            const storedFriends = localStorage.getItem(`friends_${account}`);
            if (storedFriends) {
                try {
                    const friendsList = JSON.parse(storedFriends);
                    // Update friends with nicknames
                    const updatedFriends = friendsList.map(friend => ({
                        ...friend,
                        name: getNickname(friend.address) || friend.name || getDisplayName(friend.address)
                    }));
                    setFriends(updatedFriends);
                } catch (e) {
                    console.error('Error loading friends:', e);
                }
            } else {
                // Default friends for demo
                setFriends([
                    { address: '0x1234...5678', name: getDisplayName('0x1234...5678'), status: 'online' },
                    { address: '0x8765...4321', name: getDisplayName('0x8765...4321'), status: 'in-game' },
                    { address: '0x9876...1234', name: getDisplayName('0x9876...1234'), status: 'offline' },
                ]);
            }

            // Load friend requests from localStorage
            const storedRequests = localStorage.getItem(`friendRequests_${account}`);
            if (storedRequests) {
                try {
                    const requestsList = JSON.parse(storedRequests);
                    const updatedRequests = requestsList.map(request => ({
                        ...request,
                        name: getNickname(request.address) || request.name || getDisplayName(request.address)
                    }));
                    setFriendRequests(updatedRequests);
                } catch (e) {
                    console.error('Error loading friend requests:', e);
                }
            }
        }
    }, [account, getNickname, getDisplayName]);

    const addFriend = async (address) => {
        if (!account) return;
        
        const newFriend = {
            address,
            name: getNickname(address) || getDisplayName(address),
            status: 'offline'
        };
        
        setFriends(prev => {
            // Check if friend already exists
            if (prev.some(f => f.address.toLowerCase() === address.toLowerCase())) {
                return prev;
            }
            
            const updated = [...prev, newFriend];
            // Save to localStorage
            localStorage.setItem(`friends_${account}`, JSON.stringify(updated));
            return updated;
        });
    };

    const removeFriend = async (address) => {
        if (!account) return;
        
        setFriends(prev => {
            const updated = prev.filter(friend => friend.address.toLowerCase() !== address.toLowerCase());
            localStorage.setItem(`friends_${account}`, JSON.stringify(updated));
            return updated;
        });
    };

    const acceptFriendRequest = async (address) => {
        if (!account) return;
        
        setFriendRequests(prev => {
            const updated = prev.filter(request => request.address.toLowerCase() !== address.toLowerCase());
            localStorage.setItem(`friendRequests_${account}`, JSON.stringify(updated));
            return updated;
        });
        await addFriend(address);
    };

    const sendFriendRequest = async (address) => {
        if (!account) return;
        
        const newRequest = {
            address,
            name: getNickname(address) || getDisplayName(address)
        };
        
        setFriendRequests(prev => {
            // Check if request already exists
            if (prev.some(r => r.address.toLowerCase() === address.toLowerCase())) {
                return prev;
            }
            
            const updated = [...prev, newRequest];
            localStorage.setItem(`friendRequests_${account}`, JSON.stringify(updated));
            return updated;
        });
    };

    // Get WebSocket connection from window or context
    const getWebSocket = () => {
        // Try to get from window if available (set by WebSocketContext)
        if (window.__websocket__) {
            return window.__websocket__;
        }
        return null;
    };

    const sendGameInvite = async (friendAddress, roomId) => {
        if (!account || !roomId) return;
        
        const ws = getWebSocket();
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Send invite via WebSocket
            ws.send(JSON.stringify({
                type: 'SEND_INVITE',
                data: {
                    roomId,
                    inviter: account,
                    invitee: friendAddress,
                    timestamp: Date.now()
                }
            }));
        } else {
            // Fallback: Store invite locally (for testing without WebSocket)
            console.log(`Inviting ${friendAddress} to room ${roomId} (WebSocket not available)`);
        }
    };

    const acceptGameInvite = async (inviteId, roomId) => {
        if (!account) return;
        
        const ws = getWebSocket();
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Accept invite and join room via WebSocket
            ws.send(JSON.stringify({
                type: 'ACCEPT_INVITE',
                data: {
                    inviteId,
                    roomId,
                    player: account
                }
            }));
        }
        
        // Remove invite from list and localStorage
        setGameInvites(prev => {
            const updated = prev.filter(inv => inv.id !== inviteId);
            localStorage.setItem(`gameInvites_${account}`, JSON.stringify(updated));
            return updated;
        });
    };

    const rejectGameInvite = async (inviteId) => {
        if (!account) return;
        
        const ws = getWebSocket();
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'REJECT_INVITE',
                data: { inviteId }
            }));
        }
        
        // Remove invite from list and localStorage
        setGameInvites(prev => {
            const updated = prev.filter(inv => inv.id !== inviteId);
            localStorage.setItem(`gameInvites_${account}`, JSON.stringify(updated));
            return updated;
        });
    };

    // Listen for incoming invites via WebSocket messages
    useEffect(() => {
        if (account) {
            // Load invites from localStorage
            const storedInvites = localStorage.getItem(`gameInvites_${account}`);
            if (storedInvites) {
                try {
                    setGameInvites(JSON.parse(storedInvites));
                } catch (e) {
                    console.error('Error loading game invites:', e);
                }
            }
            
            // Listen for new invites via custom event
            const handleInviteReceived = (event) => {
                const inviteData = event.detail;
                const newInvite = {
                    id: inviteData.inviteId || Date.now().toString(),
                    roomId: inviteData.roomId,
                    inviter: inviteData.inviter,
                    timestamp: inviteData.timestamp || Date.now()
                };
                
                setGameInvites(prev => {
                    // Check if invite already exists
                    if (prev.some(inv => inv.id === newInvite.id || (inv.roomId === newInvite.roomId && inv.inviter === newInvite.inviter))) {
                        return prev;
                    }
                    
                    const updated = [...prev, newInvite];
                    localStorage.setItem(`gameInvites_${account}`, JSON.stringify(updated));
                    return updated;
                });
            };
            
            window.addEventListener('gameInviteReceived', handleInviteReceived);
            
            return () => {
                window.removeEventListener('gameInviteReceived', handleInviteReceived);
            };
        }
    }, [account]);

    return (
        <FriendsContext.Provider value={{
            friends,
            onlineFriends,
            friendRequests,
            gameInvites,
            addFriend,
            removeFriend,
            acceptFriendRequest,
            sendFriendRequest,
            sendGameInvite,
            acceptGameInvite,
            rejectGameInvite
        }}>
            {children}
        </FriendsContext.Provider>
    );
};

export const useFriends = () => {
    const context = useContext(FriendsContext);
    if (!context) {
        throw new Error('useFriends must be used within a FriendsProvider');
    }
    return context;
}; 