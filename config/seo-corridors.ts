import { ProviderPair } from '@/modules/rates/types'

export interface Corridor {
  from: string
  to: string
  fromCountry: string
  toCountry: string
  fromFlag: string
  toFlag: string
}

export const CORRIDORS: Corridor[] = [
  { from: "GBP", to: "NGN", fromCountry: "United Kingdom", toCountry: "Nigeria", fromFlag: "🇬🇧", toFlag: "🇳🇬" },
  { from: "USD", to: "NGN", fromCountry: "United States", toCountry: "Nigeria", fromFlag: "🇺🇸", toFlag: "🇳🇬" },
  { from: "EUR", to: "NGN", fromCountry: "Europe", toCountry: "Nigeria", fromFlag: "🇪🇺", toFlag: "🇳🇬" },
  { from: "GBP", to: "KES", fromCountry: "United Kingdom", toCountry: "Kenya", fromFlag: "🇬🇧", toFlag: "🇰🇪" },
  { from: "USD", to: "GHS", fromCountry: "United States", toCountry: "Ghana", fromFlag: "🇺🇸", toFlag: "🇬🇭" },
  { from: "GBP", to: "GHS", fromCountry: "United Kingdom", toCountry: "Ghana", fromFlag: "🇬🇧", toFlag: "🇬🇭" },
  { from: "USD", to: "KES", fromCountry: "United States", toCountry: "Kenya", fromFlag: "🇺🇸", toFlag: "🇰🇪" },
  { from: "CAD", to: "NGN", fromCountry: "Canada", toCountry: "Nigeria", fromFlag: "🇨🇦", toFlag: "🇳🇬" },
]

export const ACTIVE_PROVIDERS = [
  "Wise", 
  "Remitly", 
  "WorldRemit", 
  "LemFi", 
  "TapTap Send"
]

const formatSlugStr = (name: string) => 
  name.toLowerCase().replace(/\s+/g, '')

export const PROVIDER_PAIRS: ProviderPair[] = CORRIDORS.flatMap((corridor) => {
  const pairs: ProviderPair[] = []
  
  for (let i = 0; i < ACTIVE_PROVIDERS.length; i++) {
    for (let j = i + 1; j < ACTIVE_PROVIDERS.length; j++) {
      const p1 = ACTIVE_PROVIDERS[i]
      const p2 = ACTIVE_PROVIDERS[j]

      // Use full corridor in slug to prevent collisions
      // e.g. wise-vs-remitly-gbp-ngn NOT wise-vs-remitly-nigeria
      const corridorSlug = `${corridor.from}-${corridor.to}`
        .toLowerCase()
      
      const slug = `${formatSlugStr(p1)}-vs-${formatSlugStr(p2)}-${corridorSlug}`

      pairs.push({
        slug,
        providers: [p1, p2] as [string, string],
        corridor: `${corridor.from}-${corridor.to}`
      })
    }
  }
  
  return pairs
})
