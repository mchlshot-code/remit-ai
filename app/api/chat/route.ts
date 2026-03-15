import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { groq } from '@/lib/groq';
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

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...parsed.messages
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
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