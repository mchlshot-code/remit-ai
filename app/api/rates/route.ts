import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchAllProviders, fetchBaseRate, fetchParallelRate } from '../../../modules/rates/fetchers';
import { normalizeAndCompare } from '../../../modules/rates/normalizer';
import { NormalizedRatesResponse } from '../../../modules/rates/types';

const RequestSchema = z.object({
  sourceCurrency: z.string().min(3).max(3).toUpperCase().default('GBP'),
  targetCurrency: z.string().min(3).max(3).toUpperCase().default('NGN'),
  amount: z.number().positive().default(500),
});

export async function POST(req: NextRequest): Promise<NextResponse<NormalizedRatesResponse | { error: string; code: string }>> {
    try {
        const body = await req.json();
        const parsed = RequestSchema.parse(body);

        const baseRate = await fetchBaseRate(parsed.sourceCurrency, parsed.targetCurrency);
        const rawRates = await fetchAllProviders(parsed);
        const result = normalizeAndCompare(rawRates, parsed.sourceCurrency);
        
        const parallelRateEstimate = await fetchParallelRate(parsed.sourceCurrency, parsed.targetCurrency, baseRate);

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
