import { useState, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { calculatePortfolioValue, calculatePortfolioVolatility, formatCurrency, formatPercentage } from '../services/calculations';
import { runMonteCarloSimulation, formatSimulationResults } from '../services/monteCarloService';
import MonteCarloChart from './MonteCarloChart';

export default function MonteCarloSimulator() {
    const { holdings, isLoading } = usePortfolio();
    const [years, setYears] = useState(10);
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const portfolioValue = calculatePortfolioValue(holdings);
    const volatility = calculatePortfolioVolatility(holdings);

    const runSimulation = useCallback(async () => {
        if (portfolioValue <= 0) {
            setError('Add stocks to your portfolio first');
            return;
        }

        setIsSimulating(true);
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            const simResult = await runMonteCarloSimulation({
                portfolioValue,
                volatility: volatility || 20, // Default 20% if not calculated
                years,
                numSimulations: 10000,
                expectedReturn: 0.07,
                onProgress: setProgress
            });

            const formatted = formatSimulationResults(simResult);
            setResult({ raw: simResult, formatted });
        } catch (err) {
            console.error('Simulation error:', err);
            setError(err.message || 'Simulation failed');
        } finally {
            setIsSimulating(false);
        }
    }, [portfolioValue, volatility, years]);

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse">
                    <div className="h-6 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-[var(--color-bg-secondary)] rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Monte Carlo Simulation
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        10,000 simulated futures based on historical volatility
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label htmlFor="years" className="text-sm text-[var(--color-text-secondary)]">
                            Years:
                        </label>
                        <select
                            id="years"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
                            disabled={isSimulating}
                        >
                            <option value={1}>1</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </div>

                    <button
                        onClick={runSimulation}
                        disabled={isSimulating || holdings.length === 0}
                        className="btn-primary flex items-center gap-2"
                    >
                        {isSimulating ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {Math.round(progress * 100)}%
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Run Simulation
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-[var(--color-danger)]/20 text-[var(--color-danger)] p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* No holdings message */}
            {holdings.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-[var(--color-text-secondary)]">Add stocks to run simulations</p>
                </div>
            )}

            {/* Chart */}
            {holdings.length > 0 && (
                <MonteCarloChart
                    data={result?.raw?.chartData || null}
                    initialValue={portfolioValue}
                />
            )}

            {/* Results Summary */}
            {result && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Expected Outcome */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Expected Value ({years}yr)</p>
                        <p className="ui-display text-xl sm:text-2xl">
                            {formatCurrency(result.formatted.summary.expectedValue)}
                        </p>
                        <p className={`text-sm mt-1 ${result.formatted.summary.totalReturn >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                            {formatPercentage(result.formatted.summary.totalReturn, true)} total return
                        </p>
                    </div>

                    {/* Best Case */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Best Case (90th)</p>
                        <p className="text-xl font-semibold stat-positive">
                            {formatCurrency(result.raw.chartData[result.raw.chartData.length - 1].p90)}
                        </p>
                    </div>

                    {/* Worst Case */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Worst Case (10th)</p>
                        <p className="text-xl font-semibold stat-negative">
                            {formatCurrency(result.raw.chartData[result.raw.chartData.length - 1].p10)}
                        </p>
                    </div>

                    {/* Probability Insights */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Chance of Doubling</p>
                        <p className="text-xl font-semibold">
                            {result.formatted.probabilities.find(p => p.label === 'Double money')?.probability || 0}%
                        </p>
                    </div>
                </div>
            )}

            {/* Probability Table */}
            {result && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                        Probability of Outcomes
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {result.formatted.probabilities.map((p) => (
                            <div
                                key={p.label}
                                className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center"
                            >
                                <p className="text-lg font-semibold">{p.probability}%</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{p.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
