---
name: data-processing-sop
description: >
  Pipeline batch de generation de SOPs Pharma78 en 3 outputs : DOCX auditable (13 sections Bible GOV-QMS-002), DOCX operationnel (fiche terrain), YAML metadata (RAG-ready). Genere en masse a partir du seed SQL sans questionnement socratique. Active avec : 'genere les SOPs batch', 'pipeline SOP batch', 'generer toutes les SOPs', 'batch SOP Pharma78', 'produire les SOPs', 'lancer le pipeline SOP'.
metadata:
  version: "3.0.0"
  author: "Emmanuel Mikaelian (PRAQ)"
  bible_version: "GOV-QMS-002 v1.0"
  source: "seed SQL (051 + 054)"
  total_sops: 111
---

# Data Processing SOP — Pipeline Batch v3.0

Pipeline AUTONOME de generation en masse des SOPs Pharma78.
Produit 3 outputs par SOP dans 3 dossiers distincts, sans questionnement socratique.
Les SOPs sont des **drafts v1.0** destines a la revue PRAQ.

## Changement majeur v3.0

- Passage de "preprocessing RAG" a **pipeline batch de generation**
- 3 outputs DOCX+YAML par SOP dans 3 dossiers distincts
- Source : seed SQL du Dashboard PRAQ (111 SOPs, 16 domaines)
- Aucun questionnement socratique — generation draft automatique
- Compatible avec le plugin `sop-generator` pour revue fine ulterieure

---

## Architecture des 3 dossiers

```
[WORKSPACE]/SOPs-Pharma78/
  01-auditables/           <- SOPs formelles 13 sections (DOCX)
    01-QMS/
      SOP-MQA-001_Pharma78_v1.0.docx
    02-PDA/
      SOP-PDA-001_Pharma78_v1.0.docx
    ...
  02-operationnelles/      <- Fiches terrain (DOCX)
    01-QMS/
      (vide -- QMS exempt terrain)
    02-PDA/
      TERRAIN-SOP-PDA-001_v1.0.docx
    ...
  03-yaml/                 <- Metadata RAG-ready (YAML)
    01-QMS/
      SOP-MQA-001.yaml
    02-PDA/
      SOP-PDA-001.yaml
    ...
```

### Prefixes domaine (ordre audit)

| N | Prefixe | Code SOP | Domaine seed SQL |
|---|---------|----------|------------------|
| 01 | 01-QMS | MQA | Management de la qualite |
| 02 | 02-PDA | PDA | PDA & Dispensation |
| 03 | 03-STK | STK | Reception & Stockage |
| 04 | 04-FRO | FRO | Chaine du Froid |
| 05 | 05-STU | STU | Stupefiants & Substances controlees |
| 06 | 06-PRE | PRE | Preparations magistrales & officinales |
| 07 | 07-LIV | LIV | Livraison EHPAD |
| 08 | 08-ORT | ORT | Orthopedie & MAD |
| 09 | 09-OFF | OFF | Officine & Conseil |
| 10 | 10-TLC | TLC | Teleconsultation & TROD |
| 11 | 11-HYG | HYG | Hygiene & Securite |
| 12 | 12-DOC | DOC | Systeme documentaire |
| 13 | 13-GRH | GRH | Gestion des ressources humaines |
| 14 | 14-MET | MET | Metrologie & Equipements |
| 15 | 15-ACH | ACH | Achats & Fournisseurs |
| 16 | 16-SIC | SIC | SI & Cybersecurite |
| 17 | 17-VIG | VIG | Vigilances (rattachees MQA dans seed) |

---

## Prerequis — LIRE AVANT DE GENERER

A CHAQUE invocation, lire IMPERATIVEMENT :

1. **Skill docx** : `/mnt/.claude/skills/docx/SKILL.md` — regles docx-js, setup, validation (skill globale)
2. **Bible regles** : `references/bible-regles.md` (copie locale dans cette skill)
3. **Matrice reglementaire** : `references/matrice-reglementaire.md` (copie locale)
4. **Template auditable** : `assets/template-auditable.md`
5. **Template operationnel** : `assets/template-operationnel.md`
6. **Schema YAML** : `assets/template-metadata.yaml`

---

## Source de donnees

Les 111 SOPs proviennent de 2 fichiers seed SQL :

- `mnt/PRAQ dash/supabase/migrations/051_seed_sops.sql` — 90 SOPs initiales
- `mnt/PRAQ dash/supabase/migrations/054_seed_sops_missing.sql` — 21 SOPs audit

Champs par SOP : `code`, `title`, `domain_id`, `owner`, `status`, `version`, `validated_at`, `next_revision`.

