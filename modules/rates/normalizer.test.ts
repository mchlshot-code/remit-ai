import { describe, it, expect } from 'vitest';
import { normalizeAndCompare } from './normalizer';
import { RateResult } from './types';

function makeMockRate(overrides: Partial<RateResult> = {}): RateResult {
    return {
        provider: 'TestProvider',
        logo: '/test.png',
        sendAmount: 500,
        receiveAmount: 990000,
        exchangeRate: 1980,
        fee: 4.5,
        totalCost: 504.5,
        transferSpeed: '1 hour',
        isBestRate: false,
        link: 'https://test.com',
        ...overrides,
    };
}

describe('normalizeAndCompare', () => {
    it('returns empty result for no rates', () => {
        const result = normalizeAndCompare([], 'GBP');
        expect(result.rates).toEqual([]);
        expect(result.savingsMessage).toBeNull();
    });

    it('marks the highest receiveAmount as best rate', () => {
        const rates = [
            makeMockRate({ provider: 'Low', receiveAmount: 900000 }),
            makeMockRate({ provider: 'High', receiveAmount: 1000000 }),
            makeMockRate({ provider: 'Mid', receiveAmount: 950000 }),
        ];
        const result = normalizeAndCompare(rates, 'GBP');
        
        expect(result.rates[0].provider).toBe('High');
        expect(result.rates[0].isBestRate).toBe(true);
        expect(result.rates[1].isBestRate).toBe(false);
        expect(result.rates[2].isBestRate).toBe(false);
    });

    it('sorts rates by receiveAmount descending', () => {
        const rates = [
            makeMockRate({ provider: 'C', receiveAmount: 100 }),
            makeMockRate({ provider: 'A', receiveAmount: 300 }),
            makeMockRate({ provider: 'B', receiveAmount: 200 }),
        ];
        const result = normalizeAndCompare(rates, 'GBP');
        expect(result.rates.map(r => r.provider)).toEqual(['A', 'B', 'C']);
    });

    it('computes savings message with GBP symbol', () => {
        const rates = [
            makeMockRate({ provider: 'Best', receiveAmount: 1000000, exchangeRate: 2000 }),
            makeMockRate({ provider: 'Worst', receiveAmount: 900000, exchangeRate: 1800 }),
        ];
        const result = normalizeAndCompare(rates, 'GBP');
        
        expect(result.savingsMessage).toBeTruthy();
        expect(result.savingsMessage).toContain('£');
        expect(result.savingsMessage).toContain('vs worst rate');
    });

    it('computes savings message with USD symbol', () => {
        const rates = [
            makeMockRate({ provider: 'Best', receiveAmount: 1000000, exchangeRate: 2000 }),
            makeMockRate({ provider: 'Worst', receiveAmount: 900000, exchangeRate: 1800 }),
        ];
        const result = normalizeAndCompare(rates, 'USD');
        expect(result.savingsMessage).toContain('$');
    });

    it('returns null savings for single provider', () => {
        const rates = [makeMockRate()];
        const result = normalizeAndCompare(rates, 'GBP');
        expect(result.savingsMessage).toBeNull();
    });
});
