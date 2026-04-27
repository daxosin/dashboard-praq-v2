# Regles de redaction -- Bible GOV-QMS-002 v1.0

Reference : Bible de redaction des SOPs Pharma78 (GOV-QMS-002)
Extraction : 2026-02-23

## DENOMINATION

Unique et exclusive : **Pharma78**
Termes interdits : H8Pharma, H8 Pharma, H8-Pharma (toute variante)
Localisation GED : /Pharma78/QMS/[Domaine]/[Code SOP]/

## FORMAT_DATE

Format unique : **AAAA-MM-JJ** (ISO 8601)
Exemples valides : 2025-10-23, 2026-03-01
Formats interdits : JJ/MM/AAAA, MM/JJ/AAAA, litteral ("24 juillet 2025")

## CODIFICATION

| Prefixe | Type | Format | Exemple |
|---------|------|--------|---------|
| SOP | Procedure operationnelle | SOP-[DOM]-NNN | SOP-PDA-001 |
| FOR | Formulaire | FOR-[DOM]-NNN | FOR-PHA-003 |
| CHK | Check-list | CHK-[DOM]-NNN | CHK-AUD-001 |
| DIA | Diagramme de flux | DIA-[DOM]-NNN | DIA-PDA-001 |
| FDP | Fiche de poste | FDP-[DOM]-NNN | FDP-OFF-001 |
| MQ | Manuel Qualite | MQ-QMS-NNN | MQ-QMS-001 |
| POL | Politique | POL-QMS-NNN | POL-QMS-001 |
| REG | Registre | REG-[DOM]-NNN | REG-STUP-001 |

Codes domaine : QMS, PDA, PHA, OFF, TC, EHPAD, ORTHO, LUXE, NAT, HSE, LOG, CYBER, RGPD, MET, COM, FIN, RH

## CARTOUCHE (12 champs obligatoires)

1. **Code SOP** : SOP-[DOM]-NNN, unique, permanent
2. **Titre** : descriptif, max 80 car., commence par nom action/processus
3. **Version** : X.Y (X = majeure, Y = mineure), demarre a 1.0
4. **Date** : AAAA-MM-JJ, date derniere approbation
5. **Statut** : Brouillon | Redige | Valide | Obsolete (4 valeurs uniquement)
6. **Redacteur** : Nom + fonction
7. **Approbateur** : Nom + fonction, DISTINCT du redacteur (ISO §7.5.2)
8. **Prochaine revue** : AAAA-MM-JJ, max 12 mois (6 mois processus critique)
9. **Localisation GED** : /Pharma78/QMS/[Domaine]/[Code SOP]/
10. **Clause ISO** : §X.X (clause principale)
11. **Pied de page** : "Document controle -- Pharma78 -- Reproduction interdite sans validation PRAQ"
12. **Branding** : zero H8Pharma

## STRUCTURE (13 sections, ordre immuable)

| N | Oblig. | Section | Contenu attendu |
|---|--------|---------|-----------------|
| 1 | [O] | Objet | 1-3 phrases. Quoi, pourquoi, resultat. |
| 2 | [O] | Domaine d'application | Inclusions + exclusions explicites. |
| 3 | [O] | References reglementaires | Tableau : Referentiel / Texte / Clause. ISO + BPP/CSP + RGPD si donnees perso. |
| 4 | [O] | Definitions | Min 3 termes. Renvoi possible glossaire PRAQ. |
| 5 | [O] | Responsabilites | RACI complet. 1 seul A par ligne. Jamais vide. |
| 6 | [O] | Materiel et docs requis | Outils, formulaires (codes), logiciels, acces, EPI. |
| 7 | [O] | Procedure operationnelle | Sous-sections 7.1/7.2. Qui fait quoi, quand, comment, enregistrement. |
| 8 | [O] | KPIs | Tableau min 3 : Indicateur / Critere / Seuil / Frequence / Source. |
| 9 | [O] | Gestion ecarts et CAPA | Detection + confinement + escalade + renvoi SOP-QMS-007. |
| 10 | [C] | Formation | Si competences specifiques. Initiale + recyclage + evaluation. |
| 11 | [O] | Archivage | Duree + lieu + format + destruction. Ref BPP/RGPD. |
| 12 | [O] | Historique revisions | Tableau : Version / Date / Nature / Auteur. Obligatoire des v1.0. |
| 13 | [C] | Annexes | Codes FOR-/CHK-/DIA-. Documents autonomes dans LM. |

