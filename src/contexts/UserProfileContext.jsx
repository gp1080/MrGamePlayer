import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const { account } = useWallet();
    const [nickname, setNickname] = useState('');
    const [userProfiles, setUserProfiles] = useState({}); // Store all user profiles (address -> nickname)

    // Load nickname from localStorage when account changes
    useEffect(() => {
        if (account) {
            // Load current user's nickname
            const storedNickname = localStorage.getItem(`nickname_${account}`);
            if (storedNickname) {
                setNickname(storedNickname);
            } else {
                setNickname('');
            }

            // Load all user profiles from localStorage
            loadUserProfiles();
        }
    }, [account]);

    // Load all user profiles from localStorage
    const loadUserProfiles = () => {
        const profiles = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('nickname_')) {
                const address = key.replace('nickname_', '');
                const nickname = localStorage.getItem(key);
                if (nickname) {
                    profiles[address.toLowerCase()] = nickname;
                }
            }
        }
        setUserProfiles(profiles);
    };

    // Update nickname for current user
    const updateNickname = (newNickname) => {
        if (!account) return;

        const trimmedNickname = newNickname.trim();
        if (trimmedNickname.length === 0) {
            // Remove nickname if empty
            localStorage.removeItem(`nickname_${account}`);
            setNickname('');
        } else if (trimmedNickname.length <= 20) {
            // Store nickname (max 20 characters)
            localStorage.setItem(`nickname_${account}`, trimmedNickname);
            setNickname(trimmedNickname);
            
            // Update user profiles
            const updatedProfiles = {
                ...userProfiles,
                [account.toLowerCase()]: trimmedNickname
            };
            setUserProfiles(updatedProfiles);
        }
    };

    // Get nickname for an address (fallback to shortened address if no nickname)
    const getNickname = (address) => {
        if (!address) return '';
        
        const addressLower = address.toLowerCase();
        const storedNickname = userProfiles[addressLower] || localStorage.getItem(`nickname_${address}`);
        
        if (storedNickname) {
            return storedNickname;
        }
        
        // Fallback to shortened address
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Get display name (nickname or shortened address)
    const getDisplayName = (address) => {
        if (!address) return 'Unknown';
        return getNickname(address);
    };

    return (
        <UserProfileContext.Provider value={{
            nickname,
            updateNickname,
            getNickname,
            getDisplayName,
            userProfiles,
            loadUserProfiles
        }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};
