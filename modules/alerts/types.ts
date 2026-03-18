export interface RateAlertRequest {
  email: string;
  sourceCurrency: string;
  targetCurrency: string;
  targetRate: number;
  currentRate?: number;
}

export interface RateAlert {
  id: string;
  email: string;
  from_currency: string;
  to_currency: string;
  target_rate: number;
  current_rate: number | null;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}
