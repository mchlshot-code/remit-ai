import { RateAlert, CreateAlertPayload } from './types';
import { supabase } from '../../lib/supabase';
import { fetchAllProviders } from '../rates/fetchers';
import { normalizeAndCompare } from '../rates/normalizer';
import { sendAlertEmail } from './email-sender';

export async function createAlert(payload: CreateAlertPayload): Promise<RateAlert> {
  const { data, error } = await supabase
    .from('rate_alerts')
    .insert([{
      email: payload.email,
      from_currency: payload.fromCurrency,
      to_currency: payload.toCurrency,
      target_rate: payload.targetRate,
      current_rate: payload.currentRate,
      is_triggered: false
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return data as RateAlert;
}

export async function getUserAlerts(email: string): Promise<RateAlert[]> {
  const { data, error } = await supabase
    .from('rate_alerts')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }

  return data as RateAlert[];
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase
    .from('rate_alerts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete alert: ${error.message}`);
  }
}

export async function triggerAlert(alertId: string, alertDetails: any): Promise<void> {
  await sendAlertEmail(alertDetails.email, alertDetails);

  const { error } = await supabase
    .from('rate_alerts')
    .update({ is_triggered: true })
    .eq('id', alertId);

  if (error) {
    console.error(`Failed to mark alert as triggered: ${error.message}`);
  }
}

export async function checkAlerts(): Promise<void> {
  // Get all active, untriggered alerts
  const { data: activeAlerts, error } = await supabase
    .from('rate_alerts')
    .select('*')
    .eq('is_triggered', false);

  if (error || !activeAlerts) {
    console.error(`Error fetching active alerts: ${error?.message}`);
    return;
  }

  if (activeAlerts.length === 0) return;

  // Group by currency pair to avoid duplicate rate fetching
  const pairs = new Set(activeAlerts.map(a => `${a.from_currency}_${a.to_currency}`));

  for (const pair of Array.from(pairs)) {
    const [fromCurr, toCurr] = pair.split('_');
    const alertsForPair = activeAlerts.filter(a => a.from_currency === fromCurr && a.to_currency === toCurr);

    try {
      const rawRates = await fetchAllProviders({ sourceCurrency: fromCurr, targetCurrency: toCurr, amount: 1000 });
      const { rates } = normalizeAndCompare(rawRates, fromCurr);
      const bestRateObj = rates.find(r => r.isBestRate) || rates[0];

      if (!bestRateObj) continue;

      for (const alert of alertsForPair) {
        // Condition: if the best current exchange rate >= target rate
        if (bestRateObj.exchangeRate >= alert.target_rate) {
          await triggerAlert(alert.id, {
            ...alert,
            bestProvider: bestRateObj.provider,
            bestRate: bestRateObj.exchangeRate,
            link: bestRateObj.link
          });
        }
      }
    } catch (e) {
      console.error(`Error checking rates for ${pair}`, e);
    }
  }
}
