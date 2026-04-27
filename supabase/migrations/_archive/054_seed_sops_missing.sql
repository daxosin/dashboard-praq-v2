-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 054 — SOPs manquantes (audit ISO/ARS)
-- 21 SOPs identifiées par l'audit de conformité du 15/02/2026
-- + 12 indicateurs manquants
-- =============================================

-- ===== PARTIE 1 : 21 SOPs manquantes =====

DO $$
DECLARE
  d_pda UUID;
  d_stu UUID;
  d_liv UUID;
  d_off UUID;
  d_grh UUID;
  d_hyg UUID;
  d_sic UUID;
  d_mqa UUID;
BEGIN
  -- Get domain IDs
  SELECT id INTO d_pda FROM domains WHERE name = 'PDA & Dispensation';
  SELECT id INTO d_stu FROM domains WHERE name = 'Stupéfiants & Substances contrôlées';
  SELECT id INTO d_liv FROM domains WHERE name = 'Livraison EHPAD';
  SELECT id INTO d_off FROM domains WHERE name = 'Officine & Conseil';
  SELECT id INTO d_grh FROM domains WHERE name = 'Gestion des ressources humaines';
  SELECT id INTO d_hyg FROM domains WHERE name = 'Hygiène & Sécurité';
  SELECT id INTO d_sic FROM domains WHERE name = 'SI & Cybersécurité';
  SELECT id INTO d_mqa FROM domains WHERE name = 'Management de la qualité';

  -- ===== Stupéfiants — CRITIQUE (5 SOPs) =====
  -- Réf. audit : anomalie #1 (CRITIQUE) — couverture réglementaire insuffisante
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-STU-005', 'Inventaire physique trimestriel des stupéfiants', d_stu, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-STU-006', 'Rapprochement registre / stock physique et gestion des écarts', d_stu, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-STU-007', 'Gestion des stupéfiants en PDA (dispensation nominative EHPAD)', d_stu, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-STU-008', 'Transport sécurisé des stupéfiants vers EHPAD', d_stu, 'Thomas D.', 'Planifié', '0.1', NULL, NULL),
    ('SOP-STU-009', 'Déclaration ARS en cas d''écart d''inventaire ou vol de stupéfiants', d_stu, 'Emmanuel', 'Planifié', '0.1', NULL, NULL);

  -- ===== PDA / BPD — MAJEUR (4 SOPs) =====
  -- Réf. audit : anomalies #2-#5 — SOPs opérationnelles PDA manquantes
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-PDA-009', 'Double contrôle pharmacien avant libération PDA', d_pda, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-PDA-010', 'Analyse pharmaceutique de l''ordonnance (validation, interactions, CI)', d_pda, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-PDA-011', 'Protocole de Dispensation Individuelle Nominative (DIN)', d_pda, 'Marie L.', 'Planifié', '0.1', NULL, NULL),
    ('SOP-PDA-012', 'Gestion des refus de délivrance et signalement prescripteur', d_pda, 'Emmanuel', 'Planifié', '0.1', NULL, NULL);

  -- ===== Livraison EHPAD — MAJEUR (3 SOPs) =====
  -- Réf. audit : anomalies #9-#12 — couverture livraison EHPAD incomplète
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-LIV-009', 'Gestion des médicaments périmés (inventaire, retrait, destruction)', d_liv, 'Sophie R.', 'Planifié', '0.1', NULL, NULL),
    ('SOP-LIV-010', 'Convention tripartite pharmacie-EHPAD (modèle et suivi)', d_liv, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-LIV-011', 'Garde pharmaceutique et urgences EHPAD', d_liv, 'Thomas D.', 'Planifié', '0.1', NULL, NULL);

  -- ===== Pharmacovigilance — MAJEUR (3 SOPs) =====
  -- Réf. audit : anomalies #22-#23 — procédures vigilance absentes
  -- Rattachées au domaine Management de la qualité (complète SOP-MQA-006)
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-VIG-001', 'Procédure de déclaration initiale à l''ANSM (délais, formulaire, circuit)', d_mqa, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-VIG-002', 'Procédure de déclaration complémentaire et suivi', d_mqa, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-VIG-003', 'Gestion des retraits/rappels de lots (réception alerte, quarantaine, retour)', d_mqa, 'Marie L.', 'Planifié', '0.1', NULL, NULL);

  -- ===== Officine / CSP — MINEUR (3 SOPs) =====
  -- Réf. audit : anomalies #26 — SOPs réglementaires CSP manquantes
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-OFF-009', 'Publicité et information sur les médicaments (conformité CSP)', d_off, 'Léa M.', 'Planifié', '0.1', NULL, NULL),
    ('SOP-OFF-010', 'Garde et urgence pharmaceutique', d_off, 'Emmanuel', 'Planifié', '0.1', NULL, NULL),
    ('SOP-OFF-011', 'Gestion des médicaments à dispensation particulière (liste I/II, rétrocession)', d_off, 'Emmanuel', 'Planifié', '0.1', NULL, NULL);

  -- ===== GRH — MINEUR (1 SOP) =====
  -- Réf. audit : anomalie #27 — pas de suivi DPC spécifique
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-GRH-007', 'Suivi du DPC (Développement Professionnel Continu)', d_grh, 'Emmanuel', 'Planifié', '0.1', NULL, NULL);

  -- ===== Hygiène — RECOMMANDATION (1 SOP) =====
  -- Réf. audit : gestion déchets PDA non couverte
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-HYG-009', 'Plan de gestion des déchets (DASRI, cartons, emballages PDA)', d_hyg, 'Thomas D.', 'Planifié', '0.1', NULL, NULL);

  -- ===== SI — RECOMMANDATION (1 SOP) =====
  -- Réf. audit : PCA/PRA spécifique absent
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-SIC-006', 'Plan de continuité informatique (PCA/PRA spécifique)', d_sic, 'Emmanuel', 'Planifié', '0.1', NULL, NULL);

END $$;

-- ===== PARTIE 2 : 12 indicateurs manquants =====

-- Indicateurs critiques (MAJEUR)
INSERT INTO indicators (label, target, unit, direction, source_tab) VALUES
  ('Taux de conformité dispensation nominative', 99.5, '%', 'up', 'PDA & Dispensation'),
  ('Taux de satisfaction EHPAD', 80, '%', 'up', 'Livraison EHPAD'),
  ('Taux de formation réalisée vs planifiée', 90, '%', 'up', 'Formations & Habilitations'),
  ('Disponibilité robots PDA', 99, '%', 'up', 'Métrologie & Équipements'),
  ('Écarts inventaire stupéfiants', 0, 'count', 'down', 'Stupéfiants'),
  ('NC fournisseurs / mois', 3, 'count', 'down', 'Fournisseurs'),
  ('Délai réponse vigilances graves', 24, 'heures', 'down', 'Vigilances'),
  ('Conventions EHPAD à jour', 100, '%', 'up', 'Livraison EHPAD')
ON CONFLICT (label) DO NOTHING;

-- Indicateurs secondaires (MINEUR)
INSERT INTO indicators (label, target, unit, direction, source_tab) VALUES
  ('Incidents cybersécurité', 0, 'count', 'down', 'SI & Cybersécurité'),
  ('Couverture DPC pharmaciens', 100, '%', 'up', 'Formations & Habilitations'),
  ('Taux de préparations conformes', 99, '%', 'up', 'Préparations'),
  ('Near miss déclarés (tendance)', 0, 'count', 'up', 'Management qualité')
ON CONFLICT (label) DO NOTHING;
