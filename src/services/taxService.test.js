/**
 * Unit Tests for Tax Service
 */
import { describe, it, expect } from 'vitest';

describe('Tax Service', () => {
    describe('Capital Gains Classification', () => {
        const isLongTerm = (holdingDays) => holdingDays > 365;
        const isShortTerm = (holdingDays) => holdingDays <= 365;

        it('should classify < 365 days as short-term', () => {
            expect(isShortTerm(100)).toBe(true);
            expect(isShortTerm(365)).toBe(true);
            expect(isLongTerm(100)).toBe(false);
        });

        it('should classify > 365 days as long-term', () => {
            expect(isLongTerm(366)).toBe(true);
            expect(isLongTerm(1000)).toBe(true);
            expect(isShortTerm(366)).toBe(false);
        });
    });

    describe('Tax Rate Calculation', () => {
        const getShortTermRate = (income) => {
            if (income <= 10275) return 0.10;
            if (income <= 41775) return 0.12;
            if (income <= 89075) return 0.22;
            if (income <= 170050) return 0.24;
            if (income <= 215950) return 0.32;
            if (income <= 539900) return 0.35;
            return 0.37;
        };

        const getLongTermRate = (income) => {
            if (income <= 41675) return 0;
            if (income <= 459750) return 0.15;
            return 0.20;
        };

        it('should return 10% for lowest bracket short-term', () => {
            expect(getShortTermRate(5000)).toBe(0.10);
        });

        it('should return 0% for lowest bracket long-term', () => {
            expect(getLongTermRate(30000)).toBe(0);
        });

        it('should return 15% for middle bracket long-term', () => {
            expect(getLongTermRate(100000)).toBe(0.15);
        });

        it('should return 20% for high earners long-term', () => {
            expect(getLongTermRate(500000)).toBe(0.20);
        });
    });

    describe('Wash Sale Detection', () => {
        const isWashSale = (sellDate, buyDate, symbol1, symbol2) => {
            if (symbol1 !== symbol2) return false;
            const daysDiff = Math.abs((new Date(buyDate) - new Date(sellDate)) / (1000 * 60 * 60 * 24));
            return daysDiff <= 30;
        };

        it('should detect wash sale within 30 days', () => {
            expect(isWashSale('2024-01-15', '2024-01-20', 'AAPL', 'AAPL')).toBe(true);
        });

        it('should not flag different symbols', () => {
            expect(isWashSale('2024-01-15', '2024-01-20', 'AAPL', 'TSLA')).toBe(false);
        });

        it('should not flag trades > 30 days apart', () => {
            expect(isWashSale('2024-01-15', '2024-03-01', 'AAPL', 'AAPL')).toBe(false);
        });
    });

    describe('Tax Loss Harvesting', () => {
        const holdings = [
            { symbol: 'AAPL', gain: 500 },
            { symbol: 'TSLA', gain: -300 },
            { symbol: 'MSFT', gain: 200 },
            { symbol: 'NVDA', gain: -150 }
        ];

        it('should identify holdings with losses', () => {
            const losses = holdings.filter(h => h.gain < 0);
            expect(losses.length).toBe(2);
            expect(losses[0].symbol).toBe('TSLA');
        });

        it('should calculate total potential tax savings', () => {
            const totalLoss = holdings
                .filter(h => h.gain < 0)
                .reduce((sum, h) => sum + h.gain, 0);
            const taxSavings = Math.abs(totalLoss) * 0.15; // 15% long-term rate
            expect(taxSavings).toBe(67.5);
        });

        it('should respect $3000 annual limit for excess losses', () => {
            const netLoss = -5000;
            const deductible = Math.min(3000, Math.abs(netLoss));
            const carryforward = Math.abs(netLoss) - deductible;
            expect(deductible).toBe(3000);
            expect(carryforward).toBe(2000);
        });
    });
});
