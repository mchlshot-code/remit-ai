export interface Corridor {
  from: string
  to: string
  fromCountry: string
  toCountry: string
  fromFlag: string
  toFlag: string
}

export interface ProviderPair {
  slug: string
  providers: string[]
  corridor: string
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

export const PROVIDER_PAIRS: ProviderPair[] = [
  { slug: "wise-vs-remitly-nigeria", providers: ["Wise", "Remitly"], corridor: "GBP-NGN" },
  { slug: "wise-vs-worldremit-nigeria", providers: ["Wise", "WorldRemit"], corridor: "GBP-NGN" },
  { slug: "remitly-vs-sendwave-nigeria", providers: ["Remitly", "Sendwave"], corridor: "USD-NGN" },
  { slug: "lemfi-vs-wise-nigeria", providers: ["LemFi", "Wise"], corridor: "GBP-NGN" },
  { slug: "wise-vs-remitly-kenya", providers: ["Wise", "Remitly"], corridor: "GBP-KES" },
  { slug: "worldremit-vs-sendwave-ghana", providers: ["WorldRemit", "Sendwave"], corridor: "USD-GHS" },
]
