export interface RateResult {
    provider: string;
    logo: string;
    sendAmount: number;
    receiveAmount: number;
    exchangeRate: number;
    fee: number;
    totalCost: number;
    transferSpeed: string;
    isBestRate: boolean;
    link: string;
}

export interface RateRequest {
    sourceCurrency: string;
    targetCurrency: string;
    amount: number;
}

export interface NormalizedRatesResponse {
    rates: RateResult[];
    savingsMessage: string | null;
}
