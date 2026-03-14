export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AiChatState {
    messages: ChatMessage[];
    isThinking: boolean;
}
