import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { analyzePortfolio, getOptimizationRating } from '../services/optimizationService';

export default function OptimizationPanel() {
    const { holdings, isLoading } = usePortfolio();

    const analysis = useMemo(() => {
        return analyzePortfolio(holdings);
    }, [holdings]);

    const rating = getOptimizationRating(analysis.score);

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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Portfolio Insights
                </h2>
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">Add stocks to see optimization suggestions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Portfolio Insights
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Suggestions to improve your portfolio
                    </p>
                </div>

                {/* Score Badge */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-[var(--color-text-secondary)]">Health Score</p>
                        <p className="text-lg font-bold" style={{ color: rating.color }}>
                            {analysis.score}/100
                        </p>
                    </div>
                    <div
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                            backgroundColor: `${rating.color}20`,
                            color: rating.color
                        }}
                    >
                        {rating.label}
                    </div>
                </div>
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length === 0 ? (
                <div className="text-center py-8 bg-[var(--color-success)]/10 rounded-lg">
                    <span className="text-4xl mb-2 block">✨</span>
                    <p className="text-[var(--color-success)] font-semibold">Looking Good!</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        No major issues detected with your portfolio
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${suggestion.priority === 'high'
                                    ? 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]'
                                    : suggestion.priority === 'medium'
                                        ? 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]'
                                        : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{suggestion.icon}</span>
                                <div className="flex-1">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {suggestion.title}
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded"
                                            style={{
                                                backgroundColor: suggestion.priority === 'high'
                                                    ? 'var(--color-danger)'
                                                    : suggestion.priority === 'medium'
                                                        ? 'var(--color-warning)'
                                                        : 'var(--color-primary)',
                                                color: 'white'
                                            }}
                                        >
                                            {suggestion.priority}
                                        </span>
                                    </h4>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                        {suggestion.description}
                                    </p>
                                    <p className="text-sm font-medium mt-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        {suggestion.action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
