import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getPortfolio, addHolding, removeHolding, updateHolding } from '../services/storageService';
import { fetchStockPrice, fetchHistoricalPrices } from '../services/apiService';
import { calculateVolatility } from '../services/calculations';

const PortfolioContext = createContext(null);

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
}

export function PortfolioProvider({ children }) {
    const [holdings, setHoldings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    // Load portfolio from IndexedDB on mount
    useEffect(() => {
        loadPortfolio();
    }, []);

    const loadPortfolio = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const savedHoldings = await getPortfolio();
            setHoldings(savedHoldings);

            // Refresh prices if we have holdings
            if (savedHoldings.length > 0) {
                await refreshPricesForHoldings(savedHoldings);
            }
        } catch (err) {
            console.error('Error loading portfolio:', err);
            setError('Failed to load portfolio');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPricesForHoldings = async (holdingsList) => {
        try {
            const updatedHoldings = await Promise.all(
                holdingsList.map(async (holding) => {
                    try {
                        const priceData = await fetchStockPrice(holding.symbol);
                        const historicalReturns = await fetchHistoricalPrices(holding.symbol, 252);
                        const volatility = calculateVolatility(historicalReturns);

                        const updatedHolding = {
                            ...holding,
                            currentPrice: priceData.price,
                            priceChange: priceData.change,
                            priceChangePercent: priceData.changePercent,
                            volatility,
                            lastPriceUpdate: new Date().toISOString(),
                        };

                        await updateHolding(updatedHolding);
                        return updatedHolding;
                    } catch (err) {
                        console.error(`Error fetching price for ${holding.symbol}:`, err);
                        return holding;
                    }
                })
            );

            setHoldings(updatedHoldings);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error refreshing prices:', err);
        }
    };

    const addStock = useCallback(async (symbol, shares, purchasePrice) => {
        try {
            setError(null);
            const upperSymbol = symbol.toUpperCase().trim();

            // Fetch current price and volatility
            const priceData = await fetchStockPrice(upperSymbol);
            const historicalReturns = await fetchHistoricalPrices(upperSymbol, 252);
            const volatility = calculateVolatility(historicalReturns);

            const newHolding = {
                id: uuidv4(),
                symbol: upperSymbol,
                shares: Number(shares),
                purchasePrice: Number(purchasePrice),
                currentPrice: priceData.price,
                priceChange: priceData.change,
                priceChangePercent: priceData.changePercent,
                volatility,
                dateAdded: new Date().toISOString(),
                lastPriceUpdate: new Date().toISOString(),
            };

            await addHolding(newHolding);
            setHoldings(prev => [...prev, newHolding]);
            setLastUpdated(new Date());

            return { success: true, holding: newHolding };
        } catch (err) {
            console.error('Error adding stock:', err);
            setError(`Failed to add ${symbol}`);
            return { success: false, error: err.message };
        }
    }, []);

    const removeStock = useCallback(async (id) => {
        try {
            setError(null);
            await removeHolding(id);
            setHoldings(prev => prev.filter(h => h.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error removing stock:', err);
            setError('Failed to remove stock');
            return { success: false, error: err.message };
        }
    }, []);

    const refreshPrices = useCallback(async () => {
        if (holdings.length === 0) return;

        try {
            setIsRefreshing(true);
            setError(null);
            await refreshPricesForHoldings(holdings);
        } catch (err) {
            console.error('Error refreshing prices:', err);
            setError('Failed to refresh prices');
        } finally {
            setIsRefreshing(false);
        }
    }, [holdings]);

    const value = {
        holdings,
        isLoading,
        isRefreshing,
        lastUpdated,
        error,
        addStock,
        removeStock,
        refreshPrices,
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
}
