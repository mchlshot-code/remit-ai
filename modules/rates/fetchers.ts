import { RateResult, RateRequest } from './types';

// Fallback generator in case public APIs block or fail
function getMockRates(req: RateRequest, baseRate: number): RateResult[] {
    const providers = [
        { name: 'Wise', fee: 4.5, margin: 0.005, speed: 'Within 1 hour', logo: '/wise.png', link: 'https://wise.com' },
        { name: 'Remitly', fee: 2.99, margin: 0.012, speed: 'Within minutes', logo: '/remitly.png', link: 'https://remitly.com' },
        { name: 'WorldRemit', fee: 3.99, margin: 0.015, speed: 'Same day', logo: '/worldremit.png', link: 'https://worldremit.com' },
        { name: 'Western Union', fee: 5.0, margin: 0.02, speed: 'Next day', logo: '/wu.png', link: 'https://westernunion.com' }
    ];

    return providers.map(p => {
        const rate = baseRate * (1 - p.margin);
        return {
            provider: p.name,
            logo: p.logo,
            sendAmount: req.amount,
            receiveAmount: req.amount * rate,
            exchangeRate: rate,
            fee: p.fee,
            totalCost: req.amount + p.fee,
            transferSpeed: p.speed,
            isBestRate: false, // Calculated later
            link: p.link
        };
    });
}

export async function fetchBaseRate(source: string, target: string): Promise<number> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) return 1950; // Mock GBP -> NGN rate

    try {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${source}/${target}`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch base rate');
        const data = await res.json();
        return data.conversion_rate;
    } catch (error) {
        console.error('Base rate fetch error:', error);
        return 1950; // fallback
    }
}

export async function fetchAllProviders(req: RateRequest): Promise<RateResult[]> {
    const baseRate = await fetchBaseRate(req.sourceCurrency, req.targetCurrency);

    // In a real production app, we would make concurrent requests to:
    // - Wise public API generic quotes
    // - Remitly pricing API
    // - WorldRemit API
    // For the purpose of this engine, we'll simulate the live api calls with realistic calculations
    // based on the real mid-market rate fetched above.

    const results = getMockRates(req, baseRate);
    return results;
}
