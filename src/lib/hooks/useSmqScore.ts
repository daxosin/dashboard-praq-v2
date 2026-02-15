"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import type { SmqScore } from '@/lib/types';

export function useSmqScore() {
  const [score, setScore] = useState<SmqScore>({
    total: 0,
    sops: 0,
    capa: 0,
    habilitations: 0,
    equipements: 0,
    audits: 0,
    reclamations: 0,
    risques: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    const calculateScore = async () => {
      try {
        setLoading(true);

        const [
          { data: sops },
          { data: capas },
          { data: qualifications },
          { data: equipment },
          { data: audits },
          { data: complaints },
          { data: risks },
        ] = await Promise.all([
          supabase.from('sops').select('status'),
          supabase.from('capas').select('status, due_date'),
          supabase.from('qualifications').select('status'),
          supabase.from('equipment').select('status'),
          supabase.from('audits').select('status'),
          supabase.from('complaints').select('created_at, responded_at, status'),
          supabase.from('risks').select('level'),
        ]);

        const sopsScore = sops && sops.length > 0
          ? (sops.filter((s: any) => s.status === 'Validé').length / sops.length) * 25
          : 0;

        const capasEnRetard = capas
          ? capas.filter((c: any) =>
              c.status !== 'Clôturée' &&
              c.due_date &&
              new Date(c.due_date) < new Date()
            ).length
          : 0;
        const capaScore = capas && capas.length > 0
          ? (1 - capasEnRetard / capas.length) * 20
          : 20;

        const habilitationsScore = qualifications && qualifications.length > 0
          ? (qualifications.filter((q: any) => q.status === 'Valide').length / qualifications.length) * 15
          : 0;

        const equipementsScore = equipment && equipment.length > 0
          ? (equipment.filter((e: any) => e.status === 'Conforme').length / equipment.length) * 15
          : 0;

        const auditsRealises = audits
          ? audits.filter((a: any) => a.status === 'Réalisé').length
          : 0;
        const auditsPlanifies = audits ? audits.length : 0;
        const auditsScore = auditsPlanifies > 0
          ? (auditsRealises / auditsPlanifies) * 10
          : 0;

        const reclamationsPlus48h = complaints
          ? complaints.filter((c: any) => {
              if (c.status === 'Clôturée' || !c.created_at) return false;
              const hours = (new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
              return hours > 48;
            }).length
          : 0;
        const reclamationsScore = complaints && complaints.length > 0
          ? (1 - reclamationsPlus48h / complaints.length) * 10
          : 10;

        const risquesInacceptables = risks
          ? risks.filter((r: any) => r.level === 'Inacceptable').length
          : 0;
        const risquesScore = risks && risks.length > 0
          ? (1 - risquesInacceptables / risks.length) * 5
          : 5;

        const total = sopsScore + capaScore + habilitationsScore + equipementsScore + auditsScore + reclamationsScore + risquesScore;

        setScore({
          total: Math.round(total),
          sops: Math.round(sopsScore),
          capa: Math.round(capaScore),
          habilitations: Math.round(habilitationsScore),
          equipements: Math.round(equipementsScore),
          audits: Math.round(auditsScore),
          reclamations: Math.round(reclamationsScore),
          risques: Math.round(risquesScore),
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    calculateScore();
  }, []);

  return { score, loading, error };
}
