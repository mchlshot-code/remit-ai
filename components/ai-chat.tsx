'use client';
import { useState, useRef, useEffect } from 'react';
import { useRatesStore } from '../modules/rates/store';
import { useQueryClient } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '../modules/rates/types';
import { Send, Trash2, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_QUESTIONS = [
  "Which is cheapest to send £500 to Nigeria?",
  "What are the hidden fees on Remitly?",
  "Should I send now or wait?",
  "How long does WorldRemit take?"
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm RemitAI. I can help you find the best ways to send money home based on live rates. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const ratesStore = useRatesStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const userMessage = customQuery || input;
    if (!userMessage.trim() || isStreaming) return;

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Append a placeholder for the assistant's response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      // Get the latest rates from react-query cache or fallback to empty array
      const queryKey = ['rates', ratesStore.sourceCurrency, ratesStore.targetCurrency, ratesStore.amount];
      const ratesData = queryClient.getQueryData<NormalizedRatesResponse>(queryKey);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, ratesData })
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      
      let assistantResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantResponse += chunk;
        
        // Update the last message (the assistant placeholder) with the new chunk
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantResponse };
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my servers right now. Please try again later." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared. What else can I help you with?" }]);
  };

  return (
    <div className="flex flex-col h-full bg-white border shadow-sm rounded-xl overflow-hidden max-h-[800px] sm:max-h-[600px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">RemitAI Assistant</h2>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Online
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClear} title="Clear chat" className="text-gray-400 hover:text-red-500 hover:bg-red-50">
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-gray-800 text-white rounded-tr-sm' : 'bg-white border shadow-sm rounded-tl-sm text-gray-800'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex justify-start w-full">
             <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white border shadow-sm rounded-tl-sm flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {/* Starter tags */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {STARTER_QUESTIONS.map((q, i) => (
              <button 
                key={i}
                onClick={() => handleSubmit(undefined, q)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full transition-colors font-medium border border-gray-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about rates, fees, or providers..." 
            className="flex-1 rounded-full h-11 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
            disabled={isStreaming}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isStreaming} 
            className="h-11 w-11 rounded-full p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex-shrink-0"
          >
            <Send size={18} className={isStreaming ? 'opacity-50' : ''} />
          </Button>
        </form>
      </div>
    </div>
  );
}
