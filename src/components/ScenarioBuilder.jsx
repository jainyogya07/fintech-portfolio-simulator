import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../services/calculations';

// Preset scenario templates
const SCENARIO_TEMPLATES = {
    recession: {
        name: '📉 Mild Recession',
        marketChange: -15,
        inflationChange: 1,
        interestRateChange: -0.5
    },
    crash: {
        name: '💥 Market Crash',
        marketChange: -35,
        inflationChange: -1,
        interestRateChange: -1.5
    },
    boom: {
        name: '🚀 Bull Market',
        marketChange: 25,
        inflationChange: 0.5,
        interestRateChange: 0.5
    },
    stagflation: {
        name: '🔥 Stagflation',
        marketChange: -10,
        inflationChange: 5,
        interestRateChange: 2
    },
    housing_crash: {
        name: '🏠 Housing Crisis',
        marketChange: -25,
        inflationChange: 0,
        interestRateChange: -2
    }
};

// Sector sensitivity to market/economic changes
const SECTOR_SENSITIVITY = {
    tech: { market: 1.3, interest: -0.5, inflation: -0.3 },
    finance: { market: 1.2, interest: 0.8, inflation: 0.1 },
    healthcare: { market: 0.7, interest: -0.2, inflation: 0.2 },
    energy: { market: 1.1, interest: 0.1, inflation: 0.5 },
    consumer: { market: 0.9, interest: -0.3, inflation: -0.2 },
    utilities: { market: 0.5, interest: -0.4, inflation: 0.3 },
    realestate: { market: 0.8, interest: -0.6, inflation: 0.2 },
    industrial: { market: 1.1, interest: 0.1, inflation: 0.0 },
    market: { market: 1.0, interest: 0.0, inflation: 0.0 }
};

