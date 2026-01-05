import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { runBacktest, getAvailableYears, calculateSectorWeights } from '../services/backtestService';
import { getStockSector } from '../config/crashScenarios';
import { formatCurrency } from '../services/calculations';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BacktestPanel() {
    const { holdings, totalValue, isLoading } = usePortfolio();
    const availableYears = useMemo(() => getAvailableYears(), []);

    const [config, setConfig] = useState({
        startYear: 2010,
        endYear: 2024,
        monthlyContribution: 0
    });

    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const runTest = () => {
        if (holdings.length === 0) return;

        setIsRunning(true);

        // Calculate sector weights from holdings
        const holdingsWithSectors = holdings.map(h => ({
            ...h,
            sector: getStockSector(h.symbol)
        }));
        const sectorWeights = calculateSectorWeights(holdingsWithSectors);

        setTimeout(() => {
            const backtestResults = runBacktest({
                initialValue: totalValue || 10000,
                sectorWeights,
                startYear: config.startYear,
                endYear: config.endYear,
                monthlyContribution: config.monthlyContribution
            });

            setResults(backtestResults);
            setIsRunning(false);
        }, 500);
    };

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

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Backtesting Engine
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                How would your portfolio have performed historically?
            </p>

            {/* Configuration */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Start Year
                    </label>
                    <select
                        value={config.startYear}
                        onChange={(e) => setConfig({ ...config, startYear: Number(e.target.value) })}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    >
                        {Array.from({ length: availableYears.max - availableYears.min + 1 }, (_, i) => availableYears.min + i)
                            .filter(y => y < config.endYear)
                            .map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        End Year
                    </label>
                    <select
                        value={config.endYear}
                        onChange={(e) => setConfig({ ...config, endYear: Number(e.target.value) })}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    >
                        {Array.from({ length: availableYears.max - config.startYear }, (_, i) => config.startYear + i + 1)
                            .map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Monthly Add ($)
                    </label>
                    <input
                        type="number"
                        value={config.monthlyContribution}
                        onChange={(e) => setConfig({ ...config, monthlyContribution: Number(e.target.value) })}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                        placeholder="0"
                    />
                </div>
            </div>

            <button
                onClick={runTest}
                disabled={isRunning || holdings.length === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-6"
            >
                {isRunning ? (
                    <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Running Backtest...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Backtest ({config.endYear - config.startYear} years)
                    </>
                )}
            </button>

            {holdings.length === 0 && (
                <p className="text-center text-[var(--color-text-secondary)] py-4">
                    Add holdings to run a backtest
                </p>
            )}

            {/* Results */}
            {results && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Performance Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.years}>
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="portfolioValue"
                                    stroke="var(--color-primary)"
                                    strokeWidth={2}
                                    name="Your Portfolio"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sp500Value"
                                    stroke="var(--color-text-secondary)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="S&P 500"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary */}
                    <div className={`p-4 rounded-lg text-center ${results.beat ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-warning)]/10'
                        }`}>
                        <p className="text-lg font-bold" style={{ color: results.beat ? 'var(--color-success)' : 'var(--color-warning)' }}>
                            {results.beat ? '🎉 Beat the Market!' : '📊 Underperformed Market'}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Your portfolio {results.beat ? 'outperformed' : 'underperformed'} S&P 500 by {Math.abs(Number(results.summary.outperformance))}% annually
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Final Portfolio</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                                {formatCurrency(results.summary.finalPortfolio)}
                            </p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">S&P 500</p>
                            <p className="text-lg font-bold">
                                {formatCurrency(results.summary.finalSP500)}
                            </p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Portfolio CAGR</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                                {results.summary.portfolioCAGR}%
                            </p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Sharpe Ratio</p>
                            <p className="text-lg font-bold">
                                {results.summary.sharpe}
                            </p>
                        </div>
                    </div>

                    {/* Risk Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[var(--color-danger)]/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Max Drawdown</p>
                            <p className="text-lg font-bold text-[var(--color-danger)]">
                                -{results.summary.maxDrawdown}%
                            </p>
                        </div>
                        <div className="bg-[var(--color-warning)]/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Volatility</p>
                            <p className="text-lg font-bold text-[var(--color-warning)]">
                                {results.summary.volatility}%
                            </p>
                        </div>
                        <div className="bg-[var(--color-primary)]/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Beta</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                                {results.summary.beta}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
