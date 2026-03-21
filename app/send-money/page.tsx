import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Globe, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RemitAI Transfer Guides | Sending Money to Nigeria',
  description: 'Explore our comprehensive guides on how to send money to Nigeria from USA, UK, Canada, and Europe at the best exchange rates.',
};

export const revalidate = 0;

async function getGuides() {
  const { data, error } = await supabase
    .from('seo_guides')
    .select('slug, page_title, intent_type, origin_country')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching guides for hub:', error);
    return [];
  }
  return data;
}

interface SEOGuide {
  slug: string;
  page_title: string;
  intent_type: string;
  origin_country: string;
}

export default async function SendMoneyHub() {
  const guides = await getGuides() as SEOGuide[];

  // Group guides by origin country
  const groupedGuides = guides.reduce((acc: Record<string, SEOGuide[]>, guide) => {
    if (!acc[guide.origin_country]) {
      acc[guide.origin_country] = [];
    }
    acc[guide.origin_country].push(guide);
    return acc;
  }, {});

  const countries = Object.keys(groupedGuides).sort();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="container relative mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex text-sm text-slate-400" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4" />
                <span className="text-blue-400 font-medium">Send Money</span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              RemitAI Transfer Guides
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed md:text-xl">
              Compare providers, track live rates, and find the smartest ways to send money home to Nigeria. 
              Our expert-curated guides cover every major corridor and use case.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {countries.length > 0 ? (
          <div className="space-y-20">
            {countries.map((country) => (
              <section key={country} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Guides from {country}</h2>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedGuides[country].map((guide) => (
                    <Link 
                      key={guide.slug} 
                      href={`/send-money/${guide.slug}`}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="mb-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {guide.intent_type.replace('_', ' ')}
                        </div>
                        <h3 className="mb-2 text-xl font-bold tracking-tight group-hover:text-blue-600 transition-colors">
                          {guide.page_title}
                        </h3>
                      </div>
                      <div className="mt-8 flex items-center font-bold text-blue-600">
                        View Guide <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-xl text-slate-500">No guides found. Check back soon!</p>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-slate-100 py-20 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Need a custom comparison?</h2>
          <p className="mb-10 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our live comparison engine tracks 15+ providers across 50+ corridors. 
            Get the data you need in seconds.
          </p>
          <Link href="/">
            <button className="rounded-2xl bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
              Go to Homepage
            </button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
