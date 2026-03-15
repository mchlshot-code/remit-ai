'use client';

import { createClient } from '@/lib/supabase/client';
import { Chrome } from 'lucide-react';
import { useState } from 'react';

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full h-12 px-6 rounded-xl bg-background border hover:bg-muted font-semibold transition-all shadow-sm disabled:opacity-50"
    >
      <Chrome className="w-5 h-5 text-emerald-500" />
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </button>
  );
}
