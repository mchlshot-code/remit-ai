-- Security Scaffold Migration
-- This migration enables RLS on all tables and defines basic access policies.

-- 1. Enable RLS
ALTER TABLE public.user_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rate_cache ENABLE ROW LEVEL SECURITY;

-- 2. Policies for user_price_alerts
-- Users should only be able to see and manage their own alerts.
CREATE POLICY "Users can view their own alerts"
ON public.user_price_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
ON public.user_price_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.user_price_alerts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.user_price_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Policies for exchange_rate_cache
-- Everyone can read the cache (public rates).
CREATE POLICY "Public read access for exchange_rate_cache"
ON public.exchange_rate_cache
FOR SELECT
TO public
USING (true);

-- Only service role or authorized background processes can update the cache.
-- For development, we might allow authenticated users if we don't have a background worker yet,
-- but standard production is service_role only.
CREATE POLICY "Service role can manage exchange_rate_cache"
ON public.exchange_rate_cache
ALL
TO service_role
USING (true)
WITH CHECK (true);
