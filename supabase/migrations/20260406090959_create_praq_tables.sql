-- ============================================================
-- PRAQ DASHBOARD — Schema complet
-- Migration appliquée en production le 2026-04-06 09:09:59 UTC
-- Rapatriée localement le 2026-04-27 (synchro repo ↔ prod)
-- ============================================================

-- 1. PROCESSUS (les 16 processus qualité ISO 9001)
CREATE TABLE processus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,           -- ex: 'DISP', 'RECEP', 'PDA'
  nom text NOT NULL,                   -- ex: 'Dispensation'
  description text,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. SOPs
CREATE TABLE sops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,           -- ex: 'SOP-QMS-001'
  titre text NOT NULL,
  version text NOT NULL DEFAULT '1',
  statut text NOT NULL DEFAULT 'EN_VIGUEUR'
    CHECK (statut IN ('BROUILLON','EN_VIGUEUR','A_REVISER','EXPIREE','ARCHIVEE')),
  processus_id uuid REFERENCES processus(id),
  date_creation date,
  date_revision date,                  -- prochaine date de révision
  date_derniere_revision date,         -- dernière révision effectuée
  responsable text,
  fichier_url text,                    -- lien vers le fichier SOP
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. EQUIPEMENTS & METROLOGIE
CREATE TABLE equipements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  numero_serie text,
  localisation text,
  type text CHECK (type IN ('MESURE','CONSERVATION','PREPARATION','AUTRE')),
  statut text NOT NULL DEFAULT 'CONFORME'
    CHECK (statut IN ('CONFORME','A_VERIFIER','NON_CONFORME','HORS_SERVICE')),
  date_derniere_maintenance date,
  date_prochaine_maintenance date,
  date_dernier_etalonnage date,
  date_prochain_etalonnage date,
  fournisseur text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. AUDITS
CREATE TABLE audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  type text NOT NULL DEFAULT 'INTERNE'
    CHECK (type IN ('INTERNE','EXTERNE','FOURNISSEUR')),
  processus_id uuid REFERENCES processus(id),
  date_planifiee date NOT NULL,
  date_realisee date,
  auditeur text,
  statut text NOT NULL DEFAULT 'PLANIFIE'
    CHECK (statut IN ('PLANIFIE','EN_COURS','REALISE','ANNULE')),
  nb_constats_majeurs int DEFAULT 0,
  nb_constats_mineurs int DEFAULT 0,
  nb_observations int DEFAULT 0,
  rapport_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. RISQUES (matrice AMDEC)
