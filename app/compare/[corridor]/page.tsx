import { notFound } from "next/navigation"
import { Metadata } from "next"
import { findCorridor, getLiveRates, getYear } from "@/lib/seo-helpers"
import { CORRIDORS } from "@/config/seo-corridors"
import { RateInputForm } from "@/components/rates/rate-input-form"
import { ComparisonTable } from "@/components/comparison-table"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

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

  const ratesData = await getLiveRates(config.from, config.to)
  const currentYear = getYear()

  // Find related corridors
  const related = CORRIDORS.filter(
    (c) => (c.from === config.from || c.to === config.to) && 
    !(c.from === config.from && c.to === config.to)
  ).slice(0, 3)

  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="bg-white border-b pt-12 pb-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Best Way to Send {config.fromFlag} {config.from} to {config.to} ({config.toCountry}) in {currentYear}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mb-8">
            Live rates from {ratesData.rates.length} providers · Updated 30 mins ago
          </p>
          
          <RateInputForm 
            defaultSource={config.from}
            defaultTarget={config.to}
          />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Live Exchange Rates</h2>
            <p className="text-slate-500">Comparing real-time quotes for {config.from} to {config.to} transfers</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Verified</span>
            <p className="text-sm font-medium text-slate-600">{new Date(ratesData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <ErrorBoundary fallback={<div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-100 italic">Something went wrong while loading the comparison table.</div>}>
          <Suspense fallback={<div className="h-64 flex items-center justify-center bg-white border rounded-xl animate-pulse text-slate-400">Loading latest rates...</div>}>
            <ComparisonTable />
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Related Corridors */}
      {related.length > 0 && (
        <section className="px-6 py-12 max-w-6xl mx-auto border-t">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Compare other corridors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((c) => (
              <Link 
                key={`${c.from}-${c.to}`}
                href={`/compare/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`}
                className="group p-5 bg-white border rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.fromFlag}</span>
                  <span className="text-2xl">→</span>
                  <span className="text-2xl">{c.toFlag}</span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600">
                  {c.from} to {c.to}
                </h3>
                <p className="text-sm text-slate-500">Best rates for {c.toCountry}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
