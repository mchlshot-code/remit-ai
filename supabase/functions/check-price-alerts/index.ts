// deno-lint-ignore-file
// eslint-disable-next-line @typescript-eslint/no-namespace
declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  env: { get(key: string): string | undefined };
};

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — JSR imports resolve in Supabase Edge Runtime (Deno), not in Node TS
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * check-price-alerts
 * 
 * Triggered by a Database Webhook on INSERT into `exchange_rate_cache`.
 * Queries active, untriggered alerts for the matching currency_pair,
 * marks matches as triggered, and sends notification emails via Resend.
 */

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const { record } = payload;

    if (!record?.currency_pair || !record?.official_rate) {
      return new Response(
        JSON.stringify({ message: "No valid cache record in payload" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find all active, untriggered alerts matching this currency pair
    const [fromCurrency, toCurrency] = record.currency_pair.split("_");

    const { data: matchedAlerts, error: fetchError } = await supabase
      .from("rate_alerts")
      .select("*")
      .eq("from_currency", fromCurrency)
      .eq("to_currency", toCurrency)
      .eq("is_active", true)
      .eq("is_triggered", false)
      .lte("target_rate", record.official_rate);

    if (fetchError) {
      console.error("[check-price-alerts] Query error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to query alerts" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!matchedAlerts || matchedAlerts.length === 0) {
      console.log(`[check-price-alerts] No alerts triggered for ${record.currency_pair} at rate ${record.official_rate}`);
      return new Response(
        JSON.stringify({ message: "No alerts triggered", processed: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[check-price-alerts] ${matchedAlerts.length} alert(s) triggered for ${record.currency_pair}`);

    // 2. Mark matched alerts as triggered
    const ids = matchedAlerts.map((a: { id: string }) => a.id);
    const { error: updateError } = await supabase
      .from("rate_alerts")
      .update({
        is_triggered: true,
        triggered_at: new Date().toISOString(),
        current_rate: record.official_rate,
        is_active: false,
      })
      .in("id", ids);

    if (updateError) {
      console.error("[check-price-alerts] Update error:", updateError);
    }

    // 3. Send notification emails via Resend
    if (resendApiKey) {
      for (const alert of matchedAlerts) {
        const [fromCurrency, toCurrency] = (alert.currency_pair as string).split("_");
        const currencySymbol = fromCurrency === "GBP" ? "£" : fromCurrency === "USD" ? "$" : fromCurrency;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "RemitAI <alerts@remitaiapp.com>",
              to: alert.email,
              subject: `🎯 Rate Alert Triggered! ${fromCurrency}→${toCurrency} hit your target`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h1 style="color: #10b981;">Your rate alert was triggered!</h1>
                  <p>You set a target of <strong>${currencySymbol}1 = ₦${alert.target_rate}</strong> for ${fromCurrency}→${toCurrency}.</p>
                  
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0; color: #166534; font-size: 14px; text-transform: uppercase; font-weight: bold;">Current Rate</p>
                    <h2 style="margin: 8px 0 0 0; color: #15803d; font-size: 32px;">${currencySymbol}1 = ₦${record.official_rate}</h2>
                    ${record.parallel_rate ? `<p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">Street estimate: ~₦${record.parallel_rate}</p>` : ''}
                  </div>

                  <p>Rates change quickly. Compare providers and lock in this rate now.</p>
                  
                  <a href="https://remitai.app" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
                    Compare Rates Now
                  </a>
                  
                  <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
                    You received this because you set up a rate alert on RemitAI.<br>
                    Rates and fees are subject to change. Please verify the final amount on the provider's website.
                  </p>
                </div>
              `,
            }),
          });
          console.log(`[check-price-alerts] Email sent to ${alert.email}`);
        } catch (emailErr) {
          console.error(`[check-price-alerts] Email failed for ${alert.email}:`, emailErr);
        }
      }
    } else {
      console.warn("[check-price-alerts] RESEND_API_KEY not set, skipping emails");
    }

    return new Response(
      JSON.stringify({
        message: "Alert check complete",
        currency_pair: record.currency_pair,
        triggered: matchedAlerts.length,
        processed: true,
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
