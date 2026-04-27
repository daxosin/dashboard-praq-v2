-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 001 — Tables
-- =============================================

-- =============================================
-- 1. DOMAINS
-- =============================================
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name TEXT NOT NULL UNIQUE,
  process_type process_type NOT NULL
);

-- =============================================
-- 2. STAFF
-- =============================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  role TEXT NOT NULL,
  cluster TEXT,
  email TEXT,
  active BOOLEAN DEFAULT true
);

-- =============================================
-- 3. STAFF PINS (for terrain form auth)
-- =============================================
CREATE TABLE staff_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE UNIQUE,
  pin_hash TEXT NOT NULL,
  locked BOOLEAN DEFAULT false,
  failed_attempts INTEGER DEFAULT 0
);

-- =============================================
-- 4. SOPS
-- =============================================
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE SET NULL,
  owner TEXT,
  status sop_status DEFAULT 'Planifié',
  version TEXT DEFAULT '1.0',
  validated_at DATE,
  next_revision DATE,
  notes TEXT
);

-- =============================================
-- 5. CAPAS
-- =============================================
CREATE TABLE capas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  source capa_source NOT NULL,
  type capa_type NOT NULL,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  action TEXT,
  owner TEXT,
  due_date DATE,
  status capa_status DEFAULT 'Ouverte',
  closed_at DATE,
  efficacy_check TEXT,
  efficacy_result TEXT,

  -- Terrain form specific fields
  terrain_zone TEXT,
  terrain_severity TEXT,
  terrain_photo_url TEXT
);

-- =============================================
-- 6. AUDITS
-- =============================================
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  type TEXT NOT NULL,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  reference TEXT NOT NULL UNIQUE,
  auditor TEXT,
  planned_at DATE,
  completed_at DATE,
  status audit_status DEFAULT 'Planifié',
  major_findings INTEGER DEFAULT 0,
  minor_findings INTEGER DEFAULT 0,
  observations INTEGER DEFAULT 0,
  strengths TEXT,
  summary TEXT
);

-- =============================================
-- 7. AUDIT FINDINGS
-- =============================================
CREATE TABLE audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  clause_ref TEXT,
  description TEXT NOT NULL,
  capa_id UUID REFERENCES capas(id) ON DELETE SET NULL
);

-- =============================================
-- 8. RISKS (AMDEC)
-- =============================================
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  causes TEXT,
  consequences TEXT,

  -- Initial evaluation
  probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
  gravity INTEGER NOT NULL CHECK (gravity >= 1 AND gravity <= 5),
  detectability INTEGER NOT NULL CHECK (detectability >= 1 AND detectability <= 5),
  criticality INTEGER GENERATED ALWAYS AS (probability * gravity * detectability) STORED,
  level risk_level,

  -- Mitigation
  mitigation TEXT,
  owner TEXT,
  review_due DATE,

  -- Residual evaluation
  residual_p INTEGER CHECK (residual_p >= 1 AND residual_p <= 5),
  residual_g INTEGER CHECK (residual_g >= 1 AND residual_g <= 5),
  residual_d INTEGER CHECK (residual_d >= 1 AND residual_d <= 5),
  residual_crit INTEGER GENERATED ALWAYS AS (
    COALESCE(residual_p, probability) *
    COALESCE(residual_g, gravity) *
    COALESCE(residual_d, detectability)
  ) STORED
);

-- =============================================
-- 9. VIGILANCES
-- =============================================
CREATE TABLE vigilances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  type TEXT NOT NULL,
  product TEXT,
  lot TEXT,
  severity TEXT,
  declared_ansm BOOLEAN DEFAULT false,
  ansm_ref TEXT,
  measures TEXT,
  capa_id UUID REFERENCES capas(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'En cours'
);

-- =============================================
-- 10. RECALLS
-- =============================================
CREATE TABLE recalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  source TEXT NOT NULL,
  product TEXT NOT NULL,
  lots TEXT,
  action TEXT NOT NULL,
  quantity TEXT,
  status TEXT DEFAULT 'En cours'
);

