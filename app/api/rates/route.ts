import { NextResponse } from 'next/server';
import { fetchAllProviders } from '../../../modules/rates/fetchers';
import { normalizeAndCompare } from '../../../modules/rates/normalizer';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source') || 'GBP';
        const target = searchParams.get('target') || 'NGN';
        const amount = parseFloat(searchParams.get('amount') || '200');

        const rawRates = await fetchAllProviders({ sourceCurrency: source, targetCurrency: target, amount });
        const result = normalizeAndCompare(rawRates, source);

        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}
