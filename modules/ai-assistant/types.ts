import { RateResult } from '../rates/types';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  currentRates: RateResult[];
}
