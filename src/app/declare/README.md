# /declare — Formulaire Terrain

Module de déclaration terrain pour le Dashboard PRAQ v2 Pharma78.

## Structure

```
src/app/declare/
├── page.tsx          PIN Pad d'authentification (9.5 KB)
├── form/
│   └── page.tsx      Formulaire déclaration (16 KB)
└── README.md         Ce fichier
```

## Routes

### `/declare` — PIN Pad
Page d'authentification avec pavé numérique 4 chiffres.

Mode : **Nuit uniquement**

Fonctionnalités :
- Pavé numérique 3x4 tactile
- 4 dots PIN (remplis en vert accent)
- Validation automatique au 4ème chiffre
- Appel API `/api/verify-pin` avec bcrypt
- Shake animation si PIN incorrect
- Blocage après 5 échecs
- Succès : "Bonjour [Prénom]" → redirect `/declare/form`
- Encart "Mes 5 dernières déclarations"

### `/declare/form` — Formulaire
Formulaire de déclaration d'événement terrain.

Mode : **Nuit uniquement**

Auth : **Cookie `staff_auth` requis** (redirect `/declare` si absent)

Champs :
1. Type événement (requis) : Non-conformité / Anomalie / Near miss
2. Domaine (requis) : select depuis table `domains`
3. Zone (requis) : select 18 zones
4. Date (requis) : pré-rempli aujourd'hui
5. Description (requis) : min 10 caractères
6. Gravité (optionnel) : Faible / Moyenne / Élevée
7. Photo (optionnel) : upload Supabase Storage

Bouton "Envoyer" :
- Sticky bottom
- Disabled si champs requis invalides

Confirmation :
- Check vert + message
- Boutons "Nouvelle déclaration" / "Retour"

## API Route

### `POST /api/verify-pin`
Route serveur pour vérifier PIN avec bcrypt.

Fichier : `src/app/api/verify-pin/route.ts`

Request :
```json
{
  "pin": "1234"
}
```

Response (succès) :
```json
{
  "success": true,
  "staff": {
    "id": "uuid",
    "name": "Sophie Martin",
    "role": "Préparateur"
  }
}
```

Response (échec) :
```json
{
  "success": false,
  "message": "PIN incorrect"
}
```

Response (bloqué) :
```json
{
  "success": false,
  "locked": true,
  "message": "Compte bloqué"
}
```

## Données insérées

INSERT dans table `capas` :

```typescript
{
  source: "Terrain",
  type: "Non-conformité" | "Anomalie" | "Near miss",
  domain_id: UUID,
  description: string,
  status: "Ouverte",
  terrain_zone: string,           // 1 des 18 zones
  terrain_severity: string | null, // "Faible" | "Moyenne" | "Élevée"
  terrain_photo_url: string | null,
  created_by: UUID,               // staff.id
  owner: null,
  due_date: null,
}
```

## Variables CSS utilisées

Mode nuit (défaut) :
- `--bg` : #1A1A1A (background)
- `--card` : #242424 (card background)
- `--elev` : #2A2A2A (hover state)
- `--accent` : #00FF88 (vert néon)
- `--text` : #FFFFFF
- `--sec` : #C8C8C8 (secondary text)
- `--mut` : #888888 (muted text)
- `--brd` : #505050 (border)
- `--grn` : #00FF88 (vert)
- `--amb` : #FFB800 (ambre)
- `--red` : #FF4444 (rouge)

## Composants réutilisés

- `Badge` : `src/components/ui/Badge.tsx`
  - Variantes : ok (vert), wip (ambre), crit (rouge), plan (gris)

- `CheckIcon` : `src/components/icons/index.tsx`
  - Icône check pour écran succès

- `UploadIcon` : `src/components/icons/index.tsx`
  - Icône upload pour bouton photo

## Dépendances externes

- `next` : Framework React, Router, API Routes
- `react` : Hooks (useState, useEffect)
- `@supabase/ssr` : Client Supabase browser
- `@supabase/supabase-js` : Client Supabase server (API route)
- `bcryptjs` : Hash/compare PIN côté serveur

## Variables d'environnement

### `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

La `SERVICE_ROLE_KEY` est nécessaire pour l'API `/api/verify-pin` afin de contourner RLS et lire tous les `staff_pins`.

## Configuration Supabase

### Bucket Storage
Bucket : `photos`
- Public : Oui
- File size limit : 5 MB
- Allowed MIME types : image/jpeg, image/png, image/webp

Policies :
- Allow authenticated to upload `terrain-photos/`
- Allow public to view `terrain-photos/`

Script : `scripts/storage-setup.sql`

### Tables utilisées

- `staff` : Collaborateurs
- `staff_pins` : PINs hashés bcrypt
- `domains` : 16 domaines qualité
- `capas` : Déclarations terrain (source="Terrain")

## Flux utilisateur

1. User arrive sur `/declare`
2. Saisit PIN 4 chiffres
3. API vérifie bcrypt
4. Si succès :
   - Affiche "Bonjour [Prénom]"
   - Crée cookie `staff_auth` (expire 1h)
   - Redirect `/declare/form`
5. Si échec :
   - Shake animation
   - Message "PIN incorrect"
   - Reset dots
6. Sur `/declare/form` :
   - Remplit formulaire (< 60s)
   - Upload photo optionnel
   - Submit
7. Insert CAPA en BDD
8. Écran confirmation
9. "Nouvelle déclaration" ou "Retour"

## Tests

Plan de test complet : `docs/TESTS_TERRAIN.md`

Tests rapides :

### T1 : PIN Pad fonctionne
```
1. Ouvrir /declare
2. Saisir PIN 1111 (si seed-staff-pin.sql)
3. Vérifier "Bonjour Sophie" affiché
4. Vérifier redirect /declare/form
```

### T2 : Formulaire fonctionne
```
1. Sur /declare/form (après auth)
2. Cliquer "Near miss"
3. Sélectionner domaine
4. Sélectionner "Officine comptoir"
5. Description : "Test déclaration terrain"
6. Cliquer "Envoyer"
7. Vérifier "Déclaration enregistrée"
```

### T3 : Insert BDD
```sql
SELECT * FROM capas
WHERE source = 'Terrain'
ORDER BY created_at DESC
LIMIT 1;
```

## Critères d'acceptance

| CA | Description | Statut |
|----|-------------|--------|
| CA-T1 | PIN fonctionnel avec bcrypt | ✓ |
| CA-T2 | Blocage après 5 échecs | ✓ |
| CA-T3 | Déclaration < 60 secondes | ✓ |
| CA-T4 | Insert CAPA réussi | ✓ |
| CA-T8 | Mes 5 déclarations | ✓ |
| CA-T9 | Zéro donnée médicale | ✓ |
| CA-T10 | Upload photo | ✓ |

## Prochaines améliorations (V2.0d)

- Notification email PRAQ
- Notification email responsable domaine
- Notification email déclarant
- Tracking `failed_attempts`
- Rate limiting IP
- Audit trail

## Documentation complète

- Guide quickstart : `../../QUICKSTART_TERRAIN.md`
- Configuration : `../../TERRAIN_SETUP.md`
- Tests : `../../docs/TESTS_TERRAIN.md`
- 18 zones : `../../docs/ZONES_TERRAIN.md`
- Index : `../../INDEX_TERRAIN.md`

## Démo

PIN Pad standalone : http://localhost:3000/design-system/pin-pad

---

**Version** : V2.0c
**Date** : 2026-02-15
**Auteur** : Claude Opus 4.6 (terrain-builder)
