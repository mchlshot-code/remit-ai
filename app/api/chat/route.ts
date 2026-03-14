import { NextResponse } from 'next/server';
import { handleChatStream } from '../../../modules/ai-assistant/chat-handler';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        // Stub: call AI chat handler
        const stream = await handleChatStream(messages, "System Prompt");

        return NextResponse.json({ success: true, stream });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
