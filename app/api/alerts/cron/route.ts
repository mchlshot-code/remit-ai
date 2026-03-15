import { NextResponse } from 'next/server';
import { checkAlerts } from '../../../../modules/alerts/alert-service';

export async function GET(request: Request) {
  // Verify it's from Vercel cron or authenticated if needed
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await checkAlerts();
    return NextResponse.json({ success: true, message: 'Checked alerts successfully' });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
