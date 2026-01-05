import { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

const POPULAR_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'JPM', name: 'JPMorgan Chase' }
];

export default function AddAssetForm() {
    const { addStock } = usePortfolio();
    const [symbol, setSymbol] = useState('');
    const [shares, setShares] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const inputRef = useRef(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (symbol.length > 0) {
            const filtered = POPULAR_STOCKS.filter(
                s => s.symbol.includes(symbol) || s.name.toLowerCase().includes(symbol.toLowerCase())
            ).slice(0, 5);
            setFilteredStocks(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [symbol]);

    const selectStock = (stock) => {
        setSymbol(stock.symbol);
        setShowSuggestions(false);
        // Focus next field
        document.getElementById('shares')?.focus();
    };

    const quickAddStock = (sym) => {
        setSymbol(sym);
        document.getElementById('shares')?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!symbol.trim()) {
            setMessage({ type: 'error', text: 'Please enter a stock symbol' });
            return;
        }
        if (!shares || Number(shares) <= 0) {
            setMessage({ type: 'error', text: 'Please enter valid shares' });
            return;
        }
        if (!purchasePrice || Number(purchasePrice) <= 0) {
            setMessage({ type: 'error', text: 'Please enter valid price' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const result = await addStock(symbol, shares, purchasePrice);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `✓ Added ${result.holding.symbol} at $${result.holding.currentPrice.toFixed(2)}`
                });
                setSymbol('');
                setShares('');
                setPurchasePrice('');
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to add stock' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="glass-card p-4 sm:p-6 animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Stock
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Symbol with autocomplete */}
                <div className="relative">
                    <label htmlFor="symbol" className="block text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Stock Symbol
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                            🔍
                        </span>
                        <input
                            ref={inputRef}
                            id="symbol"
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            onFocus={() => symbol && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="Search stocks..."
                            className="w-full uppercase pl-12"
                            disabled={isSubmitting}
                            maxLength={10}
                            autoComplete="off"
                        />
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-xl">
                            {filteredStocks.map(stock => (
                                <button
                                    key={stock.symbol}
                                    type="button"
                                    onClick={() => selectStock(stock)}
                                    className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)]/20 transition-colors"
                                >
                                    <div className="font-bold text-sm">{stock.symbol}</div>
                                    <div className="text-xs text-[var(--color-text-secondary)]">{stock.name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Shares with numeric keyboard */}
                <div>
                    <label htmlFor="shares" className="block text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Number of Shares
                    </label>
                    <input
                        id="shares"
                        type="number"
                        inputMode="decimal"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="e.g., 10"
                        className="w-full"
                        disabled={isSubmitting}
                        min="0.0001"
                        step="any"
                    />
                </div>

                {/* Price with currency symbol */}
                <div>
                    <label htmlFor="purchasePrice" className="block text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Purchase Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] font-bold">
                            $
                        </span>
                        <input
                            id="purchasePrice"
                            type="number"
                            inputMode="decimal"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            placeholder="150.00"
                            className="w-full pl-8"
                            disabled={isSubmitting}
                            min="0.01"
                            step="0.01"
                        />
                    </div>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Fetching...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add to Portfolio
                        </>
                    )}
                </button>
            </form>

            {/* Quick Add - Popular Stocks */}
            <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                <div className="text-xs text-[var(--color-text-secondary)] mb-2">Quick Add</div>
                <div className="flex flex-wrap gap-1.5">
                    {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA'].map(sym => (
                        <button
                            key={sym}
                            type="button"
                            onClick={() => quickAddStock(sym)}
                            className="px-2.5 py-1 text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)]/20 rounded-md transition-colors"
                        >
                            {sym}
                        </button>
                    ))}
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`mt-3 p-2.5 rounded-lg text-sm animate-fadeIn ${message.type === 'success'
                        ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                        : 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
