# CLAUDE.md — Dashboard PRAQ v2 (Pharma78)

> Ce fichier est la mémoire du projet pour Claude Code. Lis-le AVANT toute action.
> Dernière maj : 2026-06-10 par Claude (alignement schéma prod, branche `chore/align-db-schema`).

---

## Mission actuelle (priorité critique)

**LE PIVOT VERCEL EST FAIT** : depuis le 2026-05-15, https://praq-dashboard.vercel.app/ sert **ce repo Next.js** (deploy automatique sur push GitHub `main`). L'ancien bundle Vite orphelin n'est plus en prod.

**Conséquence** : tout push sur `main` part en prod. La mission est d'achever l'alignement du code sur le schéma DB réel **via branches + deploy preview**, jamais en direct sur main.

**État de l'alignement (2026-06-10, branche `chore/align-db-schema`) :**

1. ✅ Migrations synchronisées (10/10) + types TS générés (`src/lib/database.types.ts`, alias dans `src/lib/db-rows.ts`).
2. ✅ Score SMQ via RPC DB `kpi_smq_current_scoped` (useSmqScore), PHSQ dynamique (usePhsqLatest), alertes réelles (useAlerts), TabTableauDeBord aligné.
3. 🔄 Onglets en cours d'alignement sur les tables réelles (voir mapping ci-dessous).
4. ❌ Flux terrain `/declare` : dépend de `staff_pins`, `domains`, bucket `photos` qui n'existent PAS en prod — décision fonctionnelle à prendre (créer les migrations ou refondre le flux sur `declarations` + `staff_lite`).

---

## Contexte historique — RÉSOLU (gardé pour mémoire)

Le projet a longtemps été divisé en 2 codebases : ce repo Next.js (jamais déployé) et un Vite SPA orphelin en prod (code source perdu, compteurs PHSQ hardcodés). Résolu le 2026-05-15 : `vercel.json` force `framework: nextjs`, le push GitHub `daxosin/dashboard-praq-v2@main` déclenche les deploys. Le preset "vite" qui traîne encore dans les settings du projet Vercel est cosmétique (overridé par vercel.json) mais mériterait d'être corrigé.

### Points dangereux à connaître

- **`main` = prod immédiate.** Travailler sur branche, vérifier le deploy preview, puis merger.
- **La base prod évolue SANS ce repo** (SQL direct via Cowork/MCP : 14 tables hors migration, voir `supabase/migrations/README.md`). Avant tout chantier : re-vérifier le schéma réel (`generate_typescript_types` ou `db pull`), ne jamais faire confiance au CLAUDE.md seul.
- **Le Dockerfile + `.env.production`** sont des reliquats du setup Coolify. Ignorés par Vercel ; vérifier qu'aucune clé ne traîne dans `.env.production`.
- **`SOPs-Pharma78/` est dans `.gitignore`** : ce sont des binaires .docx métier, pas du code. Ne pas les commiter.
- **Le `.git/config` historique** était cassé (pointait vers `refs/heads/master`). Réparé le 2026-04-27.
- **Anciennes migrations** dans `supabase/migrations/_archive/` : NE PAS les rejouer. Schéma anglais obsolète (capas, equipment, complaints, risks). Conservées pour traçabilité ISO.

---

## Stack technique réelle

- **Framework** : Next.js 15 (App Router) + React 19 + TypeScript strict
- **Backend** : Supabase (PostgreSQL 17) — projet `igsrwmigysgspqskwhqy` (région eu-west-3, ACTIVE_HEALTHY)
- **UI** : Tailwind CSS 4, tokens CSS dual-theme (nuit/jour)
- **Charts** : Recharts
- **Auth** : Supabase Auth (email/pwd dashboard). PIN bcrypt terrain : CASSÉ (table `staff_pins` absente en prod, voir TODOs)
- **Icônes** : SVG inline monochromes (trait 1.5–2px) — **AUCUN EMOJI**
- **Hosting** : Vercel (deploy auto sur push GitHub, `main` = prod)

