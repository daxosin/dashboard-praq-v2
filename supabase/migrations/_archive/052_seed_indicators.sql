-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 052 — Seed Indicators
-- =============================================

INSERT INTO indicators (label, target, unit, direction, source_tab) VALUES
  ('Taux d''erreur PDA', 0.1, '%', 'down', 'PDA & Dispensation'),
  ('Réclamations traitées < 48h', 100, '%', 'up', 'Réclamations & Satisfaction'),
  ('Ruptures chaîne du froid', 0, 'count', 'down', 'Chaîne du Froid'),
  ('Personnel habilité', 100, '%', 'up', 'Formations & Habilitations'),
  ('SOPs critiques validées', 90, '%', 'up', 'Documents & SOPs'),
  ('Score moyen fournisseurs', 70, 'score', 'up', 'Fournisseurs'),
  ('Audits réalisés vs planifiés', 100, '%', 'up', 'Audits'),
  ('Délai moyen CAPA', 30, 'jours', 'down', 'CAPA & Non-conformités')
ON CONFLICT (label) DO NOTHING;
