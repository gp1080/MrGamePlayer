import React, { useState } from 'react';
import { PRICE_CONFIG, CONVERSION_RATES } from '../../config/priceSource';

const MGPCalculator = () => {
    const [mgpAmount, setMgpAmount] = useState('');
    const [usdAmount, setUsdAmount] = useState('');
    const [maticAmount, setMaticAmount] = useState('');
    
    // Use conversion rates from config
    const {
        MGP_TO_USD,
        USD_TO_MGP,
        MATIC_TO_USD,
        USD_TO_MATIC,
        MGP_TO_MATIC,
        MATIC_TO_MGP,
        MIN_BET_MGP,
        MIN_BET_MATIC,
        MIN_BET_USD
    } = CONVERSION_RATES;
    
    const PRICE_SOURCE = PRICE_CONFIG.sourceName;
    const PRICE_SOURCE_URL = PRICE_CONFIG.sourceUrl;

    const handleMGPChange = (value) => {
        setMgpAmount(value);
        if (value === '' || value === '.') {
            setUsdAmount('');
            setMaticAmount('');
            return;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            const usd = (numValue * MGP_TO_USD).toFixed(4);
            const matic = (numValue * MGP_TO_MATIC).toFixed(4);
            setUsdAmount(usd);
            setMaticAmount(matic);
        } else {
            setUsdAmount('');
            setMaticAmount('');
        }
    };

    const handleUSDChange = (value) => {
        setUsdAmount(value);
        if (value === '' || value === '.') {
            setMgpAmount('');
            setMaticAmount('');
            return;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            const mgp = (numValue * USD_TO_MGP).toFixed(2);
            const matic = (numValue * USD_TO_MATIC).toFixed(4);
            setMgpAmount(mgp);
            setMaticAmount(matic);
        } else {
            setMgpAmount('');
            setMaticAmount('');
        }
    };

    const handleMATICChange = (value) => {
        setMaticAmount(value);
        if (value === '' || value === '.') {
            setMgpAmount('');
            setUsdAmount('');
            return;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            const mgp = (numValue * MATIC_TO_MGP).toFixed(2);
            const usd = (numValue * MATIC_TO_USD).toFixed(4);
            setMgpAmount(mgp);
            setUsdAmount(usd);
        } else {
            setMgpAmount('');
            setUsdAmount('');
        }
    };

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            border: '2px solid #4CAF50',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '25px',
                justifyContent: 'center'
            }}>
                <span style={{ fontSize: '32px' }}>💎</span>
                <h2 style={{
                    color: '#4CAF50',
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 'bold'
                }}>
                    MGP ↔ USD ↔ MATIC Calculator
                </h2>
            </div>

            {/* Exchange Rate Info */}
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'center',
                border: '1px solid #444'
            }}>
                <div style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    Current Exchange Rates
                </div>
                <div style={{
                    color: '#666',
                    fontSize: '10px',
                    marginBottom: '10px',
                    fontStyle: 'italic'
                }}>
                    MATIC price data provided by{' '}
                    <a 
                        href={PRICE_SOURCE_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#666', textDecoration: 'underline' }}
                    >
                        {PRICE_SOURCE}
                    </a>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '14px'
                }}>
                    <div>
                        <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '3px' }}>
                            1 MGP = ${MGP_TO_USD.toFixed(4)} USD
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                            (via contract: 0.1 MATIC × MATIC price)
                        </div>
                    </div>
                    <div>
                        <div style={{ color: '#9C27B0', fontWeight: 'bold', marginBottom: '3px' }}>
                            1 MGP = {MGP_TO_MATIC.toFixed(1)} MATIC
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                            {MATIC_TO_MGP.toFixed(0)} MGP = 1 MATIC (Contract Rate)
                        </div>
                    </div>
                    <div>
                        <div style={{ color: '#2196F3', fontWeight: 'bold', marginBottom: '3px' }}>
                            1 MATIC = ${MATIC_TO_USD.toFixed(4)} USD
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                            ~{USD_TO_MATIC.toFixed(2)} MATIC = $1.00
                        </div>
                    </div>
                    <div>
                        <div style={{ color: '#FF9800', fontWeight: 'bold', marginBottom: '3px' }}>
                            1 MGP = ${MGP_TO_USD.toFixed(4)} USD
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                            (via contract: 0.1 MATIC × MATIC price)
                        </div>
                    </div>
                    <div>
                        <div style={{ color: '#FF9800', fontWeight: 'bold', marginBottom: '3px' }}>
                            {MIN_BET_MGP} MGP = {MIN_BET_MATIC.toFixed(1)} MATIC = ${MIN_BET_USD.toFixed(2)} USD
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                            Minimum bet (Contract Rate)
                        </div>
                    </div>
                </div>
            </div>

            {/* MGP to USD */}
            <div style={{ marginBottom: '25px' }}>
                <label style={{
                    display: 'block',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }}>
                    MGP → USD
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="number"
                        value={mgpAmount}
                        onChange={(e) => handleMGPChange(e.target.value)}
                        placeholder="Enter MGP amount"
                        min="0"
                        step="0.01"
                        style={{
                            flex: 1,
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            border: '2px solid #444',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    />
                    <span style={{
                        color: '#4CAF50',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '60px'
                    }}>
                        MGP
                    </span>
                </div>
                {mgpAmount && !isNaN(parseFloat(mgpAmount)) && (
                    <div style={{
                        marginTop: '10px',
                        padding: '12px',
                        backgroundColor: '#1a3a1a',
                        borderRadius: '6px',
                        border: '1px solid #4CAF50',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ color: '#4CAF50', fontSize: '16px', fontWeight: 'bold' }}>
                            = ${usdAmount} USD
                        </span>
                        <span style={{ color: '#9C27B0', fontSize: '16px', fontWeight: 'bold' }}>
                            = {maticAmount} MATIC
                        </span>
                    </div>
                )}
            </div>

            {/* USD to MGP/MATIC */}
            <div style={{ marginBottom: '25px' }}>
                <label style={{
                    display: 'block',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }}>
                    USD → MGP / MATIC
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="number"
                        value={usdAmount}
                        onChange={(e) => handleUSDChange(e.target.value)}
                        placeholder="Enter USD amount"
                        min="0"
                        step="0.01"
                        style={{
                            flex: 1,
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            border: '2px solid #444',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    />
                    <span style={{
                        color: '#2196F3',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '60px'
                    }}>
                        USD
                    </span>
                </div>
                {usdAmount && !isNaN(parseFloat(usdAmount)) && (
                    <div style={{
                        marginTop: '10px',
                        padding: '12px',
                        backgroundColor: '#1a1a3a',
                        borderRadius: '6px',
                        border: '1px solid #2196F3',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ color: '#4CAF50', fontSize: '16px', fontWeight: 'bold' }}>
                            = {mgpAmount} MGP
                        </span>
                        <span style={{ color: '#9C27B0', fontSize: '16px', fontWeight: 'bold' }}>
                            = {maticAmount} MATIC
                        </span>
                    </div>
                )}
            </div>

            {/* MATIC to MGP/USD */}
            <div style={{ marginBottom: '25px' }}>
                <label style={{
                    display: 'block',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }}>
                    MATIC → MGP / USD
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="number"
                        value={maticAmount}
                        onChange={(e) => handleMATICChange(e.target.value)}
                        placeholder="Enter MATIC amount"
                        min="0"
                        step="0.01"
                        style={{
                            flex: 1,
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            border: '2px solid #444',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    />
                    <span style={{
                        color: '#9C27B0',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '80px'
                    }}>
                        MATIC
                    </span>
                </div>
                {maticAmount && !isNaN(parseFloat(maticAmount)) && (
                    <div style={{
                        marginTop: '10px',
                        padding: '12px',
                        backgroundColor: '#2a1a3a',
                        borderRadius: '6px',
                        border: '1px solid #9C27B0',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ color: '#4CAF50', fontSize: '16px', fontWeight: 'bold' }}>
                            = {mgpAmount} MGP
                        </span>
                        <span style={{ color: '#2196F3', fontSize: '16px', fontWeight: 'bold' }}>
                            = ${usdAmount} USD
                        </span>
                    </div>
                )}
            </div>

            {/* Quick Reference */}
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '15px',
                border: '1px solid #444'
            }}>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
                    Quick Reference:
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '13px'
                }}>
                    <div style={{ color: '#ccc' }}>
                        <span style={{ color: '#4CAF50' }}>60 MGP</span> = <span style={{ color: '#9C27B0' }}>6 MATIC</span> = <span style={{ color: '#2196F3' }}>~${(60 * MGP_TO_USD).toFixed(2)}</span>
                    </div>
                    <div style={{ color: '#ccc' }}>
                        <span style={{ color: '#4CAF50' }}>120 MGP</span> = <span style={{ color: '#9C27B0' }}>12 MATIC</span> = <span style={{ color: '#2196F3' }}>~${(120 * MGP_TO_USD).toFixed(2)}</span>
                    </div>
                    <div style={{ color: '#ccc' }}>
                        <span style={{ color: '#4CAF50' }}>300 MGP</span> = <span style={{ color: '#9C27B0' }}>30 MATIC</span> = <span style={{ color: '#2196F3' }}>~${(300 * MGP_TO_USD).toFixed(2)}</span>
                    </div>
                    <div style={{ color: '#ccc' }}>
                        <span style={{ color: '#4CAF50' }}>600 MGP</span> = <span style={{ color: '#9C27B0' }}>60 MATIC</span> = <span style={{ color: '#2196F3' }}>~${(600 * MGP_TO_USD).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Minimum Bet Notice */}
            <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#3a1a1a',
                borderRadius: '8px',
                border: '2px solid #FF9800',
                textAlign: 'center'
            }}>
                <div style={{ color: '#FF9800', fontSize: '14px', fontWeight: 'bold' }}>
                    ⚠️ Minimum Bet: {MIN_BET_MGP} MGP ({MIN_BET_MATIC.toFixed(1)} MATIC)
                </div>
                <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                    All bets must be at least {MIN_BET_MGP} MGP tokens (equivalent to {MIN_BET_MATIC.toFixed(1)} MATIC or ~${MIN_BET_USD.toFixed(2)} USD)
                </div>
                <div style={{
                    color: '#555',
                    fontSize: '9px',
                    marginTop: '8px',
                    fontStyle: 'italic'
                }}>
                    MATIC conversion rate from{' '}
                    <a 
                        href={PRICE_SOURCE_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#555', textDecoration: 'underline' }}
                    >
                        {PRICE_SOURCE}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MGPCalculator;

