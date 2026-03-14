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

CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_currency TEXT NOT NULL,
    target_rate NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_rate_cache_currency ON public.rate_cache(source_currency, target_currency);
CREATE INDEX idx_alerts_user ON public.alerts(user_id);
