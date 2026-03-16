import { notFound } from "next/navigation"
import { Metadata } from "next"
import { findCorridor } from "@/lib/seo-helpers"
import { CORRIDORS } from "@/config/seo-corridors"
import Link from "next/link"
import { CompareClient } from "./compare-client"

interface Props {
  params: {
    corridor: string
  }
}

export const revalidate = 1800 // ISR every 30 mins

export async function generateStaticParams(): Promise<Props["params"][]> {
  return CORRIDORS.map((c) => ({
    corridor: `${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = findCorridor(params.corridor)
  if (!config) return {}

  return {
    title: `Send ${config.from} to ${config.to} — Best Exchange Rates Today | RemitAI`,
    description: `Compare live ${config.from} to ${config.to} rates from Wise, Remitly, WorldRemit and more. Find who gives the most ${config.toCountry} for your ${config.from} today.`,
    openGraph: {
      title: `Send ${config.from} to ${config.to} — Best Exchange Rates Today`,
      description: `Compare live ${config.from} to ${config.to} rates. Find the best way to send money to ${config.toCountry}.`,
      type: "website",
    },
  }
}

export default async function ComparePage({ params }: Props) {
  const config = findCorridor(params.corridor)

  if (!config) {
    notFound()
  }

  // Find related corridors - exactly 3 closest matches
  const related = CORRIDORS.filter(
    (c) => (c.to === config.to || c.from === config.from) && 
    !(c.from === config.from && c.to === config.to)
  ).sort((a, b) => {
    if (a.to === config.to && b.to !== config.to) return -1;
    if (a.to !== config.to && b.to === config.to) return 1;
    return 0;
  }).slice(0, 3)

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <CompareClient 
        from={config.from}
        to={config.to}
        fromFlag={config.fromFlag}
        toCountry={config.toCountry}
      />

      {/* Related Corridors */}
      {related.length > 0 && (
        <section className="w-full max-w-5xl px-5 py-12 border-t border-border mt-10">
          <h2 className="text-xl font-bold mb-6">Compare other corridors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((c) => (
              <Link 
                key={`${c.from}-${c.to}`}
                href={`/compare/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-brand/40 transition-colors cursor-pointer group"
              >
                <p className="font-medium text-sm text-foreground">
                  {c.fromFlag} {c.from} → {c.to} {c.toFlag}
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
