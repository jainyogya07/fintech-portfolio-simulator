/**
 * Historical Market Crash Scenarios
 * Sector-specific impacts based on actual historical data
 */

// Default sector for stocks we can't categorize
export const DEFAULT_SECTOR = 'market';

// Sector mappings for common stocks
export const STOCK_SECTORS = {
    // Tech
    AAPL: 'tech', MSFT: 'tech', GOOGL: 'tech', GOOG: 'tech', META: 'tech',
    AMZN: 'tech', NVDA: 'tech', TSLA: 'tech', AMD: 'tech', INTC: 'tech',
    NFLX: 'tech', CRM: 'tech', ORCL: 'tech', ADBE: 'tech', PYPL: 'tech',

    // Finance
    JPM: 'finance', BAC: 'finance', GS: 'finance', MS: 'finance', WFC: 'finance',
    C: 'finance', AXP: 'finance', V: 'finance', MA: 'finance', BLK: 'finance',

    // Healthcare
    JNJ: 'healthcare', UNH: 'healthcare', PFE: 'healthcare', ABBV: 'healthcare',
    MRK: 'healthcare', LLY: 'healthcare', TMO: 'healthcare', ABT: 'healthcare',

    // Energy
    XOM: 'energy', CVX: 'energy', COP: 'energy', SLB: 'energy', OXY: 'energy',

    // Consumer
    WMT: 'consumer', PG: 'consumer', KO: 'consumer', PEP: 'consumer', COST: 'consumer',
    MCD: 'consumer', NKE: 'consumer', SBUX: 'consumer', HD: 'consumer', TGT: 'consumer',

    // Industrial
    CAT: 'industrial', BA: 'industrial', HON: 'industrial', UPS: 'industrial',
    GE: 'industrial', MMM: 'industrial', LMT: 'industrial', RTX: 'industrial',

    // Real Estate
    AMT: 'realestate', PLD: 'realestate', SPG: 'realestate', O: 'realestate',

    // Utilities
    NEE: 'utilities', DUK: 'utilities', SO: 'utilities', D: 'utilities',

    // ETFs / Index
    SPY: 'market', QQQ: 'tech', VTI: 'market', VOO: 'market', IWM: 'market',
    DIA: 'market', VGT: 'tech', XLF: 'finance', XLE: 'energy', XLV: 'healthcare',

    // Bonds
    BND: 'bonds', AGG: 'bonds', TLT: 'bonds', LQD: 'bonds',

    // Gold
    GLD: 'gold', IAU: 'gold'
};

export const CRASH_SCENARIOS = {
    COVID_2020: {
        id: 'COVID_2020',
        name: 'COVID-19 Crash (2020)',
        description: 'Pandemic-induced market panic — fastest 30% drop in history',
        duration: '1 month',
        sectorImpact: {
            tech: -0.12,
            finance: -0.28,
            energy: -0.45,
            healthcare: -0.08,
            consumer: -0.22,
            industrial: -0.25,
            realestate: -0.30,
            utilities: -0.15,
            bonds: 0.05,
            gold: 0.08,
            market: -0.34
        },
        recovery: '5 months',
        maxDrawdown: -0.34,
        color: '#ef4444'
    },

    FINANCIAL_CRISIS_2008: {
        id: 'FINANCIAL_CRISIS_2008',
        name: 'Global Financial Crisis (2008)',
        description: 'Housing bubble collapse, bank failures, near-systemic meltdown',
        duration: '18 months',
        sectorImpact: {
            tech: -0.42,
            finance: -0.55,
            energy: -0.38,
            healthcare: -0.25,
            consumer: -0.35,
            industrial: -0.48,
            realestate: -0.60,
            utilities: -0.28,
            bonds: 0.12,
            gold: 0.05,
            market: -0.57
        },
        recovery: '4 years',
        maxDrawdown: -0.57,
        color: '#dc2626'
    },

    DOT_COM_BUST_2000: {
        id: 'DOT_COM_BUST_2000',
        name: 'Dot-Com Bubble Burst (2000-2002)',
        description: 'Tech bubble collapse — NASDAQ lost 78%',
        duration: '2.5 years',
        sectorImpact: {
            tech: -0.78,
            finance: -0.25,
            energy: -0.15,
            healthcare: -0.10,
            consumer: -0.20,
            industrial: -0.30,
            realestate: -0.05,
            utilities: 0.10,
            bonds: 0.20,
            gold: 0.02,
            market: -0.49
        },
        recovery: '7 years',
        maxDrawdown: -0.78,
        color: '#b91c1c'
    },

    BLACK_MONDAY_1987: {
        id: 'BLACK_MONDAY_1987',
        name: 'Black Monday (1987)',
        description: 'Single-day 22% crash — largest one-day percentage decline',
        duration: '1 day',
        sectorImpact: {
            tech: -0.22,
            finance: -0.25,
            energy: -0.20,
            healthcare: -0.18,
            consumer: -0.22,
            industrial: -0.23,
            realestate: -0.20,
            utilities: -0.15,
            bonds: 0.03,
            gold: 0.01,
            market: -0.22
        },
        recovery: '2 years',
        maxDrawdown: -0.22,
        color: '#f97316'
    },

    MILD_RECESSION: {
        id: 'MILD_RECESSION',
        name: 'Average Recession',
        description: 'Typical economic downturn with moderate market decline',
        duration: '12 months',
        sectorImpact: {
            tech: -0.20,
            finance: -0.25,
            energy: -0.18,
            healthcare: -0.12,
            consumer: -0.22,
            industrial: -0.28,
            realestate: -0.25,
            utilities: -0.10,
            bonds: 0.08,
            gold: 0.05,
            market: -0.25
        },
        recovery: '18 months',
        maxDrawdown: -0.25,
        color: '#eab308'
    }
};

/**
 * Get sector for a stock symbol
 */
export function getStockSector(symbol) {
    return STOCK_SECTORS[symbol?.toUpperCase()] || DEFAULT_SECTOR;
}

/**
 * Get all available scenarios as array
 */
export function getScenariosList() {
    return Object.values(CRASH_SCENARIOS);
}
