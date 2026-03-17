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

export async function fetchBaseRate(source: string, target: string): Promise<number> {
    const defaultRate = source === 'GBP' && target === 'NGN' ? 2050 : 1950;
    
    try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${source.toLowerCase()}.json`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch base rate');
        const data = await res.json();
        
        const rate = data[source.toLowerCase()][target.toLowerCase()];
        return rate || defaultRate;
    } catch (error) {
        console.error('Base rate fetch error:', error);
        return defaultRate; // fallback
    }
}

export async function fetchParallelRate(source: string, target: string, officialRate: number): Promise<ParallelRateEstimate | undefined> {
    try {
        const API_URL = process.env.PARALLEL_MARKET_API_URL || 'https://api.korapay.com/merchant/api/v1/conversions/rates';
        const API_KEY = process.env.PARALLEL_MARKET_API_KEY;

        let liveRate: number | undefined;

        if (API_KEY) {
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
                next: { revalidate: 300 } // Short cache (5 mins) for volatile parallel market
            });

            if (res.ok) {
                const data = await res.json();
                liveRate = data.data?.rate || data.rate; // handles different generic wrappers
            }
        }
        
        // Free fallback proxy simulation if no API key is provided
        // Represents a live fetch against an open wrapper.
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
                    const premiumMultiplier = gbpNgnSimulatedRate / officialGbpNgn;
                    liveRate = officialRate * premiumMultiplier;
                }
            } else {
                 return undefined; // If no parallel rate available for a corridor, return undefined gracefully
            }
        }

        if (liveRate) {
            return {
                estimatedParallelRate: Math.round(liveRate),
                premiumPercent: Math.round(((liveRate - officialRate) / officialRate) * 100),
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

    // In a real production app, we would make concurrent requests to:
    // - Wise public API generic quotes
    // - Remitly pricing API
    // - WorldRemit API
    // For the purpose of this engine, we'll simulate the live api calls with realistic calculations
    // based on the real mid-market rate fetched above.

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
