import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { formatCurrency } from '../services/calculations';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-2 sm:p-3 text-xs sm:text-sm shadow-xl max-w-[200px] sm:max-w-none">
                <p className="font-semibold text-[var(--color-primary-light)] mb-1 sm:mb-2">
                    Year {label}
                </p>
                <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex justify-between gap-2">
                        <span className="text-[var(--color-text-secondary)]">90th Percentile:</span>
                        <span className="font-mono stat-positive">{formatCurrency(payload[4]?.value || 0)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="text-[var(--color-text-secondary)]">75th Percentile:</span>
                        <span className="font-mono">{formatCurrency(payload[3]?.value || 0)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="text-[var(--color-text-secondary)] font-medium">Median (50th):</span>
                        <span className="font-mono font-medium">{formatCurrency(payload[2]?.value || 0)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="text-[var(--color-text-secondary)]">25th Percentile:</span>
                        <span className="font-mono">{formatCurrency(payload[1]?.value || 0)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="text-[var(--color-text-secondary)]">10th Percentile:</span>
                        <span className="font-mono stat-negative">{formatCurrency(payload[0]?.value || 0)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function MonteCarloChart({ data, initialValue }) {
    const [hoveredYear, setHoveredYear] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div className="h-80 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
                <span className="text-3xl mb-3">📈</span>
                <p>Run a simulation to see projections</p>
                <p className="text-xs mt-1 opacity-75">Tap chart to explore different years</p>
            </div>
        );
    }

    // Format Y-axis values
    const formatYAxis = (value) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value}`;
    };

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onMouseMove={(e) => {
                        if (e.activePayload) {
                            setHoveredYear(e.activeLabel);
                        }
                    }}
                    onMouseLeave={() => setHoveredYear(null)}
                >
                    <defs>
                        {/* Gradient for outer band (10-90) */}
                        <linearGradient id="outerBand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                        </linearGradient>
                        {/* Gradient for inner band (25-75) */}
                        <linearGradient id="innerBand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                        tickFormatter={(value) => `Y${value}`}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                        tickFormatter={formatYAxis}
                        domain={['auto', 'auto']}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Reference line at initial value */}
                    <ReferenceLine
                        y={initialValue}
                        stroke="var(--color-text-secondary)"
                        strokeDasharray="4 4"
                        strokeOpacity={0.5}
                    />

                    {/* 10th percentile (bottom of outer band) */}
                    <Area
                        type="monotone"
                        dataKey="p10"
                        stackId="1"
                        stroke="none"
                        fill="transparent"
                    />

                    {/* 10-25 band */}
                    <Area
                        type="monotone"
                        dataKey="p25"
                        stackId="2"
                        stroke="none"
                        fill="url(#outerBand)"
                    />

                    {/* 25-50 band */}
                    <Area
                        type="monotone"
                        dataKey="p50"
                        stackId="3"
                        stroke="none"
                        fill="url(#innerBand)"
                    />

                    {/* 50-75 band */}
                    <Area
                        type="monotone"
                        dataKey="p75"
                        stackId="4"
                        stroke="none"
                        fill="url(#innerBand)"
                    />

                    {/* 75-90 band */}
                    <Area
                        type="monotone"
                        dataKey="p90"
                        stackId="5"
                        stroke="none"
                        fill="url(#outerBand)"
                    />

                    {/* Median line */}
                    <Area
                        type="monotone"
                        dataKey="p50"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fill="none"
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded" style={{ background: 'rgba(139, 92, 246, 0.3)' }}></div>
                    <span>50% likely</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded" style={{ background: 'rgba(99, 102, 241, 0.1)' }}></div>
                    <span>80% possible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5" style={{ background: '#a855f7' }}></div>
                    <span>Median</span>
                </div>
            </div>
            {/* Info hint */}
            <p className="text-center text-[10px] text-[var(--color-text-secondary)]/70 mt-2 sm:hidden">
                💡 Tap chart to see year details
            </p>
        </div>
    );
}
