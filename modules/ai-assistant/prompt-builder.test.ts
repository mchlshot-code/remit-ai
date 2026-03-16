import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './prompt-builder';

describe('buildSystemPrompt', () => {
    const mockRates = [
        {
            provider: 'Wise',
            logo: '/wise.png',
            sendAmount: 500,
            receiveAmount: 987500,
            exchangeRate: 1975,
            fee: 4.5,
            totalCost: 504.5,
            transferSpeed: '1 hour',
            isBestRate: true,
            link: 'https://wise.com',
        },
        {
            provider: 'Remitly',
            logo: '/remitly.png',
            sendAmount: 500,
            receiveAmount: 980000,
            exchangeRate: 1960,
            fee: 2.99,
            totalCost: 502.99,
            transferSpeed: 'Minutes',
            isBestRate: false,
            link: 'https://remitly.com',
        },
    ];

    it('includes provider names in the prompt', () => {
        const prompt = buildSystemPrompt({ 
            rates: mockRates,
            sourceCurrency: 'GBP',
            targetCurrency: 'NGN'
        });
        expect(prompt).toContain('Wise');
        expect(prompt).toContain('Remitly');
    });

    it('includes rate data in the prompt', () => {
        const prompt = buildSystemPrompt({ 
            rates: mockRates,
            sourceCurrency: 'GBP',
            targetCurrency: 'NGN'
        });
        expect(prompt).toContain('1975.00');
        expect(prompt).toContain('987,500');
    });

    it('includes parallel rate context when provided', () => {
        const prompt = buildSystemPrompt({
            rates: mockRates,
            baseRate: 1975,
            sourceCurrency: 'GBP',
            targetCurrency: 'NGN',
            parallelRateEstimate: {
                estimatedParallelRate: 2250,
                premiumPercent: 14,
                disclaimer: 'Test disclaimer',
                source: 'Test API',
            },
        });
        expect(prompt).toContain('PARALLEL MARKET');
        expect(prompt).toContain('2,250');
        expect(prompt).toContain('14%');
        expect(prompt).toContain('Test API');
    });

    it('excludes parallel context when not provided', () => {
        const prompt = buildSystemPrompt({ 
            rates: mockRates,
            sourceCurrency: 'GBP',
            targetCurrency: 'NGN'
        });
        expect(prompt).not.toContain('DUAL-RATE CONTEXT');
    });

    it('contains safety rules', () => {
        const prompt = buildSystemPrompt({ 
            rates: mockRates,
            sourceCurrency: 'GBP',
            targetCurrency: 'NGN'
        });
        expect(prompt).toContain('NEVER fabricate rates');
        expect(prompt).toContain('verify on the provider');
    });

    it('handles empty rates gracefully', () => {
        const prompt = buildSystemPrompt({ 
            rates: [],
            sourceCurrency: 'GBP',
            targetCurrency: 'NGN'
        });
        expect(prompt).toContain('RemitAI Assistant');
    });
});
