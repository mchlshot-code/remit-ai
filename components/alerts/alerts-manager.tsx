'use client';

import { useState } from 'react';
import { RateAlertForm } from './rate-alert-form';
import { AlertsList } from './alerts-list';

export interface Alert {
  id: string;
  source_currency: string;
  target_currency: string;
  target_rate: number;
  created_at: string;
  status?: 'active' | 'triggered';
}

interface AlertsManagerProps {
  initialAlerts: Alert[];
  userEmail: string;
  onDeleteAction: (id: string) => Promise<void>;
}

export function AlertsManager({ initialAlerts, userEmail, onDeleteAction }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  // When a new alert is successfully created, add it to the top of our local state
  const handleAlertCreated = (newAlert: Alert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Optimistically remove the alert from local state while the server action runs
  const handleDelete = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    
    try {
      await onDeleteAction(id);
    } catch (error) {
      console.error('Failed to delete alert:', error);
      // If it fails, we could theoretically revert the optimistic update here,
      // but typically a page refresh or toast error is sufficient.
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-12">
      <RateAlertForm userEmail={userEmail} onAlertCreated={handleAlertCreated} />
      <AlertsList alerts={alerts} onDelete={handleDelete} />
    </div>
  );
}
