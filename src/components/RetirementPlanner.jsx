import { useState, useMemo, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    calculateRetirement,
    simulateRetirementOutcomes,
    getRetirementRating
} from '../services/retirementCalculator';
import { calculatePortfolioVolatility, formatCurrency } from '../services/calculations';

export default function RetirementPlanner() {
    const { holdings } = usePortfolio();

    const [inputs, setInputs] = useState({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        desiredAnnualIncome: 60000,
        lifeExpectancy: 90
    });

    const [showMonteCarlo, setShowMonteCarlo] = useState(false);
    const [monteCarloResults, setMonteCarloResults] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Get portfolio metrics
    const portfolioMetrics = useMemo(() => {
        const volatility = calculatePortfolioVolatility(holdings);
        return {
            expectedReturn: 0.07,
            volatility: volatility / 100 || 0.15
        };
    }, [holdings]);

    // Calculate retirement projections
    const results = useMemo(() => {
        return calculateRetirement({
            ...inputs,
            expectedReturn: portfolioMetrics.expectedReturn
        });
    }, [inputs, portfolioMetrics]);

    // Run Monte Carlo
    const runMonteCarlo = useCallback(async () => {
        setIsSimulating(true);
        setShowMonteCarlo(true);

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const mcResults = simulateRetirementOutcomes({
                currentSavings: inputs.currentSavings,
                monthlyContribution: inputs.monthlyContribution,
                yearsUntilRetirement: inputs.retirementAge - inputs.currentAge,
                yearsInRetirement: inputs.lifeExpectancy - inputs.retirementAge,
                portfolioReturn: portfolioMetrics.expectedReturn,
                portfolioVolatility: portfolioMetrics.volatility,
                annualWithdrawal: inputs.desiredAnnualIncome
            });

            setMonteCarloResults(mcResults);
            setIsSimulating(false);
        }, 100);
    }, [inputs, portfolioMetrics]);

    const updateInput = (field, value) => {
        setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
        setMonteCarloResults(null);
    };

    const rating = monteCarloResults ? getRetirementRating(monteCarloResults.successRate) : null;

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Retirement Planner
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Will you have enough to retire comfortably?
            </p>

            {/* Input Form */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Current Age
                    </label>
                    <input
                        type="number"
                        value={inputs.currentAge}
                        onChange={(e) => updateInput('currentAge', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Retirement Age
                    </label>
                    <input
                        type="number"
                        value={inputs.retirementAge}
                        onChange={(e) => updateInput('retirementAge', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Life Expectancy
                    </label>
                    <input
                        type="number"
                        value={inputs.lifeExpectancy}
                        onChange={(e) => updateInput('lifeExpectancy', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Current Savings ($)
                    </label>
                    <input
                        type="number"
                        value={inputs.currentSavings}
                        onChange={(e) => updateInput('currentSavings', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Monthly Contribution ($)
                    </label>
                    <input
                        type="number"
                        value={inputs.monthlyContribution}
                        onChange={(e) => updateInput('monthlyContribution', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Desired Annual Income ($)
                    </label>
                    <input
                        type="number"
                        value={inputs.desiredAnnualIncome}
                        onChange={(e) => updateInput('desiredAnnualIncome', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>
            </div>

            {/* Results Summary */}
            <div className={`p-6 rounded-lg border-2 mb-6 ${results.isOnTrack
                ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]'
                : 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]'
                }`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        {results.isOnTrack ? (
                            <>
                                <span className="text-[var(--color-success)]">✓</span>
                                On Track!
                            </>
                        ) : (
                            <>
                                <span className="text-[var(--color-danger)]">⚠</span>
                                Not On Track
                            </>
                        )}
                    </h3>
                    <div className="text-right">
                        <p className="text-xs text-[var(--color-text-secondary)]">Years Until Retirement</p>
                        <p className="text-2xl font-bold">{results.yearsUntilRetirement}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="min-w-0">
                        <p className="text-xs text-[var(--color-text-secondary)]">Projected at Retirement</p>
                        <p className="text-lg sm:text-2xl font-bold text-[var(--color-primary)] truncate">
                            {formatCurrency(results.savingsAtRetirement)}
                        </p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-[var(--color-text-secondary)]">Required Amount</p>
                        <p className="text-lg sm:text-2xl font-bold truncate">
                            {formatCurrency(results.requiredSavings)}
                        </p>
                    </div>
                </div>

                {!results.isOnTrack && (
                    <div className="bg-white/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-[var(--color-danger)] mb-2">
                            Shortfall: {formatCurrency(results.shortfall)}
                        </p>
                        <p className="text-sm">
                            Save an additional <strong>${results.additionalMonthlyNeeded}/month</strong> to get on track
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            Or increase total to <strong>${results.requiredMonthlyContribution}/month</strong>
                        </p>
                    </div>
                )}

                {results.isOnTrack && results.surplus > 0 && (
                    <div className="bg-white/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-[var(--color-success)]">
                            🎉 Surplus: {formatCurrency(results.surplus)}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            You may be able to retire earlier or with more income!
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[var(--color-text-secondary)]">Projected Monthly Income</p>
                        <p className="font-semibold">{formatCurrency(results.projectedMonthlyIncome)}</p>
                    </div>
                    <div>
                        <p className="text-[var(--color-text-secondary)]">Income Replacement</p>
                        <p className="font-semibold">{results.replacementRatio}%</p>
                    </div>
                </div>
            </div>

            {/* Monte Carlo Button */}
            <button
                onClick={runMonteCarlo}
                disabled={isSimulating}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-6"
            >
                {isSimulating ? (
                    <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Simulating...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Run Monte Carlo Simulation (5,000 scenarios)
                    </>
                )}
            </button>

            {/* Monte Carlo Results */}
            {showMonteCarlo && monteCarloResults && (
                <div className="animate-fadeIn space-y-4">
                    <div
                        className="p-4 rounded-lg text-center"
                        style={{ background: `${rating.color}15` }}
                    >
                        <p className="text-4xl mb-2">{rating.emoji}</p>
                        <h3 className="text-2xl font-bold" style={{ color: rating.color }}>
                            {monteCarloResults.successRate}% Success Rate
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Based on {monteCarloResults.simulations.toLocaleString()} simulated futures
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[var(--color-success)]/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Best Case (90th)</p>
                            <p className="text-lg font-bold text-[var(--color-success)]">
                                ${Math.round(monteCarloResults.percentile90 / 1000)}K
                            </p>
                        </div>
                        <div className="bg-[var(--color-primary)]/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Median</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                                ${Math.round(monteCarloResults.medianRetirementBalance / 1000)}K
                            </p>
                        </div>
                        <div className="bg-[var(--color-danger)]/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)]">Worst Case (10th)</p>
                            <p className="text-lg font-bold text-[var(--color-danger)]">
                                ${Math.round(monteCarloResults.percentile10 / 1000)}K
                            </p>
                        </div>
                    </div>

                    {monteCarloResults.successRate < 75 && (
                        <div className="p-3 bg-[var(--color-warning)]/10 border-l-4 border-[var(--color-warning)] rounded text-sm">
                            <strong>⚠ Warning:</strong> Your success rate is below 75%.
                            Consider increasing contributions or delaying retirement.
                        </div>
                    )}

                    {monteCarloResults.failureRate > 0 && (
                        <p className="text-xs text-[var(--color-text-secondary)] text-center">
                            If money runs out, it typically happens after {monteCarloResults.averageYearsIfFailed} years of retirement
                        </p>
                    )}
                </div>
            )}

            {/* Assumptions */}
            <div className="mt-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg text-xs text-[var(--color-text-secondary)]">
                <h4 className="font-semibold mb-2">Assumptions:</h4>
                <ul className="space-y-1">
                    <li>• Expected return: {results.assumptions.expectedReturn}% annually</li>
                    <li>• Inflation: {results.assumptions.inflationRate}% annually</li>
                    <li>• Withdrawal rate: {results.assumptions.withdrawalRate}% (safe withdrawal rule)</li>
                    <li>• No Social Security included (add separately)</li>
                </ul>
            </div>
        </div>
    );
}