-- =============================================
-- 11. QUALIFICATIONS
-- =============================================
CREATE TABLE qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  obtained_at DATE NOT NULL,
  expires_at DATE,
  status TEXT DEFAULT 'Valide'
);

-- =============================================
-- 12. TRAININGS
-- =============================================
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  planned_at DATE,
  completed_at DATE,
  evaluation TEXT,
  next_due DATE
);

-- =============================================
-- 13. EQUIPMENT
-- =============================================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand_model TEXT,
  serial_no TEXT,
  location TEXT,
  commissioned_at DATE,
  status TEXT DEFAULT 'En service',
  criticality TEXT DEFAULT 'Moyenne'
);

-- =============================================
-- 14. MAINTENANCE
-- =============================================
CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  frequency TEXT,
  last_done_at DATE,
  next_due_at DATE NOT NULL,
  provider TEXT,
  status TEXT,
  result TEXT,
  certificate_ref TEXT
);

-- =============================================
-- 15. SUPPLIERS
-- =============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  contract TEXT,
  last_eval_at DATE,
  eval_score INTEGER,
  rgpd_clause BOOLEAN DEFAULT false,
  hds_compliant BOOLEAN DEFAULT false
);

-- =============================================
-- 16. SUPPLIER EVENTS
-- =============================================
CREATE TABLE supplier_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  action TEXT,
  capa_id UUID REFERENCES capas(id) ON DELETE SET NULL
);

-- =============================================
-- 17. COMPLAINTS
-- =============================================
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  source TEXT NOT NULL,
  ehpad_name TEXT,
  category TEXT NOT NULL,
  severity TEXT,
  owner TEXT,
  responded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Ouverte',
  satisfaction TEXT,
  capa_id UUID REFERENCES capas(id) ON DELETE SET NULL
);

-- =============================================
-- 18. INDICATORS
-- =============================================
CREATE TABLE indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  label TEXT NOT NULL UNIQUE,
  target NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  source_tab TEXT
);

-- =============================================
-- 19. INDICATOR VALUES
-- =============================================
CREATE TABLE indicator_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  indicator_id UUID NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  value NUMERIC NOT NULL,

  UNIQUE(indicator_id, period)
);

-- =============================================
-- 20. REVIEWS (Revue de direction)
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  date DATE NOT NULL,
  participants TEXT,
  status TEXT DEFAULT 'Planifiée',
  context_notes TEXT,
  resource_notes TEXT,
  improvement TEXT
);

-- =============================================
-- 21. REVIEW ACTIONS
-- =============================================
CREATE TABLE review_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  action TEXT,
  owner TEXT,
  due_date DATE,
  status TEXT DEFAULT 'En cours',
  followup_notes TEXT
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_sops_domain ON sops(domain_id);
CREATE INDEX idx_sops_status ON sops(status);
CREATE INDEX idx_capas_domain ON capas(domain_id);
CREATE INDEX idx_capas_status ON capas(status);
CREATE INDEX idx_capas_source ON capas(source);
CREATE INDEX idx_capas_due_date ON capas(due_date);
CREATE INDEX idx_audits_domain ON audits(domain_id);
CREATE INDEX idx_audit_findings_audit ON audit_findings(audit_id);
CREATE INDEX idx_risks_domain ON risks(domain_id);
CREATE INDEX idx_qualifications_staff ON qualifications(staff_id);
CREATE INDEX idx_qualifications_expires ON qualifications(expires_at);
CREATE INDEX idx_trainings_staff ON trainings(staff_id);
CREATE INDEX idx_maintenance_equipment ON maintenance(equipment_id);
CREATE INDEX idx_maintenance_next_due ON maintenance(next_due_at);
CREATE INDEX idx_supplier_events_supplier ON supplier_events(supplier_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_indicator_values_indicator ON indicator_values(indicator_id);
CREATE INDEX idx_review_actions_review ON review_actions(review_id);
