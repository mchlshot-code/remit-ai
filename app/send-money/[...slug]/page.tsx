import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, ArrowRight, HelpCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { fetchAllProviders } from '@/modules/rates/fetchers';
import { ComparisonTable } from '@/components/comparison-table';

export const revalidate = 3600; // Refresh rates every hour

interface Props {
  params: {
    slug: string[];
  };
}

const currencyMap: Record<string, string> = {
  'USA': 'USD',
  'UK': 'GBP',
  'Canada': 'CAD',
  'Europe': 'EUR',
};

async function getGuide(slug: string) {
  const { data, error } = await supabase
    .from('seo_guides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugString = params.slug.join('/');
  const guide = await getGuide(slugString);

  if (!guide) return {};

  return {
    title: guide.page_title,
    description: guide.meta_description,
    openGraph: {
      title: guide.page_title,
      description: guide.meta_description,
      type: 'article',
    },
  };
}

export default async function SEOGuidePage({ params }: Props) {
  const slugString = params.slug.join('/');
  const guide = await getGuide(slugString);

  if (!guide) {
    notFound();
  }

  // Fetch live market data for the corridor
  const sourceCurrency = currencyMap[guide.origin_country] || 'USD';
  const liveRates = await fetchAllProviders({
    sourceCurrency,
    targetCurrency: 'NGN',
    amount: 1000,
  });

  // Sort rates to find the market leader
  const sortedRates = liveRates?.length ? [...liveRates].sort((a, b) => b.exchangeRate - a.exchangeRate) : [];
  const winner = sortedRates[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {guide.h1_heading}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed md:text-xl">
              {guide.intro_text}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-16">
          
          {/* Live Comparison Table Injection */}
          {liveRates?.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold">Live Market Rates</h2>
              </div>
              <div className="text-sm text-slate-500">
                Sorted by highest payout
              </div>
            </div>
            <ComparisonTable 
              initialRates={liveRates} 
              sourceCurrency={sourceCurrency} 
              targetCurrency="NGN" 
              amount={1000} 
            />
          </section>
          )}

          {/* The Smart "Top Pick" Callout */}
          {winner && (
          <section className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-blue-600 to-emerald-600 shadow-2xl">
            <div className="flex flex-col items-center justify-between gap-8 rounded-[calc(1.5rem-1px)] bg-white p-8 dark:bg-slate-900 md:flex-row md:p-12">
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  🏆 Editors&apos; Choice
                </span>
                <h2 className="text-3xl font-bold md:text-4xl text-slate-900 dark:text-white">
                  Top Pick: {winner.provider} is currently offering the best rate at {winner.exchangeRate.toFixed(2)} NGN.
                </h2>
                <p className="mt-4 text-slate-600 dark:text-slate-400">
                  Join 1M+ users getting the best {guide.origin_country} to Nigeria rates. 
                  Zero fees, instant delivery via {winner.provider}.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href={`/go/${winner.provider.toLowerCase().replace(/\s+/g, '-')}?corridor=${sourceCurrency}-to-NGN`}>
                  <Button size="lg" className="h-16 rounded-2xl px-10 text-lg font-bold shadow-lg transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white border-0">
                    Send via {winner.provider} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          )}

          {/* Step-by-Step */}
          <section>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-1">
              {guide.steps.map((step: string, index: number) => (
                <div key={index} className="group relative flex gap-6 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-900/30">
                    {index + 1}
                  </div>
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="rounded-3xl bg-slate-100 p-8 dark:bg-slate-900 md:p-12">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Perfect for...</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {guide.use_cases.map((useCase: string, index: number) => (
                <div key={index} className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm dark:bg-slate-800">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{useCase}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/50">
              {guide.faqs.map((faq: { question: string; answer: string }, index: number) => (
                <details key={index} className="group outline-none">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-bold text-lg text-slate-800 hover:bg-slate-50 transition-colors dark:text-slate-100 dark:hover:bg-slate-800/50">
                    {faq.question}
                    <span className="ml-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-180">
                      <ArrowRight className="h-5 w-5 rotate-90" />
                    </span>
                  </summary>
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed dark:text-slate-400">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      {/* Footer CTA */}
      {winner && (
      <footer className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">Ready to send money home?</h2>
          <Link href={`/go/${winner.provider.toLowerCase().replace(/\s+/g, '-')}?corridor=${sourceCurrency}-to-NGN`}>
            <Button size="lg" className="rounded-2xl px-12 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white">
              Transfer with {winner.provider} Now
            </Button>
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            Secure, regulated, and verified by RemitAI.
          </p>
        </div>
      </footer>
      )}
    </div>
  );
}
