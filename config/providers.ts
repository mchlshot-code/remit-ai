// Re-export currency symbols from single source of truth
export { CURRENCY_SYMBOLS } from '@/config/currencies'

export const PROVIDERS = [
    { id: 'wise', name: 'Wise' },
    { id: 'remitly', name: 'Remitly' },
    { id: 'western_union', name: 'Western Union' },
    { id: 'xhofm', name: 'Xoom by PayPal' }
];

// SUPPORTED_CORRIDORS removed — replaced by POPULAR_CORRIDORS in config/corridors.ts
// and any-to-any currency pairing via CURRENCIES
