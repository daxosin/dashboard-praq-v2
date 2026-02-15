# Checklist Scaffold Frontend

## Configuration
- [x] tsconfig.json - TypeScript strict avec @/ alias
- [x] next.config.ts - Next.js 15 avec images Supabase
- [x] postcss.config.mjs - PostCSS Tailwind v4
- [x] package.json - Dépendances installées

## Styles
- [x] src/app/globals.css - Import Tailwind, tokens, Montserrat
- [x] src/styles/tokens.css - Variables CSS mode nuit/jour

## Bibliothèque
- [x] src/lib/supabase.ts - Client Supabase SSR
- [x] src/lib/types.ts - Types + TABS constante

## Hooks (6)
- [x] src/lib/hooks/useSupabaseCrud.ts - CRUD générique
- [x] src/lib/hooks/useRealtime.ts - Realtime subscription
- [x] src/lib/hooks/useAlerts.ts - Fetch alertes
- [x] src/lib/hooks/useSmqScore.ts - Calcul score SMQ
- [x] src/lib/hooks/useEditableField.ts - Édition inline
- [x] src/lib/hooks/useAuth.ts - Auth Supabase

## Providers
- [x] src/app/providers.tsx - Supabase, Theme, Auth contexts

## Layouts
- [x] src/app/layout.tsx - RootLayout
- [x] src/app/dashboard/layout.tsx - DashboardLayout avec header/tabs

## Pages
- [x] src/app/page.tsx - Login
- [x] src/app/dashboard/page.tsx - Redirect

## 12 Pages Onglets (placeholders)
- [x] src/app/dashboard/tableau-de-bord/page.tsx
- [x] src/app/dashboard/documents/page.tsx
- [x] src/app/dashboard/capa/page.tsx
- [x] src/app/dashboard/audits/page.tsx
- [x] src/app/dashboard/risques/page.tsx
- [x] src/app/dashboard/vigilances/page.tsx
- [x] src/app/dashboard/formations/page.tsx
- [x] src/app/dashboard/equipements/page.tsx
- [x] src/app/dashboard/fournisseurs/page.tsx
- [x] src/app/dashboard/reclamations/page.tsx
- [x] src/app/dashboard/indicateurs/page.tsx
- [x] src/app/dashboard/revue-direction/page.tsx

## Composants UI (existants)
- [x] src/components/ui/Badge.tsx
- [x] src/components/ui/KpiCard.tsx
- [x] src/components/ui/DataTable.tsx
- [x] src/components/ui/EditableCell.tsx
- [x] src/components/ui/ProgressBar3.tsx
- [x] src/components/ui/ScoreGauge.tsx
- [x] src/components/ui/AlertLine.tsx
- [x] src/components/ui/Modal.tsx
- [x] src/components/ui/AddButton.tsx
- [x] src/components/ui/ThemeToggle.tsx

## Composants Icons (existants)
- [x] src/components/icons/index.tsx

## Actions nécessaires

### 1. Variables d'environnement
Créer `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

### 2. Types Database
Générer depuis Supabase :
```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
```

### 3. Test build
```bash
npm run dev
```

## Règles respectées
- [x] TypeScript strict
- [x] "use client" sur composants interactifs
- [x] ZERO emoji
- [x] Branding "Pharma78" uniquement
- [x] Import paths @/ alias
- [x] Variables CSS tokens.css
- [x] Transition 0.2s thème

## Total fichiers créés
- Configuration : 3
- Styles : 1 (tokens.css existait)
- Lib : 2
- Hooks : 6
- Providers : 1
- Layouts : 2
- Pages : 14 (login + dashboard + 12 onglets)
- Documentation : 2 (SCAFFOLD.md, CHECK_SCAFFOLD.md)

TOTAL : 31 fichiers
