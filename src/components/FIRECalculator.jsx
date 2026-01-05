import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { calculateFIREScenarios, getFIREStatus } from '../services/fireCalculator';
import { formatCurrency } from '../services/calculations';

export default function FIRECalculator() {
    const { totalValue } = usePortfolio();

    const [inputs, setInputs] = useState({
        currentAge: 30,
        annualIncome: 80000,
        annualExpenses: 50000,
        currentSavings: totalValue || 50000
    });

    // Update savings when portfolio value changes
    useMemo(() => {
        if (totalValue > 0) {
            setInputs(prev => ({ ...prev, currentSavings: totalValue }));
        }
    }, [totalValue]);

    const results = useMemo(() => {
        return calculateFIREScenarios({
            currentAge: inputs.currentAge,
            currentSavings: inputs.currentSavings,
            annualIncome: inputs.annualIncome,
            annualExpenses: inputs.annualExpenses
        });
    }, [inputs]);

    const regularStatus = getFIREStatus(results.scenarios.regular.years, inputs.currentAge);

    const updateInput = (field, value) => {
        setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
    };

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                FIRE Calculator
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Financial Independence, Retire Early
            </p>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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
                        Annual Income ($)
                    </label>
                    <input
                        type="number"
                        value={inputs.annualIncome}
                        onChange={(e) => updateInput('annualIncome', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        Annual Expenses ($)
                    </label>
                    <input
                        type="number"
                        value={inputs.annualExpenses}
                        onChange={(e) => updateInput('annualExpenses', e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                    />
                </div>
            </div>

            {/* Savings Rate */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span>Savings Rate</span>
                    <span className="font-bold" style={{
                        color: results.savingsRate >= 50 ? 'var(--color-success)' :
                            results.savingsRate >= 30 ? 'var(--color-warning)' : 'var(--color-danger)'
                    }}>
                        {results.savingsRate}%
                    </span>
                </div>
                <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-3">
                    <div
                        className="h-3 rounded-full transition-all"
                        style={{
                            width: `${Math.min(results.savingsRate, 100)}%`,
                            background: results.savingsRate >= 50 ? 'var(--color-success)' :
                                results.savingsRate >= 30 ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}
                    />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Saving {formatCurrency(results.annualSavings)}/year
                </p>
            </div>

            {/* Main Result */}
            <div
                className="p-4 rounded-lg text-center mb-6"
                style={{ background: `${regularStatus.color}15` }}
            >
                <p className="text-sm text-[var(--color-text-secondary)]">{regularStatus.message}</p>
                <p className="text-4xl font-bold my-2" style={{ color: regularStatus.color }}>
                    {results.scenarios.regular.years === 0 ? 'NOW! 🎉' : `${results.scenarios.regular.years} years`}
                </p>
                <p className="text-sm">
                    Retire at age <strong>{results.scenarios.regular.retireAge}</strong>
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    FIRE Number: {formatCurrency(results.scenarios.regular.fireNumber)}
                </p>
            </div>

            {/* Scenario Comparison */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm">FIRE Scenarios:</h3>

                {Object.values(results.scenarios).map((scenario, index) => (
                    <div
                        key={index}
                        className="bg-[var(--color-bg-secondary)] rounded-lg p-3 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{scenario.icon}</span>
                            <div>
                                <p className="font-medium text-sm">{scenario.type}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    {scenario.description}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            {scenario.type === 'Coast FIRE' ? (
                                <p className="font-bold text-[var(--color-primary)]">
                                    {scenario.alreadyCoast ? 'Now!' : `Age ${scenario.coastAge}`}
                                </p>
                            ) : (
                                <>
                                    <p className="font-bold">
                                        {scenario.years === 0 ? 'Now!' : `${scenario.years} yrs`}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Age {scenario.retireAge}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tips */}
            <div className="mt-6 p-3 bg-[var(--color-primary)]/10 rounded-lg text-xs">
                <p className="font-semibold text-[var(--color-primary)] mb-1">💡 FIRE Tips:</p>
                <ul className="space-y-1 text-[var(--color-text-secondary)]">
                    <li>• Aim for 50%+ savings rate for early retirement</li>
                    <li>• Coast FIRE lets you take lower-stress jobs earlier</li>
                    <li>• Consider geographic arbitrage to reduce expenses</li>
                </ul>
            </div>
        </div>
    );
}
