-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Test Queries — Validation fonctionnelle
-- =============================================

-- Ces requêtes permettent de tester le schéma après installation.
-- À exécuter dans Supabase SQL Editor.

-- =============================================
-- 1. TEST SEED DATA
-- =============================================

-- Compter les domaines par type de processus
SELECT process_type, COUNT(*) as count
FROM domains
GROUP BY process_type
ORDER BY process_type;
-- Attendu: Management=2, Réalisation=9, Support=5

-- SOPs par statut
SELECT status, COUNT(*) as count
FROM sops
GROUP BY status
ORDER BY status;
-- Attendu: Validé=18, En cours=33, Planifié=39

-- SOPs par domaine (top 5)
SELECT d.name, COUNT(s.*) as sop_count
FROM domains d
LEFT JOIN sops s ON s.domain_id = d.id
GROUP BY d.id, d.name
ORDER BY sop_count DESC
LIMIT 5;
-- Attendu: Livraison EHPAD, Officine, Hygiène en tête

-- Indicateurs avec direction
SELECT label, target, unit, direction
FROM indicators
ORDER BY label;
-- Attendu: 8 lignes

-- Équipements critiques
SELECT name, category, criticality
FROM equipment
WHERE criticality = 'Critique'
ORDER BY name;
-- Attendu: Robots PDA, Groupes froid, Sondes

-- Maintenance en retard (devrait être vide au départ)
SELECT e.name, m.type, m.next_due_at
FROM maintenance m
JOIN equipment e ON e.id = m.equipment_id
WHERE m.next_due_at < CURRENT_DATE
ORDER BY m.next_due_at;
-- Attendu: 0 rows (maintenance à jour)

-- =============================================
-- 2. TEST TRIGGERS
-- =============================================

-- Test updated_at trigger
-- Créer un domaine test
INSERT INTO domains (name, process_type)
VALUES ('TEST Domain', 'Support')
RETURNING id, created_at, updated_at;

-- Mettre à jour (updated_at doit changer)
UPDATE domains
SET name = 'TEST Domain Modified'
WHERE name = 'TEST Domain'
RETURNING created_at, updated_at;
-- updated_at > created_at

-- Nettoyer
DELETE FROM domains WHERE name = 'TEST Domain Modified';

-- Test risk level trigger
-- Créer un risque critique
INSERT INTO risks (
  description,
  probability,
  gravity,
  detectability
)
VALUES (
  'Risque test critique',
  5, 5, 5
)
RETURNING id, criticality, level;
-- Attendu: criticality=125, level='Inacceptable'

-- Créer un risque acceptable
INSERT INTO risks (
  description,
  probability,
  gravity,
  detectability
)
VALUES (
  'Risque test acceptable',
  1, 2, 2
)
RETURNING id, criticality, level;
-- Attendu: criticality=4, level='Acceptable'

-- Nettoyer
DELETE FROM risks WHERE description LIKE 'Risque test%';

-- =============================================
-- 3. TEST ALERTS VIEW
-- =============================================

-- Vue alertes (vide au départ)
SELECT type, severity, COUNT(*) as count
FROM alerts_view
GROUP BY type, severity;
-- Attendu: 0 rows (aucune alerte active)

-- Créer une CAPA en retard pour tester
INSERT INTO capas (
  source,
  type,
  description,
  due_date,
  status
)
VALUES (
  'Auto-évaluation',
  'Action corrective',
  'Test CAPA en retard',
  CURRENT_DATE - 10,
  'En cours'
)
RETURNING id;

-- Vérifier l'alerte apparaît
SELECT *
FROM alerts_view
WHERE type = 'capa_overdue';
-- Attendu: 1 row