export default function ScenarioBuilder() {
    const { holdings, totalValue, isLoading } = usePortfolio();

    const [scenario, setScenario] = useState({
        name: 'Custom Scenario',
        marketChange: 0,
        inflationChange: 0,
        interestRateChange: 0,
        duration: 12 // months
    });

    const [results, setResults] = useState(null);

    const applyTemplate = (templateKey) => {
        const template = SCENARIO_TEMPLATES[templateKey];
        setScenario({
            ...scenario,
            ...template
        });
        setResults(null);
    };

    const runScenario = () => {
        if (holdings.length === 0) return;

        // Calculate total value locally to avoid NaN
        const currentPortfolioValue = holdings.reduce((sum, h) => sum + (h.currentPrice * h.shares), 0);
        if (currentPortfolioValue === 0) return;

        // Calculate impact on each holding
        const impactedHoldings = holdings.map(h => {
            const sector = getSector(h.symbol);
            const sensitivity = SECTOR_SENSITIVITY[sector] || SECTOR_SENSITIVITY.market;

            // Calculate total impact based on sensitivities
            const marketImpact = scenario.marketChange * sensitivity.market;
            const interestImpact = scenario.interestRateChange * sensitivity.interest * 5;
            const inflationImpact = scenario.inflationChange * sensitivity.inflation * 3;

            const totalImpact = marketImpact + interestImpact + inflationImpact;
            const impactMultiplier = 1 + (totalImpact / 100);

            const currentValue = h.currentPrice * h.shares;
            const projectedValue = currentValue * impactMultiplier;

            return {
                symbol: h.symbol,
                sector,
                currentValue,
                projectedValue,
                change: projectedValue - currentValue,
                changePercent: (impactMultiplier - 1) * 100
            };
        });

        const projectedTotal = impactedHoldings.reduce((sum, h) => sum + h.projectedValue, 0);

        setResults({
            holdings: impactedHoldings,
            originalTotal: currentPortfolioValue,
            projectedTotal,
            totalChange: projectedTotal - currentPortfolioValue,
            totalChangePercent: ((projectedTotal - currentPortfolioValue) / currentPortfolioValue) * 100
        });
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
                <span className="text-2xl">🔧</span>
                Custom Scenario Builder
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Create "what if" scenarios to stress test your portfolio
            </p>

            {/* Templates */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Quick Templates:</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(SCENARIO_TEMPLATES).map(([key, template]) => (
                        <button
                            key={key}
                            onClick={() => applyTemplate(key)}
                            className="text-xs px-3 py-1.5 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 mb-6">
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium">Market Change</label>
                        <span className={`font-bold ${scenario.marketChange >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                            {scenario.marketChange >= 0 ? '+' : ''}{scenario.marketChange}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-50"
                        max="50"
                        value={scenario.marketChange}
                        onChange={(e) => setScenario({ ...scenario, marketChange: Number(e.target.value) })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                        <span>-50% (Crash)</span>
                        <span>+50% (Boom)</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium">Inflation Change</label>
                        <span className={`font-bold ${scenario.inflationChange <= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                            {scenario.inflationChange >= 0 ? '+' : ''}{scenario.inflationChange}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-3"
                        max="10"
                        step="0.5"
                        value={scenario.inflationChange}
                        onChange={(e) => setScenario({ ...scenario, inflationChange: Number(e.target.value) })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                        <span>-3% (Deflation)</span>
                        <span>+10% (High)</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium">Interest Rate Change</label>
                        <span className="font-bold">
                            {scenario.interestRateChange >= 0 ? '+' : ''}{scenario.interestRateChange}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-3"
                        max="5"
                        step="0.25"
                        value={scenario.interestRateChange}
                        onChange={(e) => setScenario({ ...scenario, interestRateChange: Number(e.target.value) })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                        <span>-3% (Cuts)</span>
                        <span>+5% (Hikes)</span>
                    </div>
                </div>
            </div>

            <button
                onClick={runScenario}
                disabled={holdings.length === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Run Scenario Analysis
            </button>

            {holdings.length === 0 && (
                <p className="text-center text-[var(--color-text-secondary)] text-sm">
                    Add holdings to run scenario analysis
                </p>
            )}

            {/* Results */}
            {results && (
                <div className="space-y-4 animate-fadeIn">
                    {/* Summary */}
                    <div className={`p-4 rounded-lg text-center ${results.totalChange >= 0 ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-danger)]/10'
                        }`}>
                        <p className="text-sm text-[var(--color-text-secondary)]">Projected Portfolio Value</p>
                        <p className="text-3xl font-bold" style={{
                            color: results.totalChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                            {formatCurrency(results.projectedTotal)}
                        </p>
                        <p className="text-sm font-medium" style={{
                            color: results.totalChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                            {results.totalChange >= 0 ? '+' : ''}{formatCurrency(results.totalChange)}
                            ({results.totalChangePercent >= 0 ? '+' : ''}{results.totalChangePercent.toFixed(1)}%)
                        </p>
                    </div>

                    {/* Per-holding impact */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Impact by Holding:</h3>
                        {results.holdings.map((h, index) => (
                            <div key={index} className="flex items-center justify-between bg-[var(--color-bg-secondary)] rounded-lg p-3">
                                <div>
                                    <span className="font-bold">{h.symbol}</span>
                                    <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                                        {h.sector}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium" style={{
                                        color: h.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {h.changePercent >= 0 ? '+' : ''}{h.changePercent.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {formatCurrency(h.currentValue)} → {formatCurrency(h.projectedValue)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper to get sector (same logic as crashScenarios)
function getSector(symbol) {
    const STOCK_SECTORS = {
        AAPL: 'tech', MSFT: 'tech', GOOGL: 'tech', GOOG: 'tech', META: 'tech', AMZN: 'tech',
        NVDA: 'tech', AMD: 'tech', INTC: 'tech', TSLA: 'tech', NFLX: 'tech', CRM: 'tech',
        JPM: 'finance', BAC: 'finance', WFC: 'finance', GS: 'finance', MS: 'finance', C: 'finance',
        JNJ: 'healthcare', PFE: 'healthcare', UNH: 'healthcare', MRK: 'healthcare', ABBV: 'healthcare',
        XOM: 'energy', CVX: 'energy', COP: 'energy',
        PG: 'consumer', KO: 'consumer', PEP: 'consumer', WMT: 'consumer', HD: 'consumer', MCD: 'consumer',
        NEE: 'utilities', DUK: 'utilities', SO: 'utilities',
        CAT: 'industrial', BA: 'industrial', GE: 'industrial', HON: 'industrial'
    };
    return STOCK_SECTORS[symbol?.toUpperCase()] || 'market';
}
