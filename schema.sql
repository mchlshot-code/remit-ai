-- Users table is handled by Supabase Auth (auth.users)
-- We might create a public.users table if we need custom profile data

CREATE TABLE public.exchange_rate_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_pair TEXT NOT NULL,
    official_rate NUMERIC NOT NULL,
    parallel_rate NUMERIC,
    provider_source TEXT,
    last_fetched_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.rate_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    target_rate NUMERIC NOT NULL,
    current_rate NUMERIC,
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_rate_cache_currency ON public.rate_cache(source_currency, target_currency);
CREATE INDEX idx_rate_alerts_email ON public.rate_alerts(email);
