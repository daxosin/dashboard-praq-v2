# Index : Documentation Formulaire Terrain

Guide de navigation rapide pour tous les fichiers liés au formulaire terrain.

## Démarrage rapide

### Je veux tester en 5 minutes
→ **[QUICKSTART_TERRAIN.md](QUICKSTART_TERRAIN.md)**
- Setup variables env
- Créer bucket Storage
- Créer staff avec PIN
- Tester !

### Je veux comprendre l'architecture
→ **[DELIVRABLE_TERRAIN.md](DELIVRABLE_TERRAIN.md)**
- Résumé exécutif
- Technologies utilisées
- Critères d'acceptance (7/10 ✓)
- Prochaines étapes V2.0d

### Je veux la configuration complète
→ **[TERRAIN_SETUP.md](TERRAIN_SETUP.md)**
- Variables d'environnement
- Configuration Supabase Storage
- Données seed requises
- Flux utilisateur complet
- Structure données insérées

## Documentation détaillée

### Liste de tous les fichiers créés
→ **[TERRAIN_FILES.md](TERRAIN_FILES.md)**
- 11 fichiers détaillés
- Structure arborescence
- Poids total (51.8 KB)
- Dépendances
- Variables CSS custom

### Liste des 18 zones
→ **[docs/ZONES_TERRAIN.md](docs/ZONES_TERRAIN.md)**
- 18 zones groupées par catégorie
- Mapping zone → domaine
- Exemples de déclarations

### Plan de test complet
→ **[docs/TESTS_TERRAIN.md](docs/TESTS_TERRAIN.md)**
- 30 tests définis
- Tests PIN Pad (6)
- Tests Formulaire (16)
- Tests API (4)
- Tests Performance (2)
- Tests Sécurité (2)

## Code source

### Pages Next.js

#### PIN Pad d'authentification
`src/app/declare/page.tsx` (9.5 KB)
- Pavé numérique tactile
- Validation bcrypt
- Mes 5 déclarations

#### Formulaire déclaration
`src/app/declare/form/page.tsx` (16 KB)
- 8 champs (type, domaine, zone, date, description, gravité, photo, submit)
- Upload photo Supabase Storage
- Insert CAPA terrain

#### API vérification PIN
`src/app/api/verify-pin/route.ts` (2.3 KB)
- POST { pin: string }
- Comparaison bcrypt
- Retourne staff info

#### Composant démo
`src/app/design-system/pin-pad/page.tsx` (4.5 KB)
- Démo standalone PIN Pad
- PIN test : 1234

## Scripts

### Générer hash PIN
```bash
node scripts/generate-pin.js <PIN>
```
Fichier : `scripts/generate-pin.js` (1.1 KB)

### Seed staff avec PIN
```sql
-- Exécuter dans Supabase SQL Editor
scripts/seed-staff-pin.sql
```
Fichier : `scripts/seed-staff-pin.sql` (2.1 KB)

### Setup Storage
```sql
-- Exécuter dans Supabase SQL Editor
scripts/storage-setup.sql
```
Fichier : `scripts/storage-setup.sql` (1.5 KB)

## URLs locales

### Formulaire terrain
- PIN Pad : http://localhost:3000/declare
- Formulaire : http://localhost:3000/declare/form

### Démo
- PIN Pad standalone : http://localhost:3000/design-system/pin-pad

## Par cas d'usage

### Je veux créer un nouveau staff avec PIN
1. Générer hash : `node scripts/generate-pin.js 1234`
2. INSERT dans Supabase :
   ```sql
   INSERT INTO staff (name, role, email, active)
   VALUES ('Nom Prénom', 'Rôle', 'email@pharma78.fr', true);

   INSERT INTO staff_pins (staff_id, pin_hash, locked, failed_attempts)
   SELECT id, '<HASH_BCRYPT>', false, 0
   FROM staff WHERE name = 'Nom Prénom';
   ```

### Je veux débloquer un compte verrouillé
```sql
UPDATE staff_pins
SET locked = false, failed_attempts = 0
WHERE staff_id = '<staff_id_uuid>';
```

### Je veux voir toutes les déclarations terrain
```sql
SELECT
  c.id,
  c.created_at,
  c.type,
  d.name as domaine,
  c.terrain_zone,
  c.description,
  c.terrain_severity,
  c.status,
  s.name as declarant
FROM capas c
LEFT JOIN domains d ON d.id = c.domain_id
LEFT JOIN staff s ON s.id = c.created_by
WHERE c.source = 'Terrain'
ORDER BY c.created_at DESC;
```

