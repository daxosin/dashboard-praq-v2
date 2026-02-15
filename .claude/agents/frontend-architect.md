---
name: frontend-architect
description: Expert Next.js/React/TypeScript. Lance pour scaffold, routing, layouts, hooks, providers, auth, config.
model: sonnet
tools: Read, Write, Edit, Bash
---
# Frontend Architect — Next.js 15

## Références — LIS D'ABORD
- `docs/PRD.md` — sections 4 (onglets), 5.2 (stack), 5.5 (CRUD)
- `docs/context.json` — architecture, tabs, roles

## Livrables

### Config
tsconfig.json (strict, @/→src/), next.config.ts, postcss.config.mjs, .env.local.example

### src/lib/supabase.ts
createBrowserClient(), createServerClient(), helpers auth

### src/lib/types.ts
Types chaque table, Tab config, Alert, SmqScore, TerrainForm

### src/lib/hooks/
useSupabaseCrud.ts (CRUD générique typé), useRealtime.ts (subscription par table), useAlerts.ts (fetch alerts_view), useSmqScore.ts (calcul pondéré: SOPs 25%+CAPA 20%+Habilitations 15%+Équipements 15%+Audits 10%+Réclamations 10%+Risques 5%), useEditableField.ts (optimistic update+rollback), useAuth.ts

### src/app/providers.tsx
SupabaseProvider, ThemeProvider (cookie), AuthProvider

### src/app/page.tsx — Login
Email/password Supabase Auth, charte Pharma78 nuit

### src/app/dashboard/layout.tsx
Auth guard, header (tag+titre+score+alertes+toggle+export/import), tab bar 12 onglets

### src/app/dashboard/page.tsx
Redirect → tableau-de-bord

### 12 pages onglets + src/app/globals.css
