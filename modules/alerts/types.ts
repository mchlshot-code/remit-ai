export interface RateAlertRequest {
  email: string;
  sourceCurrency: string;
  targetCurrency: string;
  targetRate: number;
  currentRate?: number;
}

export interface RateAlert {
  id: string;
  user_id: string | null;
  email: string;
  currency_pair: string;
  target_rate: number;
  current_rate: number | null;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
}
