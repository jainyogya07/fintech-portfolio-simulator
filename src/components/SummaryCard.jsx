import { usePortfolio } from '../context/PortfolioContext';
import {
    calculatePortfolioValue,
    calculateGainLoss,
    formatCurrency,
    formatPercentage
} from '../services/calculations';

export default function SummaryCard() {
    const { holdings, isLoading, lastUpdated } = usePortfolio();

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/3"></div>
                    <div className="h-8 bg-[var(--color-bg-secondary)] rounded w-2/3"></div>
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const totalValue = calculatePortfolioValue(holdings);
    const { totalGain, percentageGain } = calculateGainLoss(holdings);
    const isPositive = totalGain >= 0;

    return (
        <div className="glass-card p-5 sm:p-6 animate-fadeIn">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <p className="ui-kicker mb-1">Snapshot</p>
                    <h2 className="ui-section-title">Summary</h2>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-1.5 text-[var(--color-primary)]" aria-hidden>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
            </div>

            <div className="space-y-6">
                {/* Total Value */}
                <div>
                    <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">Total value</p>
                    <p className="ui-display">
                        {formatCurrency(totalValue)}
                    </p>
                </div>

                {/* Gain/Loss */}
                <div className="flex gap-8">
                    <div>
                        <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">Gain / loss</p>
                        <p className={`ui-stat ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(totalGain)}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">Total Return</p>
                        <div className={`flex items-center gap-1 ui-stat ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                            {isPositive ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                            )}
                            {formatPercentage(percentageGain, true)}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
                    <div>
                        <p className="text-xs font-medium text-[var(--color-text-secondary)]">Holdings</p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums">{holdings.length}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[var(--color-text-secondary)]">Updated</p>
                        <p className="mt-0.5 text-sm font-medium tabular-nums">
                            {lastUpdated
                                ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Never'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
