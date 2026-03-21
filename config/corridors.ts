// config/corridors.ts — Popular corridors for SEO and UI dropdowns
// Derives corridor metadata from the CURRENCIES config (single source of truth)

import { getCurrency, type Currency } from './currencies'

export interface Corridor {
  from: string
  to: string
  fromCountry: string
  toCountry: string
  fromFlag: string
  toFlag: string
}

/** All popular corridors including reverse directions — used in sitemap and corridor pages */
export const POPULAR_CORRIDORS = [
  { from: 'GBP', to: 'NGN' }, { from: 'NGN', to: 'GBP' },
  { from: 'USD', to: 'NGN' }, { from: 'NGN', to: 'USD' },
  { from: 'EUR', to: 'NGN' }, { from: 'NGN', to: 'EUR' },
  { from: 'GBP', to: 'KES' }, { from: 'KES', to: 'GBP' },
  { from: 'USD', to: 'KES' }, { from: 'USD', to: 'GHS' },
  { from: 'GBP', to: 'GHS' }, { from: 'AED', to: 'NGN' },
  { from: 'CAD', to: 'NGN' }, { from: 'AUD', to: 'NGN' },
  { from: 'USD', to: 'ZAR' }, { from: 'USD', to: 'INR' },
  { from: 'GBP', to: 'INR' }, { from: 'USD', to: 'EGP' },
] as const

/** Build a full Corridor object from currency codes using CURRENCIES as source of truth */
export function buildCorridor(from: string, to: string): Corridor | null {
  const fromCurrency: Currency | undefined = getCurrency(from)
  const toCurrency: Currency | undefined = getCurrency(to)
  if (!fromCurrency || !toCurrency) return null

  return {
    from: fromCurrency.code,
    to: toCurrency.code,
    fromCountry: fromCurrency.country,
    toCountry: toCurrency.country,
    fromFlag: fromCurrency.flag,
    toFlag: toCurrency.flag,
  }
}

/** Fully hydrated corridor objects for popular corridors */
export const CORRIDORS: Corridor[] = POPULAR_CORRIDORS
  .map(c => buildCorridor(c.from, c.to))
  .filter((c): c is Corridor => c !== null)
