# Template SOP Auditable — 13 sections Bible GOV-QMS-002

Ce template definit la structure exacte du DOCX auditable a generer pour chaque SOP.
Chaque fichier produit doit respecter STRICTEMENT cet ordre et ces regles.

## Cartouche (en-tete du document)

Tableau 2 colonnes en haut de premiere page :

```
| Champ              | Valeur                                          |
|--------------------|-------------------------------------------------|
| Code SOP           | SOP-[DOM]-NNN                                   |
| Titre              | [Titre complet depuis seed]                     |
| Version            | 1.0                                             |
| Date               | [AAAA-MM-JJ generation]                         |
| Statut             | Brouillon                                       |
| Redacteur          | Dr E. Mikaelian (PRAQ)                          |
| Approbateur        | [Direction ou owner selon regle]                |
| Prochaine revue    | [+12 mois ou +6 mois si PDA/STU/VIG]           |
| Localisation GED   | /Pharma78/QMS/[Domaine]/[Code SOP]/             |
| Clause ISO         | [Depuis matrice-reglementaire.md]               |
```

Style cartouche :
- Fond en-tete ligne : #1B4D5C, texte blanc
- Police : Arial 10pt
- Bordures : #E5E7EB
- Ligne accent #C4A35A (3pt) sous le cartouche

## Section 1 — Objet

**Regle** : 1-3 phrases. Verbe action + resultat concret.

**INTERDIT** : "Cette procedure a pour objet de definir les modalites de..."

**Modele** :
"Garantir [resultat qualite] lors de [activite] realisee par [acteurs] dans [perimetre].
La conformite a [reference reglementaire] est assuree par [mecanisme de controle]."

Adapter selon le titre et le domaine de la SOP.

## Section 2 — Domaine d'application

**Regle** : Toujours expliciter inclusions ET exclusions.

```
Inclusions :
- [Services/lieux/produits/activites couverts]
- [Etablissements concernes (ex: 9 EHPAD partenaires)]

Exclusions :
- [Ce qui est explicitement hors perimetre]
- [Renvoi vers SOP adequate si applicable]
```

## Section 3 — References reglementaires et normatives

**Regle** : Tableau obligatoire. Consulter IMPERATIVEMENT matrice-reglementaire.md pour le domaine.

```
| Referentiel      | Texte / Norme                | Clause          |
|------------------|------------------------------|-----------------|
| ISO 9001:2015    | Systemes de management       | [depuis matrice] |
| BPP              | Bonnes Pratiques Pharma      | [depuis matrice] |
| CSP              | Code de la Sante Publique    | [depuis matrice] |
| RGPD             | Protection donnees           | [si applicable]  |
| ANSM             | Agence du medicament         | [si applicable]  |
```

Ne JAMAIS inventer de reference. Toujours verifier dans la matrice.

## Section 4 — Definitions

**Regle** : Minimum 3 termes. Termes metier specifiques au processus.

```
| Terme      | Definition                                    |
|------------|-----------------------------------------------|
| [Acronyme] | [Definition claire et concise]                |
| [Terme]    | [Definition operationnelle]                   |
| [Terme]    | [Definition reglementaire si applicable]      |
```

Inclure systematiquement : acronymes du domaine, termes techniques specifiques, abreviations utilisees dans la procedure.

## Section 5 — Responsabilites (RACI)

**Regle** : Tableau RACI complet. 1 seul A par ligne. ZERO cellule vide.

```
| Activite                    | Pharmacien | Preparateur | PRAQ | Direction |
|-----------------------------|------------|-------------|------|-----------|
| [Etape 1]                   | R          | A           | C    | I         |
| [Etape 2]                   | A          | R           | I    | --        |
| [Controle]                  | C          | R           | A    | I         |
| [Validation]                | I          | --          | A    | R         |
```

Legende RACI :
- R = Responsable (execute)
- A = Autorite (approuve, UN SEUL par ligne)
- C = Consulte
- I = Informe
- -- = Non concerne (preferer a une cellule vide)

## Section 6 — Materiel et documents requis

**Regle** : Liste exhaustive avec codes.

```
Equipements :
- [Nom equipement] (ref. interne si applicable)

Logiciels :
- [Nom logiciel] (version)

Formulaires et documents :
- FOR-[DOM]-NNN : [Titre formulaire]
- CHK-[DOM]-NNN : [Titre checklist]
- REG-[DOM]-NNN : [Titre registre]

EPI (si applicable) :
- [Equipement de protection]
```

## Section 7 — Procedure operationnelle

**Regle** : Sous-sections numerotees 7.1, 7.2, 7.2.1...
Chaque etape : verbe infinitif + acteur + delai + critere.

```
### 7.1 [Phase 1 : titre]

1. [Verbe infinitif] [objet] par [acteur]. Delai : [chiffre].
   Critere de reussite : [mesurable].

2. [Verbe infinitif] [objet] par [acteur]. Delai : [chiffre].
   Enregistrement : FOR-[DOM]-NNN.

   Si [condition] : [action A].
   Sinon : [action B].

### 7.2 [Phase 2 : titre]

1. [Etape suivante...]
```

