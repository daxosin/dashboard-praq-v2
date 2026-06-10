"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';

export type SmqPerimetre = 'GLOBAL' | 'OFFICINE' | 'PDA';

export interface SmqComponent {
  code: string;
  label: string;
  value: number | null;
  weight: number;
  n: number;
}

export interface SmqScoreResult {
  scoreGlobal: number;
  activeWeight: number;
  activeComponents: number;
  totalComponents: number;
  breakdown: SmqComponent[];
  calculatedAt: string | null;
}

const EMPTY: SmqScoreResult = {
  scoreGlobal: 0,
  activeWeight: 0,
  activeComponents: 0,
  totalComponents: 0,
  breakdown: [],
  calculatedAt: null,
};

/**
 * Score SMQ calculé côté base via le RPC `kpi_smq_current_scoped`
 * (migration 20260602172552). Pondérations dans `smq_config`,
 * redistribution automatique des composantes sans données.
 */
export function useSmqScore(perimetre: SmqPerimetre = 'GLOBAL') {
  const [score, setScore] = useState<SmqScoreResult>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc(
          'kpi_smq_current_scoped',
          { p_perimetre: perimetre }
        );

        if (rpcError) throw rpcError;

        const row = Array.isArray(data) ? data[0] : data;
        if (!row) {
          setScore(EMPTY);
          return;
        }

        setScore({
          scoreGlobal: Math.round(Number(row.score_global) || 0),
          activeWeight: Number(row.active_weight) || 0,
          activeComponents: Number(row.active_components) || 0,
          totalComponents: Number(row.total_components) || 0,
          breakdown: (row.breakdown || []).map((c: any) => ({
            code: c.code,
            label: c.label,
            value: c.value === null ? null : Math.round(Number(c.value)),
            weight: Number(c.weight) || 0,
            n: Number(c.n) || 0,
          })),
          calculatedAt: row.calculated_at ?? null,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [perimetre]);

  return { score, loading, error };
}
