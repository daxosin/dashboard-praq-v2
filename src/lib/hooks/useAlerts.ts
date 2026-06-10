"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import type { Alert } from '@/lib/types';

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Alertes actives calculées côté client depuis les tables réelles
 * (la vue `alerts_view` n'existe pas en prod) :
 * - CAPA en retard (échéance dépassée, non close)
 * - Habilitations expirant sous 30 jours ou expirées
 * - Équipements : étalonnage / maintenance dépassés, non conformes
 * - SOPs à réviser ou expirées
 * - Réclamations ouvertes depuis plus de 48h
 * - Vigilances ouvertes
 */
export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        const [capa, habilitations, equipements, sops, reclamations, vigilances] =
          await Promise.all([
            supabase
              .from('capa')
              .select('id, titre, statut, date_echeance, created_at')
              .is('deleted_at', null)
              .neq('statut', 'CLOSE'),
            supabase
              .from('habilitations')
              .select('id, collaborateur, competence, statut, date_expiration, created_at')
              .is('deleted_at', null),
            supabase
              .from('equipements')
              .select('id, nom, statut, date_prochain_etalonnage, date_prochaine_maintenance, created_at')
              .is('deleted_at', null),
            supabase
              .from('sops')
              .select('id, code, titre, statut, created_at')
              .is('deleted_at', null)
              .in('statut', ['A_REVISER', 'EXPIREE']),
            supabase
              .from('reclamations')
              .select('id, reference, description, statut, date_reception, created_at')
              .is('deleted_at', null)
              .in('statut', ['OUVERTE', 'EN_COURS']),
            supabase
              .from('vigilances')
              .select('id, titre, type, statut, date_signal, created_at')
              .is('deleted_at', null)
              .in('statut', ['OUVERT', 'EN_COURS']),
          ]);

        const firstError =
          capa.error || habilitations.error || equipements.error ||
          sops.error || reclamations.error || vigilances.error;
        if (firstError) throw firstError;

        const now = Date.now();
        const result: Alert[] = [];

        (capa.data || []).forEach((c) => {
          if (c.date_echeance && new Date(c.date_echeance).getTime() < now) {
            result.push({
              id: `capa-${c.id}`,
              type: 'capa_retard',
              severity: 'error',
              message: `CAPA en retard : ${c.titre}`,
              source_table: 'capa',
              source_id: c.id,
              created_at: c.created_at ?? '',
            });
          }
        });

        (habilitations.data || []).forEach((h) => {
          if (!h.date_expiration) return;
          const days = (new Date(h.date_expiration).getTime() - now) / DAY_MS;
          if (days < 0) {
            result.push({
              id: `hab-${h.id}`,
              type: 'habilitation_expiree',
              severity: 'error',
              message: `Habilitation expirée : ${h.collaborateur} — ${h.competence}`,
              source_table: 'habilitations',
              source_id: h.id,
              created_at: h.created_at ?? '',
            });
          } else if (days <= 30) {
            result.push({
              id: `hab-${h.id}`,
              type: 'habilitation_expire_bientot',
              severity: 'warn',
              message: `Habilitation expire sous ${Math.ceil(days)}j : ${h.collaborateur} — ${h.competence}`,
              source_table: 'habilitations',
              source_id: h.id,
              created_at: h.created_at ?? '',
            });
          }
        });

        (equipements.data || []).forEach((e) => {
          if (e.statut === 'NON_CONFORME' || e.statut === 'HORS_SERVICE') {
            result.push({
              id: `equip-statut-${e.id}`,
              type: 'equipement_non_conforme',
              severity: 'error',
              message: `Équipement ${e.statut === 'HORS_SERVICE' ? 'hors service' : 'non conforme'} : ${e.nom}`,
              source_table: 'equipements',
              source_id: e.id,
              created_at: e.created_at ?? '',
            });
          }
          const etalonnageDue =
            e.date_prochain_etalonnage &&
            new Date(e.date_prochain_etalonnage).getTime() < now;
          const maintenanceDue =
            e.date_prochaine_maintenance &&
            new Date(e.date_prochaine_maintenance).getTime() < now;
          if (etalonnageDue || maintenanceDue) {
            result.push({
              id: `equip-due-${e.id}`,
              type: 'equipement_echeance',
              severity: 'warn',
              message: `${etalonnageDue ? 'Étalonnage' : 'Maintenance'} dépassé : ${e.nom}`,
              source_table: 'equipements',
              source_id: e.id,
              created_at: e.created_at ?? '',
            });
          }
        });

        (sops.data || []).forEach((s) => {
          result.push({
            id: `sop-${s.id}`,
            type: 'sop_a_reviser',
            severity: s.statut === 'EXPIREE' ? 'error' : 'warn',
            message: `SOP ${s.statut === 'EXPIREE' ? 'expirée' : 'à réviser'} : ${s.code} — ${s.titre}`,
            source_table: 'sops',
            source_id: s.id,
            created_at: s.created_at ?? '',
          });
        });

        (reclamations.data || []).forEach((r) => {
          const ref = r.date_reception ?? r.created_at;
          if (!ref) return;
          const hours = (now - new Date(ref).getTime()) / (1000 * 60 * 60);
          if (hours > 48) {
            result.push({
              id: `recl-${r.id}`,
              type: 'reclamation_48h',
              severity: 'error',
              message: `Réclamation > 48h sans clôture : ${r.reference ?? r.description?.slice(0, 60) ?? r.id}`,
              source_table: 'reclamations',
              source_id: r.id,
              created_at: r.created_at ?? '',
            });
          }
        });

        (vigilances.data || []).forEach((v) => {
          result.push({
            id: `vig-${v.id}`,
            type: 'vigilance_ouverte',
            severity: v.type === 'RETRAIT_LOT' ? 'error' : 'warn',
            message: `Vigilance ${v.statut === 'OUVERT' ? 'ouverte' : 'en cours'} : ${v.titre}`,
            source_table: 'vigilances',
            source_id: v.id,
            created_at: v.created_at ?? '',
          });
        });

        const severityOrder = { error: 0, warn: 1, ok: 2 } as const;
        result.sort(
          (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
        );

        setAlerts(result);
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
