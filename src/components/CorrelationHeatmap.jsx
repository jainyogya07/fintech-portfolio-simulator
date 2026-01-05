import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    calculateCorrelationMatrix,
    getCorrelationColor,
    getDiversificationRating
} from '../services/correlationService';

export default function CorrelationHeatmap() {
    const { holdings, isLoading } = usePortfolio();
    const [correlationData, setCorrelationData] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);

    const calculateCorrelation = useCallback(async () => {
        if (holdings.length < 2) {
            setCorrelationData(null);
            return;
        }

        setIsCalculating(true);
        setError(null);

        try {
            const result = await calculateCorrelationMatrix(holdings);
            setCorrelationData(result);
        } catch (err) {
            console.error('Error calculating correlation:', err);
            setError(err.message || 'Failed to calculate correlation');
        } finally {
            setIsCalculating(false);
        }
    }, [holdings]);

    useEffect(() => {
        if (holdings.length >= 2) {
            calculateCorrelation();
        }
    }, [holdings.length, calculateCorrelation]);

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

    if (holdings.length < 2) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Correlation Matrix
                </h2>
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="text-[var(--color-text-secondary)]">Add at least 2 stocks</p>
                    <p className="text-sm text-[var(--color-text-secondary)] opacity-75 mt-1">
                        to analyze correlations
                    </p>
                </div>
            </div>
        );
    }

    const diversificationRating = correlationData
        ? getDiversificationRating(correlationData.diversificationScore)
        : null;

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        Correlation Matrix
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        How your holdings move together
                    </p>
                </div>

                {/* Diversification Score */}
                {correlationData && diversificationRating && (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-[var(--color-text-secondary)]">Diversification</p>
                            <p
                                className="text-lg font-bold"
                                style={{ color: diversificationRating.color }}
                            >
                                {correlationData.diversificationScore}%
                            </p>
                        </div>
                        <div
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                                backgroundColor: `${diversificationRating.color}20`,
                                color: diversificationRating.color
                            }}
                        >
                            {diversificationRating.label}
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-[var(--color-danger)]/20 text-[var(--color-danger)] p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Loading */}
            {isCalculating && (
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin w-8 h-8 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-[var(--color-text-secondary)]">Calculating correlations...</span>
                </div>
            )}

            {/* Heatmap */}
            {correlationData && !isCalculating && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="p-2"></th>
                                {correlationData.symbols.map((symbol) => (
                                    <th
                                        key={symbol}
                                        className="p-2 text-sm font-medium text-[var(--color-primary-light)]"
                                    >
                                        {symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {correlationData.matrix.map((row, i) => (
                                <tr key={correlationData.symbols[i]}>
                                    <td className="p-2 text-sm font-medium text-[var(--color-primary-light)]">
                                        {correlationData.symbols[i]}
                                    </td>
                                    {row.map((value, j) => (
                                        <td
                                            key={j}
                                            className="p-2 text-center"
                                        >
                                            <div
                                                className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-sm font-mono font-medium transition-transform hover:scale-110"
                                                style={{
                                                    backgroundColor: getCorrelationColor(value),
                                                    color: 'white',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                                }}
                                                title={`${correlationData.symbols[i]} ↔ ${correlationData.symbols[j]}: ${value.toFixed(2)}`}
                                            >
                                                {i === j ? '1.00' : value.toFixed(2)}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)] mb-2">Correlation Scale:</p>
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ background: 'hsl(120, 70%, 35%)' }}></div>
                        <span className="text-[var(--color-text-secondary)]">-1.0 (inverse)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ background: 'hsl(220, 20%, 55%)' }}></div>
                        <span className="text-[var(--color-text-secondary)]">0 (uncorrelated)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ background: 'hsl(0, 70%, 45%)' }}></div>
                        <span className="text-[var(--color-text-secondary)]">+1.0 (same movement)</span>
                    </div>
                </div>
            </div>

            {/* Interpretation */}
            {correlationData && (
                <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {correlationData.avgCorrelation > 0.7 ? (
                            <span className="text-[var(--color-danger)]">
                                ⚠ High correlation ({correlationData.avgCorrelation.toFixed(2)}) — Your stocks move together. Consider adding uncorrelated assets for better diversification.
                            </span>
                        ) : correlationData.avgCorrelation > 0.4 ? (
                            <span className="text-[var(--color-warning)]">
                                ⚡ Moderate correlation ({correlationData.avgCorrelation.toFixed(2)}) — Some diversification, but room for improvement.
                            </span>
                        ) : (
                            <span className="text-[var(--color-success)]">
                                ✓ Low correlation ({correlationData.avgCorrelation.toFixed(2)}) — Good diversification! Your holdings don't all move together.
                            </span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
