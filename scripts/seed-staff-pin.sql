-- =============================================
-- SEED : Staff avec PIN pour formulaire terrain
-- Dashboard PRAQ v2 — Pharma78
-- =============================================

-- 1. Créer 3 collaborateurs exemples
INSERT INTO staff (name, role, cluster, email, active, created_by)
VALUES
  ('Sophie Martin', 'Préparateur', 'PDA', 'sophie.martin@pharma78.fr', true, (SELECT id FROM auth.users WHERE email = 'praq@pharma78.fr')),
  ('Jean Dupont', 'Technicien maintenance', 'Logistique', 'jean.dupont@pharma78.fr', true, (SELECT id FROM auth.users WHERE email = 'praq@pharma78.fr')),
  ('Marie Bernard', 'Préparateur', 'Officine', 'marie.bernard@pharma78.fr', true, (SELECT id FROM auth.users WHERE email = 'praq@pharma78.fr'))
ON CONFLICT DO NOTHING;

-- 2. Créer les PINs (hash bcrypt pour les PINs suivants)
-- Sophie Martin : PIN 1111 → $2a$10$N9qo8uLOickgx2ZMRZoMye1kCRnMBFTPmEcIq4nKLRH7nN5lqo7V2
-- Jean Dupont   : PIN 2222 → $2a$10$5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5euG6YqHr8VZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5
-- Marie Bernard : PIN 3333 → $2a$10$7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7euG6YqHr8VZ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7

-- IMPORTANT : Ces hash sont des exemples. Pour générer des vrais hash bcrypt,
-- utilisez le script : node scripts/generate-pin.js <PIN>

INSERT INTO staff_pins (staff_id, pin_hash, locked, failed_attempts, created_by)
SELECT
  s.id,
  '$2a$10$N9qo8uLOickgx2ZMRZoMye1kCRnMBFTPmEcIq4nKLRH7nN5lqo7V2',
  false,
  0,
  (SELECT id FROM auth.users WHERE email = 'praq@pharma78.fr')
FROM staff s
WHERE s.name = 'Sophie Martin'
ON CONFLICT (staff_id) DO NOTHING;

-- Pour débloquer un compte verrouillé (PRAQ uniquement)
-- UPDATE staff_pins
-- SET locked = false, failed_attempts = 0
-- WHERE staff_id = '<staff_id_uuid>';

-- Pour réinitialiser un PIN
-- 1. Générer un nouveau hash avec : node scripts/generate-pin.js <NOUVEAU_PIN>
-- 2. UPDATE staff_pins SET pin_hash = '<NOUVEAU_HASH>' WHERE staff_id = '<staff_id_uuid>';

-- Vérifier les PINs créés
SELECT
  s.name,
  s.role,
  sp.locked,
  sp.failed_attempts,
  sp.created_at
FROM staff_pins sp
JOIN staff s ON s.id = sp.staff_id
ORDER BY s.name;
