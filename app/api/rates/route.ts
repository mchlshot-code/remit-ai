import { NextResponse, NextRequest } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { z } from 'zod';
import { fetchAllProviders, fetchBaseRate, fetchParallelRate } from '../../../modules/rates/fetchers';
import { normalizeAndCompare } from '../../../modules/rates/normalizer';
import { cacheRateSnapshot } from '../../../modules/rates/cache-service';
import { VALID_CURRENCY_CODES } from '../../../config/currencies';

const currencyCodeSchema = z.string().min(3).max(3).transform(v => v.toUpperCase()).refine(
    (code) => VALID_CURRENCY_CODES.has(code),
    { message: 'Unsupported currency code' }
);

const RequestSchema = z.object({
    sourceCurrency: currencyCodeSchema.default('GBP'),
    targetCurrency: currencyCodeSchema.default('NGN'),
    amount: z.number().positive().default(500),
});

const QuerySchema = z.object({
    from: currencyCodeSchema,
    to: currencyCodeSchema,
    amount: z.string().optional().default('500').transform(Number).pipe(z.number().positive()),
});

async function handleRateRequest(sourceCurrency: string, targetCurrency: string, amount: number): Promise<NextResponse> {
    const baseRate = await fetchBaseRate(sourceCurrency, targetCurrency);
    
    if (baseRate === null) {
        return NextResponse.json({
            error: `Exchange rate not available for ${sourceCurrency} → ${targetCurrency}`,
            code: 'RATE_NOT_FOUND'
        }, { status: 404 });
    }

    const rawRates = await fetchAllProviders({ sourceCurrency, targetCurrency, amount });
    const result = normalizeAndCompare(rawRates, sourceCurrency);
    
    // Only fetch parallel rate when NGN is involved
    const isNgnCorridor = sourceCurrency === 'NGN' || targetCurrency === 'NGN';
    const parallelRateEstimate = isNgnCorridor 
        ? await fetchParallelRate(sourceCurrency, targetCurrency, baseRate) 
        : undefined;

    // Persist rate snapshot to Supabase cache (triggers DB webhook → check-price-alerts)
    const currencyPair = `${sourceCurrency}_${targetCurrency}`;
    waitUntil(
        cacheRateSnapshot(
            currencyPair,
            baseRate,
            parallelRateEstimate?.estimatedParallelRate || null,
            parallelRateEstimate?.source || 'jsdelivr'
        ).catch(err => console.error('Cache write failed (non-blocking):', err))
    );

    return NextResponse.json({ 
        baseRate,
        parallelRateEstimate,
        ...result 
    });
}

/** GET /api/rates?from=NGN&to=GBP&amount=50000 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const parsed = QuerySchema.parse({
            from: searchParams.get('from'),
            to: searchParams.get('to'),
            amount: searchParams.get('amount') || '500',
        });

        return handleRateRequest(parsed.from, parsed.to, parsed.amount);
    } catch (error: unknown) {
        console.error('API GET /api/rates Error:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request parameters', code: 'VALIDATION_ERROR', details: error.issues }, { status: 400 });
        }
        
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMsg, code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}

/** POST /api/rates — existing endpoint, preserved for backwards compatibility */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const parsed = RequestSchema.parse(body);

        return handleRateRequest(parsed.sourceCurrency, parsed.targetCurrency, parsed.amount);
    } catch (error: unknown) {
        console.error('API POST /api/rates Error:', error);
        
        if (error instanceof z.ZodError) {
           return NextResponse.json({ error: 'Invalid request parameters', code: 'VALIDATION_ERROR' }, { status: 400 });
        }
        
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMsg, code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
