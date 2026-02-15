# PRD — Dashboard PRAQ v2.0 — Pharma78

## 1. Résumé exécutif

### 1.1 Vision
Cockpit qualité ISO 9001:2015 pour le PRAQ de Pharma78, pharmacie 2500m² à Bois-d'Arcy (78). Ouverture mars 2026. 9 EHPAD, PDA robotisée, officine, orthopédie, luxe L'Écrin, téléconsultation.

**Score SMQ** : indicateur composite pondéré affiché en header.
Pondération : SOPs 25% + CAPA 20% + Habilitations 15% + Équipements 15% + Audits 10% + Réclamations 10% + Risques 5%.

### 1.2 Utilisateurs
- **PRAQ** (admin) : CRUD complet toutes tables
- **Direction** : lecture seule
- **Auditeur** : lecture seule, accès temporaire
- **Responsable processus** : lecture + édition périmètre
- **Déclarant terrain** : PIN 4 chiffres, insert CAPA terrain + lecture propres déclarations

### 1.3 Classification
L1 — Données métier qualité, zéro donnée patient.

---

## 2. Problème & Solution

### 2.1 Problème
Absence d'outil centralisé pour piloter les 16 processus qualité d'une pharmacie multi-activités. Excel, papier, emails dispersés.

### 2.2 Solution
Dashboard web temps réel avec 12 onglets couvrant 100% des responsabilités PRAQ + formulaire terrain pour déclarations par tout le personnel.

---

## 3. Direction artistique

### 3.1 Mode Nuit "Salle de contrôle" (défaut)
- Fond : #1A1A1A / Carte : #242424 / Élévation : #2A2A2A
- Accent : #00FF88 (vert néon)
- Texte : #FFFFFF / Secondaire : #C8C8C8 / Muted : #888888
- Bordure : #505050
- Font : Montserrat

### 3.2 Mode Jour "Cabinet de consultation"
- Fond : #FAFBFC / Carte : #FFFFFF / Élévation : #F0F2F4
- Accent : #C4A35A (or mat)
- Texte : #1A1A1A / Secondaire : #5A6570 / Muted : #8A929A
- Bordure : #E5E7EB
- H1 : #1B4D5C / H2 : #2A6478 / Tag : #3D8B8B
- Bar-top : gradient #1B4D5C → #3D8B8B
- Font : Arial

### 3.3 Signalétique 3 feux
- Vert : #00FF88 (nuit) / #2E7D5A (jour) — Conforme
- Ambre : #FFB800 (nuit) / #D4860B (jour) — Attention
- Rouge : #FF4444 (nuit) / #C0392B (jour) — Action requise

### 3.4 Typographie
- Tag section : 10px / 600 / uppercase / letter-spacing 1.8px
- H1 : 28px / 700 / letter-spacing -0.02em
- H2 : 18px / 600
- H3 : 14px / 600
- Corps : 14px / 400 / line-height 1.55
- Muted : 11px
- Mono : 11px / 600 / accent color

### 3.5 Règles absolues
1. ZERO EMOJI — SVG trait 1.5-2px monochrome uniquement
2. Branding "Pharma78" — JAMAIS "H8 Pharma"
3. Édition en ligne — clic sur donnée = édition sur place, sauvegarde silencieuse
4. Transition thème : 0.2s

### 3.6 Composants visuels
- **KPI Card** : border-left 3px accent, icône SVG + label 10px caps + valeur 30px bold + sous-texte 11px
- **Badge** : padding 2px 10px, border-radius 10px. Variantes : ok (vert/bg), wip (ambre/blanc), plan (muted), crit (rouge/blanc)
- **Progress Bar** : 6px hauteur, 3px radius, 3 segments vert/ambre/gris
- **Table** : header 10px caps, cell padding 8px 12px, filet fin, hover élévation
- **Alert Line** : dot 8px + gap 10px + message + lien
- **Matrice risques** : grid 5x5, cells 32px, zones colorées risk-grn/amb/red
- **Score Gauge** : cercle SVG, stroke-dasharray proportionnel

---

## 4. Architecture des 12 onglets

