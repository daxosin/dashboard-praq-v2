-- ============================================================
-- Création de la table CAPA (Actions Correctives et Préventives)
-- Migration appliquée en production le 2026-04-06 20:00:33 UTC
-- Rapatriée localement le 2026-04-27
-- ============================================================

CREATE TABLE public.capa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE,
  titre TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'CORRECTIVE' CHECK (type IN ('CORRECTIVE', 'PREVENTIVE')),
  source TEXT CHECK (source IN ('AUDIT', 'RECLAMATION', 'VIGILANCE', 'DYSFONCTIONNEMENT', 'REVUE', 'AUTRE')),
  description TEXT,
  responsable TEXT,
  date_ouverture DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE,
  date_cloture DATE,
  statut TEXT NOT NULL DEFAULT 'OUVERTE' CHECK (statut IN ('OUVERTE', 'EN_COURS', 'VERIFICATION', 'CLOSE')),
  priorite TEXT DEFAULT 'MOYENNE' CHECK (priorite IN ('HAUTE', 'MOYENNE', 'BASSE')),
  processus_id UUID REFERENCES public.processus(id),
  actions TEXT,
  verification_efficacite TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
