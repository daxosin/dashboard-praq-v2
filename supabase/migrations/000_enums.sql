-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 000 — Enums
-- =============================================

-- SOP Status
CREATE TYPE sop_status AS ENUM (
  'Planifié',
  'En cours',
  'Validé',
  'En révision',
  'Archivé'
);

-- CAPA Status
CREATE TYPE capa_status AS ENUM (
  'Ouverte',
  'En cours',
  'Vérification efficacité',
  'Clôturée'
);

-- CAPA Source
CREATE TYPE capa_source AS ENUM (
  'Audit',
  'Réclamation',
  'Vigilance',
  'Auto-évaluation',
  'Revue direction',
  'Terrain'
);

-- CAPA Type
CREATE TYPE capa_type AS ENUM (
  'Non-conformité',
  'Action corrective',
  'Action préventive',
  'Amélioration',
  'Anomalie',
  'Near miss'
);

-- Audit Status
CREATE TYPE audit_status AS ENUM (
  'Planifié',
  'En cours',
  'Réalisé',
  'Reporté',
  'Annulé'
);

-- Risk Level (calculated)
CREATE TYPE risk_level AS ENUM (
  'Acceptable',
  'Surveillance',
  'Inacceptable'
);

-- Process Type
CREATE TYPE process_type AS ENUM (
  'Management',
  'Réalisation',
  'Support'
);
