import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAlert, getUserAlerts, deleteAlert } from '../../../modules/alerts/alert-service';

const CreateAlertSchema = z.object({
  email: z.string().email(),
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  targetRate: z.number().positive(),
  currentRate: z.number().positive()
});

export async function POST(req: NextRequest) {
  try {
    const body = CreateAlertSchema.parse(await req.json());
    const alert = await createAlert(body);
    return NextResponse.json({ success: true, alert });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email parameter is required' }, { status: 400 });
    }

    const alerts = await getUserAlerts(email);
    return NextResponse.json({ success: true, alerts });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Alert ID is required' }, { status: 400 });
    }

    await deleteAlert(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
