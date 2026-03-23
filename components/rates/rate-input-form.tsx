'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { CURRENCY_SYMBOLS } from '@/config/currencies';
import { CurrencyCombobox } from '@/components/rates/currency-combobox';
import { ArrowLeftRight } from 'lucide-react';

const FormSchema = z.object({
  sourceCurrency: z.string().min(3).max(3),
  targetCurrency: z.string().min(3).max(3),
  amount: z.number().positive().min(1),
});

export type RateFormData = z.infer<typeof FormSchema>;

interface Props {
  onSubmit?: (data: RateFormData) => void;
  isLoading?: boolean;
  defaultSource?: string;
  defaultTarget?: string;
}

export function RateInputForm({ onSubmit, isLoading = false, defaultSource = 'GBP', defaultTarget = 'NGN' }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RateFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceCurrency: defaultSource,
      targetCurrency: defaultTarget,
      amount: 500,
    },
  });

  const sourceCurrency = watch('sourceCurrency');
  const targetCurrency = watch('targetCurrency');
  const currencySymbol = CURRENCY_SYMBOLS[sourceCurrency] || sourceCurrency;

  const handleSwap = (): void => {
    const currentSource = sourceCurrency;
    const currentTarget = targetCurrency;
    setValue('sourceCurrency', currentTarget);
    setValue('targetCurrency', currentSource);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit((data) => {
        if (onSubmit) {
          onSubmit(data);
        } else {
          // Default behavior: redirect to compare page
          window.location.href = `/compare/${data.sourceCurrency.toLowerCase()}-to-${data.targetCurrency.toLowerCase()}?amount=${data.amount}`;
        }
      })}
      className="w-full max-w-lg bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-5 md:p-8 mb-8 md:mb-16 flex flex-col gap-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Row 1: From | Swap | To */}
      <div className="flex items-end gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <CurrencyCombobox
            value={sourceCurrency}
            onChange={(code) => setValue('sourceCurrency', code)}
            label="From"
            disabled={isLoading}
          />
        </div>
        
        {/* Swap Button */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 mb-0.5 rounded-full border-2 border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-emerald-500/40 active:scale-90 flex items-center justify-center transition-all disabled:opacity-50"
          aria-label="Swap currencies"
        >
          <ArrowLeftRight className="w-4 h-4 text-slate-500" />
        </button>
        
        <div className="flex-1 min-w-0">
          <CurrencyCombobox
            value={targetCurrency}
            onChange={(code) => setValue('targetCurrency', code)}
            label="To"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Row 2: Amount */}
      <div className="w-full">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 px-1 block">Amount to Send</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-500/50">{currencySymbol}</span>
          <input 
            type="number"
            disabled={isLoading}
            {...register('amount', { valueAsNumber: true })}
            className={`w-full h-16 pl-12 pr-5 rounded-2xl border bg-slate-950 text-white text-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${errors.amount ? 'border-destructive' : 'border-slate-800'}`}
            placeholder="0.00"
          />
        </div>
        {errors.amount && <span className="text-xs text-destructive mt-2 px-1 block">{errors.amount.message}</span>}
      </div>
      
      {/* Row 3: Button */}
      <button 
        type="submit"
        disabled={isLoading}
        className="h-16 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-lg transition-all w-full mt-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Compare Live Rates'
        )}
      </button>
    </motion.form>
  );
}
