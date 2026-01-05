import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { analyzeTaxOpportunities, getHarvestPriority } from '../services/taxService';
import { formatCurrency } from '../services/calculations';

export default function TaxHints() {
    const { holdings, isLoading } = usePortfolio();

    const analysis = useMemo(() => {
        return analyzeTaxOpportunities(holdings);
    }, [holdings]);

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse">
                    <div className="h-6 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-4"></div>
                    <div className="h-24 bg-[var(--color-bg-secondary)] rounded"></div>
                </div>
            </div>
        );
    }

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                    Tax-Loss Harvesting
                </h2>
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">Add stocks to see tax opportunities</p>
                </div>
            </div>
        );
    }

    const hasOpportunities = analysis.opportunities.length > 0;

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                Tax-Loss Harvesting
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Reduce your tax bill by realizing losses strategically
            </p>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[var(--color-success)]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">Unrealized Gains</p>
                    <p className="text-lg font-bold text-[var(--color-success)]">
                        {formatCurrency(analysis.unrealizedGains)}
                    </p>
                </div>
                <div className="bg-[var(--color-danger)]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">Unrealized Losses</p>
                    <p className="text-lg font-bold text-[var(--color-danger)]">
                        {formatCurrency(analysis.unrealizedLosses)}
                    </p>
                </div>
            </div>

            {/* Potential Savings */}
            {analysis.potentialSavings > 0 && (
                <div className="bg-[var(--color-primary)]/10 rounded-lg p-4 mb-4 text-center">
                    <p className="text-sm text-[var(--color-text-secondary)]">Potential Tax Savings</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(analysis.potentialSavings)}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        By harvesting losses to offset {analysis.unrealizedGains > 0 ? 'gains' : 'income'}
                    </p>
                </div>
            )}

            {/* Opportunities */}
            {hasOpportunities ? (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Harvesting Opportunities:</h3>
                    {analysis.opportunities.map((opp, index) => {
                        const priority = getHarvestPriority(opp.lossPercent);
                        return (
                            <div
                                key={index}
                                className="bg-[var(--color-bg-secondary)] rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{opp.symbol}</span>
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded"
                                            style={{
                                                backgroundColor: `${priority.color}20`,
                                                color: priority.color
                                            }}
                                        >
                                            {priority.label}
                                        </span>
                                    </div>
                                    <span className="text-[var(--color-danger)] font-bold">
                                        {opp.lossPercent.toFixed(1)}%
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <span className="text-[var(--color-text-secondary)]">Loss: </span>
                                        <span className="font-medium text-[var(--color-danger)]">
                                            -{formatCurrency(opp.loss)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-secondary)]">Tax Savings: </span>
                                        <span className="font-medium text-[var(--color-success)]">
                                            ~{formatCurrency(opp.potentialTaxSavings)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-[var(--color-warning)] flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {opp.note}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 bg-[var(--color-bg-secondary)] rounded-lg">
                    <span className="text-3xl mb-2 block">✅</span>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        No significant tax-loss harvesting opportunities
                    </p>
                    {analysis.unrealizedGains > 0 && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            Your positions are in profit — consider holding for long-term rates
                        </p>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg text-xs text-[var(--color-text-secondary)]">
                <strong>Note:</strong> Tax calculations are estimates based on simplified rules.
                Consult a tax professional for personalized advice. Wash sale rules may apply.
            </div>
        </div>
    );
}
