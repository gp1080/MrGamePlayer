import React, { useState, useEffect } from 'react';
import { PRICE_CONFIG, CONVERSION_RATES } from '../../config/priceSource';

const MGPPriceDisplay = ({ compact = false }) => {
    const [mgpPrice, setMgpPrice] = useState(null);
    const [usdPrice, setUsdPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMGPPrice();
        // Refresh price every 30 seconds
        const interval = setInterval(fetchMGPPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    // Price source attribution
    const PRICE_SOURCE = PRICE_CONFIG.sourceName;
    const PRICE_SOURCE_URL = PRICE_CONFIG.sourceUrl;
    
    const fetchMGPPrice = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fixed conversion rate: 60 MGP = $1 USD
            // MATIC price from CoinGecko: $0.37914 per MATIC
            const pricePerMGP = 1 / 60; // $0.0167 per MGP
            setMgpPrice(pricePerMGP);
            setUsdPrice(1); // $1 USD = 60 MGP
            
        } catch (err) {
            console.error('Error fetching MGP price:', err);
            setError('Failed to load price');
            // Fallback to default price
            setMgpPrice(1 / 60);
            setUsdPrice(1);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !mgpPrice) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#999',
                fontSize: compact ? '12px' : '14px'
            }}>
                <span>Loading...</span>
            </div>
        );
    }

    if (error && !mgpPrice) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#F44336',
                fontSize: compact ? '12px' : '14px'
            }}>
                <span>Price unavailable</span>
            </div>
        );
    }

    if (compact) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#4CAF50',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                <span>💎</span>
                <span>1 MGP = ${mgpPrice?.toFixed(4) || '0.0167'}</span>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            padding: '15px',
            border: '2px solid #4CAF50',
            minWidth: '200px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
            }}>
                <span style={{ fontSize: '24px' }}>💎</span>
                <h3 style={{
                    color: '#4CAF50',
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}>
                    MGP Token Price
                </h3>
            </div>
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#ccc', fontSize: '14px' }}>Price per MGP:</span>
                    <span style={{ color: '#4CAF50', fontSize: '16px', fontWeight: 'bold' }}>
                        ${mgpPrice?.toFixed(4) || '0.0167'}
                    </span>
                </div>
                
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#ccc', fontSize: '12px' }}>Liquidity:</span>
                    <span style={{ color: '#2196F3', fontSize: '12px' }}>
                        100M MGP
                    </span>
                </div>
            </div>
            
            {/* Attribution */}
            <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #444',
                textAlign: 'center'
            }}>
                <div style={{
                    color: '#555',
                    fontSize: '9px',
                    fontStyle: 'italic'
                }}>
                    MATIC conversion from{' '}
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
            
            {error && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    backgroundColor: '#3a1a1a',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#F44336',
                    textAlign: 'center'
                }}>
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
};

export default MGPPriceDisplay;

