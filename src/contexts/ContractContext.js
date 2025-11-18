import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import MGPToken from '../contracts/MGPToken.json';

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
    const { provider, account } = useWallet();
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);

    const contractAddress = "0xaa2635e9b98a3220DD0fC4918fC25D9D6e16f3CF"; // MGP Token contract address (Updated with sell function)

    const connectToContract = React.useCallback(async () => {
        if (provider && account) {
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(contractAddress, MGPToken.abi, signer);
                setContract(contract);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error connecting to contract:', err);
            }
        }
    }, [provider, account]);

    useEffect(() => {
        connectToContract();
    }, [provider, account, connectToContract]);

    return (
        <ContractContext.Provider value={{ contract, error, connectToContract }}>
            {children}
        </ContractContext.Provider>
    );
};

export const useContract = () => useContext(ContractContext); 