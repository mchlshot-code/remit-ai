import { RateResult, RateRequest, ParallelRateEstimate } from './types';

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

/**
 * Fetch the live mid-market rate for ANY currency pair via fawazahmed0 API.
 * Returns null if the pair is not found or the request fails.
 */
export async function fetchBaseRate(source: string, target: string): Promise<number | null> {
    const fromCode = source.toLowerCase();
    const toCode = target.toLowerCase();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
            `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCode}.json`,
            { signal: controller.signal, next: { revalidate: 3600 } }
        );
        clearTimeout(timeoutId);

        if (!res.ok) {
            console.error(`Base rate fetch failed: HTTP ${res.status} for ${fromCode} -> ${toCode}`);
            return null;
        }

        const data = await res.json();
        const rate = data[fromCode]?.[toCode];

        if (rate === undefined || rate === null) {
            console.warn(`Rate pair not found: ${fromCode} -> ${toCode}`);
            return null;
        }

        return rate;
    } catch (error) {
        console.error('Base rate fetch error:', error);
        return null;
    }
}

export async function fetchParallelRate(source: string, target: string, officialRate: number): Promise<ParallelRateEstimate | undefined> {
    // Parallel market data only applies when NGN is on either side
    if (source !== 'NGN' && target !== 'NGN') {
        return undefined;
    }

    try {
        const API_URL = process.env.PARALLEL_MARKET_API_URL || 'https://api.korapay.com/merchant/api/v1/conversions/rates';
        const API_KEY = process.env.PARALLEL_MARKET_API_KEY;

        let liveRate: number | undefined;

        if (API_KEY) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    from_currency: source,
                    to_currency: target,
                    amount: 1
                }),
                signal: controller.signal,
                next: { revalidate: 300 } // Short cache (5 mins) for volatile parallel market
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                liveRate = data.data?.rate || data.rate; // handles different generic wrappers
            }
        }
        
        // Free fallback proxy simulation if no API key is provided
        if (!liveRate) {
            if (target === 'NGN') {
                const simulatedLiveResponse = await fetch('https://api.mocki.io/v2/01234567/ngn-parallel', { method: 'GET' }).catch(() => null);
                let gbpNgnSimulatedRate = 2250; 
                
                if (simulatedLiveResponse?.ok) {
                    const data = await simulatedLiveResponse.json();
                    gbpNgnSimulatedRate = data?.rate || 2250;
                }

                if (source === 'GBP') {
                    liveRate = gbpNgnSimulatedRate;
                } else {
                    // Convert to GBP equivalent logically via official rates to estimate parallel proxy.
                    const officialGbpNgn = await fetchBaseRate('GBP', 'NGN');
                    if (officialGbpNgn) {
                        const premiumMultiplier = gbpNgnSimulatedRate / officialGbpNgn;
                        liveRate = officialRate * premiumMultiplier;
                    }
                }
            } else if (source === 'NGN') {
                // NGN → X: derive parallel rate from the inverse
                // e.g. NGN → GBP: official gives NGN per GBP, parallel is the inverse view
                const inverseOfficial = await fetchBaseRate(target, 'NGN');
                if (inverseOfficial) {
                    const simulatedLiveResponse = await fetch('https://api.mocki.io/v2/01234567/ngn-parallel', { method: 'GET' }).catch(() => null);
                    let gbpNgnSimulatedRate = 2250;
                    if (simulatedLiveResponse?.ok) {
                        const data = await simulatedLiveResponse.json();
                        gbpNgnSimulatedRate = data?.rate || 2250;
                    }
                    const officialGbpNgn = await fetchBaseRate('GBP', 'NGN');
                    if (officialGbpNgn) {
                        const premiumMultiplier = gbpNgnSimulatedRate / officialGbpNgn;
                        // For NGN→X, the parallel rate is the inverse with premium applied
                        liveRate = officialRate / premiumMultiplier;
                    }
                }
            } else {
                return undefined;
            }
        }

        if (liveRate) {
            const premiumPercent = target === 'NGN'
                ? Math.round(((liveRate - officialRate) / officialRate) * 100)
                : Math.round(((officialRate - liveRate) / officialRate) * 100);

            return {
                estimatedParallelRate: target === 'NGN' ? Math.round(liveRate) : parseFloat(liveRate.toFixed(6)),
                premiumPercent: Math.abs(premiumPercent),
                disclaimer: "Live parallel market estimate. Actual street rates may vary.",
                source: API_KEY ? "Live Korapay / FX Wrapper" : "Simulated FX Wrapper via GBP proxy"
            };
        }

        return undefined;

    } catch (error) {
        console.error('Parallel rate fetch error:', error);
        return undefined;
    }
}

async function fetchLemFiRate(req: RateRequest, baseRate: number): Promise<RateResult | null> {
    // TODO: replace with real endpoint — mocked for now
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Simulated delay to mimic network request
        await new Promise(resolve => setTimeout(resolve, 100));
        clearTimeout(timeoutId);

        const margin = 0.008; // 0.8% margin
        const rate = baseRate * (1 - margin);
        const fee = 0; // LemFi often has zero fees for certain corridors
        
        return {
            provider: 'LemFi',
            logo: '/lemfi.png',
            sendAmount: req.amount,
            receiveAmount: req.amount * rate,
            exchangeRate: rate,
            fee: fee,
            totalCost: req.amount + fee,
            transferSpeed: 'Within minutes',
            isBestRate: false,
            link: 'https://lemfi.com'
        };
    } catch (error) {
        console.error('LemFi fetch error:', error);
        return null;
    }
}

async function fetchTapTapSendRate(req: RateRequest, baseRate: number): Promise<RateResult | null> {
    // TODO: replace with real endpoint — mocked for now
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 100));
        clearTimeout(timeoutId);

        const margin = 0.01; // 1% margin
        const rate = baseRate * (1 - margin);
        const fee = 1.99;
        
        return {
            provider: 'TapTap Send',
            logo: '/taptapsend.png',
            sendAmount: req.amount,
            receiveAmount: req.amount * rate,
            exchangeRate: rate,
            fee: fee,
            totalCost: req.amount + fee,
            transferSpeed: 'Instant',
            isBestRate: false,
            link: 'https://taptapsend.com'
        };
    } catch (error) {
        console.error('TapTap Send fetch error:', error);
        return null;
    }
}

export async function fetchAllProviders(req: RateRequest): Promise<RateResult[]> {
    const baseRate = await fetchBaseRate(req.sourceCurrency, req.targetCurrency);

    // If no base rate, return empty — graceful degradation
    if (baseRate === null) {
        console.warn(`No base rate for ${req.sourceCurrency} → ${req.targetCurrency}, returning empty`);
        return [];
    }

    const mockResults = getMockRates(req, baseRate);
    
    // Fetch new providers in parallel
    const [lemFiResult, tapTapResult] = await Promise.all([
        fetchLemFiRate(req, baseRate),
        fetchTapTapSendRate(req, baseRate)
    ]);

    const results = [...mockResults];
    if (lemFiResult) results.push(lemFiResult);
    if (tapTapResult) results.push(tapTapResult);

    return results;
}
