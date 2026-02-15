"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import type { Alert } from '@/lib/types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('alerts_view')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const sorted = (data || []).sort((a, b) => {
          const severityOrder = { error: 0, warn: 1, ok: 2 };
          return severityOrder[a.severity as keyof typeof severityOrder] -
                 severityOrder[b.severity as keyof typeof severityOrder];
        });

        setAlerts(sorted);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return { alerts, loading, error };
}
