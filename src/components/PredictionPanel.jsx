import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    predictReturns,
    detectAnomalies,
    predictRisk,
    suggestRebalancing
} from '../services/predictionService';
import { formatCurrency } from '../services/calculations';

export default function PredictionPanel() {
    const { holdings, isLoading } = usePortfolio();
    const [forecastDays, setForecastDays] = useState(30);
    const [showDetails, setShowDetails] = useState(false);

    const predictions = useMemo(() => {
        if (!holdings || holdings.length === 0) return null;
        return predictReturns({ holdings, forecastDays });
    }, [holdings, forecastDays]);

    const anomalies = useMemo(() => {
        return detectAnomalies(holdings);
    }, [holdings]);

    const riskPrediction = useMemo(() => {
        return predictRisk(holdings, forecastDays <= 7 ? 'week' : 'month');
    }, [holdings, forecastDays]);

    const rebalanceSuggestions = useMemo(() => {
        return suggestRebalancing(holdings, 'moderate');
    }, [holdings]);

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

    if (!predictions) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    ML Predictions
                </h2>
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">Add holdings to generate predictions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        ML Predictions
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        Statistical models • Not financial advice
                    </p>
                </div>
                <select
                    value={forecastDays}
                    onChange={(e) => setForecastDays(Number(e.target.value))}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm"
                >
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year</option>
                </select>
            </div>

            {/* Prediction Range */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">{forecastDays}-Day Forecast Range</span>
                    <span className="text-sm font-bold" style={{ color: predictions.riskLevel.color }}>
                        {predictions.riskLevel.level} Risk
                    </span>
                </div>

                <div className="relative h-12 bg-gradient-to-r from-[var(--color-danger)]/20 via-[var(--color-warning)]/20 to-[var(--color-success)]/20 rounded-lg overflow-hidden">
                    {/* Markers */}
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                        <div className="text-center">
                            <p className="text-xs text-[var(--color-danger)] font-bold">
                                {predictions.predictions.pessimistic.return.toFixed(1)}%
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">5th %ile</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-[var(--color-primary)] font-bold">
                                {predictions.predictions.expected.return.toFixed(1)}%
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">Expected</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-[var(--color-success)] font-bold">
                                {predictions.predictions.bullish.return.toFixed(1)}%
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">95th %ile</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-[var(--color-danger)]/10 rounded-lg p-2 text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Bear Case</p>
                        <p className="font-bold text-[var(--color-danger)]">
                            {formatCurrency(predictions.predictions.pessimistic.value)}
                        </p>
                    </div>
                    <div className="bg-[var(--color-primary)]/10 rounded-lg p-2 text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Expected</p>
                        <p className="font-bold text-[var(--color-primary)]">
                            {formatCurrency(predictions.predictions.expected.value)}
                        </p>
                    </div>
                    <div className="bg-[var(--color-success)]/10 rounded-lg p-2 text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Bull Case</p>
                        <p className="font-bold text-[var(--color-success)]">
                            {formatCurrency(predictions.predictions.bullish.value)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Anomaly Detection */}
            {anomalies.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>⚠️</span> Anomalies Detected ({anomalies.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {anomalies.map((anomaly, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg text-sm ${anomaly.severity === 'high' ? 'bg-[var(--color-danger)]/10 border-l-4 border-[var(--color-danger)]' :
                                        anomaly.severity === 'medium' ? 'bg-[var(--color-warning)]/10 border-l-4 border-[var(--color-warning)]' :
                                            'bg-[var(--color-primary)]/10 border-l-4 border-[var(--color-primary)]'
                                    }`}
                            >
                                <p className="font-medium">{anomaly.message}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    💡 {anomaly.recommendation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Prediction */}
            {riskPrediction && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between text-sm font-semibold p-2 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                    >
                        <span>📊 Risk Metrics</span>
                        <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showDetails && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 animate-fadeIn">
                            <div className="bg-[var(--color-bg-secondary)] rounded p-2 text-center">
                                <p className="text-xs text-[var(--color-text-secondary)]">VaR (95%)</p>
                                <p className="font-bold text-[var(--color-danger)]">{riskPrediction.var95.percent}%</p>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)] rounded p-2 text-center">
                                <p className="text-xs text-[var(--color-text-secondary)]">CVaR</p>
                                <p className="font-bold text-[var(--color-danger)]">{riskPrediction.cvar.percent}%</p>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)] rounded p-2 text-center">
                                <p className="text-xs text-[var(--color-text-secondary)]">Volatility</p>
                                <p className="font-bold">{riskPrediction.volatility}%</p>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)] rounded p-2 text-center">
                                <p className="text-xs text-[var(--color-text-secondary)]">Beta</p>
                                <p className="font-bold">{riskPrediction.beta}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg text-xs text-[var(--color-text-secondary)]">
                <strong>⚠️ Disclaimer:</strong> Predictions are based on simplified statistical models.
                Past performance does not guarantee future results. This is NOT investment advice.
                Consult a qualified financial advisor before making decisions.
            </div>
        </div>
    );
}
