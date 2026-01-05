import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { calculateDividendIncome, getYieldCategory } from '../services/dividendService';
import { formatCurrency } from '../services/calculations';

export default function DividendTracker() {
    const { holdings, isLoading } = usePortfolio();

    const dividends = useMemo(() => {
        return calculateDividendIncome(holdings);
    }, [holdings]);

    const yieldCategory = getYieldCategory(Number(dividends.summary.portfolioYield));

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
                    <span className="text-2xl">💵</span>
                    Dividend Tracker
                </h2>
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">Add holdings to track dividend income</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">💵</span>
                Dividend Tracker
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Projected passive income from dividends
            </p>

            {/* Income Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[var(--color-success)]/10 rounded-lg p-4 text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">Annual Income</p>
                    <p className="text-2xl font-bold text-[var(--color-success)]">
                        {formatCurrency(dividends.summary.annualIncome)}
                    </p>
                </div>
                <div className="bg-[var(--color-primary)]/10 rounded-lg p-4 text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">Monthly</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(dividends.summary.monthlyIncome)}
                    </p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4 text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">Portfolio Yield</p>
                    <p className="text-2xl font-bold" style={{ color: yieldCategory.color }}>
                        {dividends.summary.portfolioYield}%
                    </p>
                    <p className="text-xs" style={{ color: yieldCategory.color }}>
                        {yieldCategory.label}
                    </p>
                </div>
            </div>

            {/* Holdings Breakdown */}
            <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center justify-between">
                    <span>By Holding</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                        {dividends.summary.dividendPayers}/{holdings.length} pay dividends
                    </span>
                </h3>

                <div className="max-h-64 overflow-y-auto space-y-2">
                    {dividends.holdings.map((h, index) => (
                        <div
                            key={index}
                            className="bg-[var(--color-bg-secondary)] rounded-lg p-3 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-8 rounded ${h.isPayer ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-secondary)] opacity-30'}`} />
                                <div>
                                    <p className="font-bold">{h.symbol}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {formatCurrency(h.value)} • {h.yield}% yield
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                {h.isPayer ? (
                                    <>
                                        <p className="font-bold text-[var(--color-success)]">
                                            {formatCurrency(h.annualDividend)}/yr
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {formatCurrency(h.monthlyDividend)}/mo
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-xs text-[var(--color-text-secondary)]">No dividend</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            {dividends.summary.nonPayers > dividends.summary.dividendPayers && (
                <div className="mt-4 p-3 bg-[var(--color-primary)]/10 rounded-lg text-xs">
                    <p className="font-semibold text-[var(--color-primary)] mb-1">💡 Dividend Tip:</p>
                    <p className="text-[var(--color-text-secondary)]">
                        Most of your holdings don't pay dividends. Consider adding dividend stocks like
                        VZ, XOM, or dividend ETFs like SCHD for passive income.
                    </p>
                </div>
            )}

            {/* 5-Year Projection */}
            {dividends.summary.annualIncome > 0 && (
                <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                    <p className="text-xs font-semibold mb-2">5-Year Projection (5% growth):</p>
                    <div className="flex justify-between text-xs">
                        <span>Year 1: {formatCurrency(dividends.summary.annualIncome)}</span>
                        <span>Year 5: {formatCurrency(dividends.summary.annualIncome * 1.22)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
