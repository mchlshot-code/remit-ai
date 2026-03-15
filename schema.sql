-- Users table is handled by Supabase Auth (auth.users)
-- We might create a public.users table if we need custom profile data

CREATE TABLE public.rate_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT NOT NULL,
    source_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    fee NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.rate_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    target_rate NUMERIC NOT NULL,
    current_rate NUMERIC NOT NULL,
    is_triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_rate_cache_currency ON public.rate_cache(source_currency, target_currency);
CREATE INDEX idx_rate_alerts_email ON public.rate_alerts(email);
