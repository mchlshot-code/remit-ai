import { groq } from '../../../lib/groq';
import { buildSystemPrompt } from '../../../modules/ai-assistant/prompt-builder';

export async function POST(req: Request) {
  try {
    const { messages, ratesData } = await req.json();

    const systemPrompt = buildSystemPrompt(ratesData || { rates: [] });

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      max_tokens: 1024,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(messages || [])
      ]
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encoder.encode(text));
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
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
