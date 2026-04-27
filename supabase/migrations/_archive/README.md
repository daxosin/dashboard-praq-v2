# Migrations Supabase — Dashboard PRAQ v2 Pharma78

## Architecture de la base de données

### Ordre d'exécution des migrations

Les migrations doivent être exécutées dans cet ordre strict:

1. **000_enums.sql** — Définition de tous les types énumérés
2. **001_tables.sql** — Création des 21 tables avec contraintes
3. **030_triggers.sql** — Triggers pour updated_at et calculs automatiques
4. **031_alerts_view.sql** — Vue consolidée des alertes
5. **040_rls.sql** — Policies de Row Level Security
6. **050_seed_domains.sql** — 16 domaines qualité
7. **051_seed_sops.sql** — 90 SOPs (18 validées, 33 en cours, 39 planifiées)
8. **052_seed_indicators.sql** — 8 indicateurs qualité
9. **053_seed_equipment.sql** — Équipements critiques + maintenance

## Structure

### Enums (7 types)

- `sop_status`: Planifié | En cours | Validé | En révision | Archivé
- `capa_status`: Ouverte | En cours | Vérification efficacité | Clôturée
- `capa_source`: Audit | Réclamation | Vigilance | Auto-évaluation | Revue direction | Terrain
- `capa_type`: Non-conformité | Action corrective | Action préventive | Amélioration | Anomalie | Near miss
- `audit_status`: Planifié | En cours | Réalisé | Reporté | Annulé
- `risk_level`: Acceptable | Surveillance | Inacceptable (calculé automatiquement)
- `process_type`: Management | Réalisation | Support

### Tables (21 tables)

#### Management & Configuration

1. **domains** — 16 domaines qualité (PDA, Stockage, Froid, etc.)
2. **staff** — Registre des collaborateurs
3. **staff_pins** — PINs 4 chiffres pour formulaire terrain (bcrypt hash)

#### Documents & Procédures

4. **sops** — 90 SOPs avec cycle de vie

#### CAPA & Amélioration

5. **capas** — Registre CAPA + déclarations terrain
6. **audits** — Programme d'audits
7. **audit_findings** — Constats détaillés par audit
8. **risks** — Cartographie des risques AMDEC

#### Vigilances & Retraits

9. **vigilances** — Signalements réglementaires ANSM
10. **recalls** — Retraits et rappels de lots

#### Ressources Humaines

11. **qualifications** — Habilitations par collaborateur
12. **trainings** — Plan de formation

#### Équipements & Métrologie

13. **equipment** — Parc d'équipements critiques
14. **maintenance** — Calendrier maintenance/métrologie

#### Fournisseurs

15. **suppliers** — Fournisseurs et sous-traitants
16. **supplier_events** — Incidents fournisseurs

#### Réclamations

17. **complaints** — Réclamations clients/EHPAD

#### Indicateurs

18. **indicators** — Objectifs qualité mesurables
19. **indicator_values** — Valeurs mensuelles (historique)

#### Revue de direction

20. **reviews** — Revues de direction §9.3
21. **review_actions** — Décisions et actions

### Vues (1 vue)

- **alerts_view** — Consolidation de toutes les alertes actives:
  - CAPA en retard (rouge)
  - Habilitations expirées/expirant (rouge/ambre)
  - Maintenance en retard (rouge)
  - SOPs à réviser (ambre)
  - Réclamations >48h sans réponse (rouge)
  - Vigilances graves non déclarées ANSM (rouge)

## Champs standards

Toutes les tables ont ces champs:

- `id` — UUID PRIMARY KEY (gen_random_uuid())
- `created_at` — TIMESTAMPTZ (auto)
- `updated_at` — TIMESTAMPTZ (auto-refresh via trigger)
- `created_by` — UUID FK vers auth.users (ON DELETE SET NULL)

## Triggers automatiques

### updated_at

Toutes les tables ont un trigger qui met à jour `updated_at` automatiquement à chaque modification.

### Calculs risques (table `risks`)

- **criticality** = probability × gravity × detectability (GENERATED ALWAYS)
- **level** = calculé automatiquement:
  - criticality >= 60 → Inacceptable
  - criticality >= 24 → Surveillance
  - criticality < 24 → Acceptable
- **residual_crit** = residual_p × residual_g × residual_d (GENERATED ALWAYS)

## Row Level Security (RLS)

### Rôles définis

#### PRAQ (admin)

- Accès complet CRUD sur toutes les tables
- Rôle défini dans `auth.jwt() -> user_metadata -> role`

#### Direction

- Lecture seule sur toutes les tables
- Aucune modification

#### Auditeur

