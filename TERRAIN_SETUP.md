# Configuration Formulaire Terrain

Ce document explique la configuration nécessaire pour le formulaire de déclaration terrain (`/declare`).

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

La `SUPABASE_SERVICE_ROLE_KEY` est nécessaire pour l'API `/api/verify-pin` afin de pouvoir lire la table `staff_pins` sans restrictions RLS.

## Configuration Supabase Storage

### 1. Créer le bucket photos

Dans Supabase Dashboard > Storage, créez un bucket nommé `photos` avec les paramètres :
- Public : Oui
- File size limit : 5 MB
- Allowed MIME types : image/jpeg, image/png, image/webp

### 2. Politique d'accès Storage

Ajoutez cette politique RLS pour le bucket `photos` :

```sql
-- Policy: Allow authenticated users to upload photos
CREATE POLICY "Allow terrain staff to upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = 'terrain-photos');

-- Policy: Allow public to view photos
CREATE POLICY "Allow public to view terrain photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = 'terrain-photos');
```

## Données seed requises

### 1. Créer un staff avec PIN

```sql
-- Créer un collaborateur
INSERT INTO staff (id, name, role, email, active)
VALUES (
  gen_random_uuid(),
  'Jean Dupont',
  'Préparateur',
  'jean.dupont@pharma78.fr',
  true
);

-- Créer le PIN (exemple: PIN 1234)
-- Le hash bcrypt ci-dessous correspond au PIN "1234"
INSERT INTO staff_pins (staff_id, pin_hash, locked, failed_attempts)
SELECT
  id,
  '$2a$10$N9qo8uLOickgx2ZMRZoMye1kCRnMBFTPmEcIq4nKLRH7nN5lqo7V2',
  false,
  0
FROM staff
WHERE name = 'Jean Dupont';
```

Pour générer un nouveau hash de PIN en Node.js :

```javascript
const bcrypt = require('bcryptjs');
const pin = '1234';
const hash = bcrypt.hashSync(pin, 10);
console.log(hash);
```

### 2. Vérifier que les domaines existent

Le formulaire nécessite que la table `domains` contienne au moins un domaine :

```sql
SELECT id, name FROM domains ORDER BY name;
```

## Architecture

### Fichiers créés

1. **`src/app/declare/page.tsx`** : PIN Pad d'authentification
   - Mode nuit UNIQUEMENT
   - Pavé numérique tactile 4 chiffres
   - Blocage après 5 échecs
   - Affichage des 5 dernières déclarations après auth

2. **`src/app/declare/form/page.tsx`** : Formulaire de déclaration
   - Mode nuit UNIQUEMENT
   - Type d'événement (3 boutons)
   - Sélection domaine (depuis Supabase)
   - Sélection zone (18 zones)
   - Date pré-remplie
   - Description (min 10 caractères)
   - Gravité ressentie (optionnel)
   - Upload photo (optionnel)
   - Bouton sticky en bas

3. **`src/app/api/verify-pin/route.ts`** : Route API de vérification PIN
   - Compare bcrypt avec tous les PINs non lockés
   - Reset `failed_attempts` en cas de succès
   - Retourne les infos staff si match

## Flux utilisateur

1. Utilisateur arrive sur `/declare`
2. Saisit PIN 4 chiffres sur le pavé
3. API vérifie le PIN avec bcrypt
4. Si succès : affiche "Bonjour [Prénom]" + redirect vers `/declare/form`
5. Si échec : shake animation + message erreur
6. Après 5 échecs : compte bloqué (nécessite déblocage PRAQ)
7. Sur `/declare/form` : formulaire pré-rempli avec date du jour
8. Validation : tous les champs sauf gravité et photo sont requis
9. Upload photo si fournie vers Supabase Storage
10. Insert dans table `capas` avec `source="Terrain"`
11. Écran de confirmation avec boutons "Nouvelle déclaration" et "Retour"

## Mapping type événement → type CAPA

- "Non-conformité" → type CAPA "Non-conformité"
- "Anomalie" → type CAPA "Anomalie"
- "Near miss" → type CAPA "Near miss"

## Structure données insérées

```typescript
{
  source: "Terrain",
  type: eventType, // Non-conformité | Anomalie | Near miss
  domain_id: domainId,
  description: description,
  status: "Ouverte",
  terrain_zone: zone,
  terrain_severity: severity || null,
  terrain_photo_url: photoUrl || null,
  created_by: staffAuth.id,
  owner: null,
  due_date: null,
  root_cause: null,
  action: null,
  closed_at: null,
  efficacy_check: null,
  efficacy_result: null
}
```

## Critères d'acceptance

- CA-T1 : PIN fonctionnel avec bcrypt
- CA-T2 : Blocage après 5 échecs
- CA-T3 : Déclaration complète en < 60 secondes
- CA-T4 : Insert dans table capas réussi
- CA-T8 : Mes 5 dernières déclarations affichées après PIN
- CA-T10 : Upload photo optionnel fonctionnel

## Prochaines étapes (V2.0d)

- Notification email PRAQ après déclaration
- Notification email responsable domaine
- Notification email déclarant quand PRAQ qualifie
- Compteur de tentatives PIN avec lock automatique
