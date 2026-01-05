import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatPercentage } from '../services/calculations';
import { SkeletonTable } from './Skeleton';
import SwipeableRow from './SwipeableRow';
import { hapticLight } from '../utils/haptics';

export default function PortfolioTable() {
    const { holdings, isLoading, removeStock } = usePortfolio();

    if (isLoading) {
        return <SkeletonTable rows={4} />;
    }

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-4 sm:p-6 animate-fadeIn">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Your Portfolio
                </h2>
                <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📊</span>
                    <p className="text-[var(--color-text-secondary)]">No holdings yet</p>
                    <p className="text-sm text-[var(--color-text-secondary)] opacity-75 mt-1">
                        Add your first stock above
                    </p>
                </div>
            </div>
        );
    }

    const handleRemove = async (id) => {
        hapticLight();
        await removeStock(id);
    };

    const sortedHoldings = [...holdings].sort((a, b) =>
        (b.currentPrice * b.shares) - (a.currentPrice * a.shares)
    );

    return (
        <div className="glass-card p-4 sm:p-6 animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Portfolio
                <span className="ml-auto text-xs sm:text-sm font-normal text-[var(--color-text-secondary)]">
                    {holdings.length} holding{holdings.length !== 1 ? 's' : ''}
                </span>
            </h2>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2">
                {sortedHoldings.map((holding) => {
                    const value = holding.currentPrice * holding.shares;
                    const costBasis = holding.purchasePrice * holding.shares;
                    const gainLoss = value - costBasis;
                    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                    const isPositive = gainLoss >= 0;

                    return (
                        <SwipeableRow
                            key={holding.id}
                            onDelete={() => handleRemove(holding.id)}
                            onAction={() => { }}
                            actionIcon="📊"
                            actionLabel="Details"
                        >
                            <div className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-[var(--color-primary-light)]">{holding.symbol}</div>
                                    <div className="text-xs text-[var(--color-text-secondary)]">
                                        {holding.shares} shares @ {formatCurrency(holding.purchasePrice)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{formatCurrency(value)}</div>
                                    <div className={`text-xs font-medium ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                                        {isPositive ? '↑' : '↓'} {formatCurrency(Math.abs(gainLoss))} ({formatPercentage(gainLossPercent)})
                                    </div>
                                </div>
                            </div>
                        </SwipeableRow>
                    );
                })}
                <p className="text-xs text-center text-[var(--color-text-secondary)] pt-2">
                    ← Swipe for actions →
                </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            <th className="text-left py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]">Symbol</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]">Shares</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]">Avg Cost</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]">Price</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]">Value</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]">Gain/Loss</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-[var(--color-text-secondary)]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedHoldings.map((holding) => {
                            const value = holding.currentPrice * holding.shares;
                            const costBasis = holding.purchasePrice * holding.shares;
                            const gainLoss = value - costBasis;
                            const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                            const isPositive = gainLoss >= 0;

                            return (
                                <tr
                                    key={holding.id}
                                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50 transition-colors"
                                >
                                    <td className="py-3 px-2">
                                        <div className="font-semibold text-[var(--color-primary-light)]">{holding.symbol}</div>
                                    </td>
                                    <td className="text-right py-3 px-2 font-mono">
                                        {holding.shares.toLocaleString()}
                                    </td>
                                    <td className="text-right py-3 px-2 font-mono text-[var(--color-text-secondary)]">
                                        {formatCurrency(holding.purchasePrice)}
                                    </td>
                                    <td className="text-right py-3 px-2">
                                        <div className="font-mono">{formatCurrency(holding.currentPrice)}</div>
                                        {holding.priceChangePercent !== undefined && (
                                            <div className={`text-xs ${holding.priceChangePercent >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                                                {formatPercentage(holding.priceChangePercent, true)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-right py-3 px-2 font-mono font-medium">
                                        {formatCurrency(value)}
                                    </td>
                                    <td className="text-right py-3 px-2">
                                        <div className={`font-mono font-medium ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                                            {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
                                        </div>
                                        <div className={`text-xs ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                                            {formatPercentage(gainLossPercent, true)}
                                        </div>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <button
                                            onClick={() => handleRemove(holding.id)}
                                            className="btn-icon p-1.5 hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]"
                                            title="Remove"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
