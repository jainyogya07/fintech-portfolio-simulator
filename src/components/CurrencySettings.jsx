import { useState } from 'react';
import {
    getAvailableCurrencies,
    getCurrencyPreference,
    setCurrencyPreference,
    formatInCurrency,
    getInternationalExchanges
} from '../services/currencyService';
import { usePortfolio } from '../context/PortfolioContext';

export default function CurrencySettings() {
    const { holdings } = usePortfolio();
    const [currency, setCurrency] = useState(getCurrencyPreference());
    const [showExchanges, setShowExchanges] = useState(false);

    const currencies = getAvailableCurrencies();
    const exchanges = getInternationalExchanges();

    const handleCurrencyChange = (newCurrency) => {
        setCurrency(newCurrency);
        setCurrencyPreference(newCurrency);
    };

    const currentInfo = currencies.find(c => c.code === currency);

    // Calculate total from holdings
    const totalInUSD = holdings.reduce((sum, h) => sum + (h.currentPrice * h.shares), 0);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                Multi-Currency
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                View portfolio in different currencies
            </p>

            {/* Current Selection */}
            <div className="mb-4 p-4 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{currentInfo?.flag}</span>
                        <div>
                            <p className="font-bold">{currentInfo?.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                1 USD = {currentInfo?.rate} {currency}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[var(--color-primary)]">
                            {formatInCurrency(totalInUSD, currency)}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            Portfolio Value
                        </p>
                    </div>
                </div>
            </div>

            {/* Currency Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                {currencies.map(curr => (
                    <button
                        key={curr.code}
                        onClick={() => handleCurrencyChange(curr.code)}
                        className={`p-3 rounded-lg text-center transition-all ${currency === curr.code
                            ? 'bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)] ring-offset-2'
                            : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)]'
                            }`}
                    >
                        <span className="text-xl">{curr.flag}</span>
                        <p className="font-bold text-sm mt-1">{curr.code}</p>
                        <p className="text-xs opacity-75">{curr.symbol}</p>
                    </button>
                ))}
            </div>

            {/* Quick Conversion Table */}
            <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Your Portfolio in All Currencies:</p>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {currencies.map(curr => (
                        <div
                            key={curr.code}
                            className="flex items-center justify-between bg-[var(--color-bg-secondary)] rounded p-2 text-sm"
                        >
                            <span>{curr.flag} {curr.code}</span>
                            <span className="font-mono font-bold">
                                {formatInCurrency(totalInUSD, curr.code)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* International Exchanges */}
            <div>
                <button
                    onClick={() => setShowExchanges(!showExchanges)}
                    className="w-full flex items-center justify-between text-sm font-semibold p-2 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                >
                    <span>🏛️ International Exchanges</span>
                    <svg className={`w-4 h-4 transition-transform ${showExchanges ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showExchanges && (
                    <div className="mt-2 space-y-2 animate-fadeIn">
                        {Object.entries(exchanges).map(([code, exchange]) => (
                            <div key={code} className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                                <p className="font-bold text-sm">{exchange.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Suffix: <code className="bg-[var(--color-bg-primary)] px-1 rounded">{exchange.suffix || 'none'}</code>
                                </p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    Examples: {exchange.examples.join(', ')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