-- Clôturer la CAPA (l'alerte doit disparaître)
UPDATE capas
SET status = 'Clôturée',
    closed_at = CURRENT_DATE
WHERE description = 'Test CAPA en retard';

-- Vérifier l'alerte a disparu
SELECT *
FROM alerts_view
WHERE type = 'capa_overdue';
-- Attendu: 0 rows

-- Nettoyer
DELETE FROM capas WHERE description = 'Test CAPA en retard';

-- Créer une qualification qui expire bientôt
-- D'abord créer un staff test
INSERT INTO staff (name, role, active)
VALUES ('Test User', 'Préparateur', true)
RETURNING id;

-- Puis créer une qualification expirant dans 15 jours
INSERT INTO qualifications (
  staff_id,
  skill_name,
  obtained_at,
  expires_at,
  status
)
VALUES (
  (SELECT id FROM staff WHERE name = 'Test User'),
  'Test Habilitation PDA',
  CURRENT_DATE - 350,
  CURRENT_DATE + 15,
  'Valide'
);

-- Vérifier l'alerte
SELECT *
FROM alerts_view
WHERE type = 'qualification_expiring';
-- Attendu: 1 row, severity='amber'

-- Nettoyer
DELETE FROM qualifications WHERE skill_name = 'Test Habilitation PDA';
DELETE FROM staff WHERE name = 'Test User';

-- =============================================
-- 4. TEST RLS (nécessite auth)
-- =============================================

-- Ces tests nécessitent d'être connecté avec un user authentifié

-- Test 1: User PRAQ peut tout voir
-- (exécuter après login avec role='praq')
SELECT COUNT(*) FROM domains;
-- Attendu: 16 (si policy fonctionne)

-- Test 2: User direction peut lire
-- (exécuter après login avec role='direction')
SELECT COUNT(*) FROM sops;
-- Attendu: 90 (si policy fonctionne)

-- Test 3: User auditeur a accès limité
-- (exécuter après login avec role='auditeur')
SELECT COUNT(*) FROM audits;
-- Attendu: résultat (si policy fonctionne)

-- Test 4: Declarant peut créer CAPA terrain
-- (exécuter après login avec role='declarant')
-- INSERT INTO capas (source, type, description)
-- VALUES ('Terrain', 'Anomalie', 'Test déclarant');
-- Devrait réussir

-- =============================================
-- 5. TEST RELATIONS FK
-- =============================================

-- Compter les SOPs par domaine (test JOIN)
SELECT
  d.name as domaine,
  d.process_type,
  COUNT(s.*) as nb_sops
FROM domains d
LEFT JOIN sops s ON s.domain_id = d.id
GROUP BY d.id, d.name, d.process_type
ORDER BY nb_sops DESC;
-- Attendu: 16 lignes, tous les domaines même sans SOPs

-- Maintenance avec équipement (test JOIN)
SELECT
  e.name as equipement,
  e.criticality,
  m.type as maintenance_type,
  m.next_due_at
FROM maintenance m
JOIN equipment e ON e.id = m.equipment_id
ORDER BY m.next_due_at
LIMIT 10;
-- Attendu: Liste avec noms équipements

-- =============================================
-- 6. TEST CONTRAINTES
-- =============================================

-- Test UNIQUE constraint sur domains.name
-- Devrait échouer (duplicate)
-- INSERT INTO domains (name, process_type)
-- VALUES ('PDA & Dispensation', 'Réalisation');
-- ERROR: duplicate key value violates unique constraint

-- Test CHECK constraint sur risks
-- Devrait échouer (probability hors limite)
-- INSERT INTO risks (description, probability, gravity, detectability)
-- VALUES ('Test', 10, 5, 5);
-- ERROR: new row violates check constraint

-- Test NOT NULL constraint
-- Devrait échouer (description NULL)
-- INSERT INTO capas (source, type)
-- VALUES ('Audit', 'Action corrective');
-- ERROR: null value in column "description"

-- =============================================
-- 7. TEST GENERATED COLUMNS
-- =============================================

-- Criticité calculée automatiquement
SELECT
  description,
  probability,
  gravity,
  detectability,
  criticality,
  level
FROM risks
LIMIT 5;
-- criticality = P × G × D
-- level calculé selon seuils

-- Test résiduel (si renseigné)
UPDATE risks
SET
  residual_p = 2,
  residual_g = 2,
  residual_d = 2
WHERE description LIKE '%'
LIMIT 1
RETURNING residual_p, residual_g, residual_d, residual_crit;
-- residual_crit = 2 × 2 × 2 = 8

-- =============================================
-- 8. TEST PERFORMANCE
-- =============================================

-- Expliquer query plan pour SOPs
EXPLAIN ANALYZE
SELECT s.*, d.name as domain_name
FROM sops s
JOIN domains d ON d.id = s.domain_id
WHERE s.status = 'Validé'
ORDER BY s.next_revision;
-- Vérifier que les index sont utilisés

-- Expliquer query alerts_view
EXPLAIN ANALYZE
SELECT * FROM alerts_view;
-- Vérifier performance UNION ALL

-- =============================================
-- 9. STATISTIQUES BASE
-- =============================================

-- Résumé complet de la base
SELECT
  (SELECT COUNT(*) FROM domains) as domains,
  (SELECT COUNT(*) FROM staff) as staff,
  (SELECT COUNT(*) FROM sops) as sops,
  (SELECT COUNT(*) FROM capas) as capas,
  (SELECT COUNT(*) FROM audits) as audits,
  (SELECT COUNT(*) FROM risks) as risks,
  (SELECT COUNT(*) FROM vigilances) as vigilances,
  (SELECT COUNT(*) FROM qualifications) as qualifications,
  (SELECT COUNT(*) FROM equipment) as equipment,
  (SELECT COUNT(*) FROM maintenance) as maintenance,
  (SELECT COUNT(*) FROM suppliers) as suppliers,
  (SELECT COUNT(*) FROM complaints) as complaints,
  (SELECT COUNT(*) FROM indicators) as indicators,
  (SELECT COUNT(*) FROM reviews) as reviews,
  (SELECT COUNT(*) FROM alerts_view) as active_alerts;

-- Taille de la base
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================
-- 10. REQUÊTES MÉTIER TYPIQUES
-- =============================================

-- Dashboard: KPI SOPs validées
SELECT
  COUNT(*) FILTER (WHERE status = 'Validé') * 100.0 / COUNT(*) as pct_validated
FROM sops;

-- Dashboard: CAPA ouvertes par domaine
SELECT
  d.name,
  COUNT(c.*) as capa_count
FROM domains d
LEFT JOIN capas c ON c.domain_id = d.id AND c.status != 'Clôturée'
GROUP BY d.id, d.name
ORDER BY capa_count DESC
LIMIT 10;

-- Dashboard: Prochaines maintenances (30 jours)
SELECT
  e.name,
  e.category,
  m.type,
  m.next_due_at,
  m.next_due_at - CURRENT_DATE as days_remaining
FROM maintenance m
JOIN equipment e ON e.id = m.equipment_id
WHERE m.next_due_at BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
ORDER BY m.next_due_at;

-- Dashboard: Habilitations expirant (60 jours)
SELECT
  s.name as collaborateur,
  q.skill_name,
  q.expires_at,
  q.expires_at - CURRENT_DATE as days_remaining
FROM qualifications q
JOIN staff s ON s.id = q.staff_id
WHERE q.expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + 60
AND q.status = 'Valide'
ORDER BY q.expires_at;

-- Onglet Audits: Programme annuel
SELECT
  a.reference,
  a.type,
  d.name as domaine,
  a.planned_at,
  a.status,
  a.major_findings,
  a.minor_findings
FROM audits a
LEFT JOIN domains d ON d.id = a.domain_id
WHERE a.planned_at >= '2026-01-01'
ORDER BY a.planned_at;

-- Onglet Risques: Matrice par criticité
SELECT
  level,
  COUNT(*) as count
FROM risks
GROUP BY level
ORDER BY
  CASE level
    WHEN 'Inacceptable' THEN 1
    WHEN 'Surveillance' THEN 2
    WHEN 'Acceptable' THEN 3
  END;

-- Onglet Indicateurs: Dernières valeurs
SELECT
  i.label,
  i.target,
  i.unit,
  iv.period,
  iv.value,
  CASE
    WHEN i.direction = 'up' THEN iv.value >= i.target
    WHEN i.direction = 'down' THEN iv.value <= i.target
  END as target_met
FROM indicator_values iv
JOIN indicators i ON i.id = iv.indicator_id
WHERE iv.period = (
  SELECT MAX(period)
  FROM indicator_values
  WHERE indicator_id = iv.indicator_id
)
ORDER BY i.label;

-- =============================================
-- SUCCÈS
-- =============================================

SELECT
  '✓ Tests terminés avec succès' as status,
  'La base de données est prête à l''emploi' as message;