## TERMES_INTERDITS

| Interdit | Remplacer par | Motif |
|----------|---------------|-------|
| Emojis (tout type) | Texte ou icone SVG | Non professionnel |
| H8Pharma / H8 Pharma / H8-Pharma | Pharma78 | Denomination obsolete |
| "Conformement a la reglementation" | Reference precise (CSP art. X, ISO §X.X) | Trop vague |
| "Des que possible" / "rapidement" | Delai chiffre ("sous 4h", "sous 24h") | Non mesurable |
| "Il faut" / "On doit" | "[Fonction] [verbe]" ou infinitif | Pas de responsable |
| "A completer" / "A definir" / "TBD" | Contenu reel ou retirer | Inacceptable en diffusion |
| Conditionnel ("devrait", "pourrait") | Indicatif ou infinitif | Pas d'option |
| Dates JJ/MM/AAAA ou litteral | AAAA-MM-JJ | Format unique |
| Copier-coller autre SOP | Renvoi par code ("voir SOP-QMS-007") | Risque incoherence |
| "Generalement" / "En principe" | "Toujours" / "Jamais" / "Dans [X]% des cas" | Vague |
| "Cf. reglementation" / "Selon la loi" | Ref precise | Non tracable |
| "Environ" / "A peu pres" | Valeur precise ou fourchette [min-max] | Non mesurable |
| "Etc." / "Et cetera" / "..." | Liste exhaustive ou "notamment : [a, b, c]" | Incomplet |
| "Voir plus haut" / "Voir ci-dessous" | "Voir section 7.3" ou "voir SOP-QMS-007" | Non tracable |

## REDACTION

- Francais exclusivement (anglais pour acronymes universels uniquement)
- Registre professionnel, pas de familiarite
- Voix active : "Le preparateur verifie" (pas "Il est verifie par")
- Verbe action infinitif en debut d'etape : "Verifier", "Enregistrer", "Transmettre"
- Un acteur par etape (si deux : scinder)
- Criteres decision explicites : "Si [condition] alors [action A]. Sinon [action B]."
- Delais chiffres : "sous 4h", "dans les 24h", "avant 15h"
- Police : Arial, corps 10-11 pt
- Numerotation decimale : 7.1, 7.2, 7.2.1
- Signaux alerte : ATTENTION, INTERDIT, OBLIGATOIRE en gras majuscules

## DUREES_ARCHIVAGE

| Categorie | Duree minimale | Source |
|-----------|---------------|--------|
| Documents qualite SMQ | 5 ans | ISO 9001 |
| Documents pharmaceutiques | 5 ans | BPP |
| Pharmacovigilance | 10 ans | ANSM |
| Dispositifs medicaux | 15 ans | MDR 2017/745 |
| Donnees personnelles | Selon finalite | RGPD art. 5.1.e |

## VERSIONNEMENT

- Majeure (fond, processus, reglementation) : X.0 -> (X+1).0. Re-approbation complete.
- Mineure (forme, coquille) : X.Y -> X.(Y+1). Validee par PRAQ seul.
- Revue standard : 12 mois max
- Processus critiques (PDA, stupefiants, vigilance) : 6 mois
- Alerte Dashboard PRAQ : 30 jours avant echeance

## CIRCUIT_APPROBATION

1. Redaction (pilote processus) -> version 0.x
2. Revue (PRAQ) -> conformite structure + reglementaire
3. Approbation (approbateur, distinct redacteur) -> signature + date
4. Diffusion (PRAQ) -> GED + notification
5. Revue periodique (pilote + PRAQ) -> annuelle ou sur evenement
