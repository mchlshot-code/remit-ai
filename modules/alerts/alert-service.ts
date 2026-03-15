import { supabaseAdmin } from '@/lib/supabase';
import { RateAlert, RateAlertRequest } from './types';

export async function createAlert(data: RateAlertRequest): Promise<RateAlert> {
    const currencyPair = `${data.sourceCurrency}_${data.targetCurrency}`;
    
    const { data: alert, error } = await supabaseAdmin
        .from('user_price_alerts')
        .insert({
            email: data.email,
            currency_pair: currencyPair,
            target_rate: data.targetRate,
            current_rate: data.currentRate || null,
            is_active: true,
            is_triggered: false,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create alert: ${error.message}`);
    return alert as RateAlert;
}

export async function getAlertsByEmail(email: string): Promise<RateAlert[]> {
    const { data, error } = await supabaseAdmin
        .from('user_price_alerts')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);
    return (data || []) as RateAlert[];
}

export async function checkAndTriggerAlerts(
    currencyPair: string,
    currentRate: number
): Promise<RateAlert[]> {
    // Find all active, untriggered alerts where current rate meets/exceeds target
    const { data: matchedAlerts, error } = await supabaseAdmin
        .from('user_price_alerts')
        .select('*')
        .eq('currency_pair', currencyPair)
        .eq('is_active', true)
        .eq('is_triggered', false)
        .lte('target_rate', currentRate);

    if (error) throw new Error(`Failed to check alerts: ${error.message}`);
    if (!matchedAlerts || matchedAlerts.length === 0) return [];

    // Mark each matched alert as triggered
    const ids = matchedAlerts.map((a: RateAlert) => a.id);
    const { error: updateError } = await supabaseAdmin
        .from('user_price_alerts')
        .update({
            is_triggered: true,
            triggered_at: new Date().toISOString(),
            current_rate: currentRate,
            is_active: false,
        })
        .in('id', ids);

    if (updateError) {
        console.error('Failed to mark alerts as triggered:', updateError);
    }

    return matchedAlerts as RateAlert[];
}

export async function deleteAlert(id: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from('user_price_alerts')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw new Error(`Failed to delete alert: ${error.message}`);
}
