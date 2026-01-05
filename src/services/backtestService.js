/**
 * Backtesting Service
 * Simulate historical portfolio performance
 */

import { formatCurrency } from './calculations';

// Historical annual returns by year (S&P 500 total return)
const SP500_RETURNS = {
    2024: 0.25, 2023: 0.26, 2022: -0.18, 2021: 0.29, 2020: 0.18,
    2019: 0.31, 2018: -0.04, 2017: 0.22, 2016: 0.12, 2015: 0.01,
    2014: 0.14, 2013: 0.32, 2012: 0.16, 2011: 0.02, 2010: 0.15,
    2009: 0.27, 2008: -0.37, 2007: 0.05, 2006: 0.16, 2005: 0.05,
    2004: 0.11, 2003: 0.29, 2002: -0.22, 2001: -0.12, 2000: -0.09,
    1999: 0.21, 1998: 0.29, 1997: 0.33, 1996: 0.23, 1995: 0.38,
    1994: 0.01, 1993: 0.10, 1992: 0.08, 1991: 0.31, 1990: -0.03
};

// Sector-specific adjustments (relative to S&P 500)
const SECTOR_ADJUSTMENTS = {
    tech: { volatilityMult: 1.3, betaAdjust: 1.2 },
    finance: { volatilityMult: 1.2, betaAdjust: 1.1 },
    healthcare: { volatilityMult: 0.9, betaAdjust: 0.85 },
    energy: { volatilityMult: 1.4, betaAdjust: 1.3 },
    consumer: { volatilityMult: 0.95, betaAdjust: 0.9 },
    utilities: { volatilityMult: 0.6, betaAdjust: 0.5 },
    industrial: { volatilityMult: 1.1, betaAdjust: 1.05 },
    realestate: { volatilityMult: 1.15, betaAdjust: 0.95 },
    bonds: { volatilityMult: 0.3, betaAdjust: -0.1 },
    gold: { volatilityMult: 0.8, betaAdjust: 0.1 },
    market: { volatilityMult: 1.0, betaAdjust: 1.0 }
};

/**
 * Run backtest on portfolio
 */
export function runBacktest({
    initialValue,
    sectorWeights = { market: 1.0 },
    startYear = 2000,
    endYear = 2024,
    monthlyContribution = 0
}) {
    const years = [];
    let portfolioValue = initialValue;
    let sp500Value = initialValue;
    let totalContributions = initialValue;

    // Calculate weighted beta
    let weightedBeta = 0;
    Object.entries(sectorWeights).forEach(([sector, weight]) => {
        const adjustment = SECTOR_ADJUSTMENTS[sector] || SECTOR_ADJUSTMENTS.market;
        weightedBeta += weight * adjustment.betaAdjust;
    });

    for (let year = startYear; year <= endYear; year++) {
        const sp500Return = SP500_RETURNS[year] || 0.08;

        // Calculate portfolio return based on weighted beta
        const portfolioReturn = sp500Return * weightedBeta + (Math.random() - 0.5) * 0.05;

        // Apply returns
        portfolioValue = portfolioValue * (1 + portfolioReturn) + monthlyContribution * 12;
        sp500Value = sp500Value * (1 + sp500Return) + monthlyContribution * 12;
        totalContributions += monthlyContribution * 12;

        years.push({
            year,
            portfolioValue: Math.round(portfolioValue),
            sp500Value: Math.round(sp500Value),
            portfolioReturn: (portfolioReturn * 100).toFixed(1),
            sp500Return: (sp500Return * 100).toFixed(1),
            totalContributions: Math.round(totalContributions)
        });
    }

    // Calculate summary stats
    const finalPortfolio = years[years.length - 1].portfolioValue;
    const finalSP500 = years[years.length - 1].sp500Value;
    const totalYears = endYear - startYear + 1;

    const portfolioCAGR = Math.pow(finalPortfolio / initialValue, 1 / totalYears) - 1;
    const sp500CAGR = Math.pow(finalSP500 / initialValue, 1 / totalYears) - 1;

    // Calculate max drawdown for portfolio
    let maxDrawdown = 0;
    let peak = years[0].portfolioValue;
    years.forEach(y => {
        if (y.portfolioValue > peak) peak = y.portfolioValue;
        const drawdown = (peak - y.portfolioValue) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Calculate volatility
    const returns = [];
    for (let i = 1; i < years.length; i++) {
        returns.push((years[i].portfolioValue - years[i - 1].portfolioValue) / years[i - 1].portfolioValue);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe (using 3% risk-free rate)
    const sharpe = (portfolioCAGR - 0.03) / volatility;

    return {
        years,
        summary: {
            initialValue,
            finalPortfolio,
            finalSP500,
            totalContributions,
            portfolioGain: finalPortfolio - totalContributions,
            sp500Gain: finalSP500 - totalContributions,
            portfolioCAGR: (portfolioCAGR * 100).toFixed(2),
            sp500CAGR: (sp500CAGR * 100).toFixed(2),
            outperformance: ((portfolioCAGR - sp500CAGR) * 100).toFixed(2),
            maxDrawdown: (maxDrawdown * 100).toFixed(1),
            volatility: (volatility * 100).toFixed(1),
            sharpe: sharpe.toFixed(2),
            totalYears,
            beta: weightedBeta.toFixed(2)
        },
        beat: finalPortfolio > finalSP500
    };
}

/**
 * Get available year range
 */
export function getAvailableYears() {
    const years = Object.keys(SP500_RETURNS).map(Number).sort();
    return { min: Math.min(...years), max: Math.max(...years) };
}

/**
 * Create sector weights from holdings
 */
export function calculateSectorWeights(holdings) {
    if (!holdings || holdings.length === 0) return { market: 1.0 };

    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    const sectorValues = {};

    holdings.forEach(h => {
        const value = h.currentPrice * h.shares;
        const sector = h.sector || 'market';
        sectorValues[sector] = (sectorValues[sector] || 0) + value;
    });

    const weights = {};
    Object.entries(sectorValues).forEach(([sector, value]) => {
        weights[sector] = value / totalValue;
    });

    return weights;
}
