import { ExchangeRate } from '../rates/types';

export function buildSystemPrompt(currentRates: ExchangeRate[]): string {
    return `You are RemitAI, an expert remittance assistant. Current rates: ${JSON.stringify(currentRates)}`;
}
