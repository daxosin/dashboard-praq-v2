# Quickstart : Formulaire Terrain

Guide de démarrage rapide pour tester le formulaire de déclaration terrain en 5 minutes.

## 1. Variables d'environnement (30 secondes)

Créez `.env.local` avec vos credentials Supabase :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

Trouvez ces clés dans : Supabase Dashboard > Settings > API

## 2. Créer le bucket Storage (1 minute)

Dans Supabase Dashboard > Storage :

1. Créez un bucket nommé `photos`
2. Cochez "Public bucket"
3. File size limit : 5 MB
4. Allowed MIME types : `image/jpeg, image/png, image/webp`

Puis exécutez le script SQL :

```bash
# Ouvrez Supabase SQL Editor et collez le contenu de :
scripts/storage-setup.sql
```

## 3. Créer un staff avec PIN (2 minutes)

### Option A : Avec le script Node.js

```bash
# Générer un hash pour le PIN 1234
node scripts/generate-pin.js 1234

# Copiez le hash affiché, puis dans Supabase SQL Editor :
INSERT INTO staff (name, role, email, active)
VALUES ('Test User', 'Préparateur', 'test@pharma78.fr', true);

INSERT INTO staff_pins (staff_id, pin_hash, locked, failed_attempts)
SELECT id, 'COLLEZ_LE_HASH_ICI', false, 0
FROM staff WHERE name = 'Test User';
```

### Option B : Avec le script SQL prêt

```bash
# Dans Supabase SQL Editor, exécutez :
# scripts/seed-staff-pin.sql
# (utilise le hash pour PIN 1111)
```

## 4. Vérifier les domaines (30 secondes)

Le formulaire nécessite au moins 1 domaine :

```sql
SELECT id, name FROM domains ORDER BY name LIMIT 5;
```

Si vide, créez un domaine test :

```sql
INSERT INTO domains (name, process_type)
VALUES ('Test Domaine', 'Réalisation');
```

## 5. Lancer le serveur (30 secondes)

```bash
npm run dev
```

## 6. Tester ! (1 minute)

### Test PIN Pad

1. Ouvrez http://localhost:3000/declare
2. Saisissez le PIN `1111` (si script SQL) ou `1234` (si script Node.js)
3. Vous devriez voir "Bonjour Test User" (ou "Sophie Martin")
4. Redirect automatique vers le formulaire

### Test Formulaire

1. Sur http://localhost:3000/declare/form
2. Remplissez :
   - Type : cliquez "Near miss"
   - Domaine : sélectionnez "Test Domaine"
   - Zone : sélectionnez "Officine comptoir"
   - Description : "Test de déclaration terrain" (>10 chars)
3. Cliquez "Envoyer"
4. Vous devriez voir "Déclaration enregistrée"

### Vérifier l'insert

```sql
SELECT
  id,
  source,
  type,
  description,
  terrain_zone,
  status,
  created_at
FROM capas
WHERE source = 'Terrain'
ORDER BY created_at DESC
LIMIT 5;
```

## Démo visuelle

Pour voir le PIN Pad en standalone :
- http://localhost:3000/design-system/pin-pad
- PIN test : 1234

## Troubleshooting

### Erreur "PIN incorrect" alors que c'est le bon
- Vérifiez que le hash bcrypt correspond bien au PIN
- Régénérez avec `node scripts/generate-pin.js <VOTRE_PIN>`

### Erreur "Compte bloqué"
- En SQL : `UPDATE staff_pins SET locked = false, failed_attempts = 0 WHERE staff_id = '<id>';`

### Erreur upload photo
- Vérifiez que le bucket `photos` existe
- Vérifiez les policies Storage avec `scripts/storage-setup.sql`

### Redirect vers /declare depuis /declare/form
- Le cookie `staff_auth` a expiré (1h)
- Re-saisissez votre PIN sur /declare

### Formulaire vide après submit
- Normal : c'est le comportement attendu
- Cliquez "Retour" pour voir vos déclarations

## Prochaines actions

1. Créez plus de staff avec PINs différents
2. Testez le blocage après 5 échecs
3. Testez l'upload photo
4. Testez "Mes déclarations" avec plusieurs entrées
5. Lancez les tests : voir `docs/TESTS_TERRAIN.md`

## Ressources

- Configuration complète : `TERRAIN_SETUP.md`
- Liste des fichiers : `TERRAIN_FILES.md`
- Tests complets : `docs/TESTS_TERRAIN.md`
- 18 zones : `docs/ZONES_TERRAIN.md`

---

Temps total : **5 minutes** ⚡
