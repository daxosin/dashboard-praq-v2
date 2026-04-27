-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 031 — Alerts View
-- =============================================

CREATE OR REPLACE VIEW alerts_view AS

-- CAPA overdue
SELECT
  id,
  'capa_overdue' AS type,
  'red' AS severity,
  'CAPA en retard: ' || COALESCE(description, 'Sans description') AS message,
  'capas' AS source_table,
  id AS source_id,
  created_at
FROM capas
WHERE due_date < CURRENT_DATE
  AND status != 'Clôturée'

UNION ALL

-- Qualification expiring soon (within 30 days)
SELECT
  id,
  'qualification_expiring' AS type,
  'amber' AS severity,
  'Habilitation expire bientôt: ' || skill_name AS message,
  'qualifications' AS source_table,
  id AS source_id,
  created_at
FROM qualifications
WHERE expires_at < CURRENT_DATE + INTERVAL '30 days'
  AND expires_at >= CURRENT_DATE
  AND status = 'Valide'

UNION ALL

-- Qualification expired
SELECT
  id,
  'qualification_expired' AS type,
  'red' AS severity,
  'Habilitation expirée: ' || skill_name AS message,
  'qualifications' AS source_table,
  id AS source_id,
  created_at
FROM qualifications
WHERE expires_at < CURRENT_DATE
  AND status = 'Valide'

UNION ALL

-- Maintenance overdue
SELECT
  id,
  'maintenance_overdue' AS type,
  'red' AS severity,
  'Maintenance en retard (équipement ID: ' || equipment_id::TEXT || ')' AS message,
  'maintenance' AS source_table,
  id AS source_id,
  created_at
FROM maintenance
WHERE next_due_at < CURRENT_DATE
  AND (status IS NULL OR status != 'Réalisé')

UNION ALL

-- SOP revision due
SELECT
  id,
  'sop_revision_due' AS type,
  'amber' AS severity,
  'Révision SOP requise: ' || code || ' - ' || title AS message,
  'sops' AS source_table,
  id AS source_id,
  created_at
FROM sops
WHERE next_revision < CURRENT_DATE
  AND status = 'Validé'

UNION ALL

-- Complaint overdue (>48h without response)
SELECT
  id,
  'complaint_overdue' AS type,
  'red' AS severity,
  'Réclamation sans réponse >48h: ' || category AS message,
  'complaints' AS source_table,
  id AS source_id,
  created_at
FROM complaints
WHERE status = 'Ouverte'
  AND created_at < now() - INTERVAL '48 hours'

UNION ALL

-- Vigilance undeclared to ANSM (severe cases)
SELECT
  id,
  'vigilance_undeclared' AS type,
  'red' AS severity,
  'Vigilance grave non déclarée ANSM: ' || COALESCE(product, 'Produit inconnu') AS message,
  'vigilances' AS source_table,
  id AS source_id,
  created_at
FROM vigilances
WHERE severity = 'Grave'
  AND declared_ansm = false
  AND status != 'Clôturée'

ORDER BY created_at DESC;

-- Add comment
COMMENT ON VIEW alerts_view IS 'Consolidated view of all active alerts across the quality system';
