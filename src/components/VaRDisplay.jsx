import { usePortfolio } from '../context/PortfolioContext';
import {
    calculatePortfolioValue,
    calculatePortfolioVolatility,
    calculateVaR,
    formatCurrency
} from '../services/calculations';

export default function VaRDisplay() {
    const { holdings, isLoading } = usePortfolio();

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse">
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-4"></div>
                    <div className="h-20 bg-[var(--color-bg-secondary)] rounded"></div>
                </div>
            </div>
        );
    }

    const portfolioValue = calculatePortfolioValue(holdings);
    const volatility = calculatePortfolioVolatility(holdings);

    // Calculate VaR at different time horizons
    const var95Daily = calculateVaR(portfolioValue, volatility, 0.95, 1);
    const var95Weekly = calculateVaR(portfolioValue, volatility, 0.95, 5);
    const var95Monthly = calculateVaR(portfolioValue, volatility, 0.95, 21);
    const var99Daily = calculateVaR(portfolioValue, volatility, 0.99, 1);

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Value at Risk (VaR)
                </h2>
                <div className="text-center py-6">
                    <p className="text-[var(--color-text-secondary)]">Add stocks to calculate VaR</p>
                </div>
            </div>
        );
    }

    // Calculate percentage of portfolio
    const var95DailyPct = (var95Daily / portfolioValue) * 100;

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Value at Risk (VaR)
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Maximum expected loss at 95% confidence
            </p>

            {/* Main VaR Display */}
            <div className="bg-gradient-to-r from-[var(--color-danger)]/20 to-transparent p-4 rounded-lg mb-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[var(--color-danger)]">
                        {formatCurrency(var95Daily)}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">/ day</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    There's a 5% chance you could lose more than this in a single day
                </p>
            </div>

            {/* VaR Time Horizons */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Daily</p>
                    <p className="text-lg font-semibold text-[var(--color-danger)]">
                        {formatCurrency(var95Daily)}
                    </p>
                    <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2 mt-2">
                        <div
                            className="bg-[var(--color-danger)] h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(var95DailyPct * 3, 100)}%` }}
                        ></div>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Weekly</p>
                    <p className="text-lg font-semibold text-[var(--color-warning)]">
                        {formatCurrency(var95Weekly)}
                    </p>
                    <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2 mt-2">
                        <div
                            className="bg-[var(--color-warning)] h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((var95Weekly / portfolioValue) * 100 * 3, 100)}%` }}
                        ></div>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Monthly</p>
                    <p className="text-lg font-semibold text-[var(--color-primary)]">
                        {formatCurrency(var95Monthly)}
                    </p>
                    <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2 mt-2">
                        <div
                            className="bg-[var(--color-primary)] h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((var95Monthly / portfolioValue) * 100 * 2, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 99% VaR */}
            <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Extreme Risk (99% VaR)</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            1-in-100 worst day scenario
                        </p>
                    </div>
                    <p className="text-xl font-semibold text-[var(--color-danger)]">
                        {formatCurrency(var99Daily)}
                    </p>
                </div>
            </div>
        </div>
    );
}
