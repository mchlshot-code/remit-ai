import { NextResponse } from 'next/server';
import { fetchProviderRates } from '../../../modules/rates/fetchers';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source') || 'USD';
        const target = searchParams.get('target') || 'INR';

        // Stub: fetch and normalize rates
        const rates = await fetchProviderRates('all');

        return NextResponse.json({ success: true, rates });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
