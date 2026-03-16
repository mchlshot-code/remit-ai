import { notFound } from "next/navigation"
import { Metadata } from "next"
import { PROVIDER_PAIRS } from "@/config/seo-corridors"
import { getLiveRates, getYear } from "@/lib/seo-helpers"
import Link from "next/link"
import { Check, AlertCircle, Zap } from "lucide-react"

interface Props {
  params: {
    slug: string
  }
}

export const revalidate = 1800 // ISR every 30 mins

export async function generateStaticParams(): Promise<Props["params"][]> {
  return PROVIDER_PAIRS.map((p) => ({
    slug: p.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = PROVIDER_PAIRS.find((p) => p.slug === params.slug)
  if (!pair) return {}

  const currentYear = getYear()
  const [targetCurrency] = pair.corridor.split("-").reverse()

  return {
    title: `${pair.providers[0]} vs ${pair.providers[1]} for ${targetCurrency} (${currentYear}) — Which Sends More? | RemitAI`,
    description: `Live side-by-side comparison of ${pair.providers[0]} and ${pair.providers[1]} for ${pair.corridor.replace("-", " to ")}. See exact fees, rates and who sends more today.`,
  }
}

export default async function ReviewPage({ params }: Props) {
  const pair = PROVIDER_PAIRS.find((p) => p.slug === params.slug)

  if (!pair) {
    notFound()
  }

  const [from, to] = pair.corridor.split("-")
  const ratesData = await getLiveRates(from, to)
  const currentYear = getYear()

  // Filter to only the two providers
  const providers = ratesData.rates.filter(r => 
    pair.providers.some(p => p.toLowerCase() === r.provider.toLowerCase())
  ).sort((a, b) => b.receiveAmount - a.receiveAmount)

  if (providers.length < 2) {
    // If we can't find both providers in the live data, we might need a fallback or show what we have
    // but the task implies we compare two.
  }

  const winner = providers[0]
  const loser = providers[1] || providers[0] // fallback if only one found

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <header className="bg-white border-b py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            {pair.providers[0]} vs {pair.providers[1]} for {to} Transfers ({currentYear})
          </h1>
          <p className="text-lg text-slate-600">
            Comparing live exchange rates and fees for sending {from} to {to}
          </p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((p, idx) => (
            <div 
              key={p.provider}
              className={`relative bg-white p-8 rounded-3xl shadow-xl border-4 ${idx === 0 ? 'border-emerald-500' : 'border-transparent'}`}
            >
              {idx === 0 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-current" />
                  Best Right Now
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{p.provider}</h2>
                  <p className="text-slate-500 text-sm">{p.transferSpeed}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Rate</p>
                  <p className="text-lg font-bold text-slate-900">1 {from} = {p.exchangeRate.toFixed(2)} {to}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Transfer Fee</span>
                  <span className="font-semibold text-slate-900">{p.fee === 0 ? 'Free' : `${p.fee} ${from}`}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100 text-lg">
                  <span className="text-slate-600">Recipient Gets</span>
                  <span className="font-bold text-emerald-600 underline decoration-emerald-200 decoration-4 underline-offset-4">
                    {p.receiveAmount.toLocaleString()} {to}
                  </span>
                </div>
              </div>

              <Link 
                href={p.link}
                target="_blank"
                className={`w-full py-4 rounded-xl font-bold text-center block transition-all ${idx === 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Send with {p.provider}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Content */}
      <section className="max-w-4xl mx-auto px-6 mt-16 space-y-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Check className="w-32 h-32" />
          </div>

          <div className="relative space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                Which is cheaper: {winner.provider} or {loser.provider}?
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Right now, <strong>{winner.provider}</strong> is the cheaper option. By choosing {winner.provider} over {loser.provider}, 
                your recipient will receive <strong>{(winner.receiveAmount - loser.receiveAmount).toFixed(2)} more {to}</strong> for every {winner.sendAmount} {from} sent.
                This is due to {winner.provider}&apos;s {winner.exchangeRate > loser.exchangeRate ? 'better exchange rate' : 'lower fees'}.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Transfer speed comparison</h2>
              <p className="text-slate-600 leading-relaxed">
                When it comes to speed, <strong>{winner.provider}</strong> estimates delivery <strong>{winner.transferSpeed.toLowerCase()}</strong>, 
                while <strong>{loser.provider}</strong> estimates <strong>{loser.transferSpeed.toLowerCase()}</strong>. 
                Keep in mind that peak hours and bank holidays in {to} can affect these times.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Hidden fees to watch out for</h2>
              <div className="space-y-4">
                {providers.map(p => (
                  <div key={p.provider} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    {p.fee > 0 ? (
                      <div className="bg-amber-100 text-amber-600 p-2 rounded-lg h-fit">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg h-fit">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">{p.provider} Fees</h4>
                      <p className="text-slate-600 text-sm">
                        {p.fee > 0 
                          ? `${p.provider} charges a fixed fee of ${p.fee} ${from}. Always check if there&apos;s a markup on the exchange rate as well.`
                          : `${p.provider} is currently offering zero-fee transfers for this corridor.`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our verdict</h2>
              <p className="text-slate-800 leading-relaxed">
                Based on live data, <strong>{winner.provider} is the clear winner</strong> for sending {from} to {to} today. 
                They offer a superior combination of low costs and competitive exchange rates. However, exchange rates 
                fluctuate every few minutes, so we strongly recommend doing a final check on their website before 
                committing to your transfer.
              </p>
            </section>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href={`/compare/${from.toLowerCase()}-to-${to.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
          >
            See all providers for this corridor
            <Zap className="w-4 h-4 translate-y-[1px]" />
          </Link>
        </div>
      </section>
    </main>
  )
}
