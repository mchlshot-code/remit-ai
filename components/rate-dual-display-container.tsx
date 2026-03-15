'use client';
import { useRatesStore } from '../modules/rates/store';
import { useQueryClient } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '../modules/rates/types';
import { RateDualDisplay } from './rate-dual-display';

export function RateDualDisplayContainer() {
  const { hasSearched, sourceCurrency, targetCurrency, amount } = useRatesStore();
  const queryClient = useQueryClient();

  // Return nothing if user hasn't searched
  if (!hasSearched) return null;

  const queryKey = ['rates', sourceCurrency, targetCurrency, amount];
  const ratesData = queryClient.getQueryData<NormalizedRatesResponse>(queryKey);

  // Return nothing if missing required rate data or currencies aren't matching criteria (GBP -> NGN)
  if (!ratesData || !ratesData.baseRate || !ratesData.parallelRateEstimate || sourceCurrency !== 'GBP' || targetCurrency !== 'NGN') {
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
