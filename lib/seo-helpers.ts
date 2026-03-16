import { CORRIDORS, type Corridor } from "@/config/seo-corridors"
import { cache } from "react"
import { fetchAllProviders, fetchBaseRate, fetchParallelRate } from "@/modules/rates/fetchers"
import { normalizeAndCompare } from "@/modules/rates/normalizer"

/**
 * Optimized server-side rate fetching. 
 * Uses React cache to avoid redundant hits in generateMetadata and Page.
 */
export const getLiveRates = cache(async (from: string, to: string, amount: number = 500) => {
  const baseRate = await fetchBaseRate(from, to)
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
 * Finds a matching corridor configuration based on a slug.
 * Returns null if no match is found.
 */
export function findCorridor(slug: string): Corridor | null {
  const parsed = parseCorridorSlug(slug)
  if (!parsed) return null
  return CORRIDORS.find(c => c.from === parsed.from && c.to === parsed.to) ?? null
}
