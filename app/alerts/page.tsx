import { RateAlertForm } from '@/components/alerts/rate-alert-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AlertsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Rate Alerts</h1>
          <p className="text-muted-foreground">
            Hi {user.email}, set your target exchange rate and we&apos;ll notify you the moment it&apos;s available.
          </p>
        </div>
        
        <RateAlertForm />
      </div>
    </main>
  );
}
