'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RateInputForm, RateFormData } from '@/components/rates/rate-input-form';
import { ComparisonTable } from '@/components/rates/comparison-table';
import { useQuery } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '@/modules/rates/types';
import { useRatesStore } from '@/modules/rates/store';
import { RateDualDisplayContainer } from '@/components/rate-dual-display-container';
import { Flag } from '@/components/ui/flag';
import { CURRENCY_TO_COUNTRY } from '@/lib/constants';

interface Props {
  from: string;
  to: string;
  toCountry: string;
}

export function CompareClient({ from, to, toCountry }: Props) {
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
    <div className="w-full flex flex-col items-center">
      {/* Hero Section - Mirrored from landing page */}
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
          <h1 className="font-display hero-heading font-extrabold tracking-tight mb-6 text-balance px-4 text-center items-center justify-center gap-3 flex flex-wrap">
             Send <Flag countryCode={CURRENCY_TO_COUNTRY[from]} size={32} /> {from} to {toCountry} — <span className="text-emerald-500">Compare Live Rates</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-sm md:max-w-2xl mx-auto mb-8 px-5 md:px-0">
            Live rates from multiple providers · Updated 30 mins ago
          </p>
        </motion.div>

        <RateInputForm 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
          defaultSource={from}
          defaultTarget={to}
        />
        
        <RateDualDisplayContainer />

        {/* Comparison table populates when user clicks Compare Live Rates */}
        {(requestData || isLoading || error) && (
          <div className="w-full flex flex-col items-center gap-12 mt-8">
            <ComparisonTable 
              data={data || null} 
              isLoading={isLoading} 
              error={error?.message || null} 
              sourceCurrency={requestData?.sourceCurrency || from}
              targetCurrency={requestData?.targetCurrency || to}
            />
          </div>
        )}
      </section>
    </div>
  );
}
