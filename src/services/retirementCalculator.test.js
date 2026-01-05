/**
 * Unit Tests for Retirement Calculator
 */
import { describe, it, expect } from 'vitest';
import {
    calculateRetirement,
    simulateRetirementOutcomes,
    getRetirementRating
} from '../services/retirementCalculator';

describe('Retirement Calculator', () => {
    const baseInputs = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        desiredAnnualIncome: 60000,
        lifeExpectancy: 90
    };

    describe('Basic Projections', () => {
        it('should calculate years until retirement', () => {
            const result = calculateRetirement(baseInputs);
            expect(result.yearsUntilRetirement).toBe(35);
        });

        it('should project savings at retirement', () => {
            const result = calculateRetirement(baseInputs);
            expect(result.savingsAtRetirement).toBeGreaterThan(baseInputs.currentSavings);
        });

        it('should calculate if on track', () => {
            const result = calculateRetirement(baseInputs);
            expect(typeof result.isOnTrack).toBe('boolean');
        });

        it('should calculate shortfall or surplus', () => {
            const result = calculateRetirement(baseInputs);
            if (result.isOnTrack) {
                expect(result.surplus).toBeGreaterThan(0);
                expect(result.shortfall).toBe(0);
            } else {
                expect(result.shortfall).toBeGreaterThan(0);
                expect(result.surplus).toBe(0);
            }
        });
    });

    describe('Smart Features', () => {
        it('should calculate glide path equity allocation', () => {
            const result = calculateRetirement(baseInputs);
            expect(result.currentEquityAllocation).toBeDefined();
            expect(result.retirementEquityAllocation).toBeDefined();
            // Retirement allocation should be lower than current
            expect(result.retirementEquityAllocation).toBeLessThanOrEqual(result.currentEquityAllocation);
        });

        it('should use dynamic withdrawal rate', () => {
            const result = calculateRetirement(baseInputs);
            expect(result.safeWithdrawalRate).toBeGreaterThan(0);
            expect(result.safeWithdrawalRate).toBeLessThanOrEqual(5);
        });

        it('should estimate Social Security', () => {
            const result = calculateRetirement(baseInputs);
            expect(result.estimatedSocialSecurity).toBeGreaterThan(0);
        });

        it('should include glide path in assumptions', () => {
            const result = calculateRetirement(baseInputs);
            expect(result.assumptions.glidePath).toContain('→');
        });
    });

    describe('Edge Cases', () => {
        it('should handle already retired', () => {
            const retired = { ...baseInputs, currentAge: 70, retirementAge: 65 };
            const result = calculateRetirement(retired);
            expect(result.yearsUntilRetirement).toBe(-5);
        });

        it('should handle zero savings', () => {
            const noSavings = { ...baseInputs, currentSavings: 0 };
            const result = calculateRetirement(noSavings);
            expect(result.savingsAtRetirement).toBeGreaterThan(0);
        });

        it('should handle zero contribution', () => {
            const noContrib = { ...baseInputs, monthlyContribution: 0 };
            const result = calculateRetirement(noContrib);
            expect(result.savingsAtRetirement).toBeGreaterThan(noContrib.currentSavings);
        });
    });
});

describe('Monte Carlo Retirement Simulation', () => {
    it('should run simulations', () => {
        const result = simulateRetirementOutcomes({
            currentSavings: 50000,
            monthlyContribution: 1000,
            yearsUntilRetirement: 35,
            yearsInRetirement: 25,
            annualWithdrawal: 60000,
            simulations: 100 // Smaller for test speed
        });

        expect(result.successRate).toBeGreaterThanOrEqual(0);
        expect(result.successRate).toBeLessThanOrEqual(100);
        expect(result.simulations).toBe(100);
    });

    it('should calculate median balances', () => {
        const result = simulateRetirementOutcomes({
            currentSavings: 100000,
            monthlyContribution: 500,
            yearsUntilRetirement: 20,
            yearsInRetirement: 20,
            annualWithdrawal: 40000,
            simulations: 100
        });

        expect(result.medianRetirementBalance).toBeGreaterThan(0);
    });
});

describe('Retirement Rating', () => {
    it('should rate excellent for 90%+ success', () => {
        const rating = getRetirementRating(95);
        expect(rating.label).toBe('Excellent');
        expect(rating.emoji).toBe('🎉');
    });

    it('should rate high risk for <40% success', () => {
        const rating = getRetirementRating(30);
        expect(rating.label).toBe('High Risk');
        expect(rating.emoji).toBe('🚨');
    });

    it('should rate fair for 60-74% success', () => {
        const rating = getRetirementRating(65);
        expect(rating.label).toBe('Fair');
    });
});
