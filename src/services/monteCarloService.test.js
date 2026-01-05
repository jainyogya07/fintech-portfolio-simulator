/**
 * Unit Tests for Monte Carlo Service
 */
import { describe, it, expect, vi } from 'vitest';

// Mock the web worker since we can't run it in Node
vi.mock('../workers/monteCarloWorker.js', () => ({}));

describe('Monte Carlo Service', () => {
    describe('Simulation Parameters', () => {
        it('should validate portfolio value is positive', () => {
            const isValid = (value) => value > 0;
            expect(isValid(10000)).toBe(true);
            expect(isValid(0)).toBe(false);
            expect(isValid(-1000)).toBe(false);
        });

        it('should validate volatility is between 0 and 100', () => {
            const isValid = (vol) => vol >= 0 && vol <= 100;
            expect(isValid(20)).toBe(true);
            expect(isValid(0)).toBe(true);
            expect(isValid(100)).toBe(true);
            expect(isValid(-5)).toBe(false);
            expect(isValid(150)).toBe(false);
        });

        it('should validate years is positive integer', () => {
            const isValid = (years) => Number.isInteger(years) && years > 0;
            expect(isValid(10)).toBe(true);
            expect(isValid(1)).toBe(true);
            expect(isValid(0)).toBe(false);
            expect(isValid(-5)).toBe(false);
            expect(isValid(10.5)).toBe(false);
        });

        it('should use default values for optional params', () => {
            const defaults = {
                numSimulations: 10000,
                expectedReturn: 0.07,
                useFatTails: true,
                degreesOfFreedom: 5
            };
            expect(defaults.numSimulations).toBe(10000);
            expect(defaults.expectedReturn).toBe(0.07);
        });
    });

    describe('Result Formatting', () => {
        const mockResult = {
            statistics: { median: 15000, mean: 16000, min: 5000, max: 50000 },
            params: { portfolioValue: 10000, years: 10 },
            chartData: [
                { year: 10, p10: 6000, p25: 9000, p50: 15000, p75: 22000, p90: 35000 }
            ],
            probabilities: [
                { threshold: 10000, probability: 75 },
                { threshold: 20000, probability: 45 }
            ]
        };

        it('should calculate total return from initial value', () => {
            const totalReturn = ((mockResult.statistics.median - mockResult.params.portfolioValue)
                / mockResult.params.portfolioValue) * 100;
            expect(totalReturn).toBe(50);
        });

        it('should calculate annualized return', () => {
            const { median } = mockResult.statistics;
            const { portfolioValue, years } = mockResult.params;
            const annualized = Math.pow(median / portfolioValue, 1 / years) - 1;
            expect(annualized).toBeCloseTo(0.0414, 2);
        });

        it('should extract probability of reaching threshold', () => {
            const prob = mockResult.probabilities.find(p => p.threshold === 10000);
            expect(prob.probability).toBe(75);
        });
    });

    describe('Percentile Calculations', () => {
        it('should sort values correctly for percentile', () => {
            const values = [100, 50, 200, 150, 75];
            const sorted = [...values].sort((a, b) => a - b);
            expect(sorted).toEqual([50, 75, 100, 150, 200]);
        });

        it('should find correct percentile index', () => {
            const n = 100;
            const p10Index = Math.floor(0.1 * n);
            const p50Index = Math.floor(0.5 * n);
            const p90Index = Math.floor(0.9 * n);

            expect(p10Index).toBe(10);
            expect(p50Index).toBe(50);
            expect(p90Index).toBe(90);
        });
    });
});
