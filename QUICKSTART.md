# Quickstart — Dashboard PRAQ v2

## Installation en 5 minutes

### 1. Prérequis

```bash
node --version  # >= 18
npm --version   # >= 9
```

### 2. Installer Supabase CLI

```bash
npm install -g supabase
supabase --version
```

### 3. Cloner et installer

```bash
cd "c:\Users\PP_MIKAELIAN\Desktop\projets digitaux\PRAQ dash"
npm install
```

### 4. Démarrer Supabase local

```bash
supabase start
```

Attendre quelques secondes. Vous verrez:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### 5. Appliquer les migrations

```bash
supabase db push
```

Attendu:

```
✓ All migrations applied successfully
```

### 6. Vérifier dans Studio

Ouvrir: http://localhost:54323

- Aller dans Table Editor
- Vous devriez voir 21 tables
- Cliquer sur `domains` → Voir 16 lignes
- Cliquer sur `sops` → Voir 90 lignes

### 7. Créer le premier user PRAQ

Dans Studio > Authentication > Users > Add User:

- Email: `emmanuel@pharma78.fr`
- Password: `[choisir un mot de passe]`
- Auto Confirm Email: **ON**

Puis dans User Management > Cliquer sur le user > Raw User Meta Data:

```json
{
  "role": "praq"
}
```

Sauvegarder.

### 8. Tester la connexion

Créer un fichier `test.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/lib/database.types';

const supabase = createClient<Database>(
  'http://localhost:54321',
  'eyJhbGc...' // anon key affiché au step 4
);

async function test() {
  // Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'emmanuel@pharma78.fr',
    password: 'votre_password',
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('✓ Logged in as:', authData.user?.email);

  // Test query
  const { data: domains, error } = await supabase.from('domains').select('*');

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log('✓ Domains:', domains?.length);
  console.log('✓ First domain:', domains?.[0]);

  // Test alerts view
  const { data: alerts } = await supabase.from('alerts_view').select('*');
  console.log('✓ Active alerts:', alerts?.length || 0);

  console.log('\n✓ Everything works!');
}

test();
```

Exécuter:

```bash
npx tsx test.ts
```

Attendu:

```
✓ Logged in as: emmanuel@pharma78.fr
✓ Domains: 16
✓ First domain: { id: '...', name: 'PDA & Dispensation', ... }
✓ Active alerts: 0

✓ Everything works!
```

### 9. Démarrer le dev server Next.js

```bash
npm run dev
```

Ouvrir: http://localhost:3000

## Commandes utiles

```bash
# Voir les logs Supabase
supabase logs

# Réinitialiser la DB (DANGER)
supabase db reset

# Arrêter Supabase
supabase stop

# Redémarrer
supabase start

# Status
supabase status

# Dump SQL
supabase db dump -f backup.sql

# Générer types TS
supabase gen types typescript --local > src/lib/database.types.ts
```

## Tester les queries SQL

Ouvrir Studio > SQL Editor et exécuter:

```sql
-- Seed data check
SELECT
  (SELECT COUNT(*) FROM domains) as domains,
  (SELECT COUNT(*) FROM sops) as sops,
  (SELECT COUNT(*) FROM indicators) as indicators,
  (SELECT COUNT(*) FROM equipment) as equipment;
-- Attendu: 16, 90, 8, 17

-- SOPs par statut
SELECT status, COUNT(*) FROM sops GROUP BY status;
-- Attendu: Validé=18, En cours=33, Planifié=39

-- Alertes actives
SELECT type, severity, COUNT(*) FROM alerts_view GROUP BY type, severity;
-- Attendu: 0 rows (aucune alerte au départ)
```

Voir `supabase/TEST_QUERIES.sql` pour tests complets.

## Vérifier le schéma

Dans Studio > SQL Editor:

```sql
-- Copier-coller le contenu de:
-- supabase/migrations/999_verify_schema.sql

-- Exécuter. Attendu:
-- ✓ All 7 enums created successfully
-- ✓ All 21 tables created successfully
-- ✓ All 21 updated_at triggers created successfully
-- ✓ alerts_view created successfully
-- ✓ RLS enabled on all 21 tables
-- ✓ 16 domains seeded
-- ✓ 90 SOPs seeded
-- etc.
```

## Structure du projet

```
PRAQ dash/
├── src/
│   └── lib/
│       └── database.types.ts       # Types TypeScript (547 lignes)
├── supabase/
│   ├── migrations/
│   │   ├── 000_enums.sql          # 7 enums
│   │   ├── 001_tables.sql         # 21 tables
│   │   ├── 030_triggers.sql       # 22 triggers
│   │   ├── 031_alerts_view.sql    # Vue consolidée
│   │   ├── 040_rls.sql            # 50+ policies
│   │   ├── 050_seed_domains.sql   # 16 domaines
│   │   ├── 051_seed_sops.sql      # 90 SOPs
│   │   ├── 052_seed_indicators.sql# 8 indicateurs
│   │   ├── 053_seed_equipment.sql # 17 équipements
│   │   ├── 999_verify_schema.sql  # Tests
│   │   └── README.md              # Doc détaillée
│   ├── INSTALL.md                 # Guide installation
│   └── TEST_QUERIES.sql           # Requêtes de test
├── DATABASE_DELIVERABLE.md        # Récapitulatif complet
└── QUICKSTART.md                  # Ce fichier
```

## Prochaines étapes

1. **Phase V2.0a** ✅ TERMINÉE
   - Schéma SQL complet
   - RLS policies
   - Seed data
   - Types TypeScript

2. **Phase V2.0b** (Semaines 2-3)
   - Scaffolding Next.js
   - 12 onglets dashboard
   - Composants partagés (EditableCell, Badge, KPI)
   - Charte graphique nuit/jour

3. **Phase V2.0c** (Semaine 3)
   - Route `/declare`
   - Pavé PIN 4 chiffres
   - Formulaire terrain 3 écrans
   - Notifications email

4. **Phase V2.0d** (Semaine 4)
   - Intégration alerts_view
   - Navigation inter-onglets
   - Score global SMQ
   - Déploiement Vercel

## Support

- **Documentation complète**: `supabase/migrations/README.md`
- **Guide installation**: `supabase/INSTALL.md`
- **Récapitulatif**: `DATABASE_DELIVERABLE.md`
- **Tests SQL**: `supabase/TEST_QUERIES.sql`

## Problèmes courants

### "relation domains already exists"

```bash
supabase db reset  # Reset complet
supabase db push   # Réappliquer
```

### "row-level security policy"

Vérifier que le user a bien `role: "praq"` dans ses metadata.

### Types TypeScript outdated

```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

### Port déjà utilisé

```bash
supabase stop
supabase start
```

---

**Status**: ✅ Ready to code
**Version**: 2.0
**Date**: 2026-02-15
