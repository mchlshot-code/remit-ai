import { notFound } from "next/navigation"
import { Metadata } from "next"
import { findCorridor, getCurrencySymbol } from "@/lib/seo-helpers"
import { POPULAR_CORRIDORS, CORRIDORS } from "@/config/corridors"
import { CURRENCY_TO_COUNTRY } from "@/lib/constants"
import Link from "next/link"
import { CompareClient } from "@/app/compare/[corridor]/compare-client"
import { Flag } from "@/components/ui/flag"

interface Props {
  params: {
    corridor: string
  }
}

export const revalidate = 1800 // ISR every 30 mins

export async function generateStaticParams(): Promise<Props["params"][]> {
  return POPULAR_CORRIDORS.map((c) => ({
    corridor: `${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = findCorridor(params.corridor)
  if (!config) return {}

  const fromSymbol = getCurrencySymbol(config.from)
  const toSymbol = getCurrencySymbol(config.to)

  return {
    title: `Best ${config.from} to ${config.to} rate today — How much is ${fromSymbol} in ${toSymbol}? | RemitAI`,
    description: `Compare live ${config.from} to ${config.to} exchange rates from top providers. Find out how much ${config.fromCountry} ${fromSymbol} gets you in ${config.toCountry} ${toSymbol} today.`,
    openGraph: {
      title: `Best ${config.from} to ${config.to} rate today — How much is ${fromSymbol} in ${toSymbol}?`,
      description: `Compare live ${config.from} to ${config.to} rates. Find the best way to exchange ${config.from} to ${config.to}.`,
      type: "website",
    },
  }
}

export default async function CorridorPage({ params }: Props) {
  const config = findCorridor(params.corridor)

  if (!config) {
    notFound()
  }

  // Find related corridors — reverse + same-currency pairs
  const related = CORRIDORS.filter(
    (c) => (c.to === config.to || c.from === config.from || c.from === config.to || c.to === config.from) && 
    !(c.from === config.from && c.to === config.to)
  ).slice(0, 4)

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <CompareClient 
        from={config.from}
        to={config.to}
        toCountry={config.toCountry}
      />

      {/* Related Corridors */}
      {related.length > 0 && (
        <section className="w-full max-w-5xl px-5 py-12 border-t border-border mt-10">
          <h2 className="text-xl font-bold mb-6">Related corridors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((c) => (
              <Link 
                key={`${c.from}-${c.to}`}
                href={`/corridors/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-brand/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  {CURRENCY_TO_COUNTRY[c.from] && <Flag countryCode={CURRENCY_TO_COUNTRY[c.from]} size={20} />}
                  <span className="text-xs text-muted-foreground mr-1">→</span>
                  {CURRENCY_TO_COUNTRY[c.to] && <Flag countryCode={CURRENCY_TO_COUNTRY[c.to]} size={20} />}
                </div>
                <p className="font-medium text-sm text-foreground">
                  {c.from} → {c.to}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Best rates for {c.toCountry}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
