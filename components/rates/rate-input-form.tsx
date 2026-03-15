'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';

const FormSchema = z.object({
  sourceCurrency: z.string().min(3).max(3),
  targetCurrency: z.string().min(3).max(3),
  amount: z.number().positive().min(1),
});

export type RateFormData = z.infer<typeof FormSchema>;

interface Props {
  onSubmit: (data: RateFormData) => void;
  isLoading: boolean;
}

export function RateInputForm({ onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<RateFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceCurrency: 'GBP',
      targetCurrency: 'NGN',
      amount: 500,
    },
  });

  return (
    <motion.form 
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-3xl bg-card border shadow-sm rounded-2xl p-4 md:p-6 mb-16 flex flex-col md:flex-row gap-4 items-start md:items-end"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex-1 w-full">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">You Send (GBP)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium">£</span>
          <input 
            type="number"
            disabled={isLoading}
            {...register('amount', { valueAsNumber: true })}
            className={`w-full h-14 pl-10 pr-4 rounded-xl border bg-background text-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${errors.amount ? 'border-destructive' : 'border-border'}`}
          />
        </div>
        {errors.amount && <span className="text-xs text-destructive mt-1 block">{errors.amount.message}</span>}
      </div>
      
      <div className="flex-1 w-full hidden md:block">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Recipient Gets (NGN)</label>
        <div className="h-14 flex items-center px-4 rounded-xl border border-transparent bg-muted/50 text-xl font-medium text-muted-foreground">
          Auto-calculated
        </div>
      </div>
      
      <button 
        type="submit"
        disabled={isLoading}
        className="h-14 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold transition-all w-full md:w-auto mt-4 md:mt-0 shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[160px]"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Compare Live'
        )}
      </button>
    </motion.form>
  );
}
