-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 050 — Seed Domains
-- =============================================

INSERT INTO domains (name, process_type) VALUES
  ('PDA & Dispensation', 'Réalisation'),
  ('Réception & Stockage', 'Réalisation'),
  ('Chaîne du Froid', 'Réalisation'),
  ('Stupéfiants & Substances contrôlées', 'Réalisation'),
  ('Préparations magistrales & officinales', 'Réalisation'),
  ('Livraison EHPAD', 'Réalisation'),
  ('Orthopédie & MAD', 'Réalisation'),
  ('Officine & Conseil', 'Réalisation'),
  ('Téléconsultation & TROD', 'Réalisation'),
  ('Hygiène & Sécurité', 'Support'),
  ('Système documentaire', 'Management'),
  ('Gestion des ressources humaines', 'Support'),
  ('Métrologie & Équipements', 'Support'),
  ('Achats & Fournisseurs', 'Support'),
  ('SI & Cybersécurité', 'Support'),
  ('Management de la qualité', 'Management')
ON CONFLICT (name) DO NOTHING;