---

## Pipeline de generation

```
[PHASE 0] INITIALISATION
    - Lire prerequis (skill docx + bible + matrice + templates)
    - Creer arborescence 3 dossiers x 17 sous-dossiers
    - Parser seed SQL -> liste de travail
    |
[PHASE 1] DOCX AUDITABLE (par SOP)
    - Template 13 sections Bible GOV-QMS-002
    - Contenu metier genere selon domaine
    - Style Pharma78 Mode Jour
    -> 01-auditables/[PREFIX]/
    |
[PHASE 2] DOCX OPERATIONNEL (par SOP)
    - Eligibilite terrain (exclure QMS/DOC/SIC/ACH)
    - Format A5 checklist ou A4 flowchart
    -> 02-operationnelles/[PREFIX]/
    |
[PHASE 3] YAML METADATA (par SOP)
    - Metadonnees seed + enrichissement (tags, keywords, refs)
    - Liens vers fichiers DOCX generes
    -> 03-yaml/[PREFIX]/
    |
[PHASE 4] VERIFICATION BATCH
    - Comptage fichiers vs attendus
    - Rapport completude
```

Traiter par **batch de domaine** dans l'ordre des prefixes.

---

## Phase 0 : Initialisation

```bash
WORKSPACE="[CHEMIN]/SOPs-Pharma78"
for dir in 01-auditables 02-operationnelles 03-yaml; do
  for dom in 01-QMS 02-PDA 03-STK 04-FRO 05-STU 06-PRE 07-LIV 08-ORT 09-OFF 10-TLC 11-HYG 12-DOC 13-GRH 14-MET 15-ACH 16-SIC 17-VIG; do
    mkdir -p "$WORKSPACE/$dir/$dom"
  done
done
```

---

## Phase 1 : DOCX auditable

Voir `assets/template-auditable.md` pour la structure complete.

### Cartouche (12 champs obligatoires)

| Champ | Valeur |
|-------|--------|
| Code SOP | Depuis seed |
| Titre | Depuis seed |
| Version | 1.0 |
| Date | AAAA-MM-JJ du jour |
| Statut | Brouillon |
| Redacteur | Dr E. Mikaelian (PRAQ) |
| Approbateur | Si owner=Emmanuel -> "Direction" ; sinon -> owner |
| Prochaine revue | +12 mois (ou +6 mois si PDA/STU/VIG) |
| Localisation GED | /Pharma78/QMS/[Domaine]/[Code SOP]/ |
| Clause ISO | Depuis matrice-reglementaire.md |
| Pied de page | "Document controle -- Pharma78 -- Reproduction interdite sans validation PRAQ" |
| Branding | zero H8Pharma |

### Corps 13 sections (ordre immuable)

| N | Section | Contenu |
|---|---------|---------|
| 1 | Objet | 1-3 phrases, verbe action. INTERDIT : "Cette procedure a pour objet de..." |
| 2 | Domaine | Inclusions ET exclusions |
| 3 | References | Tableau {Referentiel/Texte/Clause} — consulter matrice |
| 4 | Definitions | Min 3 termes metier |
| 5 | Responsabilites | RACI complet, 1 seul A/ligne, zero vide |
| 6 | Materiel | Equipements + formulaires FOR-/CHK- |
| 7 | Procedure | 7.1/7.2..., infinitif, delais chiffres, acteur/etape |
| 8 | KPIs | Min 3 {Indicateur/Critere/Seuil/Frequence/Source} |
| 9 | CAPA | Detection + confinement + escalade + SOP-QMS-007 |
| 10 | Formation [C] | Si PDA/STU/TLC/MET/PRE |
| 11 | Archivage | Duree + lieu + format + destruction |
| 12 | Historique | v1.0 creation initiale |
| 13 | Annexes [C] | FOR-/CHK-/DIA- si applicables |

### Style DOCX Pharma78 Mode Jour

- Page A4 (11906 x 16838 DXA)
- Police Arial 10-11pt
- H1 #1B4D5C bold, H2 #2A6478 bold, H3 #3D8B8B bold
- Tableaux : header fond #1B4D5C texte blanc, bordures #E5E7EB
- Ligne accent #C4A35A sous titre principal
- Pied de page avec numero de page

### Regles redaction (Bible GOV-QMS-002)

- Francais professionnel, voix active, infinitif debut etape
- ZERO emoji, ZERO conditionnel, ZERO "a definir", ZERO "etc."
- Dates AAAA-MM-JJ, denomination Pharma78, delais chiffres
- References precises, un acteur par etape, criteres decision explicites

### Nommage

```
01-auditables/[PREFIX]/[CODE-SOP]_Pharma78_v1.0.docx
```