### ONGLET 1 — Tableau de bord
**Route** : `/dashboard/tableau-de-bord`
**Tables** : alerts_view, toutes tables (agrégation)
**Contenu** :
- Score SMQ (jauge circulaire SVG) en header
- 6 KPI cards : SOPs validées, CAPA ouvertes, Habilitations %, Équipements conformes %, Audits réalisés, Réclamations ouvertes
- Liste alertes actives (alerts_view) avec liens vers onglets concernés
- Matrice santé 16 processus (grille avec feux vert/ambre/rouge par domaine)
- Graphique tendance score SMQ (Recharts)

### ONGLET 2 — Documents & SOPs
**Route** : `/dashboard/documents`
**Tables** : sops, domains
**Contenu** :
- Vue par domaine : barres de progression tricolores (validé/en cours/planifié)
- Liste triable de toutes les SOPs (code, titre, domaine, responsable, statut, version, date validation, prochaine révision)
- DataTable avec EditableCell pour chaque champ
- Détail modal : cycle de vie SOP, historique versions
- Graphiques maturité documentaire (Recharts) : répartition par statut, par domaine
- Alertes : SOPs à réviser (next_revision dépassée)
- KPI : Total SOPs, Validées, En cours, Taux maturité %
- AddButton pour nouvelle SOP

### ONGLET 3 — CAPA & Non-conformités
**Route** : `/dashboard/capa`
**Tables** : capas, domains
**Contenu** :
- 4 KPI : Total ouvertes, En retard, Taux clôture %, Délai moyen
- Registre CAPA complet : DataTable CRUD (source, type, domaine, description, cause racine, action, owner, échéance, statut)
- Analyse causes : graphique par source (Audit, Réclamation, Terrain...)
- Vérification efficacité : champ dédié avec résultat
- Stats : répartition par type, par source, tendance temporelle
- Filtre par statut, domaine, source
- Lien vers terrain si source="Terrain"

### ONGLET 4 — Audits
**Route** : `/dashboard/audits`
**Tables** : audits, audit_findings, capas
**Contenu** :
- Timeline programme annuel (Recharts ou custom)
- Registre audits : type, domaine, référence, auditeur, dates, statut
- Constats par audit : majeurs, mineurs, observations, points forts
- Lien constat → CAPA (audit_findings.capa_id)
- Stats : audits réalisés vs planifiés, répartition constats
- KPI : Audits planifiés, Réalisés, Reportés, Taux réalisation %

### ONGLET 5 — Risques
**Route** : `/dashboard/risques`
**Tables** : risks, domains
**Contenu** :
- Matrice 5x5 (Probabilité x Gravité) avec positionnement des risques
- Vue AMDEC : criticité = P × G × D, niveau auto-calculé
- Criticité résiduelle après mitigation
- Vue par processus/domaine
- DataTable CRUD complet
- Filtres : domaine, niveau, owner
- KPI : Total risques, Inacceptables, Surveillance, Acceptables
- Graphique répartition par niveau

### ONGLET 6 — Vigilances
**Route** : `/dashboard/vigilances`
**Tables** : vigilances, recalls, capas
**Contenu** :
- Signalements : pharmacovigilance, matériovigilance, cosmétovigilance, nutrivigilance
- Registre vigilances : type, produit, lot, gravité, déclaration ANSM, mesures
- Retraits/Rappels de lots : source, produit, lots, action, quantité, statut
- Lien vigilance → CAPA
- Stats : par type, par gravité
- Alertes : vigilances graves non déclarées ANSM
- KPI : Total signalements, Graves, Déclarés ANSM %, Rappels actifs

### ONGLET 7 — Formations & Habilitations
**Route** : `/dashboard/formations`
**Tables** : staff, qualifications, trainings
**Contenu** :
- Matrice collaborateurs × compétences (grille avec statut par qualification)
- Plan de formation : DataTable CRUD
- Habilitations : dates obtention/expiration, alertes <30j
- Vue par collaborateur, par compétence
- Stats : taux habilitation global, par cluster
- KPI : Personnel habilité %, Formations planifiées, Expirations <30j, Taux couverture
- Graphique habilitations par domaine

### ONGLET 8 — Équipements & Métrologie
**Route** : `/dashboard/equipements`
**Tables** : equipment, maintenance
**Contenu** :
- Registre équipements : nom, catégorie, marque/modèle, n° série, localisation, mise en service, statut, criticité
- Calendrier maintenance : type, fréquence, dernière réalisation, prochaine échéance, prestataire, résultat, certificat
- Chaîne du froid : statut des équipements froid (sondes, groupes)
- Alertes : maintenances en retard
- KPI : Équipements conformes %, Maintenances dues, Critiques, Étalonnages à jour
- DataTable CRUD pour équipements et maintenance