## Branding (règle absolue)

- **Toujours "Pharma78"** — JAMAIS "H8 Pharma" sur ce projet.
- Pharma78 = pharmacie 2500m² Bois-d'Arcy (78), ouverte mars 2026.
- Périmètre : 9 EHPAD, PDA robotisée, officine, orthopédie, parapharmacie premium, téléconsultation.
- Utilisateur cible : PRAQ (Pharmacien Responsable Assurance Qualité).
- Classification données : L1 — métier qualité, **zéro donnée patient**.

---

## Schéma base prod

Projet Supabase : `igsrwmigysgspqskwhqy`
URL : `https://igsrwmigysgspqskwhqy.supabase.co`

### 31 tables réelles en prod (schéma `public`) — relevé 2026-06-10

**Source de vérité du schéma : `src/lib/database.types.ts`** (généré depuis la prod). Les alias de types par table sont dans `src/lib/db-rows.ts` — les composants importent depuis db-rows, jamais depuis database.types directement.

Tables métier avec données : `sops` (119), `risques` (38), `vigilances` (24), `equipements` (19), `processus` (16), `declarations` (15), `capa` (8), `indicateurs` (8), `formations` (7), `smq_config` (7), `staff_lite` (36 collaborateurs), `phsq_snapshots` (42), `kpi_history` (3+), `habilitations` (2), `reclamations` (2), `revue_direction` (2), `tracabilites_suivi` (4), `cold_chain_anomalies` (9), `cold_chain_monthly_sync` (2).

Tables vides (structure prête) : `audits` (1), `audit_findings`, `fournisseurs`, `maintenance`, `indicateurs_valeurs`, `revue_actions`, `plan_strategique`, `projets`, `projet_taches`, `evaluations_collaborateur`.

Tables système (ne pas toucher depuis le front) : `audit_log` (trail 2797+), `cowork_runs`.

Toutes les tables métier ont un **soft delete** (`deleted_at`) — `useSupabaseCrud` filtre automatiquement `deleted_at IS NULL`.

### Mapping appliqué dans `src/` (branche chore/align-db-schema)

```
capas            → capa
equipment        → equipements
complaints       → reclamations
risks            → risques
qualifications   → habilitations
trainings        → formations
suppliers        → fournisseurs       (supplier_events : pas d'équivalent, feature retirée)
indicators       → indicateurs
indicator_values → indicateurs_valeurs
reviews          → revue_direction
review_actions   → revue_actions
staff            → staff_lite
domains          → processus          (référentiel de catégorisation)
recalls          → vigilances type='RETRAIT_LOT'
alerts_view      → calcul client dans useAlerts (la vue n'existe pas)
status           → statut             (partout, valeurs UPPERCASE des CHECK constraints)
```

### Fonctions DB à utiliser (ne pas recalculer côté client)

- `kpi_smq_current_scoped(p_perimetre)` : score SMQ global + breakdown pondéré par `smq_config` — consommé par `useSmqScore`. Périmètres : GLOBAL | OFFICINE | PDA.
- `kpi_smq_components_scoped(p_perimetre)` : détail par composante.
- `freeze_rdd(p_rdd_id)` : fige une revue de direction (snapshots JSONB). Trigger auto au passage statut='REALISEE'.

### Tables que le code attendait et qui n'existent toujours pas

`staff_pins`, `domains`, `alerts_view`, bucket storage `photos` → le flux terrain `/declare` (PIN + photos) est CASSÉ en prod. Décision à prendre : créer les migrations (PIN bcrypt sur staff_lite ?) ou refondre sur `declarations`.

### Migrations en prod (tracker `supabase_migrations.schema_migrations`)

