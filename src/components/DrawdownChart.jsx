import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    calculatePortfolioDrawdown,
    getDrawdownSeverity
} from '../services/drawdownService';
import { formatCurrency, formatPercentage } from '../services/calculations';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 text-sm">
                <p className="text-[var(--color-text-secondary)]">Day {label}</p>
                <p className="font-mono font-medium">
                    Value: {formatCurrency(payload[0]?.value || 0)}
                </p>
                <p className="font-mono text-[var(--color-danger)]">
                    Drawdown: -{(payload[1]?.value || 0).toFixed(2)}%
                </p>
            </div>
        );
    }
    return null;
};

export default function DrawdownChart() {
    const { holdings, isLoading } = usePortfolio();
    const [drawdownData, setDrawdownData] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);

    const calculateDrawdown = useCallback(async () => {
        if (holdings.length === 0) {
            setDrawdownData(null);
            return;
        }

        setIsCalculating(true);
        setError(null);

        try {
            const result = await calculatePortfolioDrawdown(holdings);

            if (result.error) {
                setError(result.error);
            } else {
                setDrawdownData(result);
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to calculate drawdown');
        } finally {
            setIsCalculating(false);
        }
    }, [holdings]);

    useEffect(() => {
        calculateDrawdown();
    }, [holdings.length]); // Recalculate when holdings change

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
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    Historical Drawdown
                </h2>
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <p className="text-[var(--color-text-secondary)]">Add stocks to see drawdown</p>
                </div>
            </div>
        );
    }

    const severity = drawdownData ? getDrawdownSeverity(drawdownData.maxDrawdown) : null;

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                        Historical Drawdown
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Maximum decline from peak (1 year)
                    </p>
                </div>

                {/* Max Drawdown Badge */}
                {drawdownData && severity && (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-[var(--color-text-secondary)]">Max Drawdown</p>
                            <p className="text-lg font-bold" style={{ color: severity.color }}>
                                -{drawdownData.maxDrawdown}%
                            </p>
                        </div>
                        <div
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                                backgroundColor: `${severity.color}20`,
                                color: severity.color
                            }}
                        >
                            {severity.label}
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
                    <span className="ml-3 text-[var(--color-text-secondary)]">Analyzing historical data...</span>
                </div>
            )}

            {/* Chart */}
            {drawdownData && !isCalculating && drawdownData.chartData.length > 0 && (
                <>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={drawdownData.chartData}>
                                <defs>
                                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                                    tickFormatter={(value) => {
                                        if (value === 0) return '1Y ago';
                                        if (value === Math.floor(drawdownData.chartData.length / 2)) return '6M';
                                        if (value === drawdownData.chartData.length - 1) return 'Today';
                                        return '';
                                    }}
                                />

                                <YAxis
                                    yAxisId="value"
                                    orientation="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                                />

                                <YAxis
                                    yAxisId="drawdown"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                                    tickFormatter={(v) => `-${v.toFixed(0)}%`}
                                    domain={[0, 'auto']}
                                />

                                <Tooltip content={<CustomTooltip />} />

                                {/* Portfolio Value */}
                                <Area
                                    yAxisId="value"
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#valueGradient)"
                                />

                                {/* Drawdown */}
                                <Area
                                    yAxisId="drawdown"
                                    type="monotone"
                                    dataKey="drawdown"
                                    stroke="#ef4444"
                                    strokeWidth={1}
                                    fill="url(#drawdownGradient)"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Max Drawdown</p>
                            <p className="text-lg font-bold text-[var(--color-danger)]">
                                -{drawdownData.maxDrawdown}%
                            </p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Current Drawdown</p>
                            <p className="text-lg font-bold" style={{
                                color: drawdownData.currentDrawdown > 5
                                    ? 'var(--color-danger)'
                                    : 'var(--color-success)'
                            }}>
                                {drawdownData.currentDrawdown > 0 ? '-' : ''}{drawdownData.currentDrawdown}%
                            </p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Recovery Periods</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                                {drawdownData.recoveryPeriods?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Interpretation */}
                    <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {drawdownData.maxDrawdown >= 20 ? (
                                <span className="text-[var(--color-danger)]">
                                    ⚠ Significant historical drawdown. Your portfolio experienced major volatility.
                                </span>
                            ) : drawdownData.maxDrawdown >= 10 ? (
                                <span className="text-[var(--color-warning)]">
                                    ⚡ Moderate drawdown history. Consider your risk tolerance during market corrections.
                                </span>
                            ) : (
                                <span className="text-[var(--color-success)]">
                                    ✓ Low historical drawdown. Your portfolio has been relatively stable.
                                </span>
                            )}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
