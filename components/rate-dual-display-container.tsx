'use client';
import { useRatesStore } from '../modules/rates/store';
import { useQueryClient } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '../modules/rates/types';
import { RateDualDisplay } from './rate-dual-display';
import { Info } from 'lucide-react';

export function RateDualDisplayContainer() {
  const { hasSearched, sourceCurrency, targetCurrency, amount } = useRatesStore();
  const queryClient = useQueryClient();

  // Return nothing if user hasn't searched
  if (!hasSearched) return null;

  const queryKey = ['rates', sourceCurrency, targetCurrency, amount];
  const ratesData = queryClient.getQueryData<NormalizedRatesResponse>(queryKey);

  // Check if NGN is on either side
  const isNgnCorridor = sourceCurrency === 'NGN' || targetCurrency === 'NGN';

  // If rates data exists but this is NOT an NGN corridor, show official-only note
  if (!isNgnCorridor && ratesData?.baseRate) {
    return (
      <div className="bg-card border rounded-xl p-4 mb-8 flex items-start gap-3 max-w-lg mx-auto">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Parallel market data available for NGN corridors only. 
          Showing the official mid-market rate for {sourceCurrency} → {targetCurrency}.
        </p>
      </div>
    );
  }

  // Return nothing if missing required rate data for NGN corridor
  if (!ratesData || !ratesData.baseRate || !ratesData.parallelRateEstimate) {
    return null;
  }

  return (
    <RateDualDisplay 
      officialRate={ratesData.baseRate}
      parallelEstimate={ratesData.parallelRateEstimate}
      sourceCurrency={sourceCurrency}
      targetCurrency={targetCurrency}
    />
  );
}
