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
    if (toolName === 'getLiveRates') {
      const baseCurrency = String(toolArgs.baseCurrency);
      const targetCurrency = String(toolArgs.targetCurrency);

      const res = await fetch(`${baseUrl}/api/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCurrency: baseCurrency, targetCurrency: targetCurrency, amount: 500 })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json() as unknown;
      return JSON.stringify(data);
    }

    if (toolName === 'createRateAlert') {
      const email = String(toolArgs.email);
      const baseCurrency = String(toolArgs.baseCurrency);
      const targetCurrency = String(toolArgs.targetCurrency);
      const targetRate = Number(toolArgs.targetRate);

      const res = await fetch(`${baseUrl}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sourceCurrency: baseCurrency,
          targetCurrency: targetCurrency,
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
