'use client';
import { useQuery } from '@tanstack/react-query';
import { useRatesStore } from '../modules/rates/store';
import { NormalizedRatesResponse, RateResult } from '../modules/rates/types';
import { BestPickBadge } from './best-pick-badge';

export function ComparisonTable({ 
    initialRates, 
    sourceCurrency: propSource, 
    targetCurrency: propTarget, 
    amount: propAmount 
}: { 
    initialRates?: RateResult[]; 
    sourceCurrency?: string; 
    targetCurrency?: string; 
    amount?: number; 
} = {}) {
    const store = useRatesStore();
    
    // Use props if provided, otherwise fallback to store
    const sourceCurrency = propSource || store.sourceCurrency;
    const targetCurrency = propTarget || store.targetCurrency;
    const amount = propAmount || store.amount;
    const hasSearched = initialRates ? true : store.hasSearched;

    const { data, isLoading, error } = useQuery<NormalizedRatesResponse>({
        queryKey: ['rates', sourceCurrency, targetCurrency, amount],
        queryFn: async () => {
            const res = await fetch(`/api/rates?source=${sourceCurrency}&target=${targetCurrency}&amount=${amount}`);
            if (!res.ok) throw new Error('Failed to fetch rates');
            return res.json();
        },
        enabled: !initialRates && hasSearched
    });

    // If we have initial rates, wrap them in the expected response structure
    const displayData = initialRates 
        ? { rates: initialRates, savingsMessage: null } as NormalizedRatesResponse
        : data;

    if (!hasSearched) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !displayData || !displayData.rates) {
        return <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg mt-8 border border-red-100">Failed to load comparison data. Please try again.</div>;
    }

    return (
        <div className="w-full flex flex-col gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {displayData.savingsMessage && (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center font-medium border border-green-200 shadow-sm transition-all hover:shadow-md">
                    🎉 {displayData.savingsMessage}
                </div>
            )}

            <div className="grid gap-4">
                {displayData.rates.map((rate) => (
                    <div
                        key={rate.provider}
                        className={`flex flex-col md:flex-row items-center justify-between p-5 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all relative ${rate.isBestRate ? 'border-green-500 bg-green-50/10' : 'border-transparent border-gray-100 hover:border-blue-100'}`}
                    >
                        {rate.isBestRate && (
                            <div className="absolute -top-3 left-6">
                                <BestPickBadge />
                            </div>
                        )}

                        {/* Logo and Provider Info */}
                        <div className="flex items-center gap-4 w-full md:w-1/4 mb-4 md:mb-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${rate.isBestRate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {rate.provider[0]}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{rate.provider}</h3>
                                <p className="text-sm text-gray-500">{rate.transferSpeed}</p>
                            </div>
                        </div>

                        {/* Rate Details */}
                        <div className="w-full md:w-2/4 grid grid-cols-2 md:grid-cols-3 gap-6 mb-4 md:mb-0 text-sm md:text-base">
                            <div className="flex flex-col justify-center">
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Rate</p>
                                <p className="font-medium text-gray-900">1 = {rate.exchangeRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Fee</p>
                                <p className="font-medium text-gray-900">{rate.fee === 0 ? 'Free' : rate.fee.toFixed(2)}</p>
                            </div>
                            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-3 md:pt-0 flex flex-col justify-center">
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Recipient Gets</p>
                                <p className="font-bold text-xl text-green-600 tracking-tight">
                                    {rate.receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-semibold">{targetCurrency}</span>
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="w-full md:w-1/4 flex justify-end">
                            <a
                                href={rate.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full md:w-auto text-center px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${rate.isBestRate ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20' : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200'}`}
                            >
                                Send Now
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
