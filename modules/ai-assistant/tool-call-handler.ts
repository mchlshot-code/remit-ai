import { fetchAllProviders, fetchBaseRate, fetchParallelRate } from '@/modules/rates/fetchers';
import { normalizeAndCompare } from '@/modules/rates/normalizer';
import { cacheRateSnapshot } from '@/modules/rates/cache-service';
import { createAlert } from '@/modules/alerts/alert-service';
import { waitUntil } from '@vercel/functions';

export async function handleToolCall(
  toolName: string,
  toolArgs: Record<string, unknown>
): Promise<string> {
  try {
    if (toolName === 'getLiveRates') {
      const sourceCurrency = String(toolArgs.baseCurrency);
      const targetCurrency = String(toolArgs.targetCurrency);
      const amount = 500; // default amount for assistant context

      const baseRate = await fetchBaseRate(sourceCurrency, targetCurrency);
      if (baseRate === null) {
        return JSON.stringify({ error: `Exchange rate not available for ${sourceCurrency} → ${targetCurrency}` });
      }

      const rawRates = await fetchAllProviders({ sourceCurrency, targetCurrency, amount });
      const result = normalizeAndCompare(rawRates, sourceCurrency);
      
      const isNgnCorridor = sourceCurrency === 'NGN' || targetCurrency === 'NGN';
      const parallelRateEstimate = isNgnCorridor 
          ? await fetchParallelRate(sourceCurrency, targetCurrency, baseRate) 
          : undefined;

      // Background cache (optional but keeps analytics/webhooks alive)
      waitUntil(
          cacheRateSnapshot(
              `${sourceCurrency}_${targetCurrency}`,
              baseRate,
              parallelRateEstimate?.estimatedParallelRate || null,
              parallelRateEstimate?.source || 'jsdelivr'
          ).catch(err => console.error('Tool cache write failed:', err))
      );

      return JSON.stringify({ 
          baseRate,
          parallelRateEstimate,
          ...result 
      });
    }

    if (toolName === 'createRateAlert') {
      const email = String(toolArgs.email);
      const sourceCurrency = String(toolArgs.baseCurrency);
      const targetCurrency = String(toolArgs.targetCurrency);
      const targetRate = Number(toolArgs.targetRate);

      const alert = await createAlert({
          email,
          sourceCurrency,
          targetCurrency,
          targetRate
      });

      return JSON.stringify({ success: true, message: "Alert successfully created", alert });
    }

    return JSON.stringify({ error: "Unknown tool", tool: toolName });
  } catch (error) {
    console.error(`Tool Execution Error (${toolName}):`, error);
    return JSON.stringify({ error: "Tool execution failed", tool: toolName, details: String(error) });
  }
}
