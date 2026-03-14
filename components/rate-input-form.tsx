'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRatesStore } from '../modules/rates/store';
import { Button } from './ui/button';
import { Input } from './ui/input';

const formSchema = z.object({
    sourceCurrency: z.string().min(3),
    targetCurrency: z.string().min(3),
    amount: z.number().min(1, 'Amount must be greater than 0'),
});

export function RateInputForm() {
    const { sourceCurrency, targetCurrency, amount, setSourceCurrency, setTargetCurrency, setAmount, setHasSearched } = useRatesStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sourceCurrency,
            targetCurrency,
            amount,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setSourceCurrency(values.sourceCurrency);
        setTargetCurrency(values.targetCurrency);
        setAmount(values.amount);
        setHasSearched(true);
    }

    const currentSource = form.watch('sourceCurrency');
    const currencySymbol = currentSource === 'GBP' ? '£' : currentSource === 'USD' ? '$' : '€';

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end w-full max-w-4xl mx-auto bg-white p-4 rounded-xl border">
            <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-1 block text-gray-700">From</label>
                <select
                    {...form.register('sourceCurrency')}
                    className="w-full border rounded-md h-10 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="GBP">🇬🇧 United Kingdom (GBP)</option>
                    <option value="USD">🇺🇸 United States (USD)</option>
                    <option value="EUR">🇪🇺 Eurozone (EUR)</option>
                </select>
            </div>

            <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-1 block text-gray-700">To</label>
                <select
                    {...form.register('targetCurrency')}
                    className="w-full border rounded-md h-10 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="NGN">🇳🇬 Nigeria (NGN)</option>
                    <option value="KES">🇰🇪 Kenya (KES)</option>
                    <option value="INR">🇮🇳 India (INR)</option>
                </select>
            </div>

            <div className="flex-1 w-full relative">
                <label className="text-sm font-medium mb-1 block text-gray-700">Amount</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                        {currencySymbol}
                    </span>
                    <Input
                        type="number"
                        {...form.register('amount', { valueAsNumber: true })}
                        className="pl-8 h-10"
                        min="1"
                        step="any"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full md:w-auto h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Compare Rates
            </Button>
        </form>
    );
}
