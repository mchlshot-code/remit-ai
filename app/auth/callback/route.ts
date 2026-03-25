import { NextResponse } from 'next/server';
// The client you created in Step 3
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/alerts';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before Vercel proxy
      
      if (isLocalEnv) {
        // we can be sure that origin is http://localhost:3000
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error('Auth code exchange failed:', error);
    }
  } else {
    console.warn('Auth callback hit without code');
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
