import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { CRASH_SCENARIOS, getScenariosList } from '../config/crashScenarios';
import {
    simulateMarketCrash,
    calculateRecoveryTime,
    getEmotionalImpact
} from '../services/crashSimulator';
import { formatCurrency, formatPercentage } from '../services/calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CrashSimulator() {
    const { holdings, isLoading } = usePortfolio();
    const [selectedScenario, setSelectedScenario] = useState('COVID_2020');
    const [monthlyContribution, setMonthlyContribution] = useState(0);
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const scenarios = useMemo(() => getScenariosList(), []);

    const runSimulation = () => {
        const scenario = CRASH_SCENARIOS[selectedScenario];
        const crashResults = simulateMarketCrash(holdings, scenario);

        if (crashResults) {
            const recovery = calculateRecoveryTime(
                crashResults.original.totalValue,
                crashResults.afterCrash.totalValue,
                monthlyContribution
            );

            const emotional = getEmotionalImpact(
                crashResults.losses.total,
                crashResults.losses.percentage
            );

            setResults({ ...crashResults, recovery, emotional });
            setShowResults(true);
        }
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

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    Market Crash Simulator
                </h2>
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">Add stocks to simulate crash scenarios</p>
                </div>
            </div>
        );
    }

    const currentScenario = CRASH_SCENARIOS[selectedScenario];

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Market Crash Simulator
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                See how your portfolio would survive historical market crashes
            </p>

            {/* Scenario Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Choose a Historical Crash:
                    </label>
                    <select
                        value={selectedScenario}
                        onChange={(e) => {
                            setSelectedScenario(e.target.value);
                            setShowResults(false);
                        }}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-3"
                    >
                        {scenarios.map(scenario => (
                            <option key={scenario.id} value={scenario.id}>
                                {scenario.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                        {currentScenario.description}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Monthly Contribution During Recovery:
                    </label>
                    <input
                        type="number"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-3"
                    />
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                        Simulate continuing to invest during the downturn
                    </p>
                </div>
            </div>

            {/* Run Button */}
            <button
                onClick={runSimulation}
                className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                    background: `linear-gradient(135deg, ${currentScenario.color}, ${currentScenario.color}cc)`,
                    color: 'white'
                }}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Simulate {currentScenario.name}
            </button>

            {/* Results */}
            {showResults && results && (
                <div className="mt-8 space-y-6 animate-fadeIn">
                    {/* Impact Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                            <p className="text-sm text-[var(--color-text-secondary)]">Original Value</p>
                            <p className="text-2xl font-bold">{formatCurrency(results.original.totalValue)}</p>
                        </div>
                        <div className="rounded-lg p-4" style={{ background: `${currentScenario.color}20` }}>
                            <p className="text-sm text-[var(--color-text-secondary)]">After Crash</p>
                            <p className="text-2xl font-bold" style={{ color: currentScenario.color }}>
                                {formatCurrency(results.afterCrash.totalValue)}
                            </p>
                        </div>
                    </div>

                    {/* Total Loss */}
                    <div
                        className="p-6 rounded-lg border-l-4"
                        style={{
                            background: `${currentScenario.color}10`,
                            borderColor: currentScenario.color
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-text-secondary)]">Total Loss</p>
                                <p className="text-3xl font-bold" style={{ color: currentScenario.color }}>
                                    -{formatCurrency(results.losses.total)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-[var(--color-text-secondary)]">Percentage</p>
                                <p className="text-3xl font-bold" style={{ color: currentScenario.color }}>
                                    -{results.losses.percentage.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Timeline */}
                    <div className="bg-[var(--color-primary)]/10 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recovery Timeline
                        </h3>
                        <p className="text-lg">
                            Estimated recovery: <strong>{results.recovery.years} years</strong>
                            {results.recovery.withContributions && (
                                <span className="text-sm text-[var(--color-text-secondary)] ml-2">
                                    (with ${monthlyContribution}/mo contributions)
                                </span>
                            )}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Historical recovery for {results.scenario.name}: {results.scenario.historicalRecovery}
                        </p>
                    </div>

                    {/* Asset Impact Chart */}
                    <div>
                        <h3 className="font-semibold mb-3">Impact by Asset</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results.afterCrash.byAsset} layout="vertical">
                                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                                    <YAxis type="category" dataKey="symbol" width={60} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            background: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="originalValue" fill="var(--color-text-secondary)" opacity={0.3} name="Before" />
                                    <Bar dataKey="newValue" name="After">
                                        {results.afterCrash.byAsset.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={entry.lossPercent >= 0 ? 'var(--color-success)' : currentScenario.color}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Worst/Best Performers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--color-danger)]/10 rounded-lg p-4">
                            <h4 className="font-semibold text-[var(--color-danger)] mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                Worst Hit
                            </h4>
                            {results.worstAssets.map(asset => (
                                <div key={asset.symbol} className="flex justify-between text-sm mb-1">
                                    <span>{asset.symbol}</span>
                                    <span className="font-semibold text-[var(--color-danger)]">
                                        {asset.lossPercent.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[var(--color-success)]/10 rounded-lg p-4">
                            <h4 className="font-semibold text-[var(--color-success)] mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                Best Performers
                            </h4>
                            {results.bestAssets.map(asset => (
                                <div key={asset.symbol} className="flex justify-between text-sm mb-1">
                                    <span>{asset.symbol}</span>
                                    <span className={`font-semibold ${asset.lossPercent >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                                        {asset.lossPercent >= 0 ? '+' : ''}{asset.lossPercent.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emotional Reality Check */}
                    <div
                        className="p-4 rounded-lg border-l-4"
                        style={{
                            background: `${results.emotional.color}10`,
                            borderColor: results.emotional.color
                        }}
                    >
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            💭 Emotional Reality Check
                        </h3>
                        <p className="text-sm mb-3">{results.emotional.message}</p>
                        <p className="text-sm">
                            If you lost <strong>{formatCurrency(results.losses.total)}</strong> tomorrow, would you:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-[var(--color-success)]">✓</span>
                                Stay invested and ride it out?
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-[var(--color-success)]">✓</span>
                                Keep contributing during the downturn?
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-[var(--color-danger)]">✗</span>
                                Panic sell at the bottom?
                            </li>
                        </ul>
                        <p className="mt-3 text-sm font-semibold" style={{ color: results.emotional.color }}>
                            If you'd panic sell, your portfolio might be too aggressive.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
