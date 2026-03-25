import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { buildSystemPrompt } from '@/modules/ai-assistant/prompt-builder';
import { REMITAI_TOOLS } from '@/modules/ai-assistant/tool-definitions';
import { handleToolCall } from '@/modules/ai-assistant/tool-call-handler';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  currentRates: z.array(z.object({
    provider: z.string(),
    logo: z.string(),
    sendAmount: z.number(),
    receiveAmount: z.number(),
    exchangeRate: z.number(),
    fee: z.number(),
    totalCost: z.number(),
    transferSpeed: z.string(),
    isBestRate: z.boolean(),
    link: z.string(),
  })).default([]),
  baseRate: z.number().optional(),
  parallelRateEstimate: z.object({
    estimatedParallelRate: z.number(),
    premiumPercent: z.number(),
    disclaimer: z.string(),
    source: z.string(),
  }).nullable().optional(),
  sourceCurrency: z.string().default('GBP'),
  targetCurrency: z.string().default('NGN'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.parse(body);

    const systemPrompt = buildSystemPrompt({
      rates: parsed.currentRates,
      baseRate: parsed.baseRate,
      parallelRateEstimate: parsed.parallelRateEstimate,
      sourceCurrency: parsed.sourceCurrency,
      targetCurrency: parsed.targetCurrency,
    });

    const result = await streamText({
      model: groq('llama-3.1-70b-versatile'),
      system: systemPrompt,
      messages: parsed.messages,
      maxOutputTokens: 1024,
      temperature: 0.3,
      tools: {
        getLiveRates: {
          description: REMITAI_TOOLS.getLiveRates.description,
          inputSchema: REMITAI_TOOLS.getLiveRates.parameters,
          execute: async ({ baseCurrency, targetCurrency }: { baseCurrency: string, targetCurrency: string }) => {
            const result = await handleToolCall('getLiveRates', { baseCurrency, targetCurrency });
            return JSON.parse(result);
          },
        },
        createRateAlert: {
          description: REMITAI_TOOLS.createRateAlert.description,
          inputSchema: REMITAI_TOOLS.createRateAlert.parameters,
          execute: async ({ email, baseCurrency, targetCurrency, targetRate }: { email: string, baseCurrency: string, targetCurrency: string, targetRate: number }) => {
            const result = await handleToolCall('createRateAlert', { email, baseCurrency, targetCurrency, targetRate });
            return JSON.parse(result);
          },
        },
      },
    });

    return result.toTextStreamResponse();

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}