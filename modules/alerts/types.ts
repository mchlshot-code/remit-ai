export interface RateAlert {
    id: string;
    userId: string;
    targetCurrency: string;
    targetRate: number;
    isActive: boolean;
}

export interface AlertPayload {
    targetCurrency: string;
    targetRate: number;
}
