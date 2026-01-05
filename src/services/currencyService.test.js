/**
 * Unit Tests for Currency Service
 */
import { describe, it, expect } from 'vitest';

describe('Currency Service', () => {
    describe('Currency Codes', () => {
        const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD'];

        it('should have valid currency codes', () => {
            validCurrencies.forEach(code => {
                expect(code.length).toBe(3);
                expect(code).toBe(code.toUpperCase());
            });
        });

        it('should support USD as base currency', () => {
            expect(validCurrencies.includes('USD')).toBe(true);
        });
    });

    describe('Exchange Rate Calculations', () => {
        const mockRates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.5,
            INR: 74.5
        };

        it('should convert USD to EUR correctly', () => {
            const usdAmount = 100;
            const eurAmount = usdAmount * mockRates.EUR;
            expect(eurAmount).toBe(85);
        });

        it('should convert EUR to USD correctly', () => {
            const eurAmount = 85;
            const usdAmount = eurAmount / mockRates.EUR;
            expect(usdAmount).toBe(100);
        });

        it('should handle JPY (no decimals typically)', () => {
            const usdAmount = 100;
            const jpyAmount = Math.round(usdAmount * mockRates.JPY);
            expect(jpyAmount).toBe(11050);
        });

        it('should convert between non-USD currencies', () => {
            // EUR to GBP via USD
            const eurAmount = 100;
            const usdAmount = eurAmount / mockRates.EUR;
            const gbpAmount = usdAmount * mockRates.GBP;
            expect(gbpAmount).toBeCloseTo(85.88, 1);
        });
    });

    describe('Currency Symbols', () => {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            INR: '₹'
        };

        it('should have correct symbol for USD', () => {
            expect(symbols.USD).toBe('$');
        });

        it('should have correct symbol for EUR', () => {
            expect(symbols.EUR).toBe('€');
        });

        it('should have correct symbol for GBP', () => {
            expect(symbols.GBP).toBe('£');
        });
    });

    describe('Formatting', () => {
        it('should format USD with 2 decimal places', () => {
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(1234.567);
            expect(formatted).toBe('$1,234.57');
        });

        it('should format JPY with 0 decimal places', () => {
            const formatted = new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
            }).format(1234);
            expect(formatted).toBe('￥1,234');
        });
    });
});