CREATE TABLE risques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  processus_id uuid REFERENCES processus(id),
  probabilite int NOT NULL CHECK (probabilite BETWEEN 1 AND 5),
  gravite int NOT NULL CHECK (gravite BETWEEN 1 AND 5),
  detectabilite int NOT NULL CHECK (detectabilite BETWEEN 1 AND 5),
  criticite int GENERATED ALWAYS AS (probabilite * gravite * detectabilite) STORED,
  niveau text GENERATED ALWAYS AS (
    CASE
      WHEN probabilite * gravite * detectabilite >= 60 THEN 'CRITIQUE'
      WHEN probabilite * gravite * detectabilite >= 30 THEN 'ELEVE'
      WHEN probabilite * gravite * detectabilite >= 10 THEN 'MOYEN'
      ELSE 'FAIBLE'
    END
  ) STORED,
  action_prevue text,
  statut text NOT NULL DEFAULT 'IDENTIFIE'
    CHECK (statut IN ('IDENTIFIE','EN_TRAITEMENT','MAITRISE','CLOS')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. FOURNISSEURS
CREATE TABLE fournisseurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text CHECK (type IN ('LABO','GROSSISTE','MATERIEL','SERVICE','AUTRE')),
  contact_nom text,
  contact_email text,
  contact_tel text,
  score_evaluation int CHECK (score_evaluation BETWEEN 0 AND 100),
  date_derniere_evaluation date,
  date_prochaine_evaluation date,
  qualifie boolean DEFAULT false,
  nb_nc int DEFAULT 0,                -- non-conformités
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. RECLAMATIONS
CREATE TABLE reclamations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text,
  date_reception date NOT NULL DEFAULT CURRENT_DATE,
  source text CHECK (source IN ('CLIENT','EHPAD','INTERNE','FOURNISSEUR','AUTRE')),
  description text NOT NULL,
  gravite text DEFAULT 'MINEURE' CHECK (gravite IN ('MINEURE','MAJEURE','CRITIQUE')),
  processus_id uuid REFERENCES processus(id),
  statut text NOT NULL DEFAULT 'OUVERTE'
    CHECK (statut IN ('OUVERTE','EN_COURS','TRAITEE','CLOSE')),
  date_cloture date,
  action_corrective text,
  satisfaction text CHECK (satisfaction IN ('SATISFAIT','NEUTRE','INSATISFAIT')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. VIGILANCES
CREATE TABLE vigilances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL
    CHECK (type IN ('PHARMACOVIGILANCE','MATERIOVIGILANCE','COSMETOVIGILANCE','NUTRIVIGILANCE','RETRAIT_LOT')),
  reference text,                      -- ex: numéro ANSM
  titre text NOT NULL,
  description text,
  date_signal date NOT NULL DEFAULT CURRENT_DATE,
  date_traitement date,
  statut text NOT NULL DEFAULT 'OUVERT'
    CHECK (statut IN ('OUVERT','EN_COURS','TRAITE','CLOS')),
  actions_prises text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. DECLARATIONS TERRAIN (formulaire PIN)
CREATE TABLE declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declarant text NOT NULL,             -- prénom ou initiales
  pin_hash text,                       -- hash du PIN 4 chiffres
  type text NOT NULL
    CHECK (type IN ('DYSFONCTIONNEMENT','INCIDENT','SUGGESTION','OBSERVATION')),
  description text NOT NULL,
  gravite text DEFAULT 'FAIBLE' CHECK (gravite IN ('FAIBLE','MOYENNE','GRAVE')),
  processus_id uuid REFERENCES processus(id),
  photo_url text,
  statut text NOT NULL DEFAULT 'NOUVEAU'
    CHECK (statut IN ('NOUVEAU','VU','EN_TRAITEMENT','CLOS')),
  date_traitement date,
  notes_praq text,                     -- notes du PRAQ sur le traitement
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. PHSQ SNAPSHOTS (données importées du scraping)
CREATE TABLE phsq_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_scraping timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'tableau-de-bord',
  donnees jsonb NOT NULL,              -- données brutes JSON du scraping
  -- Champs extraits pour requêtes rapides :
  dysfonctionnements_ouverts int,
  dysfonctionnements_clos int,
  capa_ouvertes int,
  capa_en_retard int,
  capa_delai_moyen_jours int,
  formations_a_jour int,
  formations_total int,
  fiches_progres_ouvertes int,
  notifications jsonb,                 -- compteurs header
  created_at timestamptz DEFAULT now()
);

-- 11. KPI HISTORY (scores calculés quotidiennement)
CREATE TABLE kpi_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_calcul date NOT NULL DEFAULT CURRENT_DATE,
  score_smq numeric(5,2),             -- score composite 0-100
  -- Sous-scores par composante :
  score_sops numeric(5,2),
  score_capa numeric(5,2),
  score_habilitations numeric(5,2),
  score_equipements numeric(5,2),
  score_audits numeric(5,2),
  score_reclamations numeric(5,2),
  score_risques numeric(5,2),
  -- Métriques clés :
  taux_sops_conformes numeric(5,2),
  nb_capa_ouvertes int,
  nb_capa_en_retard int,
  taux_habilitations numeric(5,2),
  taux_equipements_conformes numeric(5,2),
  taux_audits_realises numeric(5,2),
  details jsonb,                       -- détail complet pour debug
  created_at timestamptz DEFAULT now(),
  UNIQUE(date_calcul)
);

