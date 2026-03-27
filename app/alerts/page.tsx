import { AlertsManager } from '@/components/alerts/alerts-manager';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteAlert } from '@/modules/alerts/alert-service';

export default async function AlertsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch alerts for this user
  const { data: alerts } = await supabase
    .from('rate_alerts')
    .select('*')
    .eq('email', user.email)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  async function deleteAlertAction(id: string) {
    'use server';
    await deleteAlert(id);
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
        <AlertsManager 
          initialAlerts={alerts || []} 
          user={user} 
          onDeleteAction={deleteAlertAction} 
        />
      </div>
    </main>
  );
}