**ATTENTION** : Chaque etape a UN acteur. Si deux acteurs, scinder en deux etapes.

## Section 8 — Indicateurs de performance (KPIs)

**Regle** : Minimum 3 KPIs. Tableau obligatoire.

```
| Indicateur            | Critere           | Seuil    | Frequence   | Source          |
|-----------------------|-------------------|----------|-------------|-----------------|
| [Nom indicateur]      | [Ce qui est mesure]| [Valeur] | [Periodicite]| [Outil/registre]|
| [Nom indicateur]      | [Ce qui est mesure]| [Valeur] | [Periodicite]| [Outil/registre]|
| [Nom indicateur]      | [Ce qui est mesure]| [Valeur] | [Periodicite]| [Outil/registre]|
```

Les seuils doivent etre CHIFFRES (pas "satisfaisant" mais "> 95%").

## Section 9 — Gestion des ecarts et CAPA

**Regle** : 4 volets obligatoires + renvoi SOP-QMS-007.

```
Detection :
- [Comment l'ecart est detecte]
- [Qui detecte]

Confinement immediat :
- [Action immediate pour limiter l'impact]
- [Delai de reaction : sous Xh]

Escalade :
- Si gravite [faible] : [action + destinataire]
- Si gravite [moyenne] : [action + destinataire + delai]
- Si gravite [elevee] : [action immediate + PRAQ + Direction + delai]

Traitement CAPA :
Appliquer la procedure SOP-QMS-007 (Traitement des CAPA).
Enregistrer dans le registre CAPA du Dashboard PRAQ.
```

## Section 10 — Formation (conditionnel)

**Generer SI** : domaine PDA, STU, TLC, MET, PRE ou si competences specifiques.

```
Formation initiale :
- [Contenu formation]
- [Duree estimee]
- [Modalite : tutorat / e-learning / presentiel]

Habilitation :
- [Criteres d'habilitation]
- [Evaluation : quiz / mise en situation]
- [Validite : X mois]

Recyclage :
- Frequence : [annuel / semestriel]
- Declencheur : [modification SOP / incident / echeance]

Enregistrement :
- FOR-GRH-NNN : Fiche de formation individuelle
```

## Section 11 — Archivage

**Regle** : 4 champs obligatoires. Durees conformes bible-regles.md.

```
| Element             | Valeur                                        |
|---------------------|-----------------------------------------------|
| Duree conservation  | [X ans selon categorie - voir bible]          |
| Lieu                | GED Pharma78 + copie papier [si applicable]   |
| Format              | DOCX original + PDF signe                     |
| Destruction         | Suppression securisee apres delai. PV destruction. |
```

Durees de reference :
- Documents qualite SMQ : 5 ans (ISO 9001)
- Documents pharmaceutiques : 5 ans (BPP)
- Pharmacovigilance : 10 ans (ANSM)
- Dispositifs medicaux : 15 ans (MDR 2017/745)
- Donnees personnelles : selon finalite (RGPD art. 5.1.e)

## Section 12 — Historique des revisions

```
| Version | Date       | Nature modification    | Auteur               |
|---------|------------|------------------------|----------------------|
| 1.0     | [AAAA-MM-JJ] | Creation initiale   | Dr E. Mikaelian (PRAQ) |
```

## Section 13 — Annexes (conditionnel)

**Generer SI** : formulaires, checklists ou diagrammes references dans la procedure.

```
Annexe A : FOR-[DOM]-NNN — [Titre formulaire]
[Structure du formulaire avec champs]

Annexe B : CHK-[DOM]-NNN — [Titre checklist]
[Items de la checklist]

Annexe C : DIA-[DOM]-NNN — [Titre diagramme]
[Description du flux]
```

---

## Style DOCX — Constantes docx-js

```javascript
// Couleurs Pharma78 Mode Jour
const COLORS = {
  H1: "1B4D5C",
  H2: "2A6478",
  H3: "3D8B8B",
  ACCENT: "C4A35A",
  TABLE_HEADER_BG: "1B4D5C",
  TABLE_HEADER_TEXT: "FFFFFF",
  BORDER: "E5E7EB",
  TEXT: "1A1A1A",
  MUTED: "5A6570"
};

// Page A4
const PAGE = {
  width: 11906,
  height: 16838,
  margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
};

// Typographie
const FONTS = {
  family: "Arial",
  h1: { size: 28, bold: true, color: COLORS.H1 },      // 14pt
  h2: { size: 24, bold: true, color: COLORS.H2 },      // 12pt
  h3: { size: 22, bold: true, color: COLORS.H3 },      // 11pt
  body: { size: 20 },                                    // 10pt
  small: { size: 18 },                                   // 9pt
  footer: { size: 16, color: COLORS.MUTED }             // 8pt
};
```

## Pied de page

Toutes les pages :
- Gauche : "Document controle -- Pharma78"
- Centre : [Code SOP] v1.0
- Droite : Page X

Derniere ligne : "Reproduction interdite sans validation PRAQ"
