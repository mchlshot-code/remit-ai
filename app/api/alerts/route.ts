import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAlert, getAlertsByEmail, deleteAlert } from '@/modules/alerts/alert-service';

const AlertSchema = z.object({
  email: z.string().email(),
  sourceCurrency: z.string().min(3).max(3),
  targetCurrency: z.string().min(3).max(3),
  targetRate: z.number().positive(),
  currentRate: z.number().positive().optional(),
});

// POST /api/alerts — create a new alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AlertSchema.parse(body);
    const alert = await createAlert(parsed);
    return NextResponse.json(alert, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: error.issues }, { status: 400 });
    }
    const errorMsg = error instanceof Error ? error.message : 'Failed to create alert.';
    return NextResponse.json({ error: errorMsg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

// GET /api/alerts?email=x — list user's active alerts
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email query parameter is required', code: 'VALIDATION_ERROR' }, { status: 400 });
    }
    const alerts = await getAlertsByEmail(email);
    return NextResponse.json({ alerts });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch alerts.';
    return NextResponse.json({ error: errorMsg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

// DELETE /api/alerts?id=x — deactivate an alert
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Alert ID query parameter is required', code: 'VALIDATION_ERROR' }, { status: 400 });
    }
    await deleteAlert(id);
    return NextResponse.json({ success: true, message: 'Alert deactivated' });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to delete alert.';
    return NextResponse.json({ error: errorMsg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
