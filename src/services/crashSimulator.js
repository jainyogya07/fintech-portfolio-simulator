/**
 * Crash Simulator Service
 * Simulate market crash impacts on portfolio
 */

import { getStockSector } from '../config/crashScenarios';

/**
 * Simulate the impact of a market crash on a portfolio
 * @param {Array} holdings - Portfolio holdings with symbol, shares, currentPrice
 * @param {Object} scenario - Crash scenario from crashScenarios.js
 * @returns {Object} - Simulation results
 */
export function simulateMarketCrash(holdings, scenario) {
    if (!holdings || holdings.length === 0 || !scenario) {
        return null;
    }

    // Calculate original values
    const originalTotal = holdings.reduce((sum, h) => sum + (h.currentPrice * h.shares), 0);

    // Apply crash scenario to each holding
    const impactedHoldings = holdings.map(holding => {
        const sector = getStockSector(holding.symbol);
        const sectorImpact = scenario.sectorImpact[sector] ?? scenario.sectorImpact.market ?? -0.20;

        const originalValue = holding.currentPrice * holding.shares;
        const newValue = originalValue * (1 + sectorImpact);
        const loss = originalValue - newValue;

        return {
            symbol: holding.symbol,
            sector,
            shares: holding.shares,
            originalPrice: holding.currentPrice,
            crashedPrice: holding.currentPrice * (1 + sectorImpact),
            originalValue,
            newValue,
            loss,
            lossPercent: sectorImpact * 100,
            impactLabel: getImpactLabel(sectorImpact)
        };
    });

    // Sort by loss amount (worst first)
    const sortedByLoss = [...impactedHoldings].sort((a, b) => a.lossPercent - b.lossPercent);

    const crashedTotal = impactedHoldings.reduce((sum, h) => sum + h.newValue, 0);
    const totalLoss = originalTotal - crashedTotal;
    const totalLossPercent = (totalLoss / originalTotal) * 100;

    return {
        scenario: {
            name: scenario.name,
            description: scenario.description,
            duration: scenario.duration,
            historicalRecovery: scenario.recovery,
            maxDrawdown: scenario.maxDrawdown
        },
        original: {
            totalValue: originalTotal,
            holdings: holdings.length
        },
        afterCrash: {
            totalValue: crashedTotal,
            byAsset: impactedHoldings
        },
        losses: {
            total: totalLoss,
            percentage: totalLossPercent
        },
        worstAssets: sortedByLoss.slice(0, 3),
        bestAssets: sortedByLoss.slice(-3).reverse(),
        sectorBreakdown: calculateSectorBreakdown(impactedHoldings)
    };
}

/**
 * Calculate recovery timeline
 */
export function calculateRecoveryTime(originalValue, crashedValue, monthlyContribution = 0, monthlyGrowthRate = 0.015) {
    if (crashedValue >= originalValue) {
        return { months: 0, years: 0, recovered: true };
    }

    let currentValue = crashedValue;
    let months = 0;
    const maxMonths = 240; // 20 years max

    while (currentValue < originalValue && months < maxMonths) {
        currentValue = currentValue * (1 + monthlyGrowthRate) + monthlyContribution;
        months++;
    }

    const recovered = currentValue >= originalValue;

    return {
        months,
        years: Math.round(months / 12 * 10) / 10,
        finalValue: currentValue,
        withContributions: monthlyContribution > 0,
        recovered
    };
}

/**
 * Get impact label based on percentage
 */
function getImpactLabel(impact) {
    if (impact >= 0.05) return 'Safe Haven';
    if (impact >= 0) return 'Stable';
    if (impact >= -0.15) return 'Minor Impact';
    if (impact >= -0.30) return 'Moderate Impact';
    if (impact >= -0.50) return 'Severe Impact';
    return 'Devastating';
}

/**
 * Calculate sector breakdown of losses
 */
function calculateSectorBreakdown(impactedHoldings) {
    const sectors = {};

    impactedHoldings.forEach(holding => {
        if (!sectors[holding.sector]) {
            sectors[holding.sector] = {
                sector: holding.sector,
                originalValue: 0,
                crashedValue: 0,
                loss: 0,
                assets: []
            };
        }

        sectors[holding.sector].originalValue += holding.originalValue;
        sectors[holding.sector].crashedValue += holding.newValue;
        sectors[holding.sector].loss += holding.loss;
        sectors[holding.sector].assets.push(holding.symbol);
    });

    // Calculate percentages
    Object.values(sectors).forEach(sector => {
        sector.lossPercent = (sector.loss / sector.originalValue) * 100;
    });

    return Object.values(sectors).sort((a, b) => b.loss - a.loss);
}

/**
 * Get emotional impact message
 */
export function getEmotionalImpact(lossAmount, lossPercent) {
    if (lossPercent < 10) {
        return {
            severity: 'manageable',
            message: 'This is within normal market volatility. Stay calm and invested.',
            color: 'var(--color-warning)'
        };
    }
    if (lossPercent < 25) {
        return {
            severity: 'significant',
            message: 'A significant drop that would test your resolve. Many investors panic sell here.',
            color: 'var(--color-warning)'
        };
    }
    if (lossPercent < 40) {
        return {
            severity: 'severe',
            message: 'This would be emotionally devastating for most investors. Question: could you hold?',
            color: 'var(--color-danger)'
        };
    }
    return {
        severity: 'extreme',
        message: 'An extreme loss that historically causes mass panic selling. Only the most disciplined survive.',
        color: 'var(--color-danger)'
    };
}
