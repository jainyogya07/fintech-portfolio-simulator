/**
 * Dividend Service
 * Estimate dividend income from portfolio
 */

// Approximate dividend yields by stock (simplified)
const DIVIDEND_DATA = {
    // High dividend stocks
    VZ: { yield: 0.065, frequency: 4 },
    T: { yield: 0.055, frequency: 4 },
    XOM: { yield: 0.035, frequency: 4 },
    CVX: { yield: 0.040, frequency: 4 },
    JNJ: { yield: 0.030, frequency: 4 },
    PG: { yield: 0.025, frequency: 4 },
    KO: { yield: 0.030, frequency: 4 },
    PEP: { yield: 0.028, frequency: 4 },
    MO: { yield: 0.085, frequency: 4 },
    PM: { yield: 0.055, frequency: 4 },

    // Moderate dividend
    JPM: { yield: 0.025, frequency: 4 },
    BAC: { yield: 0.025, frequency: 4 },
    WFC: { yield: 0.03, frequency: 4 },
    O: { yield: 0.05, frequency: 12 }, // Monthly
    SCHD: { yield: 0.035, frequency: 4 },
    VYM: { yield: 0.030, frequency: 4 },

    // Tech (low/no dividend)
    AAPL: { yield: 0.005, frequency: 4 },
    MSFT: { yield: 0.008, frequency: 4 },
    GOOGL: { yield: 0, frequency: 0 },
    GOOG: { yield: 0, frequency: 0 },
    AMZN: { yield: 0, frequency: 0 },
    META: { yield: 0.004, frequency: 4 },
    TSLA: { yield: 0, frequency: 0 },
    NVDA: { yield: 0.0003, frequency: 4 },

    // ETFs
    SPY: { yield: 0.013, frequency: 4 },
    VOO: { yield: 0.013, frequency: 4 },
    VTI: { yield: 0.014, frequency: 4 },
    QQQ: { yield: 0.006, frequency: 4 },

    // Bonds
    BND: { yield: 0.035, frequency: 12 },
    AGG: { yield: 0.033, frequency: 12 },
    TLT: { yield: 0.04, frequency: 12 },

    // REITs
    VNQ: { yield: 0.04, frequency: 4 },
    AMT: { yield: 0.025, frequency: 4 },

    // Default for unknown stocks
    DEFAULT: { yield: 0.02, frequency: 4 }
};

/**
 * Get dividend data for a stock
 */
export function getDividendInfo(symbol) {
    return DIVIDEND_DATA[symbol?.toUpperCase()] || DIVIDEND_DATA.DEFAULT;
}

/**
 * Calculate dividend income for holdings
 */
export function calculateDividendIncome(holdings) {
    if (!holdings || holdings.length === 0) {
        return {
            holdings: [],
            summary: {
                annualIncome: 0,
                monthlyIncome: 0,
                portfolioYield: 0,
                dividendPayers: 0
            }
        };
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    let totalAnnualDividends = 0;
    let dividendPayers = 0;

    const holdingsDividends = holdings.map(h => {
        const value = h.currentPrice * h.shares;
        const divInfo = getDividendInfo(h.symbol);
        const annualDividend = value * divInfo.yield;
        const quarterlyDividend = annualDividend / 4;

        if (divInfo.yield > 0) {
            totalAnnualDividends += annualDividend;
            dividendPayers++;
        }

        return {
            symbol: h.symbol,
            shares: h.shares,
            value,
            yield: (divInfo.yield * 100).toFixed(2),
            annualDividend: Math.round(annualDividend),
            quarterlyDividend: Math.round(quarterlyDividend),
            monthlyDividend: Math.round(annualDividend / 12),
            frequency: divInfo.frequency,
            isPayer: divInfo.yield > 0
        };
    });

    // Sort by annual dividend (highest first)
    holdingsDividends.sort((a, b) => b.annualDividend - a.annualDividend);

    return {
        holdings: holdingsDividends,
        summary: {
            annualIncome: Math.round(totalAnnualDividends),
            monthlyIncome: Math.round(totalAnnualDividends / 12),
            quarterlyIncome: Math.round(totalAnnualDividends / 4),
            portfolioYield: ((totalAnnualDividends / totalValue) * 100).toFixed(2),
            dividendPayers,
            nonPayers: holdings.length - dividendPayers,
            totalValue: Math.round(totalValue)
        }
    };
}

/**
 * Project future dividend income with growth
 */
export function projectDividendGrowth(currentAnnual, years = 10, growthRate = 0.05) {
    const projections = [];
    let income = currentAnnual;

    for (let year = 1; year <= years; year++) {
        income = income * (1 + growthRate);
        projections.push({
            year,
            income: Math.round(income)
        });
    }

    return projections;
}

/**
 * Get yield category
 */
export function getYieldCategory(yieldPercent) {
    if (yieldPercent >= 5) return { label: 'High Yield', color: 'var(--color-success)' };
    if (yieldPercent >= 2) return { label: 'Moderate', color: 'var(--color-primary)' };
    if (yieldPercent > 0) return { label: 'Low', color: 'var(--color-warning)' };
    return { label: 'None', color: 'var(--color-text-secondary)' };
}