-- 12. PONDERATIONS SMQ (configurable)
CREATE TABLE smq_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  composante text NOT NULL UNIQUE
    CHECK (composante IN ('SOPS','CAPA','HABILITATIONS','EQUIPEMENTS','AUDITS','RECLAMATIONS','RISQUES')),
  poids numeric(3,2) NOT NULL,         -- ex: 0.25 pour 25%
  seuil_vert int DEFAULT 80,
  seuil_ambre int DEFAULT 60,
  actif boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEX pour performance
-- ============================================================
CREATE INDEX idx_sops_statut ON sops(statut);
CREATE INDEX idx_sops_processus ON sops(processus_id);
CREATE INDEX idx_sops_date_revision ON sops(date_revision);
CREATE INDEX idx_audits_statut ON audits(statut);
CREATE INDEX idx_audits_date_planifiee ON audits(date_planifiee);
CREATE INDEX idx_risques_niveau ON risques(niveau);
CREATE INDEX idx_risques_processus ON risques(processus_id);
CREATE INDEX idx_reclamations_statut ON reclamations(statut);
CREATE INDEX idx_declarations_statut ON declarations(statut);
CREATE INDEX idx_declarations_type ON declarations(type);
CREATE INDEX idx_phsq_snapshots_date ON phsq_snapshots(date_scraping);
CREATE INDEX idx_kpi_history_date ON kpi_history(date_calcul);
CREATE INDEX idx_equipements_maintenance ON equipements(date_prochaine_maintenance);
CREATE INDEX idx_vigilances_statut ON vigilances(statut);
CREATE INDEX idx_fournisseurs_evaluation ON fournisseurs(date_prochaine_evaluation);

-- ============================================================
-- SEED : 16 processus ISO 9001 Pharma78
-- ============================================================
INSERT INTO processus (code, nom, description) VALUES
  ('DISP', 'Dispensation', 'Dispensation des médicaments au comptoir'),
  ('RECEP', 'Réception', 'Réception des commandes laboratoires et grossistes'),
  ('PDA', 'PDA', 'Préparation des Doses à Administrer pour EHPAD'),
  ('STOCK', 'Stockage', 'Stockage et conservation des produits'),
  ('CONS', 'Conseil', 'Conseil pharmaceutique et accompagnement patient'),
  ('VIGIL', 'Vigilance', 'Pharmacovigilance, matériovigilance, cosmétovigilance'),
  ('FORM', 'Formation', 'Formation continue et habilitations du personnel'),
  ('METRO', 'Métrologie', 'Métrologie, étalonnage et qualification des équipements'),
  ('HYG', 'Hygiène', 'Hygiène des locaux et gestion des déchets'),
  ('ACHAT', 'Achats', 'Achats, approvisionnement et gestion fournisseurs'),
  ('RH', 'Ressources Humaines', 'Gestion du personnel, fiches de poste, recrutement'),
  ('COM', 'Communication', 'Communication interne et externe'),
  ('DOC', 'Documentation', 'Gestion documentaire, SOPs, enregistrements'),
  ('AMEL', 'Amélioration', 'Amélioration continue, CAPA, non-conformités'),
  ('DIR', 'Direction', 'Pilotage stratégique, revue de direction'),
  ('SAT', 'Satisfaction', 'Mesure satisfaction clients et parties intéressées');

-- ============================================================
-- SEED : Pondérations SMQ par défaut
-- ============================================================
INSERT INTO smq_config (composante, poids, seuil_vert, seuil_ambre) VALUES
  ('SOPS', 0.25, 80, 60),
  ('CAPA', 0.20, 80, 60),
  ('HABILITATIONS', 0.15, 80, 60),
  ('EQUIPEMENTS', 0.15, 80, 60),
  ('AUDITS', 0.10, 80, 60),
  ('RECLAMATIONS', 0.10, 80, 60),
  ('RISQUES', 0.05, 80, 60);
