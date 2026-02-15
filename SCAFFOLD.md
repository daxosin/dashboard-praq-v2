# Scaffold Frontend - Dashboard PRAQ v2 Pharma78

## Structure créée

### Configuration
- `tsconfig.json` - Configuration TypeScript strict avec path alias @/
- `next.config.ts` - Configuration Next.js 15 avec images Supabase
- `postcss.config.mjs` - Configuration PostCSS pour Tailwind CSS v4

### Styles
- `src/app/globals.css` - Styles globaux avec Tailwind v4, variables CSS thème nuit/jour, Google Font Montserrat

### Bibliothèque
- `src/lib/supabase.ts` - Client Supabase Browser avec @supabase/ssr
- `src/lib/types.ts` - Types TypeScript (TabConfig, Alert, SmqScore, TerrainForm) + constante TABS

### Hooks
- `src/lib/hooks/useSupabaseCrud.ts` - Hook CRUD générique avec mutations optimistes
- `src/lib/hooks/useRealtime.ts` - Hook Supabase Realtime subscription
- `src/lib/hooks/useAlerts.ts` - Hook pour fetch alerts_view triées par severity
- `src/lib/hooks/useSmqScore.ts` - Hook calcul score SMQ pondéré
- `src/lib/hooks/useEditableField.ts` - Hook édition inline avec optimistic update
- `src/lib/hooks/useAuth.ts` - Hook authentification Supabase

### Providers
- `src/app/providers.tsx` - Contextes SupabaseProvider, ThemeProvider, AuthProvider

### Layouts
- `src/app/layout.tsx` - RootLayout avec Providers
- `src/app/dashboard/layout.tsx` - DashboardLayout avec auth guard, header (score SMQ, alertes, theme toggle), tab bar 12 onglets

### Pages
- `src/app/page.tsx` - Page login email/password avec branding Pharma78
- `src/app/dashboard/page.tsx` - Redirect vers /dashboard/tableau-de-bord

### 12 Pages Onglets (placeholders)
- `src/app/dashboard/tableau-de-bord/page.tsx`
- `src/app/dashboard/documents/page.tsx`
- `src/app/dashboard/capa/page.tsx`
- `src/app/dashboard/audits/page.tsx`
- `src/app/dashboard/risques/page.tsx`
- `src/app/dashboard/vigilances/page.tsx`
- `src/app/dashboard/formations/page.tsx`
- `src/app/dashboard/equipements/page.tsx`
- `src/app/dashboard/fournisseurs/page.tsx`
- `src/app/dashboard/reclamations/page.tsx`
- `src/app/dashboard/indicateurs/page.tsx`
- `src/app/dashboard/revue-direction/page.tsx`

Toutes les pages onglets sont "use client" avec H1 + "Chargement..." en attente de tab-builder.

## Variables d'environnement requises

Créer `.env.local` à la racine avec :
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Composants UI disponibles

Les composants UI suivants sont disponibles dans `src/components/ui/` :
- `Badge.tsx` - Badges colorés (ok, wip, plan, crit)
- `KpiCard.tsx` - Cartes KPI avec icône
- `DataTable.tsx` - Tableau de données
- `EditableCell.tsx` - Cellule éditable inline
- `ProgressBar3.tsx` - Barre de progression tricolore
- `ScoreGauge.tsx` - Jauge circulaire score
- `AlertLine.tsx` - Ligne d'alerte
- `Modal.tsx` - Fenêtre modale
- `AddButton.tsx` - Bouton d'ajout
- `ThemeToggle.tsx` - Toggle thème nuit/jour

Les icônes sont disponibles dans `src/components/icons/index.tsx`.

IMPORTANT : Les types database seront dans `src/lib/database.types.ts` (à créer via Supabase CLI).

## Features implémentées

### Authentification
- Login email/password avec Supabase Auth
- Auth guard sur /dashboard
- Context AuthProvider avec user/session
- Hook useAuth pour signIn/signOut

### Thème
- Mode nuit (défaut) "Salle de contrôle"
- Mode jour "Cabinet de consultation"
- Toggle fonctionnel avec persistence cookie
- Transition 0.2s
- Variables CSS dynamiques

### Navigation
- 12 onglets avec routing Next.js 15 App Router
- Tab bar scrollable horizontalement
- Indicateur visuel onglet actif (border accent)
- Paths avec alias @/

### Score SMQ
- Calcul pondéré depuis 7 sources :
  - SOPs : (validées / total) × 25
  - CAPA : (1 - en_retard / total) × 20
  - Habilitations : (à_jour / total) × 15
  - Équipements : (conformes / total) × 15
  - Audits : (réalisés / planifiés) × 10
  - Réclamations : (1 - >48h / total) × 10
  - Risques : (1 - inacceptables / total) × 5
- Affichage jauge circulaire SVG dans header

### Alertes
- Fetch depuis alerts_view
- Tri par severity (error > warn > ok)
- Badge compteur alertes critiques dans header

### Hooks CRUD
- useSupabaseCrud générique avec mutations optimistes
- Rollback automatique en cas d'erreur
- Methods : create, update, remove, refresh

### Realtime
- useRealtime pour subscription par table
- Auto-update state sur INSERT/UPDATE/DELETE

## Règles respectées

- TypeScript strict
- "use client" sur tous composants interactifs
- ZERO emoji
- Branding "Pharma78" uniquement (JAMAIS "H8 Pharma")
- Import paths avec @/ alias
- Montserrat mode nuit, Arial mode jour
- Variables CSS pour tous les styles
- Transitions 0.2s sur changement thème

## Prochaines étapes

1. Configurer variables .env.local avec credentials Supabase
2. L'agent tab-builder implémentera le contenu des 12 pages onglets
3. L'agent ui-components créera les composants UI manquants
4. Créer src/lib/database.types.ts via Supabase CLI
5. npm run dev pour tester
