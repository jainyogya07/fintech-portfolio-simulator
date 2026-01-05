/**
 * Currency Service
 * Multi-currency support and exchange rates
 */

// Exchange rates (relative to USD)
const EXCHANGE_RATES = {
    USD: { symbol: '$', name: 'US Dollar', rate: 1, flag: '🇺🇸' },
    EUR: { symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
    GBP: { symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
    JPY: { symbol: '¥', name: 'Japanese Yen', rate: 149.5, flag: '🇯🇵' },
    INR: { symbol: '₹', name: 'Indian Rupee', rate: 83.2, flag: '🇮🇳' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.53, flag: '🇦🇺' },
    CHF: { symbol: 'Fr', name: 'Swiss Franc', rate: 0.88, flag: '🇨🇭' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 7.24, flag: '🇨🇳' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', rate: 1.34, flag: '🇸🇬' }
};

// International stock exchanges
const INTERNATIONAL_EXCHANGES = {
    US: { name: 'US Markets', suffix: '', examples: ['AAPL', 'MSFT', 'GOOGL'] },
    UK: { name: 'London Stock Exchange', suffix: '.L', examples: ['HSBA.L', 'BP.L', 'VOD.L'] },
    DE: { name: 'Frankfurt Stock Exchange', suffix: '.DE', examples: ['SAP.DE', 'SIE.DE', 'BMW.DE'] },
    JP: { name: 'Tokyo Stock Exchange', suffix: '.T', examples: ['7203.T', '6758.T', '9984.T'] },
    IN: { name: 'National Stock Exchange India', suffix: '.NS', examples: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'] },
    HK: { name: 'Hong Kong Stock Exchange', suffix: '.HK', examples: ['0005.HK', '0700.HK', '1299.HK'] }
};

const CURRENCY_STORAGE_KEY = 'portfolio-currency';

/**
 * Get current currency preference
 */
export function getCurrencyPreference() {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return saved || 'USD';
}

/**
 * Set currency preference
 */
export function setCurrencyPreference(currency) {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

/**
 * Get exchange rate info
 */
export function getExchangeRate(currency) {
    return EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD;
}

/**
 * Convert amount from USD to target currency
 */
export function convertFromUSD(amountUSD, targetCurrency) {
    const rate = EXCHANGE_RATES[targetCurrency]?.rate || 1;
    return amountUSD * rate;
}

/**
 * Convert amount to USD from source currency
 */
export function convertToUSD(amount, sourceCurrency) {
    const rate = EXCHANGE_RATES[sourceCurrency]?.rate || 1;
    return amount / rate;
}

/**
 * Format currency with symbol
 */
export function formatInCurrency(amountUSD, currency = 'USD') {
    const info = EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD;
    const converted = amountUSD * info.rate;

    // Format based on currency
    if (currency === 'JPY') {
        return `${info.symbol}${Math.round(converted).toLocaleString()}`;
    }

    return `${info.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies() {
    return Object.entries(EXCHANGE_RATES).map(([code, info]) => ({
        code,
        ...info
    }));
}

/**
 * Get international exchanges
 */
export function getInternationalExchanges() {
    return INTERNATIONAL_EXCHANGES;
}

/**
 * Detect exchange from symbol
 */
export function detectExchange(symbol) {
    if (symbol.endsWith('.L')) return 'UK';
    if (symbol.endsWith('.DE')) return 'DE';
    if (symbol.endsWith('.T')) return 'JP';
    if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) return 'IN';
    if (symbol.endsWith('.HK')) return 'HK';
    return 'US';
}

export { EXCHANGE_RATES, INTERNATIONAL_EXCHANGES };
