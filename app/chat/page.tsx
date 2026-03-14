import { AiChat } from '../../components/ai-chat';

export default function ChatPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 h-screen">
            <h1 className="text-3xl font-bold mb-4">RemitAI Assistant</h1>
            <AiChat />
        </div>
    );
}
