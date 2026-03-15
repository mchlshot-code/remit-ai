import { RateAlertForm } from '@/components/alerts/rate-alert-form';
import { AlertsList } from '@/components/alerts/alerts-list';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function AlertsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch alerts for this user
  const { data: alerts } = await supabase
    .from('user_price_alerts')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false });

  async function deleteAlert(id: string) {
    'use server';
    const supabase = createClient();
    await supabase.from('user_price_alerts').delete().eq('id', id);
    revalidatePath('/alerts');
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h1 className="font-display text-5xl font-bold mb-4">Rate Alerts</h1>
          <p className="text-muted-foreground text-lg">
            Stay ahead of the market. We&apos;ll notify you when your target rate is reached.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto flex flex-col gap-12">
          <RateAlertForm userEmail={user.email!} />
          <AlertsList alerts={alerts || []} onDelete={deleteAlert} />
        </div>
      </div>
    </main>
  );
}
