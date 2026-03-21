interface RateResponse {
  rates?: Array<{
    isBestRate?: boolean;
    savingsAgainstBest?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export async function handleToolCall(
  toolName: string,
  toolArgs: Record<string, unknown>
): Promise<string> {
  // Dynamically resolve the base URL for local, preview, and production environments
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

  try {
    if (toolName === 'get_live_rates') {
      const fromCurrency = String(toolArgs.from_currency);
      const toCurrency = String(toolArgs.to_currency);
      const amount = typeof toolArgs.amount === 'number' ? toolArgs.amount : 100;

      const res = await fetch(`${baseUrl}/api/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCurrency: fromCurrency, targetCurrency: toCurrency, amount })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json() as unknown;
      return JSON.stringify(data);
    }

    if (toolName === 'get_best_provider') {
      const fromCurrency = String(toolArgs.from_currency);
      const toCurrency = String(toolArgs.to_currency);
      const amount = Number(toolArgs.amount) || 100;

      const res = await fetch(`${baseUrl}/api/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCurrency: fromCurrency, targetCurrency: toCurrency, amount })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = (await res.json()) as RateResponse;

      const bestRate = data.rates?.find(r => r.isBestRate);
      if (!bestRate) return JSON.stringify({ error: "No best provider found" });

      const worstRate = data.rates?.[data.rates.length - 1];
      const savings = worstRate?.savingsAgainstBest ?? 0;

      return JSON.stringify({
        bestProvider: bestRate,
        savingsVsWorst: savings
      });
    }

    if (toolName === 'create_rate_alert') {
      const email = String(toolArgs.email);
      const fromCurrency = String(toolArgs.from_currency);
      const toCurrency = String(toolArgs.to_currency);
      const targetRate = Number(toolArgs.target_rate);

      const res = await fetch(`${baseUrl}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sourceCurrency: fromCurrency,
          targetCurrency: toCurrency,
          targetRate
        })
      });
      if (!res.ok) {
        const err = await res.json() as unknown;
        return JSON.stringify({ error: "Failed to create alert", details: err });
      }
      const data = await res.json() as unknown;
      return JSON.stringify({ success: true, message: "Alert successfully created", alert: data });
    }

    return JSON.stringify({ error: "Unknown tool", tool: toolName });
  } catch (error) {
    return JSON.stringify({ error: "Tool execution failed", tool: toolName, details: String(error) });
  }
}
