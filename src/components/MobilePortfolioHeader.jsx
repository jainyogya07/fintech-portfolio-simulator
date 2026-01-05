import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatPercentage } from '../services/calculations';

/**
 * Mobile-only quick stats header
 * Shows portfolio value and quick summary at top of page
 */
export default function MobilePortfolioHeader() {
    const { holdings } = usePortfolio();

    const totalValue = holdings.reduce((sum, h) => sum + (h.currentPrice * h.shares), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.purchasePrice * h.shares), 0);
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;
    const isPositive = totalGain >= 0;

    if (holdings.length === 0) return null;

    return (
        <div className="sm:hidden glass-card p-3 mb-4 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Portfolio Value</p>
                    <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
                </div>
                <div className="text-right">
                    <p className={`text-sm font-bold ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                        {isPositive ? '↑' : '↓'} {formatCurrency(Math.abs(totalGain))}
                    </p>
                    <p className={`text-xs ${isPositive ? 'stat-positive' : 'stat-negative'}`}>
                        ({formatPercentage(gainPercent)})
                    </p>
                </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                <span>📊 {holdings.length} holding{holdings.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>💰 {formatCurrency(totalCost)} invested</span>
            </div>
        </div>
    );
}
