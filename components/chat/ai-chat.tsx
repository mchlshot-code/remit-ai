'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/modules/ai-assistant/types';
import { useQuery } from '@tanstack/react-query';
import { NormalizedRatesResponse } from '@/modules/rates/types';
import { useRatesStore } from '@/modules/rates/store';

export function AiChat() {
  const { sourceCurrency, targetCurrency, amount } = useRatesStore();

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your RemitAI Assistant. I can help you find the best rates, understand hidden fees, or explain the parallel market. How can I help you send money home today?" }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Optionally fetch the latest rates to inject into the API request Context
  const { data: latestRates, isLoading: ratesLoading } = useQuery<NormalizedRatesResponse, Error>({
    queryKey: ['latest_rates', sourceCurrency, targetCurrency, amount],
    queryFn: async () => {
      // Fetch rates for the currently selected corridor context
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCurrency, targetCurrency, amount: amount || 500 })
      });
      if (!res.ok) throw new Error('Failed to fetch rates');
      return res.json();
    },
    staleTime: 600000, // 10 minutes cache limit
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    
    // Append user message instantly
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    try {
      // Add a temporary empty assistant message to stream into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'system'), // Strip out any old system messages if present
          currentRates: latestRates?.rates || []
        })
      });

      if (!response.ok) throw new Error('Chat API failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let currentString = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          currentString += chunk;
          
          setMessages(prev => {
            const updated = [...prev];
            // The last item is the assistant message we're streaming into
            updated[updated.length - 1].content = currentString;
            return updated;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const sampleQuestions = [
    "Which is cheapest to send £500 to Nigeria?",
    "What are the hidden fees on Remitly?",
    "Why is the official rate different from the street rate?"
  ];

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-card border rounded-2xl shadow-sm overflow-hidden mx-auto">
      {/* Header */}
      <div className="h-16 border-b px-6 flex items-center bg-muted/30">
        <div>
          <h2 className="font-display font-bold">RemitAI Guide</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {ratesLoading ? 'Loading live rates...' : 'Live with real-time market data'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
        {messages.map((msg, i) => {
          if (isStreaming && i === messages.length - 1 && msg.content === '') {
            return null; // hide empty message while waiting for first chunk
          }
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-emerald-500 text-white rounded-br-sm' 
                  : 'bg-muted rounded-bl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
             <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-5 py-3 text-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-muted-foreground font-medium">Checking live rates…</span>
             </div>
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sampleQuestions.map((q) => (
              <button 
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors border text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form 
          className="relative flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask about rates, fees, or providers..."
            className="w-full bg-muted/50 border rounded-full h-12 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-muted-foreground disabled:opacity-50 text-white rounded-full transition-colors"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
