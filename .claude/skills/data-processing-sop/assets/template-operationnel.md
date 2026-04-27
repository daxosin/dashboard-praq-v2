# Template Fiche Terrain (DOCX Operationnel)

Ce template definit la structure des fiches terrain a generer pour les SOPs eligibles.
La fiche terrain est un document COMPACT destine au personnel sur le terrain.

---

## Principes

- Document AUTONOME : comprensible sans lire la SOP auditable
- COMPACT : l'essentiel en 1-2 pages (A4) ou 2-4 pages (A5)
- ACTIONNABLE : chaque section mene a une action concrete
- VISUEL : encadres couleur, checklist, pictogrammes textuels

---

## Determination du format

### A5 Checklist (SOPs simples/repetitives)

**Quand** : nettoyage, hygiene, controles temperature, inventaire, maintenance simple, surveillance, rangement.

**Page** : 8391 x 11906 DXA (14.8 x 21 cm)
**Marges** : 567 DXA (~1 cm)
**Max** : 4 pages (recto-verso x2)

Structure :
```
[EN-TETE compact]
[A RETENIR : 3-5 points]
[CHECKLIST cochable avec U+2610]
[POINTS D'ATTENTION encadre]
[EN CAS D'ECART]
[CONTACTS]
[PIED DE PAGE]
```

### A4 Flowchart (SOPs complexes/multi-acteurs)

**Quand** : PDA, robot, dispensation, stupefiants, vigilance, incident, liberation, ordonnance, livraison, urgence.

**Page** : 11906 x 16838 DXA (21 x 29.7 cm)
**Marges** : 850 DXA (~1.5 cm)
**Max** : 2 pages (recto-verso)

Structure :
```
[EN-TETE]
[A RETENIR : 3-5 points]
[ETAPES NUMEROTEES avec acteur + critere + delai]
[TABLEAU DE DECISION si applicable]
[POINTS D'ATTENTION encadre]
[EN CAS D'ECART]
[CONTACTS]
[PIED DE PAGE]
```

---

## Sections detaillees

### En-tete

Tableau compact 1 ligne :

```
| [CODE SOP] | [Titre court] | v1.0 | [AAAA-MM-JJ] | [Domaine] |
```

- Fond : blanc
- Barre accent #C4A35A (3pt) sous l'en-tete
- Police : Arial 10pt bold pour code, 9pt normal pour reste
- NE PAS inclure le cartouche complet de la SOP auditable

### A retenir

Encadre fond #E8F5E9 (vert clair), bordure gauche #2E7D5A (3pt).

```
A RETENIR

- [Point cle 1 en gras]
- [Point cle 2 en gras]
- [Point cle 3 en gras]
- [Point cle 4 si necessaire]
- [Point cle 5 si necessaire]
```

- Max 5 points
- Phrases courtes (< 15 mots)
- L'essentiel pour comprendre la procedure en 30 secondes

### Procedure (format checklist A5)

```
PROCEDURE

[ ] 1. [Action verbe infinitif] — [acteur]
      Critere : [mesurable]

[ ] 2. [Action verbe infinitif] — [acteur]
      Critere : [mesurable]

[ ] 3. [Action verbe infinitif] — [acteur]
      Enregistrement : FOR-[DOM]-NNN

[ ] 4. [Action verbe infinitif] — [acteur]
      Delai : [chiffre]

[ ] 5. Signer et dater — [acteur]
```

Utiliser le caractere Unicode U+2610 (case a cocher vide) pour chaque item.
Police : Arial 9pt.

### Procedure (format etapes A4)

```
PROCEDURE

Etape 1 — [Titre etape]
Acteur : [Fonction]
Action : [Verbe infinitif + objet + critere]
Delai : [Chiffre]
Enregistrement : [Code formulaire]

    |
    v

Etape 2 — [Titre etape]
Acteur : [Fonction]
Action : [Verbe infinitif + objet + critere]

    Si [condition] :
    -> [Action A]
    Sinon :
    -> [Action B]

    |
    v

Etape 3 — [Titre etape]
[...]
```

Pour les processus decisionnels, ajouter un tableau de decision :

```
| Situation           | Action                    | Destinataire    |
|---------------------|---------------------------|-----------------|
| [Cas normal]        | [Action standard]         | [Acteur]        |
| [Ecart mineur]      | [Action corrective]       | [PRAQ]          |
| [Ecart majeur]      | [Arret + notification]    | [PRAQ + Direction] |
```

### Points d'attention

Encadre fond #FFF3E0 (orange clair), bordure gauche #E65100 (3pt).

```
ATTENTION

- [Erreur frequente 1 et comment l'eviter]
- [Risque principal et mesure de prevention]
- [Piege operationnel courant]
```

- Max 4 points
- Formulation : "[Risque] -> [Prevention]"

### En cas d'ecart

Encadre fond blanc, bordure gauche #C0392B (rouge, 3pt).

```
EN CAS D'ECART

1. [Action immediate] — Delai : [chiffre]
2. Prevenir : [Fonction + telephone]
3. Enregistrer l'ecart : [Formulaire ou Dashboard PRAQ]
4. Ref. CAPA : SOP-QMS-007
```

### Contacts

Tableau compact :

```
| Role                | Nom / Fonction     | Telephone        |
|---------------------|--------------------|------------------|
| PRAQ                | Dr E. Mikaelian    | [numero]         |
| Responsable domaine | [Selon owner seed] | [numero]         |
| Direction           | [A completer]      | [numero]         |
```

Note : les numeros sont a remplir par le PRAQ lors de la revue.

### Pied de page

```
Ref. complete : [CODE-SOP]_Pharma78_v1.0 -- Revue : [AAAA-MM-JJ +12 mois]
```

Police : Arial 7pt, couleur #5A6570.

---

## Style DOCX terrain — Constantes docx-js

```javascript
const TERRAIN_COLORS = {
  HEADER_BG: "FFFFFF",
  ACCENT_BAR: "C4A35A",
  OK_BG: "E8F5E9",
  OK_BORDER: "2E7D5A",
  ALERT_BG: "FFF3E0",
  ALERT_BORDER: "E65100",
  ECART_BORDER: "C0392B",
  TITLE: "1B4D5C",
  TEXT: "1A1A1A",
  MUTED: "5A6570"
};

// A5
const PAGE_A5 = {
  width: 8391,
  height: 11906,
  margin: { top: 567, right: 567, bottom: 567, left: 567 }
};

// A4
const PAGE_A4 = {
  width: 11906,
  height: 16838,
  margin: { top: 850, right: 850, bottom: 850, left: 850 }
};

const TERRAIN_FONTS = {
  family: "Arial",
  title: { size: 20, bold: true, color: TERRAIN_COLORS.TITLE },   // 10pt
  body: { size: 18 },                                               // 9pt
  small: { size: 16 },                                              // 8pt
  footer: { size: 14, color: TERRAIN_COLORS.MUTED }                // 7pt
};
```

---

## Regles strictes fiche terrain

- NE PAS inclure le cartouche complet (juste code + version + date)
- NE PAS inclure les sections RACI, archivage, historique (voir SOP auditable)
- NE PAS depasser 2 pages A4 ou 4 pages A5
- TOUJOURS inclure "En cas d'ecart" avec renvoi SOP-QMS-007
- TOUJOURS inclure les contacts
- ZERO emoji, ZERO conditionnel
- Denomination Pharma78 exclusivement
