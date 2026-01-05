import { getCachedPrice, cachePrice } from './storageService';

// Alpha Vantage API key (free tier: 25 calls/day)
// Users can get their own key at https://www.alphavantage.co/support/#api-key
const ALPHA_VANTAGE_API_KEY = 'demo'; // Using demo key for basic functionality

/**
 * Fetch current stock price
 * Uses cache first, then falls back to API
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<Object>} - Stock data with price info
 */
export async function fetchStockPrice(symbol) {
    const upperSymbol = symbol.toUpperCase().trim();

    // Try cache first
    const cached = await getCachedPrice(upperSymbol);
    if (cached) {
        return cached;
    }

    try {
        // Try Alpha Vantage API
        const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${upperSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        // Check for API errors or rate limiting
        if (data['Note'] || data['Error Message'] || !data['Global Quote']) {
            console.warn('API rate limit or error, using fallback');
            return generateFallbackPrice(upperSymbol);
        }

        const quote = data['Global Quote'];
        const stockData = {
            symbol: upperSymbol,
            price: parseFloat(quote['05. price']) || 0,
            change: parseFloat(quote['09. change']) || 0,
            changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
            previousClose: parseFloat(quote['08. previous close']) || 0,
            high: parseFloat(quote['03. high']) || 0,
            low: parseFloat(quote['04. low']) || 0,
            volume: parseInt(quote['06. volume']) || 0,
            lastUpdated: new Date().toISOString(),
        };

        // Cache the result
        await cachePrice(upperSymbol, stockData);

        return stockData;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return generateFallbackPrice(upperSymbol);
    }
}

/**
 * Generate fallback/mock price for demo purposes
 * This ensures the app works even without API access
 * @param {string} symbol - Stock symbol
 * @returns {Object} - Mock stock data
 */
function generateFallbackPrice(symbol) {
    // Common stock prices for realistic demo (as of a reference date)
    const commonStocks = {
        'AAPL': { base: 175, volatility: 0.02 },
        'GOOGL': { base: 140, volatility: 0.025 },
        'MSFT': { base: 380, volatility: 0.018 },
        'AMZN': { base: 175, volatility: 0.028 },
        'TSLA': { base: 250, volatility: 0.04 },
        'NVDA': { base: 480, volatility: 0.035 },
        'META': { base: 520, volatility: 0.03 },
        'JPM': { base: 195, volatility: 0.015 },
        'V': { base: 280, volatility: 0.012 },
        'JNJ': { base: 155, volatility: 0.008 },
        'WMT': { base: 165, volatility: 0.01 },
        'PG': { base: 160, volatility: 0.009 },
        'DIS': { base: 95, volatility: 0.022 },
        'NFLX': { base: 620, volatility: 0.032 },
        'AMD': { base: 145, volatility: 0.038 },
    };

    const stockInfo = commonStocks[symbol] || { base: 100, volatility: 0.025 };

    // Add some random variation (±5%)
    const variation = (Math.random() - 0.5) * 0.1;
    const price = stockInfo.base * (1 + variation);
    const change = price * (Math.random() - 0.5) * 0.04;

    return {
        symbol: symbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round((change / price) * 10000) / 100,
        previousClose: Math.round((price - change) * 100) / 100,
        high: Math.round(price * 1.02 * 100) / 100,
        low: Math.round(price * 0.98 * 100) / 100,
        volume: Math.floor(Math.random() * 50000000) + 1000000,
        lastUpdated: new Date().toISOString(),
        isFallback: true,
    };
}

/**
 * Fetch historical prices for volatility calculation
 * @param {string} symbol - Stock symbol
 * @param {number} days - Number of days of history (default 252 trading days = 1 year)
 * @returns {Promise<Array>} - Array of daily returns
 */
export async function fetchHistoricalPrices(symbol, days = 252) {
    const upperSymbol = symbol.toUpperCase().trim();

    try {
        // Try Alpha Vantage time series
        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${upperSymbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data['Note'] || data['Error Message'] || !data['Time Series (Daily)']) {
            console.warn('Historical API unavailable, using generated data');
            return generateHistoricalReturns(upperSymbol, days);
        }

        const timeSeries = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).slice(0, days).reverse();

        const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

        // Calculate daily returns
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        return returns;
    } catch (error) {
        console.error('Error fetching historical prices:', error);
        return generateHistoricalReturns(upperSymbol, days);
    }
}

/**
 * Generate mock historical returns based on typical stock volatility
 * @param {string} symbol - Stock symbol
 * @param {number} days - Number of trading days
 * @returns {Array} - Array of daily returns
 */
function generateHistoricalReturns(symbol, days) {
    // Typical annual volatility ranges for different stock types
    const volatilityProfiles = {
        'TSLA': 0.5,  // High volatility
        'NVDA': 0.45,
        'AMD': 0.4,
        'META': 0.35,
        'AMZN': 0.3,
        'GOOGL': 0.28,
        'AAPL': 0.25,
        'MSFT': 0.22,
        'NFLX': 0.35,
        'DIS': 0.28,
        'JPM': 0.2,
        'V': 0.18,
        'JNJ': 0.15,
        'WMT': 0.16,
        'PG': 0.14,
    };

    // Get volatility or use default moderate volatility
    const annualVol = volatilityProfiles[symbol] || 0.25;
    const dailyVol = annualVol / Math.sqrt(252);

    // Generate returns using normal distribution (Box-Muller transform)
    const returns = [];
    for (let i = 0; i < days - 1; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const dailyReturn = z * dailyVol + 0.0004; // Small positive drift
        returns.push(dailyReturn);
    }

    return returns;
}

/**
 * Batch fetch prices for multiple symbols
 * @param {Array<string>} symbols - Array of stock symbols
 * @returns {Promise<Object>} - Map of symbol to price data
 */
export async function fetchMultipleStockPrices(symbols) {
    const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase().trim()))];
    const results = {};

    // Fetch all in parallel (with rate limit safeguards)
    await Promise.all(
        uniqueSymbols.map(async (symbol, index) => {
            // Add small delay between requests to avoid rate limits
            if (index > 0) {
                await new Promise(resolve => setTimeout(resolve, 100 * index));
            }
            results[symbol] = await fetchStockPrice(symbol);
        })
    );

    return results;
}
