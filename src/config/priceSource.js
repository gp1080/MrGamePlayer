// Price Source Configuration
// Update these values to change the attribution and conversion rates

export const PRICE_CONFIG = {
    // Source company/website name
    sourceName: 'CoinGecko',
    
    // Source website URL
    sourceUrl: 'https://www.coingecko.com',
    
    // MATIC price in USD (from the source)
    // Update this value when you get the rate from your chosen provider
    maticPriceUSD: 0.37914,
    
    // Contract-defined rates (from smart contract)
    mgpToMatic: 0.1, // 1 MGP = 0.1 MATIC (from contract - FIXED RATE)
    maticToMgp: 10, // 1 MATIC = 10 MGP (from contract - FIXED RATE)
    
    // Note: MGP USD value is calculated from contract rate and MATIC price
    // Since 1 MGP = 0.1 MATIC (contract), and MATIC price varies
    // The USD value of MGP will fluctuate with MATIC price
    
    // Last updated date (for reference)
    lastUpdated: '2025-11-14'
};

// Calculated conversion rates
export const CONVERSION_RATES = {
    // Contract rates (FIXED - from smart contract)
    MGP_TO_MATIC: PRICE_CONFIG.mgpToMatic, // 0.1 (1 MGP = 0.1 MATIC from contract)
    MATIC_TO_MGP: PRICE_CONFIG.maticToMgp, // 10 (1 MATIC = 10 MGP from contract)
    
    // MATIC USD price (from external source - CoinGecko)
    MATIC_TO_USD: PRICE_CONFIG.maticPriceUSD, // Current MATIC price from source
    USD_TO_MATIC: 1 / PRICE_CONFIG.maticPriceUSD, // MATIC per $1
    
    // MGP USD value (calculated from contract rate + MATIC price)
    // Since 1 MGP = 0.1 MATIC (contract), and 1 MATIC = $0.37914 (CoinGecko)
    // Then: 1 MGP = 0.1 * $0.37914 = $0.037914 USD
    MGP_TO_USD: PRICE_CONFIG.mgpToMatic * PRICE_CONFIG.maticPriceUSD,
    
    // USD to MGP (calculated)
    USD_TO_MGP: 1 / (PRICE_CONFIG.mgpToMatic * PRICE_CONFIG.maticPriceUSD),
    
    // Minimum bet: 60 MGP
    // 60 MGP = 6 MATIC (from contract) = 6 * $0.37914 = $2.27 USD
    MIN_BET_MGP: 60,
    MIN_BET_MATIC: 60 * PRICE_CONFIG.mgpToMatic, // 6 MATIC
    MIN_BET_USD: 60 * PRICE_CONFIG.mgpToMatic * PRICE_CONFIG.maticPriceUSD, // ~$2.27
};

