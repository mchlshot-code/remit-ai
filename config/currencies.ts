// config/currencies.ts — Single source of truth for all supported currencies
// No logic, only constants and maps (per Agent.md config/ rules)

export interface Currency {
  code: string       // ISO 4217 e.g. "NGN"
  name: string       // e.g. "Nigerian Naira"
  flag: string       // emoji e.g. "🇳🇬"
  country: string
  isPopular: boolean // true = appears at top of both dropdowns
}

export const CURRENCIES: Currency[] = [
  // Popular currencies (isPopular: true)
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom', isPopular: true },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', country: 'United States', isPopular: true },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', country: 'Europe', isPopular: true },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada', isPopular: true },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', country: 'United Arab Emirates', isPopular: true },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', country: 'Nigeria', isPopular: true },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', country: 'Kenya', isPopular: true },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', country: 'Ghana', isPopular: true },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa', isPopular: true },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', country: 'India', isPopular: true },

  // Other currencies (isPopular: false)
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia', isPopular: false },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland', isPopular: false },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', country: 'Norway', isPopular: false },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', country: 'Sweden', isPopular: false },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', country: 'Denmark', isPopular: false },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', country: 'Saudi Arabia', isPopular: false },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', country: 'Qatar', isPopular: false },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', country: 'Kuwait', isPopular: false },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', country: 'Uganda', isPopular: false },
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', country: 'Tanzania', isPopular: false },
  { code: 'RWF', name: 'Rwandan Franc', flag: '🇷🇼', country: 'Rwanda', isPopular: false },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt', isPopular: false },
  { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', country: 'Morocco', isPopular: false },
  { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', country: 'Ethiopia', isPopular: false },
  { code: 'ZMW', name: 'Zambian Kwacha', flag: '🇿🇲', country: 'Zambia', isPopular: false },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', country: 'Pakistan', isPopular: false },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', country: 'Bangladesh', isPopular: false },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', country: 'Philippines', isPopular: false },
  { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', country: 'Nepal', isPopular: false },
  { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', country: 'Sri Lanka', isPopular: false },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', country: 'China', isPopular: false },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan', isPopular: false },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', country: 'Mexico', isPopular: false },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', country: 'Brazil', isPopular: false },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', country: 'Turkey', isPopular: false },
]

/** Popular currencies — shown at top of both dropdowns */
export const POPULAR_CURRENCIES: Currency[] = CURRENCIES.filter(c => c.isPopular)

/** Lookup a currency by its ISO code */
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code.toUpperCase())
}

/** Set of all valid currency codes for fast validation */
export const VALID_CURRENCY_CODES: Set<string> = new Set(CURRENCIES.map(c => c.code))

/** Derived currency symbols map — replaces hardcoded version in providers.ts */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£', USD: '$', EUR: '€', CAD: 'CA$', AUD: 'A$',
  NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', INR: '₹',
  AED: 'د.إ', SAR: '﷼', QAR: 'ر.ق', KWD: 'د.ك',
  CHF: 'CHF', NOK: 'kr', SEK: 'kr', DKK: 'kr',
  UGX: 'USh', TZS: 'TSh', RWF: 'FRw', EGP: 'E£',
  MAD: 'MAD', ETB: 'Br', ZMW: 'ZK',
  PKR: '₨', BDT: '৳', PHP: '₱', NPR: 'रू', LKR: '₨',
  CNY: '¥', JPY: '¥', MXN: 'MX$', BRL: 'R$', TRY: '₺',
}

/** Derived currency-to-country-code map — replaces hardcoded version in lib/constants.ts */
export const CURRENCY_TO_COUNTRY_CODE: Record<string, string> = {
  GBP: 'gb', USD: 'us', EUR: 'eu', CAD: 'ca', AUD: 'au',
  NGN: 'ng', KES: 'ke', GHS: 'gh', ZAR: 'za', INR: 'in',
  AED: 'ae', SAR: 'sa', QAR: 'qa', KWD: 'kw',
  CHF: 'ch', NOK: 'no', SEK: 'se', DKK: 'dk',
  UGX: 'ug', TZS: 'tz', RWF: 'rw', EGP: 'eg',
  MAD: 'ma', ETB: 'et', ZMW: 'zm',
  PKR: 'pk', BDT: 'bd', PHP: 'ph', NPR: 'np', LKR: 'lk',
  CNY: 'cn', JPY: 'jp', MXN: 'mx', BRL: 'br', TRY: 'tr',
}
