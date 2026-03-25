import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleToolCall } from './tool-call-handler';

// Mock global fetch
global.fetch = vi.fn();

describe('handleToolCall', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('should call /api/rates for getLiveRates', async () => {
    const mockResponse = { baseRate: 1950, rates: [] };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await handleToolCall('getLiveRates', {
      baseCurrency: 'GBP',
      targetCurrency: 'NGN'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/rates'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ sourceCurrency: 'GBP', targetCurrency: 'NGN', amount: 500 })
      })
    );
    expect(JSON.parse(result)).toEqual(mockResponse);
  });

  it('should call /api/alerts for createRateAlert', async () => {
    const mockResponse = { id: 'alert-123', success: true };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await handleToolCall('createRateAlert', {
      email: 'test@example.com',
      baseCurrency: 'GBP',
      targetCurrency: 'NGN',
      targetRate: 2000
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/alerts'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          sourceCurrency: 'GBP',
          targetCurrency: 'NGN',
          targetRate: 2000
        })
      })
    );
    expect(JSON.parse(result).success).toBe(true);
  });

  it('should handle unknown tools gracefully', async () => {
    const result = await handleToolCall('unknownTool', {});
    expect(JSON.parse(result).error).toBe('Unknown tool');
  });
});
