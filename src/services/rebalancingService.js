/**
 * Rebalancing Service
 * Calculate trades needed to reach target allocation
 */

import { formatCurrency } from './calculations';

/**
 * Calculate rebalancing trades
 */
export function calculateRebalancingTrades({
    holdings,
    targetAllocations,
    totalValue,
    minTradeSize = 100 // Minimum trade to recommend
}) {
    if (!holdings || holdings.length === 0) return { trades: [], summary: {} };

    const trades = [];
    let totalBuy = 0;
    let totalSell = 0;

    // Calculate current allocations
    const currentAllocations = {};
    holdings.forEach(h => {
        const value = h.currentPrice * h.shares;
        currentAllocations[h.symbol] = {
            value,
            weight: (value / totalValue) * 100,
            shares: h.shares,
            price: h.currentPrice
        };
    });

    // Calculate trades for each target
    Object.entries(targetAllocations).forEach(([symbol, targetWeight]) => {
        const current = currentAllocations[symbol] || { value: 0, weight: 0 };
        const targetValue = (targetWeight / 100) * totalValue;
        const difference = targetValue - current.value;

        if (Math.abs(difference) >= minTradeSize) {
            const trade = {
                symbol,
                action: difference > 0 ? 'BUY' : 'SELL',
                currentWeight: current.weight.toFixed(1),
                targetWeight: targetWeight.toFixed(1),
                currentValue: current.value,
                targetValue,
                tradeAmount: Math.abs(difference),
                shares: current.price ? Math.floor(Math.abs(difference) / current.price) : 0,
                price: current.price || 0,
                driftPercent: (current.weight - targetWeight).toFixed(1)
            };

            trades.push(trade);

            if (difference > 0) {
                totalBuy += difference;
            } else {
                totalSell += Math.abs(difference);
            }
        }
    });

    // Check for holdings not in target (to sell completely)
    holdings.forEach(h => {
        if (!(h.symbol in targetAllocations)) {
            const value = h.currentPrice * h.shares;
            if (value >= minTradeSize) {
                trades.push({
                    symbol: h.symbol,
                    action: 'SELL',
                    currentWeight: ((value / totalValue) * 100).toFixed(1),
                    targetWeight: '0',
                    currentValue: value,
                    targetValue: 0,
                    tradeAmount: value,
                    shares: h.shares,
                    price: h.currentPrice,
                    driftPercent: `+${((value / totalValue) * 100).toFixed(1)}`,
                    removeFromPortfolio: true
                });
                totalSell += value;
            }
        }
    });

    // Sort: sells first (to generate cash), then buys
    trades.sort((a, b) => {
        if (a.action === 'SELL' && b.action === 'BUY') return -1;
        if (a.action === 'BUY' && b.action === 'SELL') return 1;
        return b.tradeAmount - a.tradeAmount;
    });

    return {
        trades,
        summary: {
            totalBuy: Math.round(totalBuy),
            totalSell: Math.round(totalSell),
            netCash: Math.round(totalSell - totalBuy), // Positive = cash generated
            tradesNeeded: trades.length,
            isBalanced: trades.length === 0
        }
    };
}

/**
 * Generate simple equal-weight targets
 */
export function generateEqualWeightTargets(symbols) {
    const weight = 100 / symbols.length;
    const targets = {};
    symbols.forEach(symbol => {
        targets[symbol] = weight;
    });
    return targets;
}

/**
 * Estimate tax impact of trades
 */
export function estimateTaxImpact(trades, holdings) {
    let shortTermGains = 0;
    let shortTermLosses = 0;
    let longTermGains = 0;
    let longTermLosses = 0;

    trades.filter(t => t.action === 'SELL').forEach(trade => {
        const holding = holdings.find(h => h.symbol === trade.symbol);
        if (holding) {
            const costBasis = holding.purchasePrice * Math.min(trade.shares, holding.shares);
            const saleValue = trade.shares * trade.price;
            const gainLoss = saleValue - costBasis;

            // Assume short-term for simplicity (< 1 year)
            if (gainLoss > 0) {
                shortTermGains += gainLoss;
            } else {
                shortTermLosses += Math.abs(gainLoss);
            }
        }
    });

    const taxableGain = shortTermGains - shortTermLosses;
    const estimatedTax = Math.max(0, taxableGain * 0.32); // 32% bracket assumption

    return {
        shortTermGains: Math.round(shortTermGains),
        shortTermLosses: Math.round(shortTermLosses),
        longTermGains: Math.round(longTermGains),
        longTermLosses: Math.round(longTermLosses),
        netTaxableGain: Math.round(taxableGain),
        estimatedTax: Math.round(estimatedTax)
    };
}
