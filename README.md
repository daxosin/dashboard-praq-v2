# Dashboard PRAQ v2 — Pharma78

Cockpit qualite ISO 9001:2015 pour Pharma78, pharmacie 2500 m² a Bois-d'Arcy (78).
PDA robotisee, 9 EHPAD, orthopedie, parapharmacie premium, teleconsultation.

## Stack technique

- **Frontend** : Next.js 15 (App Router) · React 19 · TypeScript strict
- **Backend** : Supabase (PostgreSQL) · RLS · Edge Functions
- **UI** : Tailwind CSS v4 · tokens CSS dual-theme (nuit/jour)
- **Graphiques** : Recharts
- **Auth** : Supabase Auth + PIN bcrypt (formulaire terrain)

## Architecture

```
src/
  app/
    dashboard/          # 12 onglets qualite
    declare/            # Formulaire terrain (PIN pad + declaration)
    api/                # 3 routes API securisees
  components/
    tabs/               # 12 composants onglets
    ui/                 # 12 composants UI reutilisables
    icons/              # 23 icones SVG monochrome
  lib/
    hooks/              # 6 hooks (CRUD, realtime, alerts, SMQ, auth)
    supabase.ts         # Client Supabase
    database.types.ts   # Types 21 tables
    export-import.ts    # Export/Import JSON
supabase/
  migrations/           # 10+ migrations SQL (tables, triggers, RLS, seeds)
docs/
  PRD.md                # Product Requirements Document
  security-audit.md     # Audit securite (10 vulnerabilites corrigees)
  compliance-audit.md   # Audit ISO/ARS (score 72/100)
```

## 12 onglets

| # | Onglet | Description |
|---|--------|-------------|
| 1 | Tableau de bord | KPIs, score SMQ, alertes, tendances |
| 2 | Documents & SOPs | 111 SOPs, cycle de vie, revision |
| 3 | CAPA & NC | Non-conformites, actions correctives/preventives |
| 4 | Audits | Planification, findings, liaison CAPA |
| 5 | Risques AMDEC | Matrice P x G x D, criticite, plans d'action |
| 6 | Vigilances | Pharmacovigilance, materiovigilance, retraits/rappels |
| 7 | Formations | Habilitations, qualifications, echeances |
| 8 | Equipements | Parc, maintenance preventive, metrologie |
| 9 | Fournisseurs | Evaluation, RGPD, non-conformites |
| 10 | Reclamations | Satisfaction, traitement, tendances |
| 11 | Indicateurs | 20 KPIs, cibles, tendances temps reel |
| 12 | Revue Direction | Donnees d'entree ISO 9.3, decisions, suivi |

## Formulaire terrain

Acces par PIN 4 chiffres (bcrypt). Declaration d'evenement qualite depuis le terrain :
type d'evenement, domaine (16), zone (18), gravite, description, photo.

## Demarrage

```bash
cp .env.local.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Conformite

- ISO 9001:2015 (clauses 4 a 10)
- BPD / BPP (Bonnes Pratiques de Dispensation / Preparation)
- CSP (Code de la Sante Publique)
- ARS Ile-de-France
- RGPD (zero donnee patient)

## Licence

Projet prive — Pharma78 / Emmanuel Mikaelian.
