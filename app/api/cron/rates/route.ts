import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchAllProviders } from '@/modules/rates/fetchers';
import { sendAlertEmail } from '@/modules/alerts/email-sender';
import { RateAlert } from '@/modules/alerts/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 1. Fetch all active alerts
        const { data: alerts, error: fetchError } = await supabaseAdmin
            .from('rate_alerts')
            .select('*')
            .eq('is_active', true);

        if (fetchError) throw fetchError;
        if (!alerts || alerts.length === 0) {
            return NextResponse.json({ message: 'No active alerts to process' });
        }

        // 2. Group alerts by currency pair to optimize rate fetching
        const pairs = Array.from(new Set(alerts.map(a => `${a.from_currency}-${a.to_currency}`)));
        
        const results = [];

        for (const pair of pairs) {
            const [source, target] = pair.split('-');
            
            // 3. Fetch current live rates
            const providers = await fetchAllProviders({
                sourceCurrency: source,
                targetCurrency: target,
                amount: 1000 // Standard amount for comparison
            });

            if (providers.length === 0) continue;

            // Find the best rate available
            const bestProvider = providers.reduce((prev, current) => 
                (prev.exchangeRate > current.exchangeRate) ? prev : current
            );

            const currentRate = bestProvider.exchangeRate;

            // 4. Filter alerts for this pair that are hit
            const triggeredAlerts = (alerts as RateAlert[]).filter(a => 
                a.from_currency === source && 
                a.to_currency === target && 
                currentRate >= a.target_rate
            );

            for (const alert of triggeredAlerts) {
                // 5. Send email via Resend
                await sendAlertEmail(alert.email, {
                    from_currency: alert.from_currency,
                    to_currency: alert.to_currency,
                    target_rate: alert.target_rate,
                    bestRate: currentRate,
                    bestProvider: bestProvider.provider,
                    link: `https://remitaiapp.com/go/${bestProvider.provider.toLowerCase().replace(/\s+/g, '-')}`
                });

                // 6. Update alert in DB: set is_active=false, is_triggered=true
                await supabaseAdmin
                    .from('rate_alerts')
                    .update({
                        is_active: false,
                        is_triggered: true,
                        triggered_at: new Date().toISOString(),
                        current_rate: currentRate
                    })
                    .eq('id', alert.id);
                
                results.push({ id: alert.id, status: 'triggered', rate: currentRate });
            }
        }

        return NextResponse.json({ 
            message: `Processed ${alerts.length} alerts`, 
            triggered: results.length,
            details: results 
        });

    } catch (error: any) {
        console.error('Cron Rate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
