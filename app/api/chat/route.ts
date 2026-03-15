import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { anthropic } from '@/lib/anthropic';
import { buildSystemPrompt } from '@/modules/ai-assistant/prompt-builder';

// Validate the incoming JSON shape
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
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.parse(body);

    const systemPrompt = buildSystemPrompt({
      rates: parsed.currentRates,
      baseRate: parsed.baseRate,
      parallelRateEstimate: parsed.parallelRateEstimate,
    });

    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Agent.md specifies newest sonnet
      max_tokens: 1024,
      temperature: 0.3,
      system: systemPrompt,
      messages: parsed.messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