### ONGLET 9 — Fournisseurs
**Route** : `/dashboard/fournisseurs`
**Tables** : suppliers, supplier_events
**Contenu** :
- Registre fournisseurs : nom, type, catégorie, contrat, dernière évaluation, score, clause RGPD, conformité HDS
- Évaluation : scoring avec code couleur
- Incidents fournisseurs : type, description, action, lien CAPA
- Stats : répartition par score, par catégorie
- KPI : Total fournisseurs, Score moyen, Incidents ouverts, RGPD conformes %
- DataTable CRUD

### ONGLET 10 — Réclamations & Satisfaction
**Route** : `/dashboard/reclamations`
**Tables** : complaints, capas
**Contenu** :
- Suivi EHPAD : par source, par établissement
- Registre réclamations : source, EHPAD, catégorie, gravité, owner, date réponse, statut, satisfaction
- Lien réclamation → CAPA
- Alertes : réclamations ouvertes > 48h
- Stats : par source, par EHPAD, par catégorie, tendance temporelle
- KPI : Total ouvertes, Délai moyen réponse, Satisfaction moyenne, > 48h
- DataTable CRUD

### ONGLET 11 — Indicateurs & Tendances
**Route** : `/dashboard/indicateurs`
**Tables** : indicators, indicator_values
**Contenu** :
- 8 indicateurs qualité avec objectifs
- Saisie mensuelle des valeurs (EditableCell)
- Graphiques tendance historiques (Recharts LineChart)
- Code couleur vs objectif (vert si atteint, rouge sinon)
- KPI : Indicateurs conformes %, Tendance globale
- Vue tableau + vue graphique

### ONGLET 12 — Revue de direction
**Route** : `/dashboard/revue-direction`
**Tables** : reviews, review_actions, toutes tables (agrégation)
**Contenu** :
- Données d'entrée §9.3 ISO auto-agrégées depuis tous les onglets :
  - Statut actions revue précédente
  - Évolution indicateurs qualité
  - Résultats audits
  - Performance processus (matrice santé)
  - NC et CAPA
  - Satisfaction parties intéressées
  - Risques et opportunités
  - Ressources (formations, équipements)
- Décisions et actions de revue : DataTable CRUD
- Suivi inter-revues : statut des actions
- Export rapport revue
- KPI : Actions ouvertes, Taux réalisation %, Prochaine revue

---

## 4B. Formulaire de déclaration terrain

### Route : `/declare`

### 4B.1 PIN Pad (page d'accueil /declare)
- Pavé numérique plein écran tactile (boutons 48px min)
- Mode nuit UNIQUEMENT
- PIN 4 chiffres
- Blocage après 5 échecs consécutifs
- Déblocage uniquement par PRAQ
- Succès : "Bonjour [Prénom]"
- Encart "Mes déclarations" : 5 dernières avec statut, lecture seule

### 4B.2 Formulaire (page /declare/form)
- Colonne unique verticale
- **Type d'événement** : 3 gros boutons (Non-conformité / Anomalie / Near miss)
- **Domaine** : sélection parmi 16 domaines
- **Zone** : sélection parmi 18 zones :
  PDA Robot 1, PDA Robot 2, Contrôle qualité, Conditionnement,
  Stock chambre froide, Stock ambiant, Stock stupéfiants,
  Officine comptoir, Officine back-office, Orthopédie,
  Luxe L'Écrin, Nature, Livraison véhicule 1, Livraison véhicule 2,
  Livraison véhicule 3, Cabine téléconsultation, Locaux techniques, Salle pause
- **Date** : pré-remplie aujourd'hui
- **Description** : textarea, minimum 10 caractères
- **Gravité ressentie** : 3 boutons optionnels (Faible / Moyenne / Élevée)
- **Photo** : upload optionnel
- Bouton "Envoyer" fixé en bas de l'écran
- Écran de confirmation après envoi

### 4B.3 API Route `/api/verify-pin`
- POST { pin: string }
- Comparaison bcrypt hash (table staff_pins)
- Échec : increment failed_attempts, lock si >= 5
- Succès : retourne { staff_id, name, role }

