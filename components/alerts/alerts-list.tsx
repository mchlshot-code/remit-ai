'use client';

import { Trash2, TrendingUp, Clock } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '@/config/providers';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  id: string;
  source_currency: string;
  target_currency: string;
  target_rate: number;
  created_at: string;
  status?: 'active' | 'triggered';
}

interface AlertsListProps {
  alerts: Alert[];
  onDelete: (id: string) => Promise<void>;
}

export function AlertsList({ alerts, onDelete }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-2xl bg-muted/30">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
        No active alerts yet. Set one above to stay informed!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold px-1">Active Alerts</h3>
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            const tgtSymbol = CURRENCY_SYMBOLS[alert.target_currency] || alert.target_currency;
            
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border rounded-2xl p-5 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                      {alert.source_currency} → {alert.target_currency}
                    </div>
                    <div className="font-bold text-xl">
                      Target: {tgtSymbol}{alert.target_rate.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                      Created {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(alert.id)}
                    className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
