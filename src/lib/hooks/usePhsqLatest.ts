"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import type { PhsqSnapshot } from '@/lib/db-rows';

/**
 * Dernier snapshot PHSQ (scraping pharma-systeme-qualite.fr),
 * lu depuis `phsq_snapshots` ordonné par date_scraping DESC.
 * Remplace les compteurs hardcodés de l'ancien bundle Vite.
 */
export function usePhsqLatest() {
  const [snapshot, setSnapshot] = useState<PhsqSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('phsq_snapshots')
          .select('*')
          .is('deleted_at', null)
          .order('date_scraping', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setSnapshot(data as PhsqSnapshot | null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return { snapshot, loading, error };
}
