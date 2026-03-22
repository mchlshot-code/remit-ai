'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { RateInputForm, RateFormData } from '@/components/rates/rate-input-form';
import { ComparisonTable } from '@/components/rates/comparison-table';
import { useQuery } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '@/modules/rates/types';
import { useRatesStore } from '@/modules/rates/store';
import { RateDualDisplayContainer } from '@/components/rate-dual-display-container';
import { RateAlertForm } from '@/components/alerts/rate-alert-form';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { CORRIDORS } from '@/config/seo-corridors';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Flag } from '@/components/ui/flag';
import { CURRENCY_TO_COUNTRY } from '@/lib/constants';

export default function Home() {
  const { 
    sourceCurrency,
    targetCurrency,
    setHasSearched, 
    setSourceCurrency, 
    setTargetCurrency, 
    setAmount 
  } = useRatesStore();
  
  const [requestData, setRequestData] = useState<RateFormData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setUserLoading(false);
    });
  }, [supabase]);

  const { data, isLoading, error } = useQuery<NormalizedRatesResponse, Error>({
    queryKey: ['rates', requestData?.sourceCurrency, requestData?.targetCurrency, requestData?.amount],
    queryFn: async () => {
      if (!requestData) return { rates: [], savingsMessage: null };
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.error || 'Failed to fetch rates');
      }
      return res.json();
    },
    enabled: !!requestData,
  });

  const onSubmit = (formData: RateFormData) => {
    setRequestData(formData);
    setHasSearched(true);
    setSourceCurrency(formData.sourceCurrency);
    setTargetCurrency(formData.targetCurrency);
    setAmount(formData.amount);
  };

  const handleAlertsSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/alerts`,
      },
    });
  };

  const { data: trendingRates } = useQuery<{ rates: { pair: string; rate: number | null }[] }>({
    queryKey: ['trending-rates'],
    queryFn: () => fetch('/api/rates/trending').then(res => res.json()),
    refetchInterval: 1800000, // 30 mins
  });

  const validCorridors = useMemo(() => {
    if (!trendingRates?.rates) return [];
    
    const africanCurrencies = ['NGN', 'KES', 'GHS', 'ZAR', 'EGP'];
    const priorityOrder = ['GBP-NGN', 'USD-NGN', 'CAD-NGN', 'EUR-NGN'];

    const filtered = CORRIDORS.filter(corridor => {
      // 1. Filter out African origins
      if (africanCurrencies.includes(corridor.from)) return false;

      // 2. Filter out broken/null rates
      const rateInfo = trendingRates.rates.find(r => r.pair === `${corridor.from}-${corridor.to}`);
      if (!rateInfo || !rateInfo.rate || rateInfo.rate <= 0) return false;

      return true;
    });

    // 3. Enforce priority sorting
    return filtered.sort((a, b) => {
      const pairA = `${a.from}-${a.to}`;
      const pairB = `${b.from}-${b.to}`;
      
      const indexA = priorityOrder.indexOf(pairA);
      const indexB = priorityOrder.indexOf(pairB);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return pairA.localeCompare(pairB);
    });
  }, [trendingRates]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-5 pt-20 pb-10 md:pb-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-6">
            Live Rates. Zero Hidden Agendas.
          </span>
          <h1 className="font-display hero-heading font-extrabold tracking-tight mb-6 text-balance px-4 text-center">
            Send Money Smarter. <span className="text-emerald-500">Understand the Real Value.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-sm md:max-w-2xl mx-auto mb-8 px-5 md:px-0">
            Compare live official rates with estimated parallel market reality. So you can ensure your family receives exactly what they deserve.
          </p>
          <div className="flex justify-center mb-10">
            <Link 
              href="/chat" 
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-semibold transition-colors gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Assistant &rarr;
            </Link>
          </div>
        </motion.div>

        {/* Popular Corridors Section */}
        <div className="w-full mb-20">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-bold text-foreground">Compare Live Rates by Corridor</h2>
            <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live Updates
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
            {validCorridors.map((corridor) => {
              const rateInfo = trendingRates?.rates.find(r => r.pair === `${corridor.from}-${corridor.to}`);
              return (
                <Link 
                  key={`${corridor.from}-${corridor.to}`}
                  href={`/compare/${corridor.from.toLowerCase()}-to-${corridor.to.toLowerCase()}`}
                  className="group bg-card border rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between h-full min-h-[160px] text-center"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-center gap-2 text-lg font-bold w-full mb-1">
                       <Flag countryCode={CURRENCY_TO_COUNTRY[corridor.from]} size={28} />
                       <span>{corridor.from}</span>
                       <span className="text-muted-foreground/30 font-light">→</span>
                       <Flag countryCode={CURRENCY_TO_COUNTRY[corridor.to]} size={28} />
                       <span>{corridor.to}</span>
                    </div>
                    
                    <p className="truncate text-sm text-gray-400 mt-1 block w-full">
                      {corridor.fromCountry} to {corridor.toCountry}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border w-full">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
                      Market Rate
                    </p>
                    <p className="text-lg font-black text-emerald-600 whitespace-nowrap">
                      1 {corridor.from} = {rateInfo?.rate ? rateInfo.rate.toFixed(2) : '---'} {corridor.to}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <RateInputForm onSubmit={onSubmit} isLoading={isLoading} />
        
        <RateDualDisplayContainer />

        {/* Render Results when not empty, otherwise keep UI clean */}
        {(requestData || isLoading || error) && (
          <div className="w-full flex flex-col items-center gap-12 mt-8">
            <ComparisonTable 
              data={data || null} 
              isLoading={isLoading} 
              error={error?.message || null} 
              sourceCurrency={requestData?.sourceCurrency || 'GBP'}
              targetCurrency={requestData?.targetCurrency || 'NGN'}
            />
            
            {data && data.rates.length > 0 && !userLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full flex flex-col items-center"
              >
                <div className="w-full h-px bg-border max-w-3xl mx-auto mb-12" />
                
                {user ? (
                  <RateAlertForm userEmail={user.email!} />
                ) : (
                  <div className="w-full max-w-2xl bg-card border rounded-3xl p-8 text-center shadow-lg">
                    <h3 className="text-2xl font-display font-bold mb-4">Never Miss a Peak Rate</h3>
                    <p className="text-muted-foreground mb-8">
                      Sign in with Google to set custom alerts and get notified the moment {sourceCurrency} to {targetCurrency} hits your target.
                    </p>
                    <button 
                      onClick={handleAlertsSignIn}
                      className="inline-flex h-14 px-8 items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                    >
                      Get Started with Rate Alerts
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
