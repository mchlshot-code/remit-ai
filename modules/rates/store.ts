import { create } from 'zustand';

interface RatesState {
    sourceCurrency: string;
    targetCurrency: string;
    amount: number;
    hasSearched: boolean;
    setSourceCurrency: (curr: string) => void;
    setTargetCurrency: (curr: string) => void;
    setAmount: (amt: number) => void;
    setHasSearched: (val: boolean) => void;
}

export const useRatesStore = create<RatesState>((set) => ({
    sourceCurrency: 'GBP',
    targetCurrency: 'NGN',
    amount: 200,
    hasSearched: false,
    setSourceCurrency: (c) => set({ sourceCurrency: c }),
    setTargetCurrency: (c) => set({ targetCurrency: c }),
    setAmount: (a) => set({ amount: a }),
    setHasSearched: (val) => set({ hasSearched: val })
}));