**10 migrations**, toutes dans `supabase/migrations/` (synchro 2026-06-10) — détail dans `supabase/migrations/README.md`. ⚠️ 14 tables prod ont été créées HORS migration (SQL direct Cowork/MCP) — non-conformité de traçabilité documentée dans ce même README.
Les anciennes (datées 2026-02-15, schéma anglais obsolète) sont dans `supabase/migrations/_archive/` — **NE PAS rejouer**.

---

## Règles de code

1. **Zéro emoji** — SVG inline monochrome trait 1.5-2px uniquement.
2. **Branding** : "Pharma78" uniquement.
3. **Édition en ligne** : clic sur valeur = édition sur place, sauvegarde silencieuse.
4. **Signalétique 3 feux** : vert `#00FF88/#2E7D5A`, ambre `#FFB800/#D4860B`, rouge `#FF4444/#C0392B`.
5. **Mode nuit (défaut) / jour** avec toggle, transition 0.2s.
6. **TypeScript strict**, PascalCase composants, kebab-case fichiers.
7. **Supabase pour TOUTE persistance** — jamais de localStorage côté front.
8. **`.docx` SOPs** : jamais commiter (déjà gitignored).

---

## Routing

```
src/app/
├── page.tsx                         (login)
├── dashboard/
│   ├── layout.tsx                   (header + tab bar + auth guard)
│   ├── page.tsx                     (redirect → tableau-de-bord)
│   ├── tableau-de-bord/page.tsx     (KPIs, score SMQ, alertes)
│   ├── documents/page.tsx           (SOPs)
│   ├── capa/page.tsx                (CAPA)
│   ├── audits/page.tsx
│   ├── risques/page.tsx
│   ├── vigilances/page.tsx
│   ├── formations/page.tsx
│   ├── equipements/page.tsx
│   ├── fournisseurs/page.tsx
│   ├── reclamations/page.tsx
│   ├── indicateurs/page.tsx
│   ├── revue-direction/page.tsx
│   └── administration/page.tsx
└── declare/
    ├── page.tsx                     (PIN pad)
    └── form/page.tsx                (formulaire terrain — pin bcrypt)
```

---

## Déploiement Vercel (pivot fait le 2026-05-15)

