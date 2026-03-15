'use client';
import { useState } from 'react';
import { useRatesStore } from '../modules/rates/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, Mail, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RateAlert } from '../modules/alerts/types';
import { NormalizedRatesResponse } from '../modules/rates/types';

export function AlertForm() {
  const [email, setEmail] = useState('');
  const [targetRate, setTargetRate] = useState<number | ''>('');
  const [successMsg, setSuccessMsg] = useState('');
  const ratesStore = useRatesStore();
  const queryClient = useQueryClient();

  // Get current rates to show to user
  const queryKey = ['rates', ratesStore.sourceCurrency, ratesStore.targetCurrency, ratesStore.amount];
  const ratesData = queryClient.getQueryData<NormalizedRatesResponse>(queryKey);
  const bestCurrentRate = ratesData?.rates.find(r => r.isBestRate)?.exchangeRate;

  // Fetch alerts for the user if they've entered an email and clicked check
  const [savedEmail, setSavedEmail] = useState('');

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['alerts', savedEmail],
    queryFn: async () => {
      if (!savedEmail) return [];
      const res = await fetch(`/api/alerts?email=${encodeURIComponent(savedEmail)}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      return data.alerts as RateAlert[];
    },
    enabled: !!savedEmail
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {email: string; fromCurrency: string; toCurrency: string; targetRate: number; currentRate: number}) => {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create alert');
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      setSuccessMsg('Rate alert created successfully!');
      setSavedEmail(variables.email);
      queryClient.invalidateQueries({ queryKey: ['alerts', variables.email] });
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', savedEmail] });
    }
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !targetRate || !bestCurrentRate) return;
    
    createMutation.mutate({
      email,
      fromCurrency: ratesStore.sourceCurrency,
      toCurrency: ratesStore.targetCurrency,
      targetRate: Number(targetRate),
      currentRate: bestCurrentRate
    });
  };

  const checkMyAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSavedEmail(email);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="text-blue-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Get Notified</h2>
        </div>
        <p className="text-sm text-gray-500">
          We&apos;ll send you an email when the exchange rate hits your target.
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleCreateAlert} className="space-y-4">
          
          {ratesStore.hasSearched && bestCurrentRate && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
              <TrendingUp size={16} />
              <span>Current best rate for {ratesStore.sourceCurrency} to {ratesStore.targetCurrency} is <strong>{bestCurrentRate.toFixed(2)}</strong></span>
            </div>
          )}

          {!ratesStore.hasSearched && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100 mb-4">
              <AlertCircle size={16} />
              <span>Please search for a rate above first before setting an alert.</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <Input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Target Exchange Rate</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target size={16} className="text-gray-400" />
              </div>
              <Input 
                type="number" 
                step="0.01"
                placeholder={bestCurrentRate ? `${(bestCurrentRate * 1.02).toFixed(2)} (Suggested)` : "e.g. 2000"}
                value={targetRate}
                onChange={(e) => setTargetRate(e.target.value ? Number(e.target.value) : '')}
                className="pl-10"
                required
                disabled={!ratesStore.hasSearched}
              />
            </div>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}
          {createMutation.error && (
            <div className="text-sm text-red-500">
              {createMutation.error.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
              disabled={createMutation.isPending || !ratesStore.hasSearched}
            >
              {createMutation.isPending ? 'Setting Alert...' : `Notify me when rate hits ${targetRate || 'X'}`}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={checkMyAlerts}
              className="flex-none"
              title="Check my active alerts"
            >
              Check My Alerts
            </Button>
          </div>
        </form>

        {/* List of active alerts */}
        {savedEmail && (
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">Active Alerts for <span className="text-blue-600 font-normal">{savedEmail}</span></h3>
            
            {isLoadingAlerts ? (
              <p className="text-sm text-gray-500">Loading your alerts...</p>
            ) : alerts && alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map((alert) => (
                  <li key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {alert.from_currency} <span>→</span> {alert.to_currency}
                        {alert.is_triggered && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-bold ml-2">Triggered</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Target: <span className="font-semibold text-gray-800">{alert.target_rate}</span> 
                        <span className="mx-1">•</span> 
                        Configured at: {alert.current_rate}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(alert.id)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === alert.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <AlertCircle size={14} /> No active alerts found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
