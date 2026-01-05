import { usePortfolio } from '../context/PortfolioContext';
import { calculatePortfolioVolatility, getRiskLevel, formatPercentage } from '../services/calculations';

export default function RiskMeter() {
    const { holdings, isLoading } = usePortfolio();

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse">
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-[var(--color-bg-secondary)] rounded mb-4"></div>
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const volatility = calculatePortfolioVolatility(holdings);
    const riskInfo = getRiskLevel(volatility);

    // Calculate position on meter (0-100%)
    // Map volatility 0-40% to 0-100% on the meter
    const meterPosition = Math.min(100, Math.max(0, (volatility / 40) * 100));

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risk Level
            </h2>

            {holdings.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-[var(--color-text-secondary)]">Add stocks to see risk analysis</p>
                </div>
            ) : (
                <>
                    {/* Volatility Display */}
                    <div className="text-center mb-6">
                        <p className="text-4xl font-bold" style={{ color: riskInfo.color }}>
                            {formatPercentage(volatility)}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Annualized Volatility</p>
                    </div>

                    {/* Risk Meter Bar */}
                    <div className="relative mb-4">
                        {/* Background gradient bar */}
                        <div
                            className="h-4 rounded-full overflow-hidden"
                            style={{
                                background: 'linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)'
                            }}
                        />

                        {/* Position indicator */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 transition-all duration-500"
                            style={{
                                left: `calc(${meterPosition}% - 10px)`,
                                borderColor: riskInfo.color
                            }}
                        />

                        {/* Labels */}
                        <div className="flex justify-between mt-2 text-xs text-[var(--color-text-secondary)]">
                            <span className="risk-low">Low</span>
                            <span className="risk-medium">Medium</span>
                            <span className="risk-high">High</span>
                        </div>
                    </div>

                    {/* Risk Label */}
                    <div
                        className="text-center py-3 rounded-lg font-medium"
                        style={{
                            backgroundColor: `${riskInfo.color}20`,
                            color: riskInfo.color
                        }}
                    >
                        {riskInfo.label}
                    </div>

                    {/* Explanation */}
                    <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {riskInfo.level === 'low' && (
                                <>Your portfolio has <strong className="risk-low">low volatility</strong>. It's relatively stable but may have limited growth potential.</>
                            )}
                            {riskInfo.level === 'medium' && (
                                <>Your portfolio has <strong className="risk-medium">moderate volatility</strong>. This is typical for a balanced portfolio.</>
                            )}
                            {riskInfo.level === 'high' && (
                                <>Your portfolio has <strong className="risk-high">high volatility</strong>. Consider diversifying to reduce risk.</>
                            )}
                        </p>
                    </div>

                    {/* Individual Stock Volatilities */}
                    <div className="mt-4">
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Individual Stock Volatility
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {holdings
                                .sort((a, b) => (b.volatility || 0) - (a.volatility || 0))
                                .map((holding) => {
                                    const stockRisk = getRiskLevel(holding.volatility || 0);
                                    return (
                                        <div key={holding.id} className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--color-primary-light)]">{holding.symbol}</span>
                                            <span style={{ color: stockRisk.color }}>
                                                {formatPercentage(holding.volatility || 0)}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