- Push GitHub `daxosin/dashboard-praq-v2` → deploy automatique. `main` = production, branches = preview.
- `vercel.json` force `framework: nextjs` (le preset projet affiche encore "vite" — cosmétique, à corriger un jour dans Settings → Build & Development Settings).
- Env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurées côté Vercel.
- Le Dockerfile à la racine est ignoré par Vercel (reliquat Coolify, ne pas supprimer tant que Coolify n'est pas officiellement abandonné).
- **Workflow obligatoire** : branche → push → vérifier le deploy preview → merger sur main. Jamais de `vercel deploy` CLI.

---

## Convention de commit

Format Conventional Commits :
```
<type>(<scope>): <message court>

<corps détaillé optionnel>
```

Types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`.
Scopes typiques : `db`, `auth`, `dashboard`, `terrain`, `ui`, `deploy`, `api`.

Exemple :
```
fix(db): renommer capas en capa pour aligner sur le schéma prod
```

---

## Commandes utiles

```bash
# Setup initial
npm install
cp .env.local.example .env.local   # puis renseigner les clés Supabase

# Dev
npm run dev                         # http://localhost:3000

# Build / vérification
npm run build
npm run lint

# Supabase migrations (en local)
npx supabase migration list         # voir les migrations
npx supabase db push                # pousser vers Supabase distant (si link configuré)
npx supabase db pull                # tirer le schéma distant en local

# Git
git status
git log --oneline -10
git diff
git push origin main
```

---

## Identifiants & ressources

- **Supabase project** : `igsrwmigysgspqskwhqy` (eu-west-3, PG17)
- **Supabase URL** : `https://igsrwmigysgspqskwhqy.supabase.co`
- **Vercel team** : `daxosins-projects` (`team_NPMBNYnge2LTv0z39GAg1YfZ`)
- **Vercel project** : `praq-dashboard` (`prj_ETn48QDghMVUd64mpnOlAaMVYY9T`)
- **Domaine prod** : https://praq-dashboard.vercel.app/
- **Repo GitHub** : https://github.com/daxosin/dashboard-praq-v2

⚠️ Les clés Supabase publiques sont dans `.env.local`. Les clés `service_role` et autres secrets ne doivent JAMAIS être commitées.
Si une clé apparaît dans un commit, faire la rotation immédiatement et purger l'historique git (`git filter-repo`).

---

## TODOs prioritaires

- [x] Renommages `src/` (capa, equipements, reclamations, risques, habilitations, formations, fournisseurs, indicateurs, revue_direction, staff_lite, processus, statut) — branche `chore/align-db-schema`.
- [x] `useSmqScore` via RPC `kpi_smq_current_scoped` (plus de recalcul client).
- [x] `usePhsqLatest` (dernière ligne `phsq_snapshots` par `date_scraping DESC`) + section PHSQ du tableau de bord.
- [x] Tendance score SMQ depuis `kpi_history` (perimetre GLOBAL).
- [x] Configurer Vercel pour Next.js (vercel.json, deploys Git).
- [x] Migrations synchronisées (10/10) + `database.types.ts` + `db-rows.ts`.
- [ ] Vérifier le deploy preview de `chore/align-db-schema` puis merger sur main.
- [ ] **Décider du sort du flux terrain `/declare`** : `staff_pins`, `domains` et le bucket `photos` n'existent pas en prod → soit migrations (PIN bcrypt rattaché à `staff_lite`), soit refonte sur la table `declarations` (15 lignes réelles, type/gravite/statut).
- [ ] Corriger le Framework Preset "vite" → "Next.js" dans les settings Vercel (cosmétique).
- [ ] Onglets manquants pour les nouvelles tables prod : traçabilités (`tracabilites_suivi`), chaîne du froid (`cold_chain_*`), projets/plan stratégique — à prioriser avec Emmanuel.
- [ ] Rétro-documenter les 14 tables créées hors migration (voir `supabase/migrations/README.md`).

---

## Pièges historiques (ne pas refaire)

1. **Ne JAMAIS faire `supabase db reset` localement** sans avoir vérifié que les 10 migrations prod (timestamps `20260406*`, `20260408*`, `20260521*`, `20260602*`) sont bien dans `supabase/migrations/`. Sinon perte de schéma.
2. **Ne pas réintroduire les anciennes migrations** (000_, 001_, ..., 999_) dans `supabase/migrations/`. Elles sont obsolètes et conservées dans `_archive/` pour traçabilité ISO uniquement.
3. **Ne pas déployer via `vercel deploy` CLI** — uniquement via push Git, pour garantir que ce qui est en prod est ce qui est dans le repo.
4. **Ne pas renommer les tables côté DB pour matcher le code** (ex: créer une vue `capas` qui pointe sur `capa`). Mauvais pour la traçabilité ISO 9001 et crée une indirection cachée. Toujours aligner le code sur la DB, pas l'inverse.
5. **`.env.production`** contient encore des reliquats Coolify — vérifier qu'aucune clé n'y traîne avant de le supprimer/migrer.

---

## Pour aller plus loin

- `docs/PRD-Dashboard-PRAQ-v2.md` — PRD complet (12 onglets, 30 critères acceptance)
- `docs/context-dashboard-praq-v2.json` — Contexte structuré (tables, tabs, roles)
- `docs/design-validation-pharma78.html` — Charte CSS validée (tokens, composants)
- `supabase/migrations/_archive/README_ARCHIVE.md` — Pourquoi l'archive existe

---

*Ce CLAUDE.md doit être tenu à jour à chaque évolution structurelle (renommage, ajout migration, changement de stack, pivot deploy).*