### 4B.4 Circuit post-déclaration
- INSERT dans capas : source="Terrain", type=choix utilisateur, status="Ouverte", owner=NULL, due_date=NULL
- Notification email PRAQ (immédiat)
- Notification email responsable domaine (parallèle)
- Notification email déclarant quand PRAQ qualifie (change statut)

---

## 5. Architecture technique

### 5.1 Stack
- **Frontend** : Next.js 15 (App Router) + React 19 + TypeScript strict
- **Backend** : Supabase (PostgreSQL managé)
- **Style** : Tailwind CSS + variables CSS custom
- **Graphiques** : Recharts
- **Auth** : Supabase Auth (email/pwd) + PIN 4 chiffres (terrain)
- **Icônes** : SVG inline monochromes — ZERO emoji
- **Hosting** : Vercel + Supabase

### 5.2 Routing
```
src/app/
├── page.tsx                         (login)
├── dashboard/
│   ├── layout.tsx                   (header + tab bar + auth guard)
│   ├── page.tsx                     (redirect → tableau-de-bord)
│   ├── tableau-de-bord/page.tsx     (onglet 1)
│   ├── documents/page.tsx           (onglet 2)
│   ├── capa/page.tsx                (onglet 3)
│   ├── audits/page.tsx              (onglet 4)
│   ├── risques/page.tsx             (onglet 5)
│   ├── vigilances/page.tsx          (onglet 6)
│   ├── formations/page.tsx          (onglet 7)
│   ├── equipements/page.tsx         (onglet 8)
│   ├── fournisseurs/page.tsx        (onglet 9)
│   ├── reclamations/page.tsx        (onglet 10)
│   ├── indicateurs/page.tsx         (onglet 11)
│   ├── revue-direction/page.tsx     (onglet 12)
├── declare/
    ├── page.tsx                     (PIN pad)
    └── form/page.tsx                (formulaire terrain)
```

### 5.3 RLS Policies
- **praq** : CRUD complet toutes tables
- **direction** : SELECT uniquement
- **auditeur** : SELECT + accès temporaire (expiration)
- **resp_processus** : SELECT + UPDATE sur son domaine
- **declarant** : INSERT capas (source=Terrain) + SELECT propres déclarations

### 5.4 Schema BDD
21 tables + alerts_view. Chaque table possède :
- id UUID PK gen_random_uuid()
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()
- created_by UUID FK auth.users

Voir `.claude/skills/db-schema/SCHEMA.md` pour détail complet.

### 5.5 CRUD
Chaque table dispose d'un CRUD complet :
- **Create** : AddButton → Modal ou formulaire inline
- **Read** : DataTable avec tri, filtres, recherche
- **Update** : EditableCell (clic = édition, blur = sauvegarde optimiste)
- **Delete** : ConfirmDelete (modale de confirmation)
Mutations optimistes avec rollback en cas d'erreur.

### 5.6 Triggers
- `updated_at` : auto-refresh sur toutes les tables
- `risks.criticality` = probability × gravity × detectability
- `risks.level` = Inacceptable (≥60) / Surveillance (≥24) / Acceptable
- `risks.residual_crit` = residual_p × residual_g × residual_d

### 5.7 alerts_view
Vue UNION ALL agrégant toutes les alertes actives :
- CAPA en retard (due_date < today AND status ≠ 'Clôturée') → rouge
- Habilitations expirant < 30j → ambre
- Maintenance en retard (next_due < today) → rouge
- SOPs à réviser (next_revision < today AND status = 'Validé') → ambre
- Réclamations ouvertes > 48h → rouge
- Vigilances graves non déclarées ANSM → rouge

### 5.8 Score SMQ
Calcul pondéré :
- SOPs : % validées × 25
- CAPA : (1 - % en retard) × 20
- Habilitations : % à jour × 15
- Équipements : % conformes × 15
- Audits : % réalisés × 10
- Réclamations : (1 - % > 48h) × 10
- Risques : (1 - % inacceptables) × 5

### 5.9 Liens inter-onglets
Navigation contextuelle entre onglets liés :
- CAPA → Audit (si source=Audit)
- CAPA → Réclamation (si source=Réclamation)
- CAPA → Vigilance (si source=Vigilance)
- Audit finding → CAPA
- Vigilance → CAPA
- Réclamation → CAPA
- Supplier event → CAPA
- Alerte → onglet source

