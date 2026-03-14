export interface RateProvider {
    id: string;
    name: string;
}

export interface ExchangeRate {
    providerId: string;
    sourceCurrency: string;
    targetCurrency: string;
    rate: number;
    fee: number;
    timestamp: Date;
}
