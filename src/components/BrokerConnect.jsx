import { useState, useEffect } from 'react';
import {
    BROKERS,
    getConnectedBrokers,
    connectBroker,
    disconnectBroker,
    fetchBrokerPortfolio
} from '../services/brokerService';
import { formatCurrency } from '../services/calculations';

export default function BrokerConnect() {
    const [connectedBrokers, setConnectedBrokers] = useState([]);
    const [connecting, setConnecting] = useState(null);
    const [portfolios, setPortfolios] = useState({});
    const [expandedBroker, setExpandedBroker] = useState(null);

    useEffect(() => {
        setConnectedBrokers(getConnectedBrokers());
    }, []);

    const handleConnect = async (brokerId) => {
        setConnecting(brokerId);
        try {
            await connectBroker(brokerId);
            setConnectedBrokers(getConnectedBrokers());
            // Fetch portfolio data
            const data = await fetchBrokerPortfolio(brokerId);
            setPortfolios(prev => ({ ...prev, [brokerId]: data }));
        } finally {
            setConnecting(null);
        }
    };

    const handleDisconnect = (brokerId) => {
        disconnectBroker(brokerId);
        setConnectedBrokers(getConnectedBrokers());
        setPortfolios(prev => {
            const updated = { ...prev };
            delete updated[brokerId];
            return updated;
        });
    };

    const toggleExpand = async (brokerId) => {
        if (expandedBroker === brokerId) {
            setExpandedBroker(null);
        } else {
            setExpandedBroker(brokerId);
            if (!portfolios[brokerId]) {
                const data = await fetchBrokerPortfolio(brokerId);
                setPortfolios(prev => ({ ...prev, [brokerId]: data }));
            }
        }
    };

    // Calculate totals
    const totalValue = Object.values(portfolios).reduce((sum, p) => sum + (p?.summary?.totalValue || 0), 0);
    const totalGain = Object.values(portfolios).reduce((sum, p) => sum + (p?.summary?.totalGain || 0), 0);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Broker Connections
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Import holdings from your brokerage accounts
            </p>

            {/* Aggregated Summary */}
            {connectedBrokers.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-lg">
                    <p className="text-xs text-[var(--color-text-secondary)]">Combined Portfolio Value</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(totalValue)}
                    </p>
                    <p className={`text-sm font-medium ${totalGain >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                        {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                    </p>
                </div>
            )}

            {/* Broker List */}
            <div className="space-y-3">
                {Object.entries(BROKERS).map(([brokerId, broker]) => {
                    const isConnected = connectedBrokers.includes(brokerId);
                    const isConnecting = connecting === brokerId;
                    const isExpanded = expandedBroker === brokerId;
                    const portfolio = portfolios[brokerId];

                    return (
                        <div
                            key={brokerId}
                            className={`rounded-lg border transition-all ${isConnected
                                    ? 'border-[var(--color-success)] bg-[var(--color-success)]/5'
                                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'
                                }`}
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{broker.logo}</span>
                                    <div>
                                        <p className="font-bold">{broker.name}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {broker.features.join(' • ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isConnected && portfolio?.summary && (
                                        <div className="text-right mr-2 hidden sm:block">
                                            <p className="font-bold text-sm">{formatCurrency(portfolio.summary.totalValue)}</p>
                                            <p className={`text-xs ${portfolio.summary.totalGain >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                                {portfolio.summary.totalGain >= 0 ? '+' : ''}{portfolio.summary.gainPercent.toFixed(1)}%
                                            </p>
                                        </div>
                                    )}

                                    {isConnected ? (
                                        <>
                                            <button
                                                onClick={() => toggleExpand(brokerId)}
                                                className="text-sm px-3 py-1 bg-[var(--color-bg-primary)] rounded hover:bg-[var(--color-border)] transition-colors"
                                            >
                                                {isExpanded ? 'Hide' : 'View'}
                                            </button>
                                            <button
                                                onClick={() => handleDisconnect(brokerId)}
                                                className="text-sm px-3 py-1 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(brokerId)}
                                            disabled={isConnecting}
                                            className="btn-primary px-4 py-1.5 text-sm flex items-center gap-2"
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                    Connecting...
                                                </>
                                            ) : (
                                                'Connect'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Portfolio View */}
                            {isExpanded && portfolio && (
                                <div className="border-t border-[var(--color-border)] p-4 animate-fadeIn">
                                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                                        Holdings from {broker.name}
                                    </p>
                                    <div className="space-y-2">
                                        {portfolio.holdings.map((h, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <span className="font-bold">{h.symbol}</span>
                                                    <span className="text-[var(--color-text-secondary)] ml-2">
                                                        {h.shares} shares
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-medium">{formatCurrency(h.currentPrice * h.shares)}</span>
                                                    <span className={`ml-2 text-xs ${h.currentPrice >= h.purchasePrice ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                                                        }`}>
                                                        {h.currentPrice >= h.purchasePrice ? '+' : ''}
                                                        {(((h.currentPrice - h.purchasePrice) / h.purchasePrice) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="mt-3 w-full text-sm py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/80 transition-colors">
                                        Import to Portfolio
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg text-xs text-[var(--color-text-secondary)]">
                <strong>Demo Mode:</strong> This is a simulation. Real broker integration requires OAuth authentication
                and API keys from each brokerage.
            </div>
        </div>
    );
}
