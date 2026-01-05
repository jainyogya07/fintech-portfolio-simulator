/**
 * Integration Tests for Portfolio Flow
 * Tests end-to-end scenarios
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Portfolio Integration', () => {
    let portfolio;

    beforeEach(() => {
        portfolio = {
            holdings: [],
            addStock: function (stock) {
                this.holdings.push({
                    ...stock,
                    currentPrice: stock.purchasePrice, // Initially same as purchase
                    id: Date.now().toString()
                });
            },
            removeStock: function (symbol) {
                this.holdings = this.holdings.filter(h => h.symbol !== symbol);
            },
            updatePrice: function (symbol, newPrice) {
                const holding = this.holdings.find(h => h.symbol === symbol);
                if (holding) holding.currentPrice = newPrice;
            },
            getTotalValue: function () {
                return this.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
            },
            getCostBasis: function () {
                return this.holdings.reduce((sum, h) => sum + h.purchasePrice * h.shares, 0);
            },
            getGainLoss: function () {
                const value = this.getTotalValue();
                const cost = this.getCostBasis();
                return {
                    total: value - cost,
                    percent: cost > 0 ? ((value - cost) / cost) * 100 : 0
                };
            }
        };
    });

    describe('Add Stock Flow', () => {
        it('should add a single stock correctly', () => {
            portfolio.addStock({ symbol: 'AAPL', shares: 10, purchasePrice: 150 });

            expect(portfolio.holdings.length).toBe(1);
            expect(portfolio.holdings[0].symbol).toBe('AAPL');
            expect(portfolio.getTotalValue()).toBe(1500);
        });

        it('should add multiple stocks correctly', () => {
            portfolio.addStock({ symbol: 'AAPL', shares: 10, purchasePrice: 150 });
            portfolio.addStock({ symbol: 'TSLA', shares: 5, purchasePrice: 200 });

            expect(portfolio.holdings.length).toBe(2);
            expect(portfolio.getTotalValue()).toBe(2500);
        });

        it('should calculate cost basis after adding stocks', () => {
            portfolio.addStock({ symbol: 'AAPL', shares: 10, purchasePrice: 150 });
            portfolio.addStock({ symbol: 'MSFT', shares: 5, purchasePrice: 300 });

            expect(portfolio.getCostBasis()).toBe(3000);
        });
    });

    describe('Price Update Flow', () => {
        beforeEach(() => {
            portfolio.addStock({ symbol: 'AAPL', shares: 10, purchasePrice: 150 });
        });

        it('should update price and reflect in total value', () => {
            portfolio.updatePrice('AAPL', 180);

            expect(portfolio.getTotalValue()).toBe(1800);
        });

        it('should calculate gain correctly after price increase', () => {
            portfolio.updatePrice('AAPL', 180);
            const gainLoss = portfolio.getGainLoss();

            expect(gainLoss.total).toBe(300);
            expect(gainLoss.percent).toBe(20);
        });

        it('should calculate loss correctly after price decrease', () => {
            portfolio.updatePrice('AAPL', 120);
            const gainLoss = portfolio.getGainLoss();

            expect(gainLoss.total).toBe(-300);
            expect(gainLoss.percent).toBe(-20);
        });
    });

    describe('Remove Stock Flow', () => {
        beforeEach(() => {
            portfolio.addStock({ symbol: 'AAPL', shares: 10, purchasePrice: 150 });
            portfolio.addStock({ symbol: 'TSLA', shares: 5, purchasePrice: 200 });
        });

        it('should remove stock correctly', () => {
            portfolio.removeStock('AAPL');

            expect(portfolio.holdings.length).toBe(1);
            expect(portfolio.holdings[0].symbol).toBe('TSLA');
        });

        it('should update total value after removal', () => {
            portfolio.removeStock('AAPL');

            expect(portfolio.getTotalValue()).toBe(1000);
        });

        it('should return empty portfolio after removing all', () => {
            portfolio.removeStock('AAPL');
            portfolio.removeStock('TSLA');

            expect(portfolio.holdings.length).toBe(0);
            expect(portfolio.getTotalValue()).toBe(0);
        });
    });

    describe('Complete User Journey', () => {
        it('should handle full add-update-remove flow', () => {
            // User adds stocks
            portfolio.addStock({ symbol: 'AAPL', shares: 10, purchasePrice: 150 });
            portfolio.addStock({ symbol: 'TSLA', shares: 5, purchasePrice: 200 });
            expect(portfolio.getTotalValue()).toBe(2500);

            // Prices update
            portfolio.updatePrice('AAPL', 180);
            portfolio.updatePrice('TSLA', 250);
            expect(portfolio.getTotalValue()).toBe(3050);

            // User sells AAPL
            portfolio.removeStock('AAPL');
            expect(portfolio.getTotalValue()).toBe(1250);

            // Check final state
            expect(portfolio.holdings.length).toBe(1);
            expect(portfolio.getGainLoss().total).toBe(250);
        });
    });
});
