/**
 * Tax Service
 * Calculate tax implications and harvesting opportunities
 */

import { formatCurrency } from './calculations';

// Tax rates (simplified, US-based)
const SHORT_TERM_RATE = 0.32; // Ordinary income (assumed 32% bracket)
const LONG_TERM_RATE = 0.15;  // Long-term capital gains

/**
 * Analyze holdings for tax-loss harvesting opportunities
 */
export function analyzeTaxOpportunities(holdings) {
    if (!holdings || holdings.length === 0) {
        return {
            opportunities: [],
            potentialSavings: 0,
            unrealizedLosses: 0,
            unrealizedGains: 0
        };
    }

    const opportunities = [];
    let totalUnrealizedLosses = 0;
    let totalUnrealizedGains = 0;

    // Analyze each holding
    holdings.forEach(h => {
        const currentValue = h.currentPrice * h.shares;
        const costBasis = h.purchasePrice * h.shares;
        const gainLoss = currentValue - costBasis;
        const gainLossPercent = ((gainLoss / costBasis) * 100);

        if (gainLoss < 0) {
            totalUnrealizedLosses += Math.abs(gainLoss);

            // Significant loss opportunity
            if (gainLossPercent <= -10) {
                const taxSavings = Math.abs(gainLoss) * SHORT_TERM_RATE;

                opportunities.push({
                    type: 'harvest',
                    symbol: h.symbol,
                    shares: h.shares,
                    currentPrice: h.currentPrice,
                    purchasePrice: h.purchasePrice,
                    loss: Math.abs(gainLoss),
                    lossPercent: gainLossPercent,
                    potentialTaxSavings: taxSavings,
                    priority: gainLossPercent <= -20 ? 'high' : 'medium',
                    action: `Sell ${h.symbol} to realize $${Math.abs(gainLoss).toLocaleString()} loss`,
                    note: 'Wait 31 days before repurchasing to avoid wash sale rules'
                });
            }
        } else {
            totalUnrealizedGains += gainLoss;
        }
    });

    // Calculate total potential tax savings
    // Losses can offset gains first, then up to $3,000 of ordinary income
    const lossesToOffsetGains = Math.min(totalUnrealizedLosses, totalUnrealizedGains);
    const excessLosses = totalUnrealizedLosses - lossesToOffsetGains;
    const lossesToOffsetIncome = Math.min(excessLosses, 3000);

    const savingsFromGainOffset = lossesToOffsetGains * LONG_TERM_RATE;
    const savingsFromIncomeOffset = lossesToOffsetIncome * SHORT_TERM_RATE;
    const potentialSavings = savingsFromGainOffset + savingsFromIncomeOffset;

    return {
        opportunities: opportunities.sort((a, b) => b.loss - a.loss),
        potentialSavings: Math.round(potentialSavings),
        unrealizedLosses: Math.round(totalUnrealizedLosses),
        unrealizedGains: Math.round(totalUnrealizedGains),
        netGainLoss: Math.round(totalUnrealizedGains - totalUnrealizedLosses),
        taxableGains: Math.round(Math.max(0, totalUnrealizedGains - totalUnrealizedLosses)),
        savingsBreakdown: {
            fromGainOffset: Math.round(savingsFromGainOffset),
            fromIncomeOffset: Math.round(savingsFromIncomeOffset),
            annualIncomeDeduction: Math.min(excessLosses, 3000)
        }
    };
}

/**
 * Get tax harvesting priority
 */
export function getHarvestPriority(lossPercent) {
    if (lossPercent <= -30) return { label: 'Urgent', color: 'var(--color-danger)' };
    if (lossPercent <= -20) return { label: 'High', color: 'var(--color-warning)' };
    if (lossPercent <= -10) return { label: 'Consider', color: 'var(--color-primary)' };
    return { label: 'Low', color: 'var(--color-text-secondary)' };
}

/**
 * Generate tax summary
 */
export function generateTaxSummary(holdings) {
    const analysis = analyzeTaxOpportunities(holdings);

    if (analysis.opportunities.length === 0 && analysis.unrealizedGains > 0) {
        return {
            status: 'gains',
            message: `You have ${formatCurrency(analysis.unrealizedGains)} in unrealized gains. No harvesting opportunities.`,
            estimatedTax: Math.round(analysis.unrealizedGains * LONG_TERM_RATE)
        };
    }

    if (analysis.opportunities.length > 0) {
        return {
            status: 'opportunities',
            message: `${analysis.opportunities.length} tax-loss harvesting opportunities found.`,
            potentialSavings: analysis.potentialSavings
        };
    }

    return {
        status: 'neutral',
        message: 'No significant tax implications at current prices.',
        potentialSavings: 0
    };
}
