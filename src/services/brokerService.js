/**
 * Broker Service (Mock)
 * Simulates broker API integration
 */

// Supported brokers
export const BROKERS = {
    robinhood: {
        name: 'Robinhood',
        logo: '🟢',
        color: '#00C805',
        features: ['Stocks', 'Options', 'Crypto']
    },
    fidelity: {
        name: 'Fidelity',
        logo: '🔵',
        color: '#4E7D4E',
        features: ['Stocks', 'ETFs', 'Mutual Funds', '401k']
    },
    schwab: {
        name: 'Charles Schwab',
        logo: '🔷',
        color: '#00A3E0',
        features: ['Stocks', 'ETFs', 'Options', 'Futures']
    },
    vanguard: {
        name: 'Vanguard',
        logo: '🔴',
        color: '#C41230',
        features: ['ETFs', 'Mutual Funds', 'IRA']
    },
    interactive: {
        name: 'Interactive Brokers',
        logo: '🟡',
        color: '#DD2C00',
        features: ['Stocks', 'Options', 'Futures', 'Forex']
    }
};

// Mock portfolio data for demo
const MOCK_PORTFOLIOS = {
    robinhood: [
        { symbol: 'TSLA', shares: 15, purchasePrice: 180, currentPrice: 248 },
        { symbol: 'PLTR', shares: 100, purchasePrice: 15, currentPrice: 22 },
        { symbol: 'AMD', shares: 25, purchasePrice: 90, currentPrice: 142 },
        { symbol: 'SOFI', shares: 200, purchasePrice: 8, currentPrice: 10 }
    ],
    fidelity: [
        { symbol: 'VTI', shares: 50, purchasePrice: 200, currentPrice: 252 },
        { symbol: 'VXUS', shares: 30, purchasePrice: 55, currentPrice: 58 },
        { symbol: 'BND', shares: 25, purchasePrice: 75, currentPrice: 72 },
        { symbol: 'AAPL', shares: 10, purchasePrice: 145, currentPrice: 189 }
    ],
    schwab: [
        { symbol: 'SPY', shares: 20, purchasePrice: 400, currentPrice: 478 },
        { symbol: 'QQQ', shares: 15, purchasePrice: 350, currentPrice: 418 },
        { symbol: 'SCHD', shares: 40, purchasePrice: 70, currentPrice: 78 }
    ],
    vanguard: [
        { symbol: 'VTI', shares: 100, purchasePrice: 180, currentPrice: 252 },
        { symbol: 'VXUS', shares: 50, purchasePrice: 50, currentPrice: 58 },
        { symbol: 'BND', shares: 75, purchasePrice: 80, currentPrice: 72 }
    ],
    interactive: [
        { symbol: 'MSFT', shares: 20, purchasePrice: 280, currentPrice: 378 },
        { symbol: 'GOOGL', shares: 10, purchasePrice: 120, currentPrice: 142 },
        { symbol: 'NVDA', shares: 8, purchasePrice: 450, currentPrice: 495 }
    ]
};

// Connection state storage
const BROKER_STORAGE_KEY = 'connected-brokers';

/**
 * Get connected brokers
 */
export function getConnectedBrokers() {
    try {
        const saved = localStorage.getItem(BROKER_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

/**
 * Simulate OAuth connection flow
 */
export async function connectBroker(brokerId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const connected = getConnectedBrokers();
    if (!connected.includes(brokerId)) {
        connected.push(brokerId);
        localStorage.setItem(BROKER_STORAGE_KEY, JSON.stringify(connected));
    }

    return { success: true, message: `Connected to ${BROKERS[brokerId].name}` };
}

/**
 * Disconnect broker
 */
export function disconnectBroker(brokerId) {
    const connected = getConnectedBrokers().filter(id => id !== brokerId);
    localStorage.setItem(BROKER_STORAGE_KEY, JSON.stringify(connected));
}

/**
 * Fetch portfolio from broker (mock)
 */
export async function fetchBrokerPortfolio(brokerId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const portfolio = MOCK_PORTFOLIOS[brokerId] || [];
    const totalValue = portfolio.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    const totalCost = portfolio.reduce((sum, h) => sum + h.purchasePrice * h.shares, 0);

    return {
        brokerId,
        brokerName: BROKERS[brokerId].name,
        holdings: portfolio,
        summary: {
            totalValue,
            totalCost,
            totalGain: totalValue - totalCost,
            gainPercent: ((totalValue - totalCost) / totalCost) * 100
        }
    };
}

/**
 * Get all connected portfolios
 */
export async function fetchAllBrokerPortfolios() {
    const connected = getConnectedBrokers();
    const portfolios = await Promise.all(
        connected.map(brokerId => fetchBrokerPortfolio(brokerId))
    );
    return portfolios;
}
