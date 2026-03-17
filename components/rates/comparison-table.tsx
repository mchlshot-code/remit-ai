'use client';

import { motion, Variants } from 'framer-motion';
import { NormalizedRatesResponse } from '@/modules/rates/types';
import { CURRENCY_SYMBOLS } from '@/config/providers';

interface Props {
  data: NormalizedRatesResponse | null;
  isLoading: boolean;
  error: string | null;
  sourceCurrency: string;
  targetCurrency: string;
}

export function ComparisonTable({ data, isLoading, error, sourceCurrency, targetCurrency }: Props) {
  const srcSymbol = CURRENCY_SYMBOLS[sourceCurrency] || sourceCurrency;
  const tgtSymbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (error) {
    return (
      <div className="w-full max-w-3xl p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-center">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || !data.rates.length) {
    return null; // Initial state or empty results
  }

  return (
    <div className="w-full max-w-3xl text-left">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Live Comparison</h2>
        <span className="text-sm text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1 rounded-full">
          {data.savingsMessage || 'Live results'}
        </span>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {data.rates.map((provider) => (
          <motion.div 
            key={provider.provider}
            variants={item}
            className={`relative overflow-hidden rounded-2xl border bg-card p-5 md:p-6 transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer ${provider.isBestRate ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              const slug = provider.provider.toLowerCase().replace(/\s+/g, '');
              window.open(`/go/${slug}?corridor=${sourceCurrency}-${targetCurrency}`, '_blank');
            }}
          >
            {provider.isBestRate && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                Highest Return
              </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Provider Info */}
              <div className="flex items-center gap-4 w-48">
                {/* Fallback avatar if logo fails or is internal string */}
                <div className="w-12 h-12 rounded-full border bg-background flex flex-shrink-0 items-center justify-center font-bold text-lg text-emerald-600 shadow-sm overflow-hidden">
                   {provider.provider[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{provider.provider}</h3>
                  <p className="text-sm text-muted-foreground">{provider.transferSpeed}</p>
                </div>
              </div>

              {/* Dual Rate Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Provider Rate:</span>
                  <span className="font-semibold">{srcSymbol}1 = {tgtSymbol}{provider.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                {/* Parallel Market Insight */}
                {data.parallelRateEstimate && (
                   <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2 py-1.5 rounded-md inline-flex items-center gap-1.5 mt-1 border border-amber-500/20">
                     <span>Street Est: ~{tgtSymbol}{data.parallelRateEstimate.estimatedParallelRate.toLocaleString()} ({data.parallelRateEstimate.premiumPercent}% gap)</span>
                     <div className="w-4 h-4 rounded-full bg-amber-500/20 flex flex-shrink-0 items-center justify-center cursor-help" title={data.parallelRateEstimate.disclaimer}>
                       i
                     </div>
                   </div>
                )}
              </div>

              {/* Receive Amount & CTA */}
              <div className="text-left md:text-right">
                <div className="text-sm text-muted-foreground mb-1">Recipient Gets</div>
                <div className="font-display text-2xl font-bold text-emerald-500 mb-2">
                  {tgtSymbol}{provider.receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  Fee: {srcSymbol}{provider.fee.toFixed(2)} included
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