---

## Phase 2 : DOCX operationnel (fiche terrain)

Voir `assets/template-operationnel.md` pour la structure complete.

### Eligibilite

| Prefixe | Eligible | Motif si exclu |
|---------|----------|----------------|
| 01-QMS | NON | Procedures management |
| 02-PDA | OUI | |
| 03-STK | OUI | |
| 04-FRO | OUI | |
| 05-STU | OUI | |
| 06-PRE | OUI | |
| 07-LIV | OUI | |
| 08-ORT | OUI | |
| 09-OFF | OUI | |
| 10-TLC | OUI | |
| 11-HYG | OUI | |
| 12-DOC | NON | Procedures documentaires |
| 13-GRH | PARTIEL | Seulement formation/habilitations |
| 14-MET | OUI | |
| 15-ACH | NON | Procedures administratives |
| 16-SIC | NON | Procedures techniques IT |
| 17-VIG | OUI | Vigilances = terrain |

### Format automatique

| Titre contient... | Format |
|-------------------|--------|
| nettoyage, hygiene, controle, temperature, inventaire, maintenance, surveillance, rangement | A5 checklist |
| PDA, robot, dispensation, stupefiants, vigilance, incident, liberation, ordonnance, livraison, urgence | A4 flowchart |
| Par defaut | A4 flowchart |

### Structure fiche terrain

| Section | Contenu |
|---------|---------|
| En-tete | Code + titre court + version + date + domaine. Barre #C4A35A |
| A retenir | 3-5 points cles gras. Essentiel en 30 secondes |
| Procedure | Checklist (U+2610) OU etapes numerotees |
| Points d'attention | Encadre fond #FFF3E0, bordure gauche #E65100 |
| En cas d'ecart | Action immediate + qui prevenir + SOP-QMS-007 |
| Contacts | Telephones et roles |
| Pied de page | "Ref. complete : [CODE]_Pharma78_v1.0 -- Revue : AAAA-MM-JJ" |

### Nommage

```
02-operationnelles/[PREFIX]/TERRAIN-[CODE-SOP]_v1.0.docx
```

---

## Phase 3 : YAML metadata

Voir `assets/template-metadata.yaml` pour le schema complet.

### Champs obligatoires

- `sop_id`, `title`, `version`, `status`, `date_generated`
- `domain`, `domain_code`, `domain_prefix`, `category`
- `owner`, `redacteur`, `approbateur`
- `iso_clause`, `regulatory_refs` (depuis matrice)
- `tags` (5-8), `keywords` (3-5)
- `related_sops`, `training_required`
- `files` (chemins relatifs vers DOCX)
- `archival`, `audit_trail`

### Enrichissement

| Champ | Source |
|-------|--------|
| sop_id, title, owner | Seed SQL |
| iso_clause, regulatory_refs | matrice-reglementaire.md |
| tags | Domaine + mots-cles titre |
| training_required | true si PDA/STU/TLC/MET/PRE |
| archival.retention | bible-regles.md |

### Nommage

```
03-yaml/[PREFIX]/[CODE-SOP].yaml
```

---

## Phase 4 : Verification

### Rapport par domaine

```
=== RAPPORT BATCH [PREFIX] [DOMAINE] ===
SOPs traitees     : X / Y
Auditables DOCX   : X fichiers
Operationnelles   : X fichiers (Y exemptees)
YAML metadata     : X fichiers
Erreurs           : [liste ou "aucune"]
```

---

## Mode d'emploi

| Commande | Action |
|----------|--------|
| "Genere toutes les SOPs batch" | Pipeline complet 111 SOPs |
| "Pipeline batch domaine PDA" | Un domaine specifique |
| "Genere SOP-PDA-001 en 3 outputs" | Une SOP specifique |
| "Continue le pipeline" | Reprend les fichiers manquants |

---

## Anti-patterns

- INTERDIT : Generer sans avoir lu skill docx + bible + matrice
- INTERDIT : Emojis, conditionnel, "H8Pharma", "a definir", "etc."
- INTERDIT : RACI vide, references non verifiees dans la matrice
- INTERDIT : Fiche terrain pour QMS/DOC/SIC/ACH
- INTERDIT : YAML sans champs obligatoires
- INTERDIT : Dates JJ/MM/AAAA
- INTERDIT : Contenu placeholder ("TBD", "a completer")
- INTERDIT : Omettre pied de page Pharma78
- INTERDIT : Copier-coller contenu inter-SOPs (renvoi par code)

---

## Dependances

```bash
npm install -g docx
```

Fichiers de reference inclus dans `references/` et `assets/`.
