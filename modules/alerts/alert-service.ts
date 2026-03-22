import { supabaseAdmin } from '@/lib/supabase';
import { RateAlert, RateAlertRequest } from './types';

export async function createAlert(data: RateAlertRequest): Promise<RateAlert> {
    const currencyPair = `${data.sourceCurrency}_${data.targetCurrency}`;
    
    const { data: alert, error } = await supabaseAdmin
        .from('rate_alerts')
        .insert({
            email: data.email,
            from_currency: data.sourceCurrency,
            to_currency: data.targetCurrency,
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
        .from('rate_alerts')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);
    return (data || []) as RateAlert[];
}


export async function deleteAlert(id: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from('rate_alerts')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw new Error(`Failed to delete alert: ${error.message}`);
}
