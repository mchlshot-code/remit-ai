import { z } from 'zod';

export const REMITAI_TOOLS = {
  getLiveRates: {
    description: "Fetch current live exchange rates for a specific currency corridor",
    parameters: z.object({
      baseCurrency: z.string().describe('The source currency code, e.g. USD, GBP'),
      targetCurrency: z.string().describe('The target currency code, e.g. NGN, KES'),
    }),
  },
  createRateAlert: {
    description: "Create a rate alert — notify user by email when target rate is reached",
    parameters: z.object({
      email: z.string().describe("The user's email address"),
      baseCurrency: z.string().describe('The source currency code'),
      targetCurrency: z.string().describe('The target currency code'),
      targetRate: z.number().describe('The exchange rate at which to trigger the alert'),
    }),
  },
};
