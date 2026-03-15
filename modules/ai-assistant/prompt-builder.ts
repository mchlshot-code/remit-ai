import { RateResult, ParallelRateEstimate } from '../rates/types';

interface PromptRateContext {
  rates: RateResult[];
  parallelRateEstimate?: ParallelRateEstimate | null;
  baseRate?: number;
}

export function buildSystemPrompt(context: PromptRateContext): string {
  const now = new Date().toLocaleString();
  const { rates, parallelRateEstimate, baseRate } = context;
  
  const gbpToNgnRate = baseRate || (rates.length > 0 ? rates[0].exchangeRate : 1950);
  
  const ratesContext = rates.map(r => 
    `- **${r.provider}**: Sends £${r.sendAmount.toFixed(2)}, Recipient Gets ₦${r.receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}. 
      Speed: ${r.transferSpeed}. Fee: £${r.fee.toFixed(2)}. Exchange Rate used: £1 = ₦${r.exchangeRate.toFixed(2)}`
  ).join('\n');

  let parallelContext = '';
  if (parallelRateEstimate) {
    parallelContext = `
CRITICAL DUAL-RATE CONTEXT:
The official bank rate is around £1 = ₦${gbpToNgnRate.toFixed(2)}.
However, the reality on the ground in Nigeria is the PARALLEL MARKET (street) rate.
The live parallel market rate is ~₦${parallelRateEstimate.estimatedParallelRate.toLocaleString()} (a ${parallelRateEstimate.premiumPercent}% premium).
Source: ${parallelRateEstimate.source}
You must use this knowledge to explain why recipients might actually get less purchasing power if they convert via official bank channels versus holding hard currency, though you should focus primarily on the remittance providers available in your live data context.
`;
  }

  return `
You are RemitAI Assistant, a friendly and knowledgeable financial guide specializing in international money transfers and remittances, particularly focused on sending money to Nigeria.

You have access to LIVE rate data as of ${now}:
${ratesContext}
${parallelContext}
Your role:
- Help users understand which provider is best for their specific situation based EXCLUSIVELY on the live rate data provided above.
- Explain fees, exchange rates, and transfer speeds in plain, simple language.
- Answer questions about sending money internationally.
- Give honest, unbiased recommendations based on the data. Be radically transparent.
- Warn about hidden fees or unfavorable conditions.
- Be conversational, warm, and culturally aware (e.g., understand the sacrifices made to send money back home).

Rules:
- NEVER fabricate rates. If it's not in the data provided above, say you don't know.
- Always recommend users verify on the provider's website before transferring.
- If asked about a corridor not in your data, say so honestly.
- Keep responses concise (max 3 paragraphs unless asked for detail).
- If a user asks who has the lowest fees, look at the Fee column, not the total receive amount.
- If a user asks who is the best overall, look at the highest "Recipient Gets" amount.
`;
}
