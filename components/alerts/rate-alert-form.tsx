'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '@/modules/rates/types';
import { Bell, User as UserIcon } from 'lucide-react';
import { useRatesStore } from '@/modules/rates/store';
import { CURRENCY_SYMBOLS } from '@/config/currencies';
import { CurrencyCombobox } from '@/components/rates/currency-combobox';
import Image from 'next/image';

import { toast } from 'sonner';
import { Alert } from './alerts-manager';
import { User } from '@supabase/supabase-js';

const AlertSchema = z.object({
  targetRate: z.number().min(0.01, 'Target rate must be positive'),
});

type AlertFormData = z.infer<typeof AlertSchema>;

interface RateAlertFormProps {
  user: User;
  onAlertCreated?: (alert: Alert) => void;
}

export function RateAlertForm({ user, onAlertCreated }: RateAlertFormProps) {
  const { sourceCurrency: storeSource, targetCurrency: storeTarget } = useRatesStore();
  
  const [sourceCurrency, setSourceCurrency] = useState(storeSource || 'GBP');
  const [targetCurrency, setTargetCurrency] = useState(storeTarget || 'NGN');

  const srcSymbol = CURRENCY_SYMBOLS[sourceCurrency] || sourceCurrency;
  const tgtSymbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AlertFormData>({
    resolver: zodResolver(AlertSchema),
    defaultValues: { targetRate: 1000 }
  });

  const { data: latestRates, isLoading: ratesLoading } = useQuery<NormalizedRatesResponse, Error>({
    queryKey: ['latest_rates_alerts', sourceCurrency, targetCurrency],
    queryFn: async () => {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCurrency, targetCurrency, amount: 100 })
      });
      if (!res.ok) throw new Error('Failed to fetch rates');
      return res.json();
    },
    staleTime: 600000,
  });

  const currentBestRate = latestRates?.rates?.[0]?.exchangeRate || 0;

  const onSubmit = async (data: AlertFormData) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRate: data.targetRate,
          email: user.email,
          sourceCurrency,
          targetCurrency,
        })
      });
      
      if (!res.ok) {
        toast.error('Failed to create alert');
        throw new Error('Failed to create alert');
      }

      const alertData = await res.json();
      onAlertCreated?.(alertData);
      
      toast.success(`Alert set! We'll email you when the rate hits ${tgtSymbol}${data.targetRate}`);
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="w-full">
      {/* Target Setup */}
      <motion.div 
        className="bg-card border rounded-3xl p-6 md:p-10 shadow-lg shadow-emerald-500/5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Create Rate Alert</h2>
            <p className="text-sm text-muted-foreground font-medium">{sourceCurrency} to {targetCurrency}</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 mb-8 flex items-center justify-between border-2 border-dashed">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">CURRENT BEST RATE</div>
              <div className="text-3xl font-display font-bold text-emerald-500">
                {ratesLoading ? <span className="animate-pulse">...</span> : `${srcSymbol}1 = ${tgtSymbol}${currentBestRate.toLocaleString()}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">STATUS</div>
              <div className="text-sm font-bold text-emerald-500 flex items-center justify-end gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyCombobox 
                label="SEND FROM"
                value={sourceCurrency}
                onChange={setSourceCurrency}
              />

              <CurrencyCombobox 
                label="SEND TO"
                value={targetCurrency}
                onChange={setTargetCurrency}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 block">Target Rate ({tgtSymbol})</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-muted-foreground font-bold group-focus-within:text-emerald-500 transition-colors">{tgtSymbol}</span>
                  <input 
                    {...register('targetRate', { valueAsNumber: true })}
                    type="number" 
                    step="any"
                    placeholder="0.00"
                    className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 bg-background focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-xl"
                  />
                </div>
                {errors.targetRate && <p className="text-red-500 text-xs font-bold mt-2 px-1">{errors.targetRate.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Logged in as</div>
                <div className="flex items-center gap-3 h-14 px-4 bg-muted/30 border-2 rounded-2xl w-full">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center overflow-hidden border border-emerald-500/20">
                    {avatarUrl && !avatarError ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Avatar" 
                        width={32} 
                        height={32} 
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground/80 truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
          >
            {isSubmitting ? 'Setting Alert...' : 'Notify Me'}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
