-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 051 — Seed SOPs
-- 90 SOPs réalistes — 18 validées, 33 en cours, 39 planifiées
-- =============================================

-- Helper to get domain IDs
DO $$
DECLARE
  d_pda UUID;
  d_stk UUID;
  d_fro UUID;
  d_stu UUID;
  d_pre UUID;
  d_liv UUID;
  d_ort UUID;
  d_off UUID;
  d_tlc UUID;
  d_hyg UUID;
  d_doc UUID;
  d_grh UUID;
  d_met UUID;
  d_ach UUID;
  d_sic UUID;
  d_mqa UUID;
BEGIN
  -- Get domain IDs
  SELECT id INTO d_pda FROM domains WHERE name = 'PDA & Dispensation';
  SELECT id INTO d_stk FROM domains WHERE name = 'Réception & Stockage';
  SELECT id INTO d_fro FROM domains WHERE name = 'Chaîne du Froid';
  SELECT id INTO d_stu FROM domains WHERE name = 'Stupéfiants & Substances contrôlées';
  SELECT id INTO d_pre FROM domains WHERE name = 'Préparations magistrales & officinales';
  SELECT id INTO d_liv FROM domains WHERE name = 'Livraison EHPAD';
  SELECT id INTO d_ort FROM domains WHERE name = 'Orthopédie & MAD';
  SELECT id INTO d_off FROM domains WHERE name = 'Officine & Conseil';
  SELECT id INTO d_tlc FROM domains WHERE name = 'Téléconsultation & TROD';
  SELECT id INTO d_hyg FROM domains WHERE name = 'Hygiène & Sécurité';
  SELECT id INTO d_doc FROM domains WHERE name = 'Système documentaire';
  SELECT id INTO d_grh FROM domains WHERE name = 'Gestion des ressources humaines';
  SELECT id INTO d_met FROM domains WHERE name = 'Métrologie & Équipements';
  SELECT id INTO d_ach FROM domains WHERE name = 'Achats & Fournisseurs';
  SELECT id INTO d_sic FROM domains WHERE name = 'SI & Cybersécurité';
  SELECT id INTO d_mqa FROM domains WHERE name = 'Management de la qualité';

  -- ===== PDA & Dispensation (8 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-PDA-001', 'Réception et traitement des ordonnances PDA', d_pda, 'Emmanuel', 'Validé', '2.1', '2025-11-15', '2026-11-15'),
    ('SOP-PDA-002', 'Exploitation du robot Mekapharm', d_pda, 'Emmanuel', 'Validé', '1.0', '2025-12-10', '2026-12-10'),
    ('SOP-PDA-003', 'Contrôle qualité avant livraison EHPAD', d_pda, 'Marie L.', 'En cours', '0.9', NULL, NULL),
    ('SOP-PDA-004', 'Gestion des erreurs de dispensation', d_pda, 'Emmanuel', 'Validé', '1.2', '2025-10-20', '2026-04-20'),
    ('SOP-PDA-005', 'Traçabilité des lots dispensés', d_pda, 'Marie L.', 'En cours', '0.8', NULL, NULL),
    ('SOP-PDA-006', 'Reconditionnement unitaire', d_pda, 'Thomas D.', 'Planifié', '0.1', NULL, NULL),
    ('SOP-PDA-007', 'Gestion des piluliers hebdomadaires', d_pda, 'Marie L.', 'Planifié', '0.1', NULL, NULL),
    ('SOP-PDA-008', 'Interface LGO - Robot PDA', d_pda, 'Emmanuel', 'En cours', '0.7', NULL, NULL);

  -- ===== Réception & Stockage (5 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-STK-001', 'Réception des livraisons grossistes', d_stk, 'Sophie R.', 'Validé', '1.1', '2025-11-01', '2026-11-01'),
    ('SOP-STK-002', 'Contrôle quantitatif et qualitatif', d_stk, 'Sophie R.', 'En cours', '0.9', NULL, NULL),
    ('SOP-STK-003', 'Rangement et organisation des stocks', d_stk, 'Thomas D.', 'En cours', '0.6', NULL, NULL),
    ('SOP-STK-004', 'Gestion des retours fournisseurs', d_stk, 'Sophie R.', 'Planifié', '0.2', NULL, NULL),
    ('SOP-STK-005', 'Inventaire tournant', d_stk, 'Emmanuel', 'Planifié', '0.1', NULL, NULL);

  -- ===== Chaîne du Froid (4 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-FRO-001', 'Surveillance température enceintes froides', d_fro, 'Marie L.', 'Validé', '1.3', '2025-09-15', '2026-09-15'),
    ('SOP-FRO-002', 'Conduite à tenir en cas de rupture chaîne du froid', d_fro, 'Emmanuel', 'Validé', '1.0', '2025-10-05', '2026-10-05'),
    ('SOP-FRO-003', 'Qualification thermique annuelle', d_fro, 'Emmanuel', 'En cours', '0.8', NULL, NULL),
    ('SOP-FRO-004', 'Transport réfrigéré vers EHPAD', d_fro, 'Thomas D.', 'Planifié', '0.3', NULL, NULL);

  -- ===== Stupéfiants & Substances contrôlées (4 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-STU-001', 'Gestion du coffre stupéfiants', d_stu, 'Emmanuel', 'Validé', '2.0', '2025-08-20', '2026-08-20'),
    ('SOP-STU-002', 'Registre des mouvements stupéfiants', d_stu, 'Emmanuel', 'En cours', '0.9', NULL, NULL),
    ('SOP-STU-003', 'Destruction de stupéfiants périmés', d_stu, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-STU-004', 'Contrôle accès substances vénéneuses', d_stu, 'Sophie R.', 'Planifié', '0.2', NULL, NULL);

  -- ===== Préparations magistrales & officinales (4 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-PRE-001', 'Réalisation de préparations magistrales', d_pre, 'Marie L.', 'Validé', '1.0', '2025-12-01', '2026-12-01'),
    ('SOP-PRE-002', 'Nettoyage du laboratoire de préparation', d_pre, 'Marie L.', 'En cours', '0.8', NULL, NULL),
    ('SOP-PRE-003', 'Contrôle qualité des matières premières', d_pre, 'Emmanuel', 'En cours', '0.6', NULL, NULL),
    ('SOP-PRE-004', 'Étiquetage et conservation', d_pre, 'Marie L.', 'Planifié', '0.3', NULL, NULL);

  -- ===== Livraison EHPAD (8 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-LIV-001', 'Planning hebdomadaire de livraison', d_liv, 'Thomas D.', 'Validé', '1.2', '2025-11-20', '2026-11-20'),
    ('SOP-LIV-002', 'Préparation des dotations EHPAD', d_liv, 'Thomas D.', 'En cours', '0.9', NULL, NULL),
    ('SOP-LIV-003', 'Circuit du médicament en EHPAD', d_liv, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-LIV-004', 'Gestion des urgences EHPAD', d_liv, 'Thomas D.', 'Planifié', '0.4', NULL, NULL),
    ('SOP-LIV-005', 'Traitement des retours EHPAD', d_liv, 'Sophie R.', 'Planifié', '0.2', NULL, NULL),
    ('SOP-LIV-006', 'Interface LGO - Logiciels EHPAD', d_liv, 'Emmanuel', 'En cours', '0.6', NULL, NULL),
    ('SOP-LIV-007', 'Audits pharmaceutiques en EHPAD', d_liv, 'Emmanuel', 'Planifié', '0.3', NULL, NULL),
    ('SOP-LIV-008', 'Formation du personnel EHPAD', d_liv, 'Marie L.', 'Planifié', '0.2', NULL, NULL);

  -- ===== Orthopédie & MAD (4 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-ORT-001', 'Prise de mesures orthopédiques', d_ort, 'Léa M.', 'En cours', '0.9', NULL, NULL),
    ('SOP-ORT-002', 'Commande et suivi fournisseurs orthopédie', d_ort, 'Léa M.', 'Planifié', '0.4', NULL, NULL),
    ('SOP-ORT-003', 'Installation matériel à domicile', d_ort, 'Thomas D.', 'Planifié', '0.3', NULL, NULL),
    ('SOP-ORT-004', 'Maintenance équipements location', d_ort, 'Thomas D.', 'Planifié', '0.1', NULL, NULL);

  -- ===== Officine & Conseil (8 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-OFF-001', 'Accueil et écoute du patient', d_off, 'Léa M.', 'Validé', '1.0', '2025-12-15', '2026-12-15'),
    ('SOP-OFF-002', 'Délivrance sur ordonnance', d_off, 'Emmanuel', 'Validé', '1.1', '2025-10-10', '2026-10-10'),
    ('SOP-OFF-003', 'Conseil en aromathérapie', d_off, 'Léa M.', 'En cours', '0.8', NULL, NULL),
    ('SOP-OFF-004', 'Gestion des médicaments à marge thérapeutique étroite', d_off, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-OFF-005', 'Programme d\'accompagnement patients chroniques', d_off, 'Marie L.', 'Planifié', '0.4', NULL, NULL),
    ('SOP-OFF-006', 'Tests rapides d\'orientation diagnostique (TROD)', d_off, 'Léa M.', 'En cours', '0.6', NULL, NULL),
    ('SOP-OFF-007', 'Gestion du rayon parapharmacie', d_off, 'Sophie R.', 'Planifié', '0.2', NULL, NULL),
    ('SOP-OFF-008', 'Programme fidélité L\'Écrin', d_off, 'Léa M.', 'Planifié', '0.3', NULL, NULL);

  -- ===== Téléconsultation & TROD (4 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-TLC-001', 'Exploitation de la cabine de téléconsultation', d_tlc, 'Léa M.', 'En cours', '0.9', NULL, NULL),
    ('SOP-TLC-002', 'Hygiène et désinfection cabine', d_tlc, 'Léa M.', 'Planifié', '0.5', NULL, NULL),
    ('SOP-TLC-003', 'Réalisation TROD angine', d_tlc, 'Marie L.', 'En cours', '0.8', NULL, NULL),
    ('SOP-TLC-004', 'Vaccination antigrippale', d_tlc, 'Emmanuel', 'Planifié', '0.6', NULL, NULL);

  -- ===== Hygiène & Sécurité (8 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-HYG-001', 'Nettoyage quotidien des locaux', d_hyg, 'Sophie R.', 'Validé', '1.0', '2025-11-25', '2026-11-25'),
    ('SOP-HYG-002', 'Gestion des déchets DASRI', d_hyg, 'Thomas D.', 'Validé', '1.1', '2025-10-15', '2026-10-15'),
    ('SOP-HYG-003', 'Plan de maîtrise sanitaire', d_hyg, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-HYG-004', 'Conduite à tenir en cas d\'incendie', d_hyg, 'Thomas D.', 'Planifié', '0.5', NULL, NULL),
    ('SOP-HYG-005', 'Prévention risques chimiques', d_hyg, 'Emmanuel', 'Planifié', '0.3', NULL, NULL),
    ('SOP-HYG-006', 'Ergonomie postes de travail', d_hyg, 'Sophie R.', 'Planifié', '0.2', NULL, NULL),
    ('SOP-HYG-007', 'Plan de continuité d\'activité', d_hyg, 'Emmanuel', 'En cours', '0.6', NULL, NULL),
    ('SOP-HYG-008', 'Contrôle d\'accès et vidéosurveillance', d_hyg, 'Thomas D.', 'Planifié', '0.4', NULL, NULL);

  -- ===== Système documentaire (6 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-DOC-001', 'Rédaction et validation des procédures', d_doc, 'Emmanuel', 'Validé', '1.0', '2025-12-20', '2026-12-20'),
    ('SOP-DOC-002', 'Gestion des révisions documentaires', d_doc, 'Emmanuel', 'En cours', '0.8', NULL, NULL),
    ('SOP-DOC-003', 'Archivage et conservation', d_doc, 'Sophie R.', 'Planifié', '0.4', NULL, NULL),
    ('SOP-DOC-004', 'Diffusion et communication interne', d_doc, 'Marie L.', 'Planifié', '0.3', NULL, NULL),
    ('SOP-DOC-005', 'Liste maîtresse des documents', d_doc, 'Emmanuel', 'En cours', '0.9', NULL, NULL),
    ('SOP-DOC-006', 'Gestion des enregistrements qualité', d_doc, 'Emmanuel', 'En cours', '0.7', NULL, NULL);

  -- ===== Gestion des ressources humaines (6 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-GRH-001', 'Recrutement et intégration', d_grh, 'Emmanuel', 'Validé', '1.0', '2025-11-10', '2026-11-10'),
    ('SOP-GRH-002', 'Plan de formation annuel', d_grh, 'Emmanuel', 'En cours', '0.8', NULL, NULL),
    ('SOP-GRH-003', 'Évaluation des compétences', d_grh, 'Marie L.', 'Planifié', '0.5', NULL, NULL),
    ('SOP-GRH-004', 'Gestion des habilitations', d_grh, 'Emmanuel', 'En cours', '0.9', NULL, NULL),
    ('SOP-GRH-005', 'Entretiens annuels', d_grh, 'Emmanuel', 'Planifié', '0.3', NULL, NULL),
    ('SOP-GRH-006', 'DUERP - Document unique', d_grh, 'Emmanuel', 'En cours', '0.6', NULL, NULL);

  -- ===== Métrologie & Équipements (5 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-MET-001', 'Programme métrologique annuel', d_met, 'Emmanuel', 'Validé', '1.2', '2025-09-10', '2026-09-10'),
    ('SOP-MET-002', 'Étalonnage des balances', d_met, 'Marie L.', 'En cours', '0.9', NULL, NULL),
    ('SOP-MET-003', 'Qualification des équipements critiques', d_met, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-MET-004', 'Maintenance préventive', d_met, 'Thomas D.', 'Planifié', '0.4', NULL, NULL),
    ('SOP-MET-005', 'Gestion du parc informatique', d_met, 'Emmanuel', 'Planifié', '0.3', NULL, NULL);

  -- ===== Achats & Fournisseurs (5 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-ACH-001', 'Référencement nouveaux fournisseurs', d_ach, 'Emmanuel', 'Validé', '1.0', '2025-12-05', '2026-12-05'),
    ('SOP-ACH-002', 'Évaluation annuelle des fournisseurs', d_ach, 'Emmanuel', 'En cours', '0.8', NULL, NULL),
    ('SOP-ACH-003', 'Gestion des contrats et conventions', d_ach, 'Sophie R.', 'Planifié', '0.4', NULL, NULL),
    ('SOP-ACH-004', 'Traitement des non-conformités fournisseurs', d_ach, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-ACH-005', 'Clause RGPD sous-traitants', d_ach, 'Emmanuel', 'En cours', '0.6', NULL, NULL);

  -- ===== SI & Cybersécurité (5 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-SIC-001', 'Politique de sécurité des systèmes d\'information', d_sic, 'Emmanuel', 'Validé', '1.0', '2025-11-30', '2026-11-30'),
    ('SOP-SIC-002', 'Sauvegarde et restauration données', d_sic, 'Emmanuel', 'En cours', '0.9', NULL, NULL),
    ('SOP-SIC-003', 'Gestion des accès utilisateurs', d_sic, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-SIC-004', 'Conduite à tenir en cas de cyberattaque', d_sic, 'Emmanuel', 'Planifié', '0.5', NULL, NULL),
    ('SOP-SIC-005', 'Conformité RGPD - Données patients', d_sic, 'Emmanuel', 'En cours', '0.8', NULL, NULL);

  -- ===== Management de la qualité (6 SOPs) =====
  INSERT INTO sops (code, title, domain_id, owner, status, version, validated_at, next_revision) VALUES
    ('SOP-MQA-001', 'Politique qualité générale', d_mqa, 'Emmanuel', 'Validé', '1.0', '2025-12-01', '2026-12-01'),
    ('SOP-MQA-002', 'Traitement des CAPA', d_mqa, 'Emmanuel', 'Validé', '1.1', '2025-10-25', '2026-10-25'),
    ('SOP-MQA-003', 'Audits internes qualité', d_mqa, 'Emmanuel', 'En cours', '0.9', NULL, NULL),
    ('SOP-MQA-004', 'Revue de direction annuelle', d_mqa, 'Emmanuel', 'En cours', '0.8', NULL, NULL),
    ('SOP-MQA-005', 'Gestion des risques (AMDEC)', d_mqa, 'Emmanuel', 'En cours', '0.7', NULL, NULL),
    ('SOP-MQA-006', 'Déclarations de vigilances', d_mqa, 'Emmanuel', 'Planifié', '0.5', NULL, NULL);

END $$;