### Je veux tester l'API verify-pin
```bash
curl -X POST http://localhost:3000/api/verify-pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

### Je veux voir les dernières déclarations d'un staff
```sql
SELECT
  id,
  created_at,
  type,
  terrain_zone,
  status
FROM capas
WHERE created_by = '<staff_id_uuid>'
  AND source = 'Terrain'
ORDER BY created_at DESC
LIMIT 5;
```

## Troubleshooting rapide

### Erreur "PIN incorrect" alors que c'est le bon
→ Vérifier hash bcrypt dans `staff_pins.pin_hash`
→ Régénérer avec `node scripts/generate-pin.js <PIN>`

### Erreur "Compte bloqué"
→ Débloquer avec :
```sql
UPDATE staff_pins SET locked = false, failed_attempts = 0
WHERE staff_id = '<id>';
```

### Erreur upload photo
→ Vérifier bucket `photos` existe
→ Exécuter `scripts/storage-setup.sql`

### Redirect vers /declare depuis /declare/form
→ Cookie `staff_auth` expiré (1h)
→ Re-saisir PIN sur /declare

### Formulaire vide après submit
→ Normal, comportement attendu
→ Cliquer "Retour" pour voir déclarations

## Résumé fichiers

| Fichier | Taille | Type | Description |
|---------|--------|------|-------------|
| `src/app/declare/page.tsx` | 9.5 KB | Code | PIN Pad |
| `src/app/declare/form/page.tsx` | 16 KB | Code | Formulaire |
| `src/app/api/verify-pin/route.ts` | 2.3 KB | Code | API Route |
| `src/app/design-system/pin-pad/page.tsx` | 4.5 KB | Code | Démo |
| `scripts/generate-pin.js` | 1.1 KB | Script | Générer hash |
| `scripts/seed-staff-pin.sql` | 2.1 KB | Script | Seed staff |
| `scripts/storage-setup.sql` | 1.5 KB | Script | Setup Storage |
| `DELIVRABLE_TERRAIN.md` | 10 KB | Doc | Résumé exécutif |
| `TERRAIN_SETUP.md` | 4.8 KB | Doc | Configuration |
| `TERRAIN_FILES.md` | 5.5 KB | Doc | Liste fichiers |
| `QUICKSTART_TERRAIN.md` | 2 KB | Doc | Démarrage rapide |
| `docs/ZONES_TERRAIN.md` | 2.3 KB | Doc | 18 zones |
| `docs/TESTS_TERRAIN.md` | 8 KB | Doc | Plan de test |
| **TOTAL** | **69.6 KB** | - | - |

## Critères d'acceptance

| CA | Description | Statut | Fichier |
|----|-------------|--------|---------|
| CA-T1 | PIN fonctionnel avec bcrypt | ✓ | page.tsx, route.ts |
| CA-T2 | Blocage après 5 échecs | ✓ | route.ts |
| CA-T3 | Déclaration < 60 secondes | ✓ | form/page.tsx |
| CA-T4 | Insert CAPA réussi | ✓ | form/page.tsx |
| CA-T5 | Notification PRAQ | V2.0d | - |
| CA-T6 | Notification responsable | V2.0d | - |
| CA-T7 | Notification déclarant | V2.0d | - |
| CA-T8 | Mes 5 déclarations | ✓ | page.tsx |
| CA-T9 | Zéro donnée médicale | ✓ | form/page.tsx |
| CA-T10 | Upload photo | ✓ | form/page.tsx |

**7/10 implémentés en V2.0c** ✓
**3/10 reportés en V2.0d** (notifications email)

## Prochaines étapes

### V2.0d (semaine 4)
- [ ] Notification email PRAQ (CA-T5)
- [ ] Notification email responsable domaine (CA-T6)
- [ ] Notification email déclarant (CA-T7)
- [ ] Tracking `failed_attempts` dans API
- [ ] Rate limiting par IP
- [ ] Audit trail tentatives PIN

### V2.1 (post-livraison)
- [ ] Tests end-to-end Playwright
- [ ] Documentation API OpenAPI
- [ ] Historique déclarations terrain dans dashboard
- [ ] Export PDF déclaration

---

**Navigation rapide** :
[Quickstart](QUICKSTART_TERRAIN.md) |
[Setup](TERRAIN_SETUP.md) |
[Tests](docs/TESTS_TERRAIN.md) |
[Zones](docs/ZONES_TERRAIN.md) |
[Fichiers](TERRAIN_FILES.md) |
[Livrable](DELIVRABLE_TERRAIN.md)

**Version** : V2.0c
**Date** : 2026-02-15
**Projet** : Dashboard PRAQ v2 — Pharma78
