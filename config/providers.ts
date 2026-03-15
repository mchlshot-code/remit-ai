export const PROVIDERS = [
    { id: 'wise', name: 'Wise' },
    { id: 'remitly', name: 'Remitly' },
    { id: 'western_union', name: 'Western Union' },
    { id: 'xhofm', name: 'Xoom by PayPal' }
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
    GBP: '£', USD: '$', EUR: '€', CAD: 'CA$', AUD: 'A$', NGN: '₦', KES: 'KSh', GHS: '₵'
};

export const SUPPORTED_CORRIDORS = [
    { from: 'GBP', to: 'NGN' },
    { from: 'USD', to: 'NGN' },
    { from: 'EUR', to: 'NGN' },
    { from: 'CAD', to: 'NGN' },
    { from: 'GBP', to: 'KES' },
    { from: 'GBP', to: 'GHS' },
    { from: 'USD', to: 'KES' },
    { from: 'USD', to: 'GHS' },
];

