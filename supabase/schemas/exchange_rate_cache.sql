-- =============================================================
-- Table: exchange_rate_cache
-- Purpose: Stores fetched FX rates (official + parallel) with a
--          TTL timestamp to prevent excessive external API calls.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.exchange_rate_cache (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_pair   text NOT NULL,                          -- e.g. 'GBP_NGN'
    official_rate   numeric(18, 6) NOT NULL,                -- Mid-market / CBN rate
    parallel_rate   numeric(18, 6),                         -- Live street / parallel rate (nullable if unavailable)
    provider_source text,                                   -- e.g. 'Korapay', 'jsdelivr', 'AbokiFX'
    last_fetched_at timestamptz NOT NULL DEFAULT now(),     -- TTL monitor timestamp
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by currency pair + recency
CREATE INDEX IF NOT EXISTS idx_cache_pair_fetched
    ON public.exchange_rate_cache (currency_pair, last_fetched_at DESC);

-- Enable Row Level Security (Agent.md rule)
ALTER TABLE public.exchange_rate_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access via the anon key (public rates are not sensitive)
CREATE POLICY "Allow public read on exchange_rate_cache"
    ON public.exchange_rate_cache
    FOR SELECT
    USING (true);

-- Only the service_role key can insert/update cache rows
CREATE POLICY "Service role manages cache"
    ON public.exchange_rate_cache
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
