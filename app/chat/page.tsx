import { AiChat } from '@/components/chat/ai-chat';

export default function ChatPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="font-display text-4xl font-bold mb-3">RemitAI Guide</h1>
          <p className="text-muted-foreground">
            Get unbiased advice on sending money home, based on real-time comparison data.
          </p>
        </div>
        
        <AiChat />
      </div>
    </main>
  );
}
