# Validation du Scaffold Frontend

## 1. Variables d'environnement

Vérifier que `.env.local` existe et contient :
```bash
cat .env.local
```

Devrait afficher :
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Si absent, créer le fichier :
```bash
cp .env.local.example .env.local
# Puis éditer avec vos credentials Supabase
```

## 2. Vérification des dépendances

```bash
npm list --depth=0
```

Devrait afficher :
- next@^15.1.0
- react@^19.0.0
- react-dom@^19.0.0
- @supabase/supabase-js@^2.45.0
- @supabase/ssr@^0.5.0
- recharts@^2.13.0
- bcryptjs@^2.4.3
- typescript@^5.7.0
- tailwindcss@^4.0.0
- @tailwindcss/postcss@^4.0.0

## 3. Vérification TypeScript

```bash
npx tsc --noEmit
```

Devrait compiler sans erreur.

## 4. Vérification structure fichiers

```bash
# Vérifier que tous les fichiers critiques existent
ls -1 tsconfig.json next.config.ts postcss.config.mjs
ls -1 src/app/layout.tsx src/app/page.tsx src/app/providers.tsx
ls -1 src/app/dashboard/layout.tsx src/app/dashboard/page.tsx
ls -1 src/lib/supabase.ts src/lib/types.ts
ls -1 src/lib/hooks/*.ts | wc -l  # Devrait afficher 6
ls -1 src/app/dashboard/*/page.tsx | wc -l  # Devrait afficher 12
```

## 5. Test build Next.js

```bash
npm run build
```

Devrait compiler sans erreur et afficher :
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    XXX B          XXX kB
├ ○ /dashboard                           XXX B          XXX kB
└ ○ /dashboard/[12 pages...]             XXX B          XXX kB
```

## 6. Test dev server

```bash
npm run dev
```

Devrait démarrer sur http://localhost:3000 et afficher :
```
▲ Next.js 15.X.X
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in XXXms
```

Ouvrir http://localhost:3000 dans navigateur :
- [x] Page login affiche "Pharma78" avec "a" en accent vert
- [x] Tag "DASHBOARD PRAQ" visible
- [x] Formulaire email/password présent
- [x] Thème nuit par défaut (fond #1A1A1A)

Sans authentification, accéder à http://localhost:3000/dashboard :
- [x] Redirige automatiquement vers /

Avec authentification Supabase valide :
- [x] Header avec logo Pharma78
- [x] Score SMQ (jauge circulaire) visible
- [x] Icône cloche avec compteur alertes
- [x] Toggle thème Nuit/Jour
- [x] Boutons Export/Import
- [x] Tab bar 12 onglets scrollable
- [x] Onglet actif souligné en accent
- [x] Clic sur onglet charge page placeholder

## 7. Test changement thème

Cliquer sur bouton "Jour" :
- [x] Transition 0.2s
- [x] Fond devient #FAFBFC
- [x] Accent devient #C4A35A (or mat)
- [x] Police devient Arial
- [x] Logo "a" devient or mat
- [x] Cookie "theme=light" enregistré

Rafraîchir page :
- [x] Thème persiste

Cliquer sur "Nuit" :
- [x] Retour mode nuit
- [x] Montserrat réappliqué

## 8. Test navigation

Cliquer sur chaque onglet :
- [x] URL change vers /dashboard/[nom-onglet]
- [x] H1 affiche nom onglet
- [x] "Chargement..." visible
- [x] Onglet actif visuellement

Vérifier les 12 routes :
```
/dashboard/tableau-de-bord
/dashboard/documents
/dashboard/capa
/dashboard/audits
/dashboard/risques
/dashboard/vigilances
/dashboard/formations
/dashboard/equipements
/dashboard/fournisseurs
/dashboard/reclamations
/dashboard/indicateurs
/dashboard/revue-direction
```

## 9. Test Supabase connexion

Dans console navigateur (F12) :
```javascript
// Vérifier client Supabase initialisé
window.localStorage.getItem('sb-*-auth-token')
```

Devrait afficher token si connecté.

## 10. Vérification règles

- [x] ZERO emoji dans tout le code
```bash
grep -r "😀\|😃\|😄\|😁\|😆" src/
# Devrait retourner vide
```

- [x] JAMAIS "H8 Pharma"
```bash
grep -ri "h8.pharma" src/
# Devrait retourner vide
```

- [x] Branding "Pharma78" uniquement
```bash
grep -r "Pharma78" src/app/page.tsx src/app/dashboard/layout.tsx
# Devrait afficher 2+ occurrences
```

- [x] TypeScript strict
```bash
grep "strict" tsconfig.json
# Devrait afficher "strict": true
```

- [x] Imports @/ alias
```bash
grep -r "from '@/" src/ | wc -l
# Devrait afficher 30+
```

## 11. Checklist finale

- [ ] .env.local configuré
- [ ] npm run build réussit
- [ ] npm run dev démarre
- [ ] Page login accessible
- [ ] Auth guard fonctionne
- [ ] 12 onglets accessibles
- [ ] Thème toggle fonctionne
- [ ] ZERO emoji
- [ ] ZERO "H8 Pharma"
- [ ] Score SMQ visible (0 si tables vides)
- [ ] Compteur alertes visible

## Erreurs possibles

### "NEXT_PUBLIC_SUPABASE_URL is undefined"
Solution : Créer .env.local avec variables Supabase

### "Module not found: Can't resolve '@/...'"
Solution : Vérifier tsconfig.json paths configuration

### "Type error: Property 'X' does not exist on type 'Y'"
Solution : Vérifier src/lib/database.types.ts est généré

### "Failed to compile"
Solution : Vérifier syntax errors avec `npx tsc --noEmit`

### Score SMQ = 0
Normal si tables Supabase vides. Attendre seed data.

### Aucune alerte affichée
Normal si alerts_view vide. Attendre données test.

## Support

En cas d'erreur persistante :
1. Vérifier console navigateur (F12)
2. Vérifier terminal Next.js
3. Vérifier logs Supabase
4. Vérifier .env.local
5. Supprimer .next/ et relancer build

---

Date validation : __________
Validé par : __________
Status : [ ] OK / [ ] KO
