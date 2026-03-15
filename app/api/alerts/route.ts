import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RateAlertRequest } from '@/modules/alerts/types';

const AlertSchema = z.object({
  email: z.string().email(),
  sourceCurrency: z.string().min(3).max(3),
  targetCurrency: z.string().min(3).max(3),
  targetRate: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AlertSchema.parse(body) as RateAlertRequest;

    // TODO: Insert into Supabase 'alerts' table when DB is connected.
    // For now, mock a successful save and return a fake ID with the data
    const mockCreatedAlert = {
      id: Math.random().toString(36).substring(7),
      ...parsed,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    return NextResponse.json(mockCreatedAlert, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create alert.' }, { status: 500 });
  }
}
