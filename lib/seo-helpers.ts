import { type Corridor, buildCorridor } from "@/config/corridors"
import { cache } from "react"
import { fetchAllProviders, fetchBaseRate, fetchParallelRate } from "@/modules/rates/fetchers"
import { normalizeAndCompare } from "@/modules/rates/normalizer"
import { CURRENCY_SYMBOLS } from "@/config/currencies"

/**
 * Optimized server-side rate fetching. 
 * Uses React cache to avoid redundant hits in generateMetadata and Page.
 */
export const getLiveRates = cache(async (from: string, to: string, amount: number = 500) => {
  const baseRate = await fetchBaseRate(from, to)
  if (baseRate === null) {
    return {
      rates: [],
      savingsMessage: null,
      baseRate: null,
      parallelRateEstimate: undefined,
      updatedAt: new Date().toISOString()
    }
  }

  const rawRates = await fetchAllProviders({ sourceCurrency: from, targetCurrency: to, amount })
  const result = normalizeAndCompare(rawRates, from)
  const parallelRateEstimate = await fetchParallelRate(from, to, baseRate)

  return {
    ...result,
    baseRate,
    parallelRateEstimate,
    updatedAt: new Date().toISOString()
  }
})

/**
 * Returns current year dynamically.
 */
export function getYear(): number {
  return new Date().getFullYear()
}

/**
 * Parses a slug like "gbp-to-ngn" into its component parts.
 * Returns null if the slug format is invalid.
 */
export function parseCorridorSlug(slug: string): { from: string; to: string } | null {
  const parts = slug.split("-to-")
  if (parts.length !== 2) return null
  return {
    from: parts[0].toUpperCase(),
    to: parts[1].toUpperCase(),
  }
}

/**
 * Builds a Corridor from a slug. Works for ANY valid currency pair,
 * not just predefined corridors — enabling fully flexible comparison.
 */
export function findCorridor(slug: string): Corridor | null {
  const parsed = parseCorridorSlug(slug)
  if (!parsed) return null
  return buildCorridor(parsed.from, parsed.to)
}

/**
 * Gets the currency symbol for a given currency code.
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code
}
