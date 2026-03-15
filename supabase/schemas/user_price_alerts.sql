-- =============================================================
-- Table: user_price_alerts
-- Purpose: Stores user-created hedging targets. When a cached
--          rate matches or exceeds the target, the alert fires.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_price_alerts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid,                                    -- FK to auth.users (nullable for anonymous alerts via email)
    email           text NOT NULL,                            -- Notification target
    currency_pair   text NOT NULL DEFAULT 'GBP_NGN',         -- e.g. 'GBP_NGN'
    target_rate     numeric(18, 6) NOT NULL,                 -- The rate the user is waiting for
    current_rate    numeric(18, 6),                          -- Snapshot of rate when alert was created
    is_active       boolean NOT NULL DEFAULT true,            -- Deactivated after trigger or manual cancel
    is_triggered    boolean NOT NULL DEFAULT false,           -- True once the alert has fired
    triggered_at    timestamptz,                              -- When the alert was triggered
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for the cron checker: find all active, untriggered alerts quickly
CREATE INDEX IF NOT EXISTS idx_alerts_active
    ON public.user_price_alerts (is_active, is_triggered)
    WHERE is_active = true AND is_triggered = false;

-- Enable Row Level Security
ALTER TABLE public.user_price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can read their own alerts (by email match or user_id)
CREATE POLICY "Users read own alerts"
    ON public.user_price_alerts
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR email = current_setting('request.jwt.claims', true)::json->>'email'
    );

-- Anyone can insert an alert (email-based, no auth required for MVP)
CREATE POLICY "Public insert alerts"
    ON public.user_price_alerts
    FOR INSERT
    WITH CHECK (true);

-- Service role can do everything (for cron trigger updates)
CREATE POLICY "Service role manages alerts"
    ON public.user_price_alerts
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
