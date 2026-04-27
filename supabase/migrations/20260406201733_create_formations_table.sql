-- ============================================================
-- Création des tables FORMATIONS et HABILITATIONS + RLS
-- Migration appliquée en production le 2026-04-06 20:17:33 UTC
-- Rapatriée localement le 2026-04-27
-- ============================================================

CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INTERNE', 'EXTERNE', 'DPC', 'E_LEARNING')),
  formateur TEXT,
  processus_id UUID REFERENCES processus(id),
  date_formation DATE,
  duree_heures NUMERIC(4,1),
  participants TEXT[], -- array of participant names
  nb_participants INTEGER DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'PLANIFIEE' CHECK (statut IN ('PLANIFIEE', 'REALISEE', 'ANNULEE', 'REPORTEE')),
  attestation BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitations tracking
CREATE TABLE habilitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborateur TEXT NOT NULL,
  poste TEXT,
  competence TEXT NOT NULL,
  processus_id UUID REFERENCES processus(id),
  date_obtention DATE,
  date_expiration DATE,
  statut TEXT NOT NULL DEFAULT 'VALIDE' CHECK (statut IN ('VALIDE', 'A_RENOUVELER', 'EXPIREE', 'EN_COURS')),
  formation_id UUID REFERENCES formations(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE habilitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_formations" ON formations FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_formations" ON formations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_formations" ON formations FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_read_habilitations" ON habilitations FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_habilitations" ON habilitations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_habilitations" ON habilitations FOR UPDATE TO anon USING (true);
