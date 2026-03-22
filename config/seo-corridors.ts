// config/seo-corridors.ts — SEO-specific configuration
// Re-exports corridor data from config/corridors.ts and generates provider pairs

import { ProviderPair } from '@/modules/rates/types'
import { CORRIDORS, FORWARD_CORRIDORS } from '@/config/corridors'

// Re-export for backwards compatibility
export { CORRIDORS } from '@/config/corridors'
export type { Corridor } from '@/config/corridors'

export const ACTIVE_PROVIDERS = [
  "Wise", 
  "Remitly", 
  "WorldRemit", 
  "LemFi", 
  "TapTap Send"
]

const formatSlugStr = (name: string): string => 
  name.toLowerCase().replace(/\s+/g, '')

export const PROVIDER_PAIRS: ProviderPair[] = FORWARD_CORRIDORS.flatMap((corridor) => {
  const pairs: ProviderPair[] = []
  
  for (let i = 0; i < ACTIVE_PROVIDERS.length; i++) {
    for (let j = i + 1; j < ACTIVE_PROVIDERS.length; j++) {
      const p1 = ACTIVE_PROVIDERS[i]
      const p2 = ACTIVE_PROVIDERS[j]

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
