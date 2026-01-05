import { openDB } from 'idb';

const DB_NAME = 'portfolio-simulator';
const DB_VERSION = 1;
const HOLDINGS_STORE = 'holdings';
const PRICE_CACHE_STORE = 'priceCache';

// Cache duration: 1 hour in milliseconds
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Initialize the IndexedDB database
 */
async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Holdings store - user's portfolio
            if (!db.objectStoreNames.contains(HOLDINGS_STORE)) {
                const holdingsStore = db.createObjectStore(HOLDINGS_STORE, { keyPath: 'id' });
                holdingsStore.createIndex('symbol', 'symbol', { unique: false });
            }

            // Price cache store - cached stock prices
            if (!db.objectStoreNames.contains(PRICE_CACHE_STORE)) {
                const cacheStore = db.createObjectStore(PRICE_CACHE_STORE, { keyPath: 'symbol' });
                cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        },
    });
}

/**
 * Add a new holding to the portfolio
 * @param {Object} holding - The holding to add
 */
export async function addHolding(holding) {
    const db = await initDB();
    await db.put(HOLDINGS_STORE, holding);
    return holding;
}

/**
 * Remove a holding from the portfolio
 * @param {string} id - The ID of the holding to remove
 */
export async function removeHolding(id) {
    const db = await initDB();
    await db.delete(HOLDINGS_STORE, id);
}

/**
 * Get all holdings in the portfolio
 * @returns {Promise<Array>} - Array of holdings
 */
export async function getPortfolio() {
    const db = await initDB();
    return db.getAll(HOLDINGS_STORE);
}

/**
 * Update a holding in the portfolio
 * @param {Object} holding - The updated holding
 */
export async function updateHolding(holding) {
    const db = await initDB();
    await db.put(HOLDINGS_STORE, holding);
    return holding;
}

/**
 * Cache price data for a stock
 * @param {string} symbol - Stock symbol
 * @param {Object} data - Price data to cache
 */
export async function cachePrice(symbol, data) {
    const db = await initDB();
    await db.put(PRICE_CACHE_STORE, {
        symbol: symbol.toUpperCase(),
        data,
        timestamp: Date.now(),
    });
}

/**
 * Get cached price data if still valid
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object|null>} - Cached data or null if expired/missing
 */
export async function getCachedPrice(symbol) {
    const db = await initDB();
    const cached = await db.get(PRICE_CACHE_STORE, symbol.toUpperCase());

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        // Cache expired, remove it
        await db.delete(PRICE_CACHE_STORE, symbol.toUpperCase());
        return null;
    }

    return cached.data;
}

/**
 * Clear all cached prices
 */
export async function clearPriceCache() {
    const db = await initDB();
    await db.clear(PRICE_CACHE_STORE);
}

/**
 * Clear entire portfolio
 */
export async function clearPortfolio() {
    const db = await initDB();
    await db.clear(HOLDINGS_STORE);
}
