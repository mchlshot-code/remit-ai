'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RateInputForm, RateFormData } from '@/components/rates/rate-input-form';
import { ComparisonTable } from '@/components/rates/comparison-table';
import { useQuery } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '@/modules/rates/types';

export default function LandingPage() {
  const [requestData, setRequestData] = useState<RateFormData | null>(null);

  const { data, isLoading, error } = useQuery<NormalizedRatesResponse, Error>({
    queryKey: ['rates', requestData],
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
    enabled: !!requestData, // Only run the query if we have form data submitted
  });

  const onSubmit = (formData: RateFormData) => {
    setRequestData(formData);
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
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Compare live official rates with estimated parallel market reality. So you can ensure your family receives exactly what they deserve.
          </p>
        </motion.div>

        <RateInputForm onSubmit={onSubmit} isLoading={isLoading} />
        
        {/* Render Results when not empty, otherwise keep UI clean */}
        {(requestData || isLoading || error) && (
            <ComparisonTable 
              data={data || null} 
              isLoading={isLoading} 
              error={error?.message || null} 
            />
        )}
      </section>
    </main>
  );
}
