import { NextRequest, NextResponse } from 'next/server';
import { AFFILIATE_LINKS, FALLBACK_URL } from '@/lib/affiliate-config';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteParams {
  params: {
    provider: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { provider } = params;
  const searchParams = request.nextUrl.searchParams;
  const corridor = searchParams.get('corridor');

  // 1. Resolve Provider Link
  const targetUrl = AFFILIATE_LINKS[provider.toLowerCase()] || FALLBACK_URL;

  // 2. Log Click Asynchronously
  // We use supabaseAdmin to bypass RLS for server-side logging.
  // We don't block the redirect for the log insertion failure.
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // We await this to ensure it's processed in the serverless function environment
    // but we wrap in try/catch to avoid crashing the redirect.
    await supabaseAdmin
      .from('affiliate_clicks')
      .insert({
        provider: provider.toLowerCase(),
        corridor: corridor || 'unknown',
        ip_address: ipAddress,
        user_agent: userAgent,
      });
  } catch (error) {
    console.error('Failed to log affiliate click:', error);
  }

  // 3. Redirect
  return NextResponse.redirect(targetUrl, 302);
}
