export interface RateAlert {
  id: string;
  email: string;
  from_currency: string;
  to_currency: string;
  target_rate: number;
  current_rate: number;
  is_triggered: boolean;
  created_at: string;
}

export interface CreateAlertPayload {
  email: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  currentRate: number;
}
