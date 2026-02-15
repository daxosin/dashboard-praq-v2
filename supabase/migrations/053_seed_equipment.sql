-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 053 — Seed Equipment & Maintenance
-- =============================================

DO $$
DECLARE
  eq_robot1 UUID;
  eq_robot2 UUID;
  eq_froid_pda UUID;
  eq_froid_off UUID;
  eq_balance1 UUID;
  eq_balance2 UUID;
  eq_balance3 UUID;
  eq_sonde1 UUID;
  eq_sonde2 UUID;
  eq_sonde3 UUID;
  eq_sonde4 UUID;
  eq_sonde5 UUID;
  eq_sonde6 UUID;
  eq_sonde7 UUID;
  eq_sonde8 UUID;
  eq_cabine UUID;
  eq_automate UUID;
BEGIN

  -- ===== Equipment =====

  -- Robot PDA Mekapharm #1
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Robot PDA Mekapharm #1', 'Automate', 'Mekapharm M-Series', 'MEK-2025-001', 'Zone PDA', '2026-03-01', 'En service', 'Critique')
  RETURNING id INTO eq_robot1;

  -- Robot PDA Mekapharm #2
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Robot PDA Mekapharm #2', 'Automate', 'Mekapharm M-Series', 'MEK-2025-002', 'Zone PDA', '2026-03-01', 'En service', 'Critique')
  RETURNING id INTO eq_robot2;

  -- Groupe froid PDA
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Groupe froid PDA', 'Réfrigération', 'Liebherr MediLine', 'LBH-2025-PDA', 'Zone PDA', '2026-02-15', 'En service', 'Critique')
  RETURNING id INTO eq_froid_pda;

  -- Groupe froid officine
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Groupe froid officine', 'Réfrigération', 'Liebherr MediLine', 'LBH-2025-OFF', 'Officine', '2026-02-15', 'En service', 'Critique')
  RETURNING id INTO eq_froid_off;

  -- Balance précision #1
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Balance précision #1', 'Métrologie', 'Mettler Toledo AB204', 'MT-2025-001', 'Laboratoire', '2026-02-20', 'En service', 'Moyenne')
  RETURNING id INTO eq_balance1;

  -- Balance précision #2
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Balance précision #2', 'Métrologie', 'Mettler Toledo AB204', 'MT-2025-002', 'Laboratoire', '2026-02-20', 'En service', 'Moyenne')
  RETURNING id INTO eq_balance2;

  -- Balance précision #3
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Balance précision #3', 'Métrologie', 'Sartorius Entris', 'SAR-2025-001', 'Zone contrôle', '2026-02-25', 'En service', 'Moyenne')
  RETURNING id INTO eq_balance3;

  -- Sondes température (x8)
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #1', 'Monitoring', 'Testo 184 H1', 'TES-2025-001', 'Groupe froid PDA', '2026-02-15', 'En service', 'Critique')
  RETURNING id INTO eq_sonde1;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #2', 'Monitoring', 'Testo 184 H1', 'TES-2025-002', 'Groupe froid officine', '2026-02-15', 'En service', 'Critique')
  RETURNING id INTO eq_sonde2;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #3', 'Monitoring', 'Testo 184 H1', 'TES-2025-003', 'Armoire PDA', '2026-02-15', 'En service', 'Critique')
  RETURNING id INTO eq_sonde3;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #4', 'Monitoring', 'Testo 184 H1', 'TES-2025-004', 'Réserve froide', '2026-02-15', 'En service', 'Critique')
  RETURNING id INTO eq_sonde4;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #5', 'Monitoring', 'Testo 184 H1', 'TES-2025-005', 'Véhicule livraison #1', '2026-02-20', 'En service', 'Critique')
  RETURNING id INTO eq_sonde5;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #6', 'Monitoring', 'Testo 184 H1', 'TES-2025-006', 'Véhicule livraison #2', '2026-02-20', 'En service', 'Critique')
  RETURNING id INTO eq_sonde6;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #7', 'Monitoring', 'Testo 184 H1', 'TES-2025-007', 'Laboratoire', '2026-02-25', 'En service', 'Moyenne')
  RETURNING id INTO eq_sonde7;

  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Sonde température #8', 'Monitoring', 'Testo 184 H1', 'TES-2025-008', 'Local stockage', '2026-02-25', 'En service', 'Moyenne')
  RETURNING id INTO eq_sonde8;

  -- Cabine téléconsultation
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Cabine téléconsultation', 'Télémedecine', 'H4D DOMISanté', 'H4D-2025-001', 'Officine', '2026-03-05', 'En service', 'Faible')
  RETURNING id INTO eq_cabine;

  -- Automate stockage
  INSERT INTO equipment (name, category, brand_model, serial_no, location, commissioned_at, status, criticality)
  VALUES ('Automate stockage', 'Stockage', 'BD Rowa Vmax', 'ROW-2025-001', 'Réserve', '2026-02-28', 'En service', 'Moyenne')
  RETURNING id INTO eq_automate;

  -- ===== Maintenance préventive =====

  -- Robot PDA #1 - Maintenance trimestrielle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_robot1, 'Préventive', 'Trimestrielle', '2026-01-15', '2026-04-15', 'Mekapharm Service', NULL);

  -- Robot PDA #2 - Maintenance trimestrielle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_robot2, 'Préventive', 'Trimestrielle', '2026-01-15', '2026-04-15', 'Mekapharm Service', NULL);

  -- Groupe froid PDA - Qualification annuelle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status, certificate_ref)
  VALUES (eq_froid_pda, 'Qualification', 'Annuelle', '2025-12-10', '2026-12-10', 'ThermoControl SAS', NULL, 'QUAL-PDA-2025');

  -- Groupe froid officine - Qualification annuelle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status, certificate_ref)
  VALUES (eq_froid_off, 'Qualification', 'Annuelle', '2025-12-10', '2026-12-10', 'ThermoControl SAS', NULL, 'QUAL-OFF-2025');

  -- Balance #1 - Étalonnage annuel
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status, certificate_ref)
  VALUES (eq_balance1, 'Étalonnage', 'Annuelle', '2025-11-20', '2026-11-20', 'Mettler Toledo Service', NULL, 'ETAL-BAL1-2025');

  -- Balance #2 - Étalonnage annuel
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status, certificate_ref)
  VALUES (eq_balance2, 'Étalonnage', 'Annuelle', '2025-11-20', '2026-11-20', 'Mettler Toledo Service', NULL, 'ETAL-BAL2-2025');

  -- Balance #3 - Étalonnage annuel
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status, certificate_ref)
  VALUES (eq_balance3, 'Étalonnage', 'Annuelle', '2025-11-25', '2026-11-25', 'Sartorius Service', NULL, 'ETAL-BAL3-2025');

  -- Sondes température - Vérification semestrielle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde1, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde2, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde3, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde4, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde5, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde6, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde7, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_sonde8, 'Vérification', 'Semestrielle', '2025-12-01', '2026-06-01', 'Testo', NULL);

  -- Cabine téléconsultation - Maintenance annuelle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_cabine, 'Préventive', 'Annuelle', '2025-11-01', '2026-11-01', 'H4D Service', NULL);

  -- Automate stockage - Maintenance semestrielle
  INSERT INTO maintenance (equipment_id, type, frequency, last_done_at, next_due_at, provider, status)
  VALUES (eq_automate, 'Préventive', 'Semestrielle', '2025-12-15', '2026-06-15', 'BD Rowa', NULL);

END $$;
