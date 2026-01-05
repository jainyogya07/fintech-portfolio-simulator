import { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    calculateRebalancingTrades,
    generateEqualWeightTargets,
    estimateTaxImpact
} from '../services/rebalancingService';
import { formatCurrency } from '../services/calculations';

export default function RebalancingCalculator() {
    const { holdings, totalValue, isLoading } = usePortfolio();

    const [targetAllocations, setTargetAllocations] = useState({});
    const [showResults, setShowResults] = useState(false);

    // Initialize targets from current holdings
    useEffect(() => {
        if (holdings.length > 0 && Object.keys(targetAllocations).length === 0) {
            const initial = {};
            holdings.forEach(h => {
                const weight = ((h.currentPrice * h.shares) / totalValue) * 100;
                initial[h.symbol] = Math.round(weight);
            });
            setTargetAllocations(initial);
        }
    }, [holdings, totalValue]);

    const results = useMemo(() => {
        if (!showResults || holdings.length === 0) return null;

        const trades = calculateRebalancingTrades({
            holdings,
            targetAllocations,
            totalValue
        });

        const tax = estimateTaxImpact(trades.trades, holdings);

        return { ...trades, tax };
    }, [showResults, holdings, targetAllocations, totalValue]);

    const updateTarget = (symbol, value) => {
        setTargetAllocations(prev => ({
            ...prev,
            [symbol]: Number(value) || 0
        }));
        setShowResults(false);
    };

    const applyEqualWeight = () => {
        const symbols = holdings.map(h => h.symbol);
        setTargetAllocations(generateEqualWeightTargets(symbols));
        setShowResults(false);
    };

    const totalTarget = Object.values(targetAllocations).reduce((sum, w) => sum + w, 0);
    const isValid = Math.abs(totalTarget - 100) < 1;

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse">
                    <div className="h-6 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-4"></div>
                    <div className="h-48 bg-[var(--color-bg-secondary)] rounded"></div>
                </div>
            </div>
        );
    }

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    Rebalancing Calculator
                </h2>
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">Add holdings to calculate rebalancing trades</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">⚖️</span>
                Rebalancing Calculator
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Set target allocations and get exact trades needed
            </p>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={applyEqualWeight}
                    className="text-sm px-3 py-1 bg-[var(--color-bg-secondary)] rounded hover:bg-[var(--color-border)] transition-colors"
                >
                    Equal Weight
                </button>
            </div>

            {/* Target Allocations */}
            <div className="space-y-3 mb-4">
                {holdings.map(h => {
                    const value = h.currentPrice * h.shares;
                    const currentWeight = totalValue > 0 ? (value / totalValue) * 100 : 0;
                    const target = targetAllocations[h.symbol] || 0;
                    const drift = target - currentWeight;

                    return (
                        <div key={h.symbol} className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="font-bold">{h.symbol}</span>
                                    <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                                        Current: {currentWeight.toFixed(1)}%
                                    </span>
                                </div>
                                <span className={`text-xs font-medium ${Math.abs(drift) < 1 ? 'text-[var(--color-success)]' :
                                    Math.abs(drift) < 5 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
                                    }`}>
                                    {drift > 0 ? '+' : ''}{drift.toFixed(1)}% drift
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={target}
                                    onChange={(e) => updateTarget(h.symbol, e.target.value)}
                                    className="flex-1"
                                />
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => updateTarget(h.symbol, e.target.value)}
                                    className="w-16 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-2 py-1 text-sm text-center"
                                    min="0"
                                    max="100"
                                />
                                <span className="text-sm">%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Check */}
            <div className={`p-3 rounded-lg mb-4 text-center ${isValid ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-danger)]/10'
                }`}>
                <span className="text-sm">
                    Total: <strong className={isValid ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                        {totalTarget.toFixed(0)}%
                    </strong>
                    {!isValid && <span className="text-[var(--color-danger)]"> (must equal 100%)</span>}
                </span>
            </div>

            {/* Calculate Button */}
            <button
                onClick={() => setShowResults(true)}
                disabled={!isValid}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate Trades
            </button>

            {/* Results */}
            {results && (
                <div className="space-y-4 animate-fadeIn">
                    {results.summary.isBalanced ? (
                        <div className="text-center py-6 bg-[var(--color-success)]/10 rounded-lg">
                            <span className="text-3xl">✅</span>
                            <p className="font-semibold text-[var(--color-success)] mt-2">Portfolio is Balanced!</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">No trades needed</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[var(--color-success)]/10 rounded-lg p-3 text-center">
                                    <p className="text-xs text-[var(--color-text-secondary)]">To Buy</p>
                                    <p className="text-lg font-bold text-[var(--color-success)]">
                                        {formatCurrency(results.summary.totalBuy)}
                                    </p>
                                </div>
                                <div className="bg-[var(--color-danger)]/10 rounded-lg p-3 text-center">
                                    <p className="text-xs text-[var(--color-text-secondary)]">To Sell</p>
                                    <p className="text-lg font-bold text-[var(--color-danger)]">
                                        {formatCurrency(results.summary.totalSell)}
                                    </p>
                                </div>
                                <div className="bg-[var(--color-primary)]/10 rounded-lg p-3 text-center">
                                    <p className="text-xs text-[var(--color-text-secondary)]">Net Cash</p>
                                    <p className="text-lg font-bold text-[var(--color-primary)]">
                                        {results.summary.netCash >= 0 ? '+' : ''}{formatCurrency(results.summary.netCash)}
                                    </p>
                                </div>
                            </div>

                            {/* Trade List */}
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Trade List:</h3>
                                <div className="space-y-2">
                                    {results.trades.map((trade, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-3 rounded-lg ${trade.action === 'BUY'
                                                ? 'bg-[var(--color-success)]/10'
                                                : 'bg-[var(--color-danger)]/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold text-sm px-2 py-0.5 rounded ${trade.action === 'BUY'
                                                    ? 'bg-[var(--color-success)] text-white'
                                                    : 'bg-[var(--color-danger)] text-white'
                                                    }`}>
                                                    {trade.action}
                                                </span>
                                                <div>
                                                    <span className="font-bold">{trade.symbol}</span>
                                                    <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                                                        {trade.currentWeight}% → {trade.targetWeight}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(trade.tradeAmount)}</p>
                                                {trade.shares > 0 && (
                                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                                        ~{trade.shares} shares @ {formatCurrency(trade.price)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tax Impact */}
                            {results.tax.estimatedTax > 0 && (
                                <div className="p-3 bg-[var(--color-warning)]/10 border-l-4 border-[var(--color-warning)] rounded text-sm">
                                    <p className="font-semibold text-[var(--color-warning)]">
                                        ⚠️ Estimated Tax Impact: {formatCurrency(results.tax.estimatedTax)}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                        Based on {formatCurrency(results.tax.netTaxableGain)} in realized gains
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
