# Composants Tabs

Ce dossier contient les composants complets pour chaque onglet du Dashboard PRAQ.

## Onglets implémentés

### 1. TabTableauDeBord (ONGLET 1)
**Fichier**: `TabTableauDeBord.tsx`
**Route**: `/dashboard/tableau-de-bord`

Composant principal du tableau de bord avec :

#### Sections
1. **Score SMQ global**
   - Jauge circulaire principale (80px)
   - Breakdown des 7 composantes avec jauges individuelles (44px)
   - Pondération : SOPs 25% + CAPA 20% + Habilitations 15% + Équipements 15% + Audits 10% + Réclamations 10% + Risques 5%

2. **6 KPI Cards en grille**
   - SOPs validées (X/total avec détails en cours/planifiées)
   - CAPA ouvertes (count + nombre en retard)
   - Habilitations % (pourcentage + expirations < 30j)
   - Équipements conformes % (pourcentage + maintenances dues)
   - Audits réalisés (X/Y + taux de réalisation)
   - Réclamations ouvertes (count + nombre > 48h)

3. **Alertes actives**
   - Liste AlertLine depuis `alerts_view`
   - Triées par severity (rouge → ambre)
   - Liens vers onglet source pour navigation contextuelle
   - Affichage des 10 premières alertes

4. **Matrice santé 16 processus**
   - Grille 4x4 responsive (2 cols mobile, 3 cols tablet, 4 cols desktop)
   - Chaque domaine avec badge feu (vert/ambre/rouge)
   - Statut basé sur agrégation SOPs du domaine :
     - Vert (ok) : ≥70% SOPs validées
     - Ambre (wip) : 40-70% SOPs validées
     - Rouge (crit) : <40% SOPs validées

5. **Graphique tendance score SMQ**
   - AreaChart Recharts
   - Données mensuelles (5 derniers mois)
   - Gradient sous la courbe
   - Axes et tooltip stylisés

#### Hooks utilisés
- `useAlerts()` : récupération alertes depuis alerts_view
- `useSmqScore()` : calcul score SMQ pondéré
- `useSupabaseCrud()` : récupération données domains, sops, capas, qualifications, equipment, maintenance, audits, complaints

#### Composants UI utilisés
- `ScoreGauge` : jauges circulaires SVG
- `KpiCard` : cartes KPI avec icône, valeur, sous-titre
- `AlertLine` : lignes d'alerte avec dot coloré et lien
- `Badge` : badges statuts (ok, wip, crit, plan)

#### Icônes utilisées
- `DocIcon`, `ZapIcon`, `UsersIcon`, `ToolIcon`, `SearchIcon`, `MsgIcon`

#### Calculs dynamiques
- SOPs validées/en cours/planifiées
- CAPA ouvertes et en retard (due_date < today)
- Habilitations valides et expirant sous 30j
- Équipements conformes et maintenances dues
- Audits réalisés vs planifiés
- Réclamations ouvertes et > 48h
- Santé par domaine basée sur taux SOPs validées

#### Navigation inter-onglets
Mapping des alertes vers onglets sources :
- `capas` → `/dashboard/capa`
- `sops` → `/dashboard/documents`
- `qualifications` → `/dashboard/formations`
- `maintenance` → `/dashboard/equipements`
- `complaints` → `/dashboard/reclamations`
- `vigilances` → `/dashboard/vigilances`

#### Responsive
- Grille KPI : 1 col mobile, 2 cols tablet, 3 cols desktop
- Score breakdown : vertical mobile, horizontal desktop
- Matrice processus : 2 cols mobile, 3 cols tablet, 4 cols desktop
- Graphique : ResponsiveContainer 100% width

#### Variables CSS utilisées
- Couleurs : `--grn`, `--amb`, `--red`, `--accent`, `--card`, `--brd`, `--text`, `--sec`, `--mut`, `--elev`
- Toutes définies dans `src/styles/tokens.css`
- Support mode nuit (défaut) et mode jour

#### Données placeholder
- Graphique tendance : 5 mois de données statiques (Oct-Fév)
- Score final basé sur calcul dynamique depuis useSmqScore

#### IMPORTANT
- ZERO emoji utilisé
- Mutations optimistes via hooks
- Données temps réel depuis Supabase
- Design respectant charte Pharma78
