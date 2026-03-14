import { ChatMessage } from './types';
import { anthropic } from '../../lib/anthropic';
import { buildSystemPrompt } from './prompt-builder';

export async function handleChatStream(messages: ChatMessage[], systemPrompt: string) {
    // Stub for Anthropic streaming response
    return { status: "ok" };
}
