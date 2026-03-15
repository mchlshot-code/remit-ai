export interface RateAlertRequest {
  email: string;
  sourceCurrency: string;
  targetCurrency: string;
  targetRate: number;
}

export interface RateAlert {
  id: string;
  email: string;
  sourceCurrency: string;
  targetCurrency: string;
  targetRate: number;
  createdAt: string;
  isActive: boolean;
}
