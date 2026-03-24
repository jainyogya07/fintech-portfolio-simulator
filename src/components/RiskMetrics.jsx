import { usePortfolio } from '../context/PortfolioContext';
import {
    calculatePortfolioValue,
    calculatePortfolioVolatility,
    calculateSharpeRatio,
    formatPercentage
} from '../services/calculations';
import { fetchHistoricalPrices } from '../services/apiService';
import { useEffect, useState } from 'react';

export default function RiskMetrics() {
    const { holdings, isLoading } = usePortfolio();
    const [sharpeRatio, setSharpeRatio] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const volatility = calculatePortfolioVolatility(holdings);
    const portfolioValue = calculatePortfolioValue(holdings);

    // Calculate portfolio-level Sharpe ratio
    useEffect(() => {
        const calculateMetrics = async () => {
            if (holdings.length === 0) {
                setSharpeRatio(null);
                return;
            }

            setIsCalculating(true);
            try {
                // Get weighted returns
                const totalValue = calculatePortfolioValue(holdings);
                let weightedReturns = [];

                for (const holding of holdings) {
                    const weight = (holding.currentPrice * holding.shares) / totalValue;
                    const returns = await fetchHistoricalPrices(holding.symbol, 252);

                    if (weightedReturns.length === 0) {
                        weightedReturns = returns.map(r => r * weight);
                    } else {
                        for (let i = 0; i < Math.min(returns.length, weightedReturns.length); i++) {
                            weightedReturns[i] += returns[i] * weight;
                        }
                    }
                }

                const sharpe = calculateSharpeRatio(weightedReturns);
                setSharpeRatio(sharpe);
            } catch (err) {
                console.error('Error calculating Sharpe ratio:', err);
                setSharpeRatio(null);
            } finally {
                setIsCalculating(false);
            }
        };

        calculateMetrics();
    }, [holdings]);

    // Get Sharpe rating
    const getSharpeRating = (ratio) => {
        if (ratio === null) return { label: 'N/A', color: 'var(--color-text-secondary)' };
        if (ratio >= 1.5) return { label: 'Excellent', color: 'var(--color-success)' };
        if (ratio >= 1.0) return { label: 'Good', color: 'var(--color-success)' };
        if (ratio >= 0.5) return { label: 'Average', color: 'var(--color-warning)' };
        if (ratio >= 0) return { label: 'Below Avg', color: 'var(--color-warning)' };
        return { label: 'Poor', color: 'var(--color-danger)' };
    };

    const sharpeRating = getSharpeRating(sharpeRatio);

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

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Risk Metrics
                </h2>
                <div className="text-center py-6">
                    <p className="text-[var(--color-text-secondary)]">Add stocks to see risk metrics</p>
                </div>
            </div>
        );
    }

    // Calculate expected return (simplified assumption)
    const expectedReturn = 7; // Assuming 7% market average

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Risk-Adjusted Metrics
            </h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Sharpe Ratio */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[var(--color-text-secondary)]">Sharpe Ratio</p>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${sharpeRating.color}20`,
                                color: sharpeRating.color
                            }}
                        >
                            {sharpeRating.label}
                        </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: sharpeRating.color }}>
                        {isCalculating ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            sharpeRatio !== null ? sharpeRatio.toFixed(2) : 'N/A'
                        )}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Return per unit of risk
                    </p>
                </div>

                {/* Volatility */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">Volatility</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                        {formatPercentage(volatility)}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Annualized standard deviation
                    </p>
                </div>

                {/* Assumed Annual Return */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">Assumed Annual Return</p>
                    <p className="text-2xl font-bold stat-positive">
                        {formatPercentage(expectedReturn)}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Based on historical market average
                    </p>
                </div>

                {/* Risk/Return Ratio */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">Return/Risk</p>
                    <p className="text-2xl font-bold text-[var(--color-warning)]">
                        {volatility > 0 ? (expectedReturn / volatility).toFixed(2) : 'N/A'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Higher is better
                    </p>
                </div>
            </div>

            {/* Interpretation */}
            <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <p className="text-sm text-[var(--color-text-secondary)]">
                    {sharpeRatio !== null && sharpeRatio >= 1 ? (
                        <span className="stat-positive">✓ Good risk-adjusted returns. Your portfolio is efficiently using risk.</span>
                    ) : sharpeRatio !== null && sharpeRatio >= 0.5 ? (
                        <span className="text-[var(--color-warning)]">⚠ Average performance. Consider optimizing for better returns per unit of risk.</span>
                    ) : sharpeRatio !== null ? (
                        <span className="stat-negative">✗ Below average. Consider reducing volatility or increasing expected returns.</span>
                    ) : (
                        <span>Calculating metrics...</span>
                    )}
                </p>
            </div>
        </div>
    );
}
