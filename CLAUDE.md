# CLAUDE.md — Dashboard PRAQ v2 (Pharma78)

> Ce fichier est la mémoire du projet pour Claude Code. Lis-le AVANT toute action.
> Dernière maj : 2026-04-27 par Emmanuel + Claude (post-audit complet).

---

## Mission actuelle (priorité critique)

**Objectif** : Faire de ce repo Next.js le **vrai** repo de https://praq-dashboard.vercel.app/, en remplacement du déploiement Vite orphelin actuellement en prod.

**Étape par étape :**

1. Aligner les noms de tables/colonnes dans `src/` sur le schéma réel de la base prod (voir [Schéma DB](#schéma-base-prod) ci-dessous).
2. Adapter ou créer les composants qui doivent lire `phsq_snapshots` et `kpi_history` (actuellement non consommés).
3. Configurer le projet Vercel `praq-dashboard` pour utiliser Next.js (au lieu du framework Vite qu'il croit être). Voir [Pivot Vercel](#pivot-vercel).
4. Déployer et vérifier que les données réelles s'affichent correctement.

---

## Contexte historique critique — À COMPRENDRE

### Le projet est divisé en 2 codebases distinctes (un héritage à corriger)

| | **Ce repo (Next.js)** | **Le déploiement prod actuel (Vite SPA)** |
|---|---|---|
| Repo Git | `daxosin/dashboard-praq-v2` | ❌ Aucun. Code source perdu / introuvable |
| Stack | Next.js 15 (App Router) + Docker | Vite SPA (bundle `index-CbLC27A_.js`) |
| Cible historique | Coolify (Dockerfile + standalone) | Vercel |
| Statut prod | Pas déployé | Live depuis 2026-04-06 (deploy CLI) |
| Compteurs PHSQ | Aucune lecture de `phsq_snapshots` | **Hardcodés en dur dans le bundle** (snapshot 18 avril figé) |

### Points dangereux à connaître

- **Le projet Vercel `praq-dashboard` indique framework "vite"** — c'est faux pour ce repo Next.js. À corriger via les settings Vercel ou un `vercel.json` adapté.
- **Le Dockerfile + `.env.production` + `Dockerfile`** sont des reliquats du setup Coolify. Pour Vercel il faut soit les supprimer soit les ignorer.
- **`SOPs-Pharma78/` est dans `.gitignore`** : ce sont des binaires .docx métier, pas du code. Ne pas les commiter.
- **Le `.git/config` historique** était cassé (pointait vers `refs/heads/master`). Réparé le 2026-04-27.
- **Anciennes migrations** dans `supabase/migrations/_archive/` : NE PAS les rejouer. Schéma anglais obsolète (capas, equipment, complaints, risks). Conservées pour traçabilité ISO.

---

## Stack technique réelle

- **Framework** : Next.js 15 (App Router) + React 19 + TypeScript strict
- **Backend** : Supabase (PostgreSQL 17) — projet `igsrwmigysgspqskwhqy` (région eu-west-3, ACTIVE_HEALTHY)
- **UI** : Tailwind CSS 4, tokens CSS dual-theme (nuit/jour)
- **Charts** : Recharts
- **Auth** : Supabase Auth (email/pwd dashboard) + PIN bcrypt 4 chiffres (formulaire terrain)
- **Icônes** : SVG inline monochromes (trait 1.5–2px) — **AUCUN EMOJI**
- **Hosting cible** : Vercel (à reconfigurer)

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

### 15 tables réelles en prod (schéma `public`)

| Table | Lignes ~ | Lue par le code prod (Vite) ? | Lue par ce repo ? |
|---|---|---|---|
| `processus` | 16 | ✅ | À aligner |
| `sops` | 112 | ✅ (champ `statut`) | ❌ code utilise `status` |
| `capa` | 3 | ✅ | ❌ code utilise `capas` |
| `audits` | 0 | ✅ | ❌ code utilise `status` au lieu de `statut` |
| `vigilances` | 2 | ✅ | À aligner |
| `declarations` | 3 | ✅ | À aligner |
| `equipements` | 0 | ✅ | ❌ code utilise `equipment` |
| `formations` | 0 | — | À créer |
| `habilitations` | 0 | — | ❌ code utilise `qualifications` |
| `fournisseurs` | 0 | — | À créer |
| `reclamations` | 0 | — | ❌ code utilise `complaints` |
| `risques` | 0 | — | ❌ code utilise `risks` (avec colonne `level`) |
| `phsq_snapshots` | 3 | ❌ (compteurs hardcodés) | ❌ pas lu |
| `kpi_history` | 2 | ❌ | ❌ pas lu |
| `smq_config` | 7 | — | À créer |

### Mapping à appliquer dans `src/`

```
capas       → capa
equipment   → equipements
complaints  → reclamations
risks       → risques
qualifications → habilitations
status      → statut       (sur sops, audits, capa, equipements, vigilances, declarations)
created_at, updated_at  → idem (déjà OK)
```

### Tables que le code attend mais qui n'existent pas en prod

`staff_pins`, `staff`, `domains`, `alerts_view`, `photos`. À créer (migrations) ou à abandonner selon la fonctionnalité ciblée.

### Migrations en prod (tracker `supabase_migrations.schema_migrations`)

```
20260406090959_create_praq_tables.sql      (schéma initial 12 tables + seeds)
20260406200033_create_capa_table.sql
20260406201733_create_formations_table.sql (formations + habilitations + RLS)
20260408132010_add_score_global_to_kpi_history.sql
```

Toutes les 4 sont dans `supabase/migrations/` (rapatriées le 2026-04-27).
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

## Pivot Vercel

Pour faire de ce repo le projet Vercel `praq-dashboard` :

1. Sur le dashboard Vercel, ouvrir le projet `prj_ETn48QDghMVUd64mpnOlAaMVYY9T` (team `daxosins-projects`).
2. Settings → Build & Development Settings → changer Framework Preset de "Vite" à "Next.js".
3. Settings → Git → connecter au repo GitHub `daxosin/dashboard-praq-v2` (pour que les push GitHub déclenchent les deploys, au lieu de devoir faire `vercel deploy` CLI).
4. Settings → Environment Variables → ajouter `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (déjà dans `.env.local` côté local).
5. Le Dockerfile à la racine sera ignoré par Vercel (mais ne pas le supprimer tant qu'on n'est pas sûr d'avoir abandonné Coolify).
6. Tester un deploy de preview sur une branche avant de merger en main.

**Avant le pivot, vérifier impérativement que :**
- Le code source ne plante plus sur les noms de tables/colonnes (mapping fait).
- Les migrations en `supabase/migrations/` matchent l'état prod (déjà OK).
- Aucune route ne plante en build (`npm run build` localement avant push).

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

- [ ] Renommer dans `src/` : `capas → capa`, `equipment → equipements`, `complaints → reclamations`, `risks → risques`, `qualifications → habilitations`, `status → statut`.
- [ ] Adapter `useSmqScore.ts` pour les nouveaux noms.
- [ ] Créer un hook `usePhsqLatest.ts` qui lit la dernière ligne de `phsq_snapshots` ordonnée par `date_scraping DESC`.
- [ ] Remplacer les compteurs PHSQ hardcodés par la lecture dynamique.
- [ ] Tableau de bord : afficher score SMQ + sous-scores depuis `kpi_history` (dernière ligne par `date_calcul`).
- [ ] Configurer Vercel pour Next.js (voir [Pivot Vercel](#pivot-vercel)).
- [ ] Décider du sort des tables `staff`, `staff_pins`, `domains`, `alerts_view`, `photos` (créer en migration ou refactorer le code qui en a besoin).
- [ ] Ajouter un `vercel.json` avec config minimale (regions: ['cdg1'], functions config si besoin).
- [ ] Audit final + premier deploy preview.

---

## Pièges historiques (ne pas refaire)

1. **Ne JAMAIS faire `supabase db reset` localement** sans avoir vérifié que les 4 migrations prod (timestamps `20260406*` et `20260408*`) sont bien dans `supabase/migrations/`. Sinon perte de schéma.
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
