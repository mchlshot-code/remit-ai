import { NextResponse } from 'next/server';
import { CORRIDORS } from '@/config/seo-corridors';
import { getLiveRates } from '@/lib/seo-helpers';

export async function GET() {
  try {
    const rates = await Promise.all(
      CORRIDORS.slice(0, 8).map(async (c) => {
        try {
          const data = await getLiveRates(c.from, c.to);
          return {
            pair: `${c.from}-${c.to}`,
            rate: data.baseRate,
          };
        } catch {
          return { pair: `${c.from}-${c.to}`, rate: null };
        }
      })
    );

    return NextResponse.json({ rates });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trending rates' }, { status: 500 });
  }
}