- Lecture limitée: domains, sops, audits, audit_findings, risks, capas
- Accès temporaire

#### Resp_processus

- Lecture sur toutes les tables
- Modification limitée à son périmètre (géré par logique applicative)

#### Declarant (terrain)

- INSERT dans capas avec source='Terrain' uniquement
- SELECT sur ses propres déclarations (created_by = auth.uid())
- SELECT domains (pour formulaire)

## Données de seed

### 16 Domaines

Répartis en 3 types de processus:

- **Management** (2): Système documentaire, Management de la qualité
- **Réalisation** (9): PDA, Stockage, Froid, Stupéfiants, Préparations, Livraison EHPAD, Orthopédie, Officine, Téléconsultation
- **Support** (5): Hygiène, RH, Métrologie, Achats, SI

### 90 SOPs

- 18 validées (20%)
- 33 en cours (37%)
- 39 planifiées (43%)

Codes: SOP-PDA, SOP-STK, SOP-FRO, SOP-STU, SOP-PRE, SOP-LIV, SOP-ORT, SOP-OFF, SOP-TLC, SOP-HYG, SOP-DOC, SOP-GRH, SOP-MET, SOP-ACH, SOP-SIC, SOP-MQA

### 8 Indicateurs qualité

1. Taux erreur PDA (< 0.1%)
2. Réclamations < 48h (100%)
3. Ruptures chaîne froid (0)
4. Personnel habilité (100%)
5. SOPs critiques validées (90%)
6. Score fournisseurs (>70)
7. Audits réalisés (100%)
8. Délai moyen CAPA (<30j)

### Équipements critiques

- 2× Robot PDA Mekapharm
- 2× Groupe froid (PDA + officine)
- 3× Balance précision
- 8× Sonde température
- 1× Cabine téléconsultation
- 1× Automate stockage

Chaque équipement a sa maintenance préventive associée.

## Commandes Supabase

### Appliquer les migrations

```bash
# Toutes les migrations
supabase db push

# Ou une par une
supabase migration up
```

### Reset complet (DANGER)

```bash
supabase db reset
```

### Générer les types TypeScript

Les types sont déjà créés dans `src/lib/database.types.ts`.

Pour régénérer depuis Supabase:

```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

## Notes importantes

- **Encodage**: UTF-8 (caractères français, accents)
- **Dates**: Format ISO 8601, type TIMESTAMPTZ
- **UUIDs**: gen_random_uuid() (Postgres natif)
- **Contraintes FK**: ON DELETE SET NULL (sauf staff_pins → CASCADE)
- **Index**: Créés sur toutes les FK et champs de filtrage courants
- **Performance**: Vue alerts_view optimisée avec UNION ALL

## Validations

### Contraintes CHECK

- `risks.probability` ∈ [1, 5]
- `risks.gravity` ∈ [1, 5]
- `risks.detectability` ∈ [1, 5]
- `indicators.direction` ∈ {up, down}

### UNIQUE

- `domains.name`
- `sops.code`
- `audits.reference`
- `indicators.label`
- `indicator_values(indicator_id, period)`
- `staff_pins.staff_id`

## Dépendances

- PostgreSQL >= 14
- Extension `uuid-ossp` (pour gen_random_uuid, inclus dans Supabase)
- Supabase Auth (pour auth.users et auth.jwt())

## Types TypeScript

Fichier: `src/lib/database.types.ts` (547 lignes)

Exporte:

- Types pour tous les enums
- Types pour toutes les tables (Row, Insert, Update)
- Type Alert pour la vue alerts_view
- Type Database complet pour Supabase client

Usage:

```typescript
import type { Database, Capa, Alert, SopStatus } from '@/lib/database.types';

// Avec Supabase client
const supabase = createClient<Database>(...);

// Typage automatique
const { data } = await supabase.from('capas').select('*');
// data: Capa[] | null
```

## Maintenance

### Backup recommandé

```bash
# Dump complet
pg_dump -h db.xxx.supabase.co -U postgres pharma78 > backup.sql

# Restauration
psql -h db.xxx.supabase.co -U postgres pharma78 < backup.sql
```

### Monitoring

Tables à surveiller:

- `alerts_view` — Alertes actives
- `capas` WHERE status != 'Clôturée' — CAPA ouvertes
- `maintenance` WHERE next_due_at < CURRENT_DATE — Maintenance en retard
- `qualifications` WHERE expires_at < CURRENT_DATE + 30 — Habilitations à renouveler

---

**Dernière mise à jour**: 2026-02-15
**Version schema**: 2.0
**Contact**: Emmanuel (PRAQ Pharma78)
