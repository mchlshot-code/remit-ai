import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchAllProviders, fetchBaseRate, fetchParallelRate } from '../../../modules/rates/fetchers';
import { normalizeAndCompare } from '../../../modules/rates/normalizer';
import { cacheRateSnapshot } from '../../../modules/rates/cache-service';

const RequestSchema = z.object({
  sourceCurrency: z.string().min(3).max(3).toUpperCase().default('GBP'),
  targetCurrency: z.string().min(3).max(3).toUpperCase().default('NGN'),
  amount: z.number().positive().default(500),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = RequestSchema.parse(body);

        const baseRate = await fetchBaseRate(parsed.sourceCurrency, parsed.targetCurrency);
        const rawRates = await fetchAllProviders(parsed);
        const result = normalizeAndCompare(rawRates, parsed.sourceCurrency);
        
        const parallelRateEstimate = await fetchParallelRate(parsed.sourceCurrency, parsed.targetCurrency, baseRate);

        // Persist rate snapshot to Supabase cache (triggers DB webhook → check-price-alerts)
        const currencyPair = `${parsed.sourceCurrency}_${parsed.targetCurrency}`;
        cacheRateSnapshot(
            currencyPair,
            baseRate,
            parallelRateEstimate?.estimatedParallelRate || null,
            parallelRateEstimate?.source || 'jsdelivr'
        ).catch(err => console.error('Cache write failed (non-blocking):', err));

        return NextResponse.json({ 
            baseRate,
            parallelRateEstimate,
            ...result 
        });
    } catch (error: unknown) {
        console.error('API /api/rates Error:', error);
        
        if (error instanceof z.ZodError) {
           return NextResponse.json({ error: 'Invalid request parameters', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMsg, code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
