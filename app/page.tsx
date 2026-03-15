'use client';

import { useState } from 'react';
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

export default function LandingPage() {
  const { 
    setHasSearched, 
    setSourceCurrency, 
    setTargetCurrency, 
    setAmount 
  } = useRatesStore();
  
  const [requestData, setRequestData] = useState<RateFormData | null>(null);

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

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-6">
            Live Rates. Zero Hidden Agendas.
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-balance">
            Send Money Smarter. <span className="text-emerald-500">Understand the Real Value.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
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
            
            {data && data.rates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <div className="w-full h-px bg-border max-w-3xl mx-auto mb-12" />
                <RateAlertForm />
              </motion.div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
