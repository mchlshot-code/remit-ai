'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '@/modules/rates/types';
import { Bell, ShieldCheck, Info, Trash2, Loader2 } from 'lucide-react';
import { useRatesStore } from '@/modules/rates/store';
import { CURRENCY_SYMBOLS } from '@/config/providers';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';

const AlertSchema = z.object({
  targetRate: z.number().min(1, 'Target rate must be positive'),
});

type AlertFormData = z.infer<typeof AlertSchema>;

export function RateAlertForm() {
  const { sourceCurrency, targetCurrency } = useRatesStore();
  const srcSymbol = CURRENCY_SYMBOLS[sourceCurrency] || sourceCurrency;
  const tgtSymbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<{id: string, rate: number, source: string, target: string}[]>([
    // Removed the dummy alert as it might be confusing if they change corridors.
    // In a real app this would be fetched from the DB based on the email.
  ]);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setUserLoading(false);
    });
  }, [supabase]);
  
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
    if (!user) return;
    try {
      setSuccessMsg(null);
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
      
      if (!res.ok) throw new Error('Failed to create alert');
      
      setSuccessMsg(`Alert set! We'll email you when the rate hits ${tgtSymbol}${data.targetRate}`);
      setActiveAlerts(prev => [...prev, { id: Math.random().toString(), rate: data.targetRate, source: sourceCurrency, target: targetCurrency }]);
      reset();
      
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const removeAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {/* Target Setup */}
      <motion.div 
        className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Create Rate Alert</h2>
            <p className="text-sm text-muted-foreground">{sourceCurrency} to {targetCurrency}</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 mb-6 flex items-center justify-between border">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Current Best Rate</div>
              <div className="text-xl font-bold">
                {ratesLoading ? <span className="animate-pulse">Loading...</span> : `${srcSymbol}1 = ${tgtSymbol}${currentBestRate.toLocaleString()}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</div>
              <div className="text-sm font-medium text-emerald-500 flex items-center justify-end gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5 mb-2">
            <div className="text-sm font-medium">Logged in as</div>
            <div className="text-sm text-muted-foreground px-4 py-2 bg-muted/50 border rounded-xl w-full">
              {user?.email}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Target Rate ({tgtSymbol})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{tgtSymbol}</span>
                <input 
                  {...register('targetRate', { valueAsNumber: true })}
                  type="number" 
                  step="any"
                  className="w-full h-12 pl-8 pr-4 rounded-xl border bg-background focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>
              {errors.targetRate && <p className="text-red-500 text-xs mt-1">{errors.targetRate.message}</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-12 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm"
          >
            {isSubmitting ? 'Setting Alert...' : 'Notify Me'}
          </button>
        </form>

        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Active Alerts */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold px-1">Active Alerts</h3>
        <AnimatePresence>
          {activeAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-8 text-muted-foreground text-sm border dashed rounded-xl"
            >
              No active alerts yet.
            </motion.div>
          ) : (
            activeAlerts.map(alert => {
              const alertTgtSymbol = CURRENCY_SYMBOLS[alert.target] || alert.target;
              return (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className="bg-card border rounded-xl p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{alert.source} to {alert.target}</div>
                    <div className="font-bold text-lg">Target: {alertTgtSymbol}{alert.rate.toLocaleString()}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
