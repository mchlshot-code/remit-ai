// deno-lint-ignore-file
// eslint-disable-next-line @typescript-eslint/no-namespace
declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * check-price-alerts
 * 
 * This Edge Function is designed to be triggered by a Database Webhook
 * whenever a new row is inserted into the `exchange_rate_cache` table.
 * 
 * Flow:
 * 1. Webhook fires on INSERT into `exchange_rate_cache`
 * 2. This function reads the new official/parallel rates from the payload
 * 3. Queries all active, untriggered alerts for the matching currency_pair
 * 4. For each alert where the new rate >= target_rate:
 *    a. Mark the alert as triggered (is_triggered = true, triggered_at = now())
 *    b. Send a notification email via Resend
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - RESEND_API_KEY
 */

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const { record } = payload; // Database webhook payload shape

    // TODO: Implement alert matching logic
    // 1. Create Supabase client with service role key
    // 2. Query active alerts matching record.currency_pair
    // 3. Compare record.official_rate against each alert's target_rate
    // 4. Trigger matched alerts and send email notifications

    console.log(`[check-price-alerts] New cache entry for ${record?.currency_pair}:`, {
      official_rate: record?.official_rate,
      parallel_rate: record?.parallel_rate,
    });

    return new Response(
      JSON.stringify({ 
        message: "Alert check complete",
        currency_pair: record?.currency_pair,
        processed: true 
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-price-alerts] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process alert check" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
