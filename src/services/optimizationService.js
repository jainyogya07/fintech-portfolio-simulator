/**
 * Portfolio Optimization Service
 * Analyze portfolio and suggest improvements
 */

import { getStockSector } from '../config/crashScenarios';

/**
 * Analyze portfolio and generate optimization suggestions
 */
export function analyzePortfolio(holdings) {
    if (!holdings || holdings.length === 0) {
        return { suggestions: [], score: 0 };
    }

    const suggestions = [];
    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);

    // 1. Concentration Risk
    const concentrationRisk = analyzeConcentration(holdings, totalValue);
    if (concentrationRisk.length > 0) {
        suggestions.push(...concentrationRisk);
    }

    // 2. Sector Diversification
    const sectorRisk = analyzeSectorDiversification(holdings, totalValue);
    if (sectorRisk.length > 0) {
        suggestions.push(...sectorRisk);
    }

    // 3. Number of Holdings
    if (holdings.length < 5) {
        suggestions.push({
            type: 'diversification',
            priority: 'medium',
            title: 'Limited Diversification',
            description: `You have only ${holdings.length} holding(s). Consider adding more stocks across different sectors to reduce risk.`,
            action: 'Add 5-10 more stocks from different sectors',
            icon: '📊'
        });
    }

    // 4. All gains / all losses
    const allGains = holdings.every(h => h.currentPrice >= h.purchasePrice);
    const allLosses = holdings.every(h => h.currentPrice < h.purchasePrice);

    if (allGains && holdings.length > 3) {
        suggestions.push({
            type: 'rebalancing',
            priority: 'low',
            title: 'Consider Taking Profits',
            description: 'All your holdings are in profit. Consider rebalancing or taking some gains.',
            action: 'Review if any positions have grown beyond target allocation',
            icon: '💰'
        });
    }

    if (allLosses && holdings.length > 2) {
        suggestions.push({
            type: 'review',
            priority: 'high',
            title: 'Portfolio Under Review',
            description: 'All holdings are at a loss. Review your investment thesis for each position.',
            action: 'Consider tax-loss harvesting or averaging down on conviction positions',
            icon: '⚠️'
        });
    }

    // Calculate optimization score (0-100)
    const score = calculateOptimizationScore(holdings, suggestions);

    return {
        suggestions: suggestions.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)),
        score,
        holdingsCount: holdings.length,
        totalValue
    };
}

/**
 * Analyze concentration risk (single stock > 25% of portfolio)
 */
function analyzeConcentration(holdings, totalValue) {
    const suggestions = [];

    holdings.forEach(h => {
        const value = h.currentPrice * h.shares;
        const weight = (value / totalValue) * 100;

        if (weight > 40) {
            suggestions.push({
                type: 'concentration',
                priority: 'high',
                title: `High Concentration: ${h.symbol}`,
                description: `${h.symbol} represents ${weight.toFixed(1)}% of your portfolio. This is very high concentration risk.`,
                action: `Consider reducing ${h.symbol} to under 25% and diversifying`,
                icon: '🎯',
                symbol: h.symbol,
                weight
            });
        } else if (weight > 25) {
            suggestions.push({
                type: 'concentration',
                priority: 'medium',
                title: `Moderate Concentration: ${h.symbol}`,
                description: `${h.symbol} represents ${weight.toFixed(1)}% of your portfolio.`,
                action: `Consider trimming ${h.symbol} if you want more balanced exposure`,
                icon: '📍',
                symbol: h.symbol,
                weight
            });
        }
    });

    return suggestions;
}

/**
 * Analyze sector diversification
 */
function analyzeSectorDiversification(holdings, totalValue) {
    const suggestions = [];
    const sectors = {};

    // Group by sector
    holdings.forEach(h => {
        const sector = getStockSector(h.symbol);
        const value = h.currentPrice * h.shares;

        if (!sectors[sector]) {
            sectors[sector] = { value: 0, stocks: [] };
        }
        sectors[sector].value += value;
        sectors[sector].stocks.push(h.symbol);
    });

    // Check sector weights
    Object.entries(sectors).forEach(([sector, data]) => {
        const weight = (data.value / totalValue) * 100;

        if (weight > 50) {
            suggestions.push({
                type: 'sector',
                priority: 'high',
                title: `Heavy ${capitalize(sector)} Exposure`,
                description: `${weight.toFixed(1)}% of your portfolio is in ${sector} (${data.stocks.join(', ')}). This creates significant sector risk.`,
                action: `Consider adding exposure to other sectors like healthcare, utilities, or bonds`,
                icon: '🏭',
                sector,
                weight
            });
        } else if (weight > 35) {
            suggestions.push({
                type: 'sector',
                priority: 'medium',
                title: `${capitalize(sector)} Overweight`,
                description: `${weight.toFixed(1)}% in ${sector} sector is above typical diversification guidelines.`,
                action: `Consider balancing with other sectors`,
                icon: '⚖️',
                sector,
                weight
            });
        }
    });

    // Check for missing defensive sectors
    const hasDefensive = sectors.utilities || sectors.healthcare || sectors.bonds;
    if (!hasDefensive && holdings.length >= 3) {
        suggestions.push({
            type: 'allocation',
            priority: 'low',
            title: 'No Defensive Holdings',
            description: 'Your portfolio lacks defensive sectors (utilities, healthcare, bonds) that may hold up better in downturns.',
            action: 'Consider adding 10-20% in defensive stocks or bond ETFs',
            icon: '🛡️'
        });
    }

    return suggestions;
}

/**
 * Calculate optimization score
 */
function calculateOptimizationScore(holdings, suggestions) {
    let score = 100;

    // Deduct points based on suggestions
    suggestions.forEach(s => {
        if (s.priority === 'high') score -= 20;
        else if (s.priority === 'medium') score -= 10;
        else score -= 5;
    });

    // Bonus for good diversification
    if (holdings.length >= 8) score += 5;
    if (holdings.length >= 12) score += 5;

    return Math.max(0, Math.min(100, score));
}

function priorityWeight(priority) {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[priority] || 0;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get score rating
 */
export function getOptimizationRating(score) {
    if (score >= 90) return { label: 'Excellent', color: 'var(--color-success)' };
    if (score >= 75) return { label: 'Good', color: 'var(--color-success)' };
    if (score >= 60) return { label: 'Fair', color: 'var(--color-warning)' };
    if (score >= 40) return { label: 'Needs Work', color: 'var(--color-warning)' };
    return { label: 'High Risk', color: 'var(--color-danger)' };
}
