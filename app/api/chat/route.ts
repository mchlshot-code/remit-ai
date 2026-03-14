import { NextResponse } from 'next/server';
import { handleChatStream } from '../../../modules/ai-assistant/chat-handler';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        // Stub: call AI chat handler
        const stream = await handleChatStream(messages, "System Prompt");

        return NextResponse.json({ success: true, stream });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}
