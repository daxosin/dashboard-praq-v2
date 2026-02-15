# Installation de la base de données — Dashboard PRAQ v2

## Prérequis

- Supabase CLI installé (`npm install -g supabase`)
- Compte Supabase configuré
- PostgreSQL >= 14

## Étape 1: Initialisation du projet Supabase

```bash
# Se placer à la racine du projet
cd "c:\Users\PP_MIKAELIAN\Desktop\projets digitaux\PRAQ dash"

# Initialiser Supabase (si pas déjà fait)
supabase init

# Lier au projet distant (si déjà créé)
supabase link --project-ref <YOUR_PROJECT_REF>

# OU démarrer en local
supabase start
```

## Étape 2: Appliquer les migrations

Les migrations sont dans `supabase/migrations/` et doivent être exécutées dans l'ordre:

```bash
# Option 1: Appliquer toutes les migrations automatiquement
supabase db push

# Option 2: Migration par migration (local)
supabase migration up
```

### Ordre strict d'exécution

1. `000_enums.sql` — Types énumérés (7 enums)
2. `001_tables.sql` — Tables principales (21 tables)
3. `030_triggers.sql` — Triggers updated_at + calculs risques
4. `031_alerts_view.sql` — Vue consolidée alertes
5. `040_rls.sql` — Row Level Security policies
6. `050_seed_domains.sql` — 16 domaines
7. `051_seed_sops.sql` — 90 SOPs
8. `052_seed_indicators.sql` — 8 indicateurs
9. `053_seed_equipment.sql` — Équipements + maintenance

## Étape 3: Vérifications

### 3.1 Vérifier les enums

```sql
SELECT typname FROM pg_type WHERE typname IN (
  'sop_status',
  'capa_status',
  'capa_source',
  'capa_type',
  'audit_status',
  'risk_level',
  'process_type'
);
```

Attendu: 7 lignes

### 3.2 Vérifier les tables

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Attendu: 21 tables

### 3.3 Vérifier les seed data

```sql
-- Domaines (attendu: 16)
SELECT COUNT(*) FROM domains;

-- SOPs (attendu: 90)
SELECT COUNT(*) FROM sops;

-- Breakdown SOPs par statut
SELECT status, COUNT(*) FROM sops GROUP BY status;
-- Attendu: Validé=18, En cours=33, Planifié=39

-- Indicateurs (attendu: 8)
SELECT COUNT(*) FROM indicators;

-- Équipements (attendu: 17)
SELECT COUNT(*) FROM equipment;

-- Maintenance (attendu: variable, au moins 15+)
SELECT COUNT(*) FROM maintenance;
```

### 3.4 Vérifier la vue alerts

```sql
SELECT type, COUNT(*) FROM alerts_view GROUP BY type;
```

Attendu: Vide au démarrage (normal, aucune alerte active)

### 3.5 Vérifier les triggers

```sql
-- Trigger updated_at (doit exister sur toutes les tables)
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;
```

Attendu: 21 triggers (un par table)

```sql
-- Trigger risk level
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'set_risk_level';
```

Attendu: 1 ligne

### 3.6 Vérifier RLS

```sql
-- RLS activé sur toutes les tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

Attendu: 21 lignes

```sql
-- Policies créées
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Attendu: Nombreuses policies (50+)

## Étape 4: Générer les types TypeScript

Types déjà créés dans `src/lib/database.types.ts`.

Pour régénérer depuis la DB:

```bash
# Local
supabase gen types typescript --local > src/lib/database.types.ts

# Distant
supabase gen types typescript --project-ref <YOUR_PROJECT_REF> > src/lib/database.types.ts
```

## Étape 5: Configuration Auth

### 5.1 Créer le premier utilisateur PRAQ

Via Supabase Dashboard > Authentication > Users > Add User:

- Email: emmanuel@pharma78.fr (ou autre)
- Password: [généré ou choisi]
- User Metadata (JSON):
  ```json
  {
    "role": "praq"
  }
  ```

### 5.2 Tester l'accès

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'emmanuel@pharma78.fr',
  password: 'votre_password',
});

// Test query
const { data: domains } = await supabase.from('domains').select('*');
console.log(domains); // Devrait retourner 16 domaines
```

## Étape 6: Créer des PINs terrain (optionnel)

Pour permettre aux collaborateurs de déclarer via le formulaire terrain:

### 6.1 Créer un collaborateur

```sql
INSERT INTO staff (name, role, email, active)
VALUES ('Marie Dupont', 'Préparateur', 'marie.dupont@pharma78.fr', true)
RETURNING id;
```

### 6.2 Créer son PIN (via app, pas SQL)

L'application doit hasher le PIN avec bcrypt avant insertion:

```typescript
import bcrypt from 'bcrypt';

const pin = '1234'; // PIN choisi par le collaborateur
const pin_hash = await bcrypt.hash(pin, 10);

await supabase.from('staff_pins').insert({
  staff_id: staff_id, // UUID du collaborateur
  pin_hash: pin_hash,
  locked: false,
  failed_attempts: 0,
});
```

## Dépannage

### Erreur: "type sop_status already exists"

```sql
DROP TYPE IF EXISTS sop_status CASCADE;
-- Puis relancer la migration 000
```

### Erreur: "relation domains already exists"

La base contient déjà des données. Pour reset complet (DANGER, efface tout):

```bash
supabase db reset
```

### Erreur RLS: "new row violates row-level security policy"

Vérifier que le user a bien le rôle dans ses metadata:

```sql
-- Via Supabase SQL Editor
SELECT auth.jwt();
-- Doit contenir "user_metadata": {"role": "praq"}
```

### Fonction get_user_role() retourne NULL

Se connecter en tant qu'utilisateur authentifié (pas anon).

### Alerts_view vide

Normal au démarrage. Pour tester, créer une CAPA en retard:

```sql
INSERT INTO capas (source, type, description, due_date, status)
VALUES ('Terrain', 'Anomalie', 'Test alerte', CURRENT_DATE - 1, 'Ouverte');

-- Puis vérifier
SELECT * FROM alerts_view;
```

## Performances

### Index créés automatiquement

Les index sont créés dans `001_tables.sql` sur:

- Toutes les foreign keys
- Champs de filtrage fréquents (status, due_date, expires_at, etc.)

### Optimisations recommandées

Si la base grossit (>10k lignes par table):

```sql
-- Vacuum régulier
VACUUM ANALYZE;

-- Statistiques
ANALYZE;

-- Index supplémentaires si requis (après analyse des query plans)
```

## Backup

### Export complet

```bash
# Local
supabase db dump -f backup.sql

# Distant
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Import

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

## Migration en production

1. Tester toutes les migrations en local d'abord
2. Backup de la DB de production
3. Appliquer les migrations:

```bash
supabase db push --project-ref <PROD_PROJECT_REF>
```

4. Vérifier les seed data
5. Créer le premier user PRAQ
6. Tester l'authentification
7. Tester les policies RLS

## Support

En cas de problème:

1. Vérifier les logs Supabase Dashboard > Logs
2. Tester les requêtes SQL dans SQL Editor
3. Vérifier la doc: https://supabase.com/docs
4. Contact: Emmanuel (PRAQ)

---

**Version**: 2.0
**Date**: 2026-02-15
**Projet**: Dashboard PRAQ Pharma78
