import { RateResult, NormalizedRatesResponse } from './types';

export function normalizeAndCompare(results: RateResult[], sourceCurrency: string): NormalizedRatesResponse {
    if (!results.length) return { rates: [], savingsMessage: null };

    // 1. Sort by receiveAmount DESC
    const sorted = [...results].sort((a, b) => b.receiveAmount - a.receiveAmount);

    // 2. Mark the best rate
    const bestRate = sorted[0];
    const worstRate = sorted[sorted.length - 1];

    const processedRates = sorted.map((rate, index) => ({
        ...rate,
        isBestRate: index === 0
    }));

    // 3. Compute savings vs worst rate
    let savingsMessage = null;
    if (sorted.length > 1 && bestRate.receiveAmount > worstRate.receiveAmount) {
        // Calculate how much source currency was saved based on the difference in received amount and the best exchange rate
        const differenceInReceive = bestRate.receiveAmount - worstRate.receiveAmount;

        // Convert the received difference back to the source currency cost equivalent using the best rate
        const savingsInSource = differenceInReceive / bestRate.exchangeRate;

        const currencySymbol = sourceCurrency === 'GBP' ? '£' : sourceCurrency === 'USD' ? '$' : sourceCurrency;
        savingsMessage = `You save ${currencySymbol}${savingsInSource.toFixed(2)} vs worst rate`;
    }

    return {
        rates: processedRates,
        savingsMessage
    };
}
