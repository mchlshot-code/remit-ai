'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftRight, Sparkles, Bell, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { GoogleSignInButton } from './auth/google-sign-in-button';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const handleAlertsClick = async (e: React.MouseEvent) => {
    if (!user && !loading) {
      e.preventDefault();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/alerts`,
        },
      });
    }
  };

  const links = [
    { href: '/', label: 'Compare', icon: ArrowLeftRight },
    { href: '/chat', label: 'AI Assistant', icon: Sparkles },
    { href: '/alerts', label: 'Rate Alerts', icon: Bell, onClick: handleAlertsClick },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex border-b h-16 items-center px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="mr-8 flex items-center">
          <Image 
            src="/logo.png" 
            alt="RemitAI Logo" 
            width={150} 
            height={40} 
            className="h-10 w-auto object-contain mix-blend-screen"
            priority
          />
        </Link>
        <nav className="flex items-center gap-6 flex-1">
          {links.map(({ href, label, icon: Icon, onClick }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClick}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-500 ${
                  isActive ? 'text-emerald-500' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border text-sm font-medium">
                  {user.user_metadata.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="Avatar" 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full border border-emerald-500/20"
                      unoptimized
                    />
                  ) : (
                    <User className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-48">
                <GoogleSignInButton />
              </div>
            )
          )}
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="flex md:hidden border-b h-14 items-center justify-center px-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="RemitAI Logo" 
            width={120} 
            height={32} 
            className="h-8 w-auto object-contain mix-blend-screen"
            priority
          />
        </Link>
        <div className="absolute right-4 flex items-center">
          {user && (
             <button 
                onClick={handleSignOut}
                className="p-2 text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
              </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 items-center grid grid-cols-3 w-full pb-safe md:pb-5">
        {links.map(({ href, label, icon: Icon, onClick }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClick}
              className={`flex flex-col items-center justify-center p-3 gap-1 w-full h-full transition-colors ${
                isActive ? 'text-emerald-500' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-emerald-500/20' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
