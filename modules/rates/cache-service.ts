import { supabaseAdmin } from '@/lib/supabase';

interface CacheEntry {
    id: string;
    currency_pair: string;
    official_rate: number;
    parallel_rate: number | null;
    provider_source: string | null;
    last_fetched_at: string;
    created_at: string;
}

export async function cacheRateSnapshot(
    currencyPair: string,
    officialRate: number,
    parallelRate: number | null,
    providerSource: string | null
): Promise<CacheEntry> {
    const { data, error } = await supabaseAdmin
        .from('exchange_rate_cache')
        .insert({
            currency_pair: currencyPair,
            official_rate: officialRate,
            parallel_rate: parallelRate,
            provider_source: providerSource,
            last_fetched_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to cache rate snapshot:', error);
        throw new Error(`Cache write failed: ${error.message}`);
    }
    return data as CacheEntry;
}

export async function getLatestCachedRate(currencyPair: string): Promise<CacheEntry | null> {
    const { data, error } = await supabaseAdmin
        .from('exchange_rate_cache')
        .select('*')
        .eq('currency_pair', currencyPair)
        .order('last_fetched_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Failed to read cache:', error);
    }
    return (data as CacheEntry) || null;
}

export function isStale(lastFetchedAt: string | null, ttlMinutes: number = 10): boolean {
    if (!lastFetchedAt) return true;
    const age = Date.now() - new Date(lastFetchedAt).getTime();
    return age > ttlMinutes * 60 * 1000;
}
