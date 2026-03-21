import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { groq } from '@/lib/groq';
import { buildSystemPrompt } from '@/modules/ai-assistant/prompt-builder';
import { REMITAI_TOOLS } from '@/modules/ai-assistant/tool-definitions';
import { handleToolCall } from '@/modules/ai-assistant/tool-call-handler';
import Groq from 'groq-sdk';

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

    const messages = parsed.messages as Groq.Chat.ChatCompletionMessageParam[];

    const firstResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.3,
      stream: false,
      tools: REMITAI_TOOLS,
      tool_choice: 'auto',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    });

    const assistantMessage = firstResponse.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Execute each tool call via handleToolCall()
      const toolResults: Groq.Chat.ChatCompletionMessageParam[] = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        // The type for toolArgs is record, we need to parse if it's string
        const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        
        const resultString = await handleToolCall(functionName, functionArgs);
        
        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultString
        });
      }

      // Build updated messages array
      const secondRoundMessages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
        assistantMessage,
        ...toolResults
      ];

      // Make SECOND Groq call with stream: true
      const finalStream = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.3,
        stream: true,
        messages: secondRoundMessages
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of finalStream) {
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

    } else {
      // No tool calls directly stream the content
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(assistantMessage.content || ''));
          controller.close();
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked'
        }
      });
    }

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}