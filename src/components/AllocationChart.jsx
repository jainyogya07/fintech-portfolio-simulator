import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { calculateAssetAllocation, formatCurrency, formatPercentage } from '../services/calculations';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass-card p-3 text-sm">
                <p className="font-semibold" style={{ color: data.color }}>{data.symbol}</p>
                <p className="text-[var(--color-text-secondary)]">
                    Value: {formatCurrency(data.value)}
                </p>
                <p className="text-[var(--color-text-secondary)]">
                    Weight: {formatPercentage(data.percentage)}
                </p>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }) => {
    return (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function AllocationChart() {
    const { holdings, isLoading } = usePortfolio();

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <div className="animate-pulse">
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-4"></div>
                    <div className="h-48 bg-[var(--color-bg-secondary)] rounded-full w-48 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (holdings.length === 0) {
        return (
            <div className="glass-card p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Asset Allocation
                </h2>
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                    <p className="text-[var(--color-text-secondary)]">Add stocks to see allocation</p>
                </div>
            </div>
        );
    }

    const allocation = calculateAssetAllocation(holdings);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Asset Allocation
            </h2>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={allocation}
                            dataKey="percentage"
                            nameKey="symbol"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            stroke="transparent"
                        >
                            {allocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Top Holdings List */}
            <div className="mt-4 space-y-2">
                {allocation.slice(0, 5).map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium">{item.symbol}</span>
                        </div>
                        <span className="text-[var(--color-text-secondary)]">
                            {formatPercentage(item.percentage)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