### 5.10 Export / Import
- **Export JSON** : export complet par onglet ou global
- **Import JSON** : import avec validation schema

---

## 6. Critères d'acceptance

### 6.1 Dashboard (CA-01 → CA-20)
| # | Critère | Vérification |
|---|---------|-------------|
| CA-01 | 12 onglets navigables | Tous les onglets chargent sans erreur |
| CA-02 | Édition en ligne | Clic sur cellule = mode édition |
| CA-03 | Persistance Supabase | Données sauvegardées en BDD |
| CA-04 | CRUD complet | Create, Read, Update, Delete sur chaque table |
| CA-05 | Alertes automatiques | alerts_view génère les alertes correctes |
| CA-06 | Liens inter-onglets | Navigation contextuelle entre onglets liés |
| CA-07 | Graphiques Recharts | Au moins 1 graphique par onglet |
| CA-08 | Mode nuit/jour | Toggle fonctionnel, transition 0.2s |
| CA-09 | ZERO emoji | Aucun emoji dans le code source |
| CA-10 | Branding Pharma78 | Aucune référence "H8 Pharma" |
| CA-11 | Export JSON | Export fonctionnel par onglet |
| CA-12 | Import JSON | Import avec validation |
| CA-13 | 90 SOPs seed | 18 validées, 33 en cours, 39 planifiées |
| CA-14 | Score SMQ | Calcul pondéré correct en header |
| CA-15 | RDD auto-agrégée | Onglet 12 agrège données des 11 autres |
| CA-16 | Auth | Login email/password fonctionnel |
| CA-17 | RLS | Policies par rôle |
| CA-18 | Champs calculés | Criticité, niveau risque, statut maintenance |
| CA-19 | Responsive tablette | Layout adaptatif ≥768px |
| CA-20 | Déploiement | Build Next.js sans erreur |

### 6.2 Terrain (CA-T1 → CA-T10)
| # | Critère | Vérification |
|---|---------|-------------|
| CA-T1 | PIN fonctionnel | Saisie 4 chiffres, validation bcrypt |
| CA-T2 | Blocage 5 échecs | Compte verrouillé après 5 tentatives |
| CA-T3 | < 60 secondes | Déclaration complète en moins d'1 minute |
| CA-T4 | Insert CAPA | Déclaration insérée dans table capas |
| CA-T5 | Notification PRAQ | Email envoyé au PRAQ |
| CA-T6 | Notification responsable | Email envoyé au responsable domaine |
| CA-T7 | Notification déclarant | Email quand PRAQ qualifie |
| CA-T8 | Mes déclarations | 5 dernières visibles après PIN |
| CA-T9 | Zéro donnée médicale | Aucun champ patient/ordonnance |
| CA-T10 | Photo | Upload optionnel fonctionnel |

---

## 7. Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| Supabase free tier limites | Performance | Monitoring usage, upgrade si nécessaire |
| Adoption terrain | Utilité | UX ultra-simple, formation, champions |
| Données non saisies | Qualité | Alertes automatiques, revues périodiques |
| Sécurité PIN | Accès non autorisé | Bcrypt + blocage + audit trail |

---

## 8. Roadmap

| Phase | Contenu | Timing |
|-------|---------|--------|
| V2.0a | Schema SQL, RLS, seed, auth | Semaine 1 |
| V2.0b | Next.js, 12 onglets, CRUD, charte | Semaines 2-3 |
| V2.0c | /declare, PIN, formulaire, notifications | Semaine 3 |
| V2.0d | alerts_view, liens, score SMQ, déploiement | Semaine 4 |
| V2.1 | Export/import JSON, export PDF | Post-livraison |
| V2.2 | Audit trail par enregistrement | T2 2026 |
| V3.0 | Rôles direction + auditeur, Realtime | T3 2026 |
| V3.1 | Monitoring IoT chaîne du froid | T4 2026 |
| V4.0 | Connexion API LGO | 2027 |

---

## 9. Validation

- [ ] PRD validé par PRAQ
- [ ] Design validation approuvé
- [ ] Schema BDD validé
- [ ] Prototype navigable validé
- [ ] Tests acceptance passés (30 critères)
