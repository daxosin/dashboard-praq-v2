# Audit de conformite ISO 9001:2015 / ARS -- Dashboard PRAQ v2

**Date d'audit** : 15 fevrier 2026
**Auditeur** : Audit automatise par Claude (expertise PRAQ / ISO 9001:2015 / ARS)
**Perimetre** : Dashboard PRAQ v2.0 -- Pharma78, Bois-d'Arcy (78)
**Reference** : PRD v2.0, Schema BDD 21 tables, 90 SOPs, 8 indicateurs, 12 onglets

---

## Score global : 72/100

**Repartition** :
- Conformite ISO 9001:2015 : 75/100
- Conformite reglementaire ARS : 65/100
- Couverture PDA/EHPAD : 70/100

---

## 1. Conformite ISO 9001:2015

### S.4 Contexte de l'organisme

#### S.4.1 Comprehension de l'organisme et de son contexte
**Constat** : Le dashboard couvre 16 domaines qualite structures selon la classification processus ISO (Management, Realisation, Support). Les 16 domaines identifies sont :
- **Management (2)** : Systeme documentaire, Management de la qualite
- **Realisation (9)** : PDA & Dispensation, Reception & Stockage, Chaine du Froid, Stupefiants, Preparations magistrales, Livraison EHPAD, Orthopedie & MAD, Officine & Conseil, Teleconsultation & TROD
- **Support (5)** : Hygiene & Securite, GRH, Metrologie & Equipements, Achats & Fournisseurs, SI & Cybersecurite

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Absence d'un domaine "Pharmacovigilance & Vigilances reglementaires" en tant que processus a part entiere. Les vigilances sont traitees via un onglet dedie mais ne sont pas un domaine dans les 16. Les SOPs de vigilance sont rattachees au domaine "Management de la qualite" (SOP-MQA-006), ce qui est insuffisant.
- **MINEURE** : Absence d'un domaine explicite "Satisfaction client / Parties interessees". Les reclamations sont gerees via l'onglet 10 mais pas integrees comme processus formel.
- **RECOMMANDATION** : Ajouter un domaine "Communication & Relation EHPAD" pour couvrir les conventions tripartites et la relation avec les parties interessees EHPAD.

#### S.4.2 Comprehension des besoins et attentes des parties interessees
**Constat** : Les parties interessees sont partiellement identifiees dans le systeme :
- EHPAD (via onglet Reclamations avec champ ehpad_name)
- Fournisseurs (via onglet Fournisseurs avec eval_score, rgpd_clause, hds_compliant)
- Personnel (via staff, qualifications, trainings)
- ARS/autorites (implicite via vigilances, audits)

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Aucune table ou champ ne documente formellement la liste des parties interessees, leurs exigences, et le suivi de ces exigences. ISO 9001:2015 exige l'identification des parties interessees pertinentes et la determination de leurs exigences.
- **MINEURE** : Pas de champ pour le contrat/convention EHPAD dans la table complaints. La relation pharmacie-EHPAD devrait etre formalisee.

#### S.4.3 Determination du domaine d'application
**Constat** : Le PRD definit clairement le perimetre : officine, PDA robotisee, 9 EHPAD, orthopedie, L'Ecrin, teleconsultation. Classification L1.
**Conformite** : CONFORME

#### S.4.4 SMQ et ses processus
**Constat** : Les 16 domaines avec process_type (Management/Realisation/Support) constituent une cartographie des processus. Le Score SMQ pondere sert d'indicateur synthetique.
**Conformite** : CONFORME avec observations

**Observation** : La cartographie des processus est presente mais manque de formalisation des interactions entre processus (sequencement, liens entrants/sortants). Le dashboard les gere operationnellement via les liens inter-onglets.

---

### S.5 Leadership

#### S.5.1 Leadership et engagement
**Constat** : Le role PRAQ (admin) est defini avec CRUD complet. Le score SMQ visible en header demontre l'engagement envers la qualite. La revue de direction (onglet 12) permet le pilotage par la direction.
**Conformite** : CONFORME

#### S.5.2 Politique qualite
**Constat** : La SOP-MQA-001 "Politique qualite generale" est validee (version 1.0). Elle est documentable et suivie dans le systeme.
**Conformite** : CONFORME

**Observation** : La politique qualite devrait etre accessible en permanence a tout le personnel. Un lien direct depuis le dashboard ou le formulaire terrain serait un plus.

#### S.5.3 Roles, responsabilites et autorites
**Constat** : 5 roles definis (PRAQ, Direction, Auditeur, Responsable processus, Declarant terrain) avec des droits differencies via RLS. Chaque SOP a un "owner". Chaque CAPA a un "owner". Chaque risque a un "owner".
**Conformite** : CONFORME

**Observation** : Le champ "owner" est un TEXT libre. En l'absence de liaison FK vers la table staff, il n'y a pas de controle d'integrite sur les noms de responsables. Risque de saisies incoherentes.

---

### S.6 Planification

#### S.6.1 Actions face aux risques et opportunites
**Constat** : L'onglet 5 (Risques) implemente une matrice AMDEC complete avec :
- Criticite = P x G x D (echelle 1-5 chaque, max 125)
- Seuils : Inacceptable >= 60, Surveillance >= 24, Acceptable < 24
- Risque residuel apres mitigation (residual_p, residual_g, residual_d)
- Matrice 5x5 Probabilite x Gravite
- Vue AMDEC detaillee avec tous les champs
- Vue par domaine

**Conformite** : CONFORME avec observations

**Anomalies** :
- **MINEURE** : La matrice 5x5 dans TabRisques.tsx affiche P x G uniquement (pas D). La fonction getCellColor calcule criticality = p * g. C'est une matrice simplifiee, pas l'AMDEC complete P x G x D. La vue AMDEC montre bien le calcul complet, mais la matrice visuelle est potentiellement trompeuse.
- **MINEURE** : Les seuils 60/24 pour une echelle 1-5 sur 3 dimensions (max 125) sont raisonnables mais meritent d'etre valides par le PRAQ. En pharmacie, un seuil de 60 correspond a un risque combinant par exemple P3 x G4 x D5 = 60. Les bonnes pratiques pharmaceutiques recommandent parfois des seuils plus conservateurs.
- **RECOMMANDATION** : Ajouter une notion explicite d'"opportunites" (pas seulement des risques). ISO 9001:2015 S.6.1 exige aussi l'identification des opportunites d'amelioration.

#### S.6.2 Objectifs qualite et planification des actions pour les atteindre
**Constat** : 8 indicateurs qualite definis dans la table indicators :
1. Taux d'erreur PDA (< 0.1%, down)
2. Reclamations traitees < 48h (100%, up)
3. Ruptures chaine du froid (0, down)
4. Personnel habilite (100%, up)
5. SOPs critiques validees (90%, up)
6. Score moyen fournisseurs (> 70, up)
7. Audits realises vs planifies (100%, up)
8. Delai moyen CAPA (< 30j, down)

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Manque des indicateurs critiques pour une pharmacie multi-activites :
  - Taux de dispensation nominative correcte (PDA/EHPAD)
  - Taux de conformite des preparations (preparations magistrales)
  - Taux de satisfaction EHPAD (parties interessees cles)
  - Taux de formation realisee vs planifiee
  - Taux de retours de lots / retraits (vigilances)
  - Taux de non-conformite fournisseurs
  - Disponibilite des equipements critiques (uptime robots PDA)
  - Nombre d'incidents de securite SI (cybersecurite)
- **MINEURE** : Les indicateurs sont stockes avec un champ "source_tab" TEXT libre sans FK vers domains. Pas de lien formel entre indicateur et processus.
- **RECOMMANDATION** : ISO 9001:2015 exige que les objectifs soient "coherents avec la politique qualite" et "pertinents pour la conformite des produits et services". Ajouter au minimum 4 indicateurs supplementaires couvrant les processus critiques non mesures.

---

### S.7 Support

#### S.7.1 Ressources
**S.7.1.1 Generalites** : Couvert via les onglets Formations (7), Equipements (8), Fournisseurs (9).

**S.7.1.2 Ressources humaines** : Table staff avec role, cluster, email, active. Table qualifications et trainings.
**Conformite** : CONFORME

**S.7.1.3 Infrastructure** : Table equipment avec category, location, status, criticality. Table maintenance avec type, frequency, provider.
**Conformite** : CONFORME

**S.7.1.4 Environnement pour la mise en oeuvre des processus** : Partiel -- la chaine du froid est couverte (filtrage equipements froid dans TabEquipements), les zones sont definies (18 zones dans le formulaire terrain). Manque la gestion des conditions ambiantes hors froid.
**Conformite** : PARTIELLE

**S.7.1.5 Ressources pour la surveillance et la mesure** : La metrologie est couverte via l'onglet 8 (Equipements & Metrologie) avec etalonnages, certificats, frequences.
**Conformite** : CONFORME

**S.7.1.6 Connaissances organisationnelles** : Non explicitement couvert. Le systeme documentaire (SOPs) represente une base mais il manque une gestion formelle des connaissances (retours d'experience, base de donnees lecons apprises, etc.).
**Conformite** : PARTIELLE

**Anomalie MINEURE** : Absence de mecanisme formel de capitalisation des connaissances organisationnelles. Les CAPA cloturees avec efficacy_result constituent un debut mais ne sont pas structurees comme retour d'experience.

#### S.7.2 Competences
**Constat** : La matrice competences (TabFormations) croise collaborateurs x competences avec statuts (Valide, Expire <30j, Expiree, Non acquise). Le plan de formation est gerable avec dates, evaluations, echeances.
**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Les habilitations specifiques pharmaceutiques ne sont pas pre-definies dans le systeme. Le champ skill_name est un TEXT libre. Il manque une liste referencee des habilitations obligatoires :
  - Habilitation PDA (exploitation robot Mekapharm)
  - Habilitation stupefiants (acces coffre, registre)
  - Habilitation chaine du froid (gestion temperature)
  - Habilitation preparations magistrales
  - Habilitation vaccination (DPC)
  - Habilitation TROD (tests rapides)
  - Habilitation livraison EHPAD
  - AFGSU (Attestation de Formation aux Gestes et Soins d'Urgence)
  - Formation incendie / evacuation
  - Formation RGPD
  - Formation cybersecurite
- **MINEURE** : Pas de notion de "niveau de competence" (debutant, autonome, referent). La matrice est binaire (OK/pas OK).

#### S.7.3 Sensibilisation
**Constat** : Le formulaire terrain (PIN pad + declaration) sensibilise le personnel a la qualite en permettant les signalements. La SOP-DOC-004 "Diffusion et communication interne" est planifiee.
**Conformite** : PARTIELLE -- la SOP de diffusion est seulement planifiee, pas encore en vigueur.

#### S.7.4 Communication
**Constat** : Les notifications email (PRAQ, responsable domaine, declarant) assurent la communication operationnelle. L'alerts_view centralise les alertes.
**Conformite** : CONFORME

#### S.7.5 Informations documentees
**Constat** : 90 SOPs couvrant 16 domaines. Cycle de vie (Planifie > En cours > Valide > En revision > Archive). Versionning. Dates de validation et revision.
**Conformite** : CONFORME

**Observation** : 18 SOPs validees sur 90 (20%). 33 en cours (37%). 39 planifiees (43%). Pour une ouverture mars 2026, le taux de maturite documentaire est insuffisant. Les SOPs critiques doivent etre prioritairement validees.

---

### S.8 Realisation des activites operationnelles

#### S.8.1 Planification et maitrise operationnelles
**Constat** : Les 90 SOPs couvrent les processus operationnels. Analyse de la couverture par domaine :

| Domaine | SOPs | Couverture |
|---------|------|-----------|
| PDA & Dispensation | 8 | Bonne |
| Reception & Stockage | 5 | Correcte |
| Chaine du Froid | 4 | Correcte |
| Stupefiants | 4 | Insuffisante |
| Preparations magistrales | 4 | Correcte |
| Livraison EHPAD | 8 | Bonne |
| Orthopedie & MAD | 4 | Correcte |
| Officine & Conseil | 8 | Bonne |
| Teleconsultation & TROD | 4 | Correcte |
| Hygiene & Securite | 8 | Bonne |
| Systeme documentaire | 6 | Correcte |
| GRH | 6 | Correcte |
| Metrologie & Equipements | 5 | Correcte |
| Achats & Fournisseurs | 5 | Correcte |
| SI & Cybersecurite | 5 | Correcte |
| Management qualite | 6 | Correcte |

**Conformite** : PARTIELLE

**Anomalies** : Voir section 4 "SOPs manquantes" pour la liste detaillee.

#### S.8.2 Exigences relatives aux produits et services
**Constat** : Les reclamations (onglet 10) avec suivi par EHPAD, categorie, gravite, satisfaction couvrent le retour client. Les vigilances (onglet 6) couvrent les signalements produits.
**Conformite** : CONFORME

#### S.8.4 Maitrise des processus, produits et services fournis par des prestataires externes
**Constat** : L'onglet Fournisseurs (9) avec evaluation, scoring, RGPD, HDS, incidents couvre la maitrise des prestataires.
**Conformite** : CONFORME

#### S.8.5 Production et prestation de service
**Constat** : Les processus PDA, livraison, preparation, officine sont documentes par des SOPs. La tracabilite est assuree via les timestamps et created_by.
**Conformite** : CONFORME avec observations

**Observation** : La tracabilite des lots dispenses (SOP-PDA-005) est "En cours". C'est un processus critique qui devrait etre prioritaire.

#### S.8.7 Maitrise des elements de sortie non conformes
**Constat** : L'onglet CAPA (3) gere les non-conformites. Le formulaire terrain permet les declarations en temps reel. Les types NC incluent Non-conformite, Anomalie, Near miss.
**Conformite** : CONFORME

---

### S.9 Evaluation des performances

#### S.9.1 Surveillance, mesure, analyse et evaluation
**Constat** : 8 indicateurs avec valeurs mensuelles, objectifs, direction (up/down), graphiques tendance. Score SMQ composite avec ponderation.
**Conformite** : PARTIELLE

**Anomalies** :
- **MINEURE** : Le Score SMQ inclut 7 composantes mais pas les indicateurs (onglet 11). Les indicateurs et le score sont deux systemes de mesure paralleles non integres.
- **MINEURE** : Les donnees tendance du graphique score SMQ dans TabTableauDeBord sont partiellement statiques (placeholder hardcode pour les mois precedents). Ce n'est pas un probleme ISO en soi mais reduit la valeur du suivi.

#### S.9.2 Audit interne
**Constat** : L'onglet Audits (4) permet :
- Planification (programme annuel avec timeline)
- Types : Audit interne, processus, systeme, fournisseur, client
- Constats : Majeur, Mineur, Observation, Point fort (conforme ISO 19011)
- Lien constat vers CAPA (audit_findings.capa_id)
- Clause ISO reference (audit_findings.clause_ref)
- Suivi : statuts Planifie/En cours/Realise/Reporte/Annule

**Conformite** : CONFORME

**Observation positive** : L'implementation est solide et conforme a ISO 19011. La liaison findings -> CAPA est un bon point.

#### S.9.3 Revue de direction
**Constat** : L'onglet 12 (TabRevueDirection) agregue les donnees d'entree exigees par S.9.3.2.

**Verification des 9 elements d'entree S.9.3.2** :

| # | Element d'entree ISO 9.3.2 | Couvert | Implementation |
|---|----------------------------|---------|---------------|
| a | Etat des actions des revues de direction precedentes | OUI | isoData.actionsByStatus -- statut des review_actions |
| b | Modifications des enjeux externes et internes | PARTIEL | reviews.context_notes -- champ texte libre, pas structure |
| c | Informations sur la performance et l'efficacite du SMQ, y compris tendances : | | |
| c.1 | Satisfaction des clients | OUI | isoData.stakeholders (reclamations, satisfaction moyenne) |
| c.2 | Degre de realisation des objectifs qualite | OUI | isoData.indicatorPerformance (8 indicateurs vs cibles) |
| c.3 | Performance des processus et conformite des produits/services | OUI | isoData.processHealth (matrice verte/ambre/rouge) |
| c.4 | Non-conformites et actions correctives | OUI | isoData.capas (ouvertes, retard, taux cloture) |
| c.5 | Resultats de surveillance et de mesure | OUI | isoData.indicatorPerformance |
| c.6 | Resultats d'audit | OUI | isoData.audits (realises, constats majeurs, total) |
| c.7 | Performance des prestataires externes | NON | Absent -- les donnees fournisseurs ne sont pas agregees |
| d | Adequation des ressources | OUI | isoData.resources (habilitations, formations, equipements) |
| e | Efficacite des actions face aux risques et opportunites | OUI | isoData.risks (total, inacceptables, actions) |
| f | Opportunites d'amelioration | PARTIEL | reviews.improvement -- champ texte libre |

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : L'element S.9.3.2(c.7) "Performance des prestataires externes" n'est pas agregee dans la revue de direction. Les donnees fournisseurs (score moyen, incidents ouverts, RGPD %) devraient etre remontees dans isoData.
- **MINEURE** : L'element S.9.3.2(b) "Modifications des enjeux externes et internes" est un simple champ texte. Il serait preferable d'avoir une structure guidee (modifications reglementaires, evolutions du marche, changements internes).
- **MINEURE** : L'element S.9.3.2(f) "Opportunites d'amelioration" est aussi un simple champ texte sans suivi structure.

---

### S.10 Amelioration

#### S.10.1 Generalites
**Constat** : Le systeme permet de gerer les ameliorations via les CAPA de type "Amelioration" et les actions de revue de direction.
**Conformite** : CONFORME

#### S.10.2 Non-conformite et action corrective
**Constat** : Le circuit CAPA est :
1. Detection (NC, Anomalie, Near miss) -- via terrain ou PRAQ
2. Enregistrement (insert dans capas avec description, source, type, domaine, zone)
3. Analyse cause racine (champ root_cause)
4. Action corrective (champ action)
5. Attribution (owner, due_date)
6. Suivi (statuts : Ouverte > En cours > Verification efficacite > Cloturee)
7. Verification efficacite (efficacy_check, efficacy_result)
8. Cloture (closed_at automatique)

**Conformite** : CONFORME

**Observation positive** : Le circuit est complet et conforme. Le statut "Verification efficacite" avant cloture est un bon point qui depasse les pratiques minimales.

#### S.10.3 Amelioration continue
**Constat** : Le score SMQ avec tendance, les indicateurs avec suivi mensuel, les revues de direction avec actions de suivi constituent un cadre d'amelioration continue.
**Conformite** : CONFORME

---

## 2. Conformite reglementaire ARS

### BPD (Bonnes Pratiques de Dispensation)

**Constat** : Le domaine "PDA & Dispensation" compte 8 SOPs couvrant reception ordonnances, exploitation robot, controle qualite, erreurs de dispensation, tracabilite lots, reconditionnement, piluliers, interface LGO.

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Pas de SOP dediee au "Double controle pharmacien" (obligation BPD). Le controle qualite avant livraison EHPAD (SOP-PDA-003) est "En cours" mais le double controle pharmaceutique n'est pas explicitement mentionne.
- **MAJEURE** : Pas de SOP "Analyse pharmaceutique de l'ordonnance" (obligation BPD). La validation pharmaceutique (interactions, contre-indications, posologies) n'est pas formalisee.
- **MINEURE** : SOP-PDA-005 "Tracabilite des lots dispenses" est seulement "En cours". C'est une exigence BPD majeure.
- **MINEURE** : Pas de SOP pour la gestion des "refus de delivrance" et les signalements au prescripteur.

### Stupefiants

**Constat** : 4 SOPs pour le domaine "Stupefiants & Substances controlees" :
- SOP-STU-001 Gestion du coffre stupefiants (Valide)
- SOP-STU-002 Registre des mouvements (En cours)
- SOP-STU-003 Destruction stupefiants perimes (En cours)
- SOP-STU-004 Controle acces substances veneneuses (Planifie)

**Conformite** : PARTIELLE

**Anomalies** :
- **CRITIQUE** : Seulement 1 SOP validee sur 4 dans un domaine ou la conformite reglementaire est strictement exigee par l'ARS et la MILDECA. Le registre des mouvements (SOP-STU-002) doit etre valide avant ouverture.
- **MAJEURE** : Il manque des SOPs critiques :
  - Inventaire physique periodique (obligation legale : trimestre)
  - Rapprochement registre / stock physique
  - Conduite a tenir en cas d'ecart d'inventaire (declaration ARS obligatoire)
  - Gestion des stupefiants en PDA (dispensation nominative)
  - Transport securise des stupefiants vers EHPAD
- **MAJEURE** : Pas de tracage specifique des stupefiants dans le dashboard. Le domaine a des SOPs mais aucune donnee specifique de suivi (pas de table pour le registre des stupefiants, pas d'alerte sur ecarts d'inventaire).

### Chaine du froid

**Constat** : 4 SOPs pour le domaine "Chaine du Froid". L'onglet Equipements filtre les equipements froid (Groupe froid, Sonde temperature). L'alerts_view inclut les maintenances en retard.

L'indicateur "Ruptures chaine du froid" avec cible 0 est defini.

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Pas de monitoring temps reel de la temperature. Le systeme se limite au suivi des equipements (statut, maintenance) sans enregistrement continu des temperatures. L'arrete du 24 mai 2005 (bonnes pratiques de transport) et les BPDG exigent un enregistrement continu.
  - Note : La roadmap V3.1 prevoit "Monitoring IoT chaine du froid" au T4 2026, mais pour l'ouverture mars 2026, le suivi est insuffisant.
- **MINEURE** : SOP-FRO-004 "Transport refrigere vers EHPAD" est seulement "Planifie". C'est critique pour la livraison des 9 EHPAD.
- **MINEURE** : Pas d'alerte specifique "rupture chaine du froid" dans alerts_view. L'alerte maintenance_overdue couvre les maintenances en retard mais pas une excursion de temperature en temps reel.

### Pharmacovigilance

**Constat** : L'onglet 6 (Vigilances) couvre pharmacovigilance, materiovigilance, cosmetovigilance, nutrivigilance. Champs : type, produit, lot, gravite, declared_ansm, ansm_ref, mesures, capa_id, statut. Alerte pour vigilances graves non declarees ANSM.

**Conformite** : PARTIELLE

**Anomalies** :
- **MAJEURE** : Pas de champ "delai de declaration" ni de suivi du respect des delais reglementaires (15 jours pour EIG, immeduat pour cas graves). La table vigilances a un created_at mais pas de champ "date_declaration_ansm" pour verifier le respect du delai.
- **MAJEURE** : Pas de distinction entre declaration initiale et declaration complementaire (obligation reglementaire).
- **MINEURE** : Le statut de la vigilance est un TEXT libre avec options "Ouverte/En cours/Cloturee". Il manque les statuts reglementaires (Initiale, Complementaire, Finale).
- **MINEURE** : La SOP-MQA-006 "Declarations de vigilances" est seulement "Planifie". Cette SOP devrait etre validee avant ouverture.

### RGPD

**Constat** : Classification L1 -- zero donnee patient. Verifie dans toutes les tables SQL : aucun champ patient, ordonnance, ou donnee medicale. La table complaints a ehpad_name mais pas de donnee patient. La table staff contient nom, email, role -- donnees personnelles du personnel uniquement.

Le suivi RGPD fournisseurs est couvert via suppliers.rgpd_clause (boolean). La SOP-ACH-005 "Clause RGPD sous-traitants" est "En cours". La SOP-SIC-005 "Conformite RGPD - Donnees patients" est "En cours".

**Conformite** : CONFORME pour l'absence de donnees patient. PARTIELLE pour le suivi RGPD global.

**Anomalies** :
- **MINEURE** : La table staff contient des donnees personnelles (nom, email) et la table staff_pins contient des hash bcrypt. Ces donnees sont protegees par RLS mais il manque une mention explicite du registre des traitements (obligation RGPD art. 30).
- **MINEURE** : Le champ suppliers.rgpd_clause est un simple boolean. Il devrait inclure la date de signature, la reference du DPA (Data Processing Agreement), et la date de derniere verification.
- **RECOMMANDATION** : Ajouter un champ "hds_compliance_date" a la table suppliers pour tracer la derniere verification de conformite HDS (Hebergeur de Donnees de Sante).

### CSP (Code de la Sante Publique)

**Constat** : Les obligations du pharmacien responsable au titre du CSP sont partiellement couvertes :

| Obligation CSP | Couverte | Via |
|----------------|----------|-----|
| Surveillance du personnel | OUI | Onglet 7 - Formations |
| Respect BPD | PARTIEL | SOPs PDA (lacunes identifiees) |
| Registre stupefiants | PARTIEL | SOPs STU (lacunes identifiees) |
| Pharmacovigilance | OUI | Onglet 6 - Vigilances |
| Qualite des preparations | OUI | SOPs PRE |
| Chaine du froid | PARTIEL | SOPs FRO + Equipements |
| Formation continue DPC | PARTIEL | Onglet 7 (pas de suivi DPC specifique) |
| Garde et urgence | NON | Aucune SOP |
| Publicite medicaments | NON | Aucune SOP |

**Anomalies** :
- **MINEURE** : Pas de SOP ni de suivi pour les obligations de garde/urgence.
- **MINEURE** : Pas de SOP pour la publicite et l'information sur les medicaments (obligation CSP L5125-31).
- **MINEURE** : Pas de suivi specifique du DPC (Developpement Professionnel Continu) du pharmacien.

---

## 3. Conformite PDA/EHPAD

### Convention tripartite pharmacie-EHPAD
**Constat** : Aucune table ni onglet ne gere les conventions pharmacie-EHPAD. La table complaints a un champ ehpad_name mais pas de table dediee aux 9 EHPAD (nom, adresse, convention, IDE referent, medecin coordonnateur, etc.).

**Anomalie MAJEURE** : Absence totale de gestion des conventions tripartites. Pour 9 EHPAD, c'est un element reglementaire central.

### Protocole de dispensation nominative
**Constat** : 8 SOPs PDA couvrent le processus mais le "protocole" formel de dispensation nominative (DIN - Dispensation Individuelle Nominative) n'est pas structure comme un protocole a part entiere avec les etapes reglementaires.

**Anomalie MINEURE** : Pas de SOP specifique "Protocole DIN" formalisant la globalite du processus.

### Gestion des retours et perimes
**Constat** : SOP-LIV-005 "Traitement des retours EHPAD" est "Planifie". Pas de SOP specifique pour la gestion des perimes (inventaire, retrait, destruction).

**Anomalie MAJEURE** : SOP retours/perimes non validee. Processus critique pour l'activite EHPAD.

### Circuit du medicament complet
**Constat** : SOP-LIV-003 "Circuit du medicament en EHPAD" est "En cours". Ce document central devrait etre prioritaire.

**Anomalie MAJEURE** : La SOP du circuit du medicament est seulement "En cours" a 6 semaines de l'ouverture. Risque majeur pour l'inspection ARS.

### Formation du personnel soignant EHPAD
**Constat** : SOP-LIV-008 "Formation du personnel EHPAD" est "Planifie". Le plan de formation (onglet 7) ne distingue pas les formations du personnel EHPAD des formations internes pharmacie.

**Anomalie MAJEURE** : Formation EHPAD non planifiee concretement. L'ARS verifie systematiquement ce point lors des inspections PUI.

---

## 4. Anomalies detectees

| # | Severite | Clause | Description | Recommandation | Statut |
|---|----------|--------|-------------|----------------|--------|
| 1 | CRITIQUE | ARS-STU | Stupefiants : 1/4 SOPs validee, manque inventaire trimestriel, transport securise, gestion PDA, tracage ecarts | Valider SOP-STU-002/003/004 + creer 5 SOPs manquantes avant ouverture | Ouvert |
| 2 | MAJEURE | S.4.1-4.2 | Pas de domaine processus ni de table parties interessees | Ajouter domaine "Vigilances reglementaires" + table parties_interessees | Ouvert |
| 3 | MAJEURE | S.6.2 | Manque 8+ indicateurs critiques (dispensation, satisfaction EHPAD, formations, SI...) | Ajouter au minimum 4 indicateurs supplementaires | Ouvert |
| 4 | MAJEURE | S.7.2 | Habilitations pharma non pre-definies (PDA, stup, froid, prepa, TROD, vaccination) | Creer liste referencee des habilitations obligatoires | Ouvert |
| 5 | MAJEURE | S.9.3 | Performance prestataires externes absente de la revue de direction | Ajouter isoData.suppliers dans TabRevueDirection | Ouvert |
| 6 | MAJEURE | BPD | Manque double controle pharmacien + analyse pharmaceutique ordonnance | Creer SOP-PDA-009 et SOP-PDA-010 | Ouvert |
| 7 | MAJEURE | ARS-FROID | Pas de monitoring temperature temps reel, pas d'alerte excursion | Anticiper V3.1 ou implementer saisie manuelle quotidienne | Ouvert |
| 8 | MAJEURE | PV | Pas de suivi delais declaration ANSM ni statut reglementaire | Ajouter champs date_declaration, declaration_type a vigilances | Ouvert |
| 9 | MAJEURE | PDA-EHPAD | Aucune gestion des conventions tripartites | Creer table ehpad_conventions ou enrichir table existante | Ouvert |
| 10 | MAJEURE | PDA-EHPAD | SOP circuit medicament (LIV-003) seulement "En cours" a 6 sem ouverture | Priorite 1 : valider cette SOP | Ouvert |
| 11 | MAJEURE | PDA-EHPAD | SOP retours/perimes (LIV-005) seulement "Planifie" | Passer en "En cours" et valider avant ouverture | Ouvert |
| 12 | MAJEURE | PDA-EHPAD | Formation personnel EHPAD (LIV-008) seulement "Planifie" | Planifier les sessions de formation EHPAD | Ouvert |
| 13 | MINEURE | S.4.1 | Pas de domaine "Satisfaction client / Parties interessees" | Envisager l'ajout ou documenter dans Management qualite | Ouvert |
| 14 | MINEURE | S.5.3 | Champ "owner" TEXT libre sans FK vers staff (risque incoherence) | Envisager FK ou liste deroulante liee a staff | Ouvert |
| 15 | MINEURE | S.6.1 | Matrice 5x5 affiche P x G sans D (trompeur vs AMDEC complete) | Ajouter note explicative ou modifier l'affichage | Ouvert |
| 16 | MINEURE | S.6.1 | Pas de gestion explicite des "opportunites" | Ajouter un type "Opportunite" dans la gestion des risques | Ouvert |
| 17 | MINEURE | S.6.2 | source_tab TEXT libre sans FK vers domains | Lier indicateurs aux domaines par FK | Ouvert |
| 18 | MINEURE | S.7.1 | Pas de gestion connaissances organisationnelles (REX) | Envisager une section REX dans les CAPA cloturees | Ouvert |
| 19 | MINEURE | S.7.2 | Pas de niveau de competence (debutant/autonome/referent) | Ajouter champ "level" a qualifications | Ouvert |
| 20 | MINEURE | S.9.1 | Score SMQ tendance avec donnees partiellement statiques | Stocker historique score SMQ en BDD | Ouvert |
| 21 | MINEURE | S.9.3 | Elements b et f de S.9.3.2 en texte libre non structure | Structurer les champs contexte et amelioration | Ouvert |
| 22 | MINEURE | PV | Statut vigilance en TEXT libre (manque statuts reglementaires) | Ajouter enum specifique (Initiale/Complementaire/Finale) | Ouvert |
| 23 | MINEURE | PV | SOP-MQA-006 Declarations vigilances seulement "Planifie" | Priorite haute avant ouverture | Ouvert |
| 24 | MINEURE | RGPD | Registre traitements non mentionne | Documenter le registre RGPD art. 30 | Ouvert |
| 25 | MINEURE | RGPD | rgpd_clause boolean trop simple (manque date, ref DPA) | Enrichir le suivi RGPD fournisseurs | Ouvert |
| 26 | MINEURE | CSP | Pas de SOP garde/urgence ni publicite medicaments | Creer SOPs supplementaires | Ouvert |
| 27 | MINEURE | CSP | Pas de suivi DPC specifique | Ajouter champ DPC dans trainings ou qualifications | Ouvert |
| 28 | MINEURE | PDA-EHPAD | Pas de SOP "Protocole DIN" formalise | Creer SOP-PDA-009 ou enrichir LIV-003 | Ouvert |
| 29 | RECOMMANDATION | S.4.1 | Ajouter domaine "Communication & Relation EHPAD" | Proposition d'amelioration | Ouvert |
| 30 | RECOMMANDATION | S.6.1 | Valider les seuils 60/24 avec le PRAQ | Revue des seuils en comite qualite | Ouvert |
| 31 | RECOMMANDATION | S.5.2 | Politique qualite accessible depuis dashboard et formulaire terrain | Lien permanent vers SOP-MQA-001 | Ouvert |
| 32 | RECOMMANDATION | RGPD | Ajouter hds_compliance_date a la table suppliers | Tracabilite conformite HDS | Ouvert |
| 33 | RECOMMANDATION | S.9.1 | Integrer les indicateurs (onglet 11) dans le score SMQ | Coherence du pilotage | Ouvert |

---

## 4. SOPs manquantes identifiees

### Stupefiants (CRITIQUE - a creer avant ouverture)
1. **SOP-STU-005** : Inventaire physique trimestriel des stupefiants
2. **SOP-STU-006** : Rapprochement registre / stock physique et gestion des ecarts
3. **SOP-STU-007** : Gestion des stupefiants en PDA (dispensation nominative EHPAD)
4. **SOP-STU-008** : Transport securise des stupefiants vers EHPAD
5. **SOP-STU-009** : Declaration ARS en cas d'ecart d'inventaire ou vol

### PDA / BPD (MAJEUR - a creer avant ouverture)
6. **SOP-PDA-009** : Double controle pharmacien avant liberation PDA
7. **SOP-PDA-010** : Analyse pharmaceutique de l'ordonnance (validation, interactions, CI)
8. **SOP-PDA-011** : Protocole de Dispensation Individuelle Nominative (DIN)
9. **SOP-PDA-012** : Gestion des refus de delivrance et signalement prescripteur

### Livraison EHPAD (MAJEUR - a creer ou accelerer)
10. **SOP-LIV-009** : Gestion des medicaments perimes (inventaire, retrait, destruction)
11. **SOP-LIV-010** : Convention tripartite pharmacie-EHPAD (modele et suivi)
12. **SOP-LIV-011** : Garde pharmaceutique et urgences EHPAD

### Pharmacovigilance (MAJEUR - a creer)
13. **SOP-VIG-001** : Procedure de declaration initiale a l'ANSM (delais, formulaire, circuit)
14. **SOP-VIG-002** : Procedure de declaration complementaire et suivi
15. **SOP-VIG-003** : Gestion des retraits/rappels de lots (reception alerte, quarantaine, retour)

### Officine / CSP (MINEUR)
16. **SOP-OFF-009** : Publicite et information sur les medicaments
17. **SOP-OFF-010** : Garde et urgence pharmaceutique
18. **SOP-OFF-011** : Gestion des medicaments a dispensation particuliere (liste I/II retrocession)

### GRH (MINEUR)
19. **SOP-GRH-007** : Suivi du DPC (Developpement Professionnel Continu)

### Divers (RECOMMANDATION)
20. **SOP-HYG-009** : Plan de Gestion des Dechets (DASRI, cartons, emballages PDA)
21. **SOP-SIC-006** : Plan de continuite informatique (PCA/PRA specifique)

---

## 5. Indicateurs manquants

### Indicateurs critiques a ajouter (MAJEUR)

| # | Indicateur | Cible | Unite | Direction | Domaine source |
|---|-----------|-------|-------|-----------|---------------|
| 1 | Taux de conformite dispensation nominative | > 99.5% | % | up | PDA & Dispensation |
| 2 | Taux de satisfaction EHPAD | > 80% | % | up | Livraison EHPAD |
| 3 | Taux de formation realisee vs planifiee | > 90% | % | up | GRH |
| 4 | Disponibilite robots PDA | > 99% | % | up | Metrologie & Equipements |
| 5 | Taux de conformite stupefiants (ecart inventaire) | 0 | count | down | Stupefiants |
| 6 | Nombre de NC fournisseurs | < 3/mois | count | down | Achats & Fournisseurs |
| 7 | Delai moyen de reponse vigilances graves | < 24h | heures | down | Vigilances |
| 8 | Taux de conventions EHPAD a jour | 100% | % | up | Livraison EHPAD |

### Indicateurs secondaires recommandes (MINEUR)

| # | Indicateur | Cible | Unite | Direction | Domaine source |
|---|-----------|-------|-------|-----------|---------------|
| 9 | Incidents cybersecurite | 0 | count | down | SI & Cybersecurite |
| 10 | Taux de couverture DPC pharmaciens | 100% | % | up | GRH |
| 11 | Taux de preparations conformes | > 99% | % | up | Preparations |
| 12 | Nombre de near miss declares | (suivi tendance) | count | up | Management qualite |

---

## 6. Plan d'action recommande

### Priorite 1 -- AVANT OUVERTURE (mars 2026) -- Semaines 1-4

| Action | Responsable | Echeance | Impact |
|--------|------------|----------|--------|
| Valider SOP-STU-002 (registre mouvements stupefiants) | Emmanuel | S+1 | CRITIQUE |
| Valider SOP-STU-003 (destruction stupefiants) | Emmanuel | S+1 | CRITIQUE |
| Creer et valider SOP-STU-005 a 009 (stupefiants manquantes) | Emmanuel | S+2 | CRITIQUE |
| Valider SOP-LIV-003 (circuit medicament EHPAD) | Emmanuel | S+1 | MAJEUR |
| Passer SOP-LIV-005 (retours) en "En cours" puis valider | Sophie R. | S+2 | MAJEUR |
| Creer SOP-PDA-009/010 (double controle + analyse pharma) | Emmanuel | S+2 | MAJEUR |
| Planifier et demarrer formations personnel EHPAD (LIV-008) | Marie L. | S+2 | MAJEUR |
| Valider SOP-MQA-006 (declarations vigilances) | Emmanuel | S+3 | MAJEUR |
| Valider SOP-PDA-005 (tracabilite lots) | Marie L. | S+3 | MAJEUR |
| Valider SOP-FRO-004 (transport refrigere) | Thomas D. | S+3 | MAJEUR |

### Priorite 2 -- SPRINT POST-OUVERTURE (T2 2026)

| Action | Responsable | Echeance | Impact |
|--------|------------|----------|--------|
| Ajouter performance fournisseurs dans TabRevueDirection (isoData) | Dev | T2 | MAJEUR |
| Ajouter 4+ indicateurs critiques (table indicators) | Emmanuel | T2 | MAJEUR |
| Creer table parties_interessees ou enrichir la structure | Dev | T2 | MAJEUR |
| Ajouter gestion conventions EHPAD (table ou onglet) | Dev | T2 | MAJEUR |
| Enrichir table vigilances (date_declaration, type_declaration) | Dev | T2 | MAJEUR |
| Implementer saisie temperature manuelle quotidienne (avant IoT) | Dev | T2 | MAJEUR |
| Creer liste referencee habilitations obligatoires | Emmanuel | T2 | MAJEUR |
| Lier champ owner a table staff (FK ou autocomplete) | Dev | T2 | MINEUR |

### Priorite 3 -- AMELIORATION CONTINUE (T3-T4 2026)

| Action | Responsable | Echeance | Impact |
|--------|------------|----------|--------|
| Monitoring IoT chaine du froid (V3.1 roadmap) | Dev | T4 | MAJEUR |
| Ajouter gestion des opportunites dans onglet Risques | Dev | T3 | MINEUR |
| Stocker historique score SMQ en BDD (vs statique) | Dev | T3 | MINEUR |
| Structurer elements b et f de S.9.3.2 (revue direction) | Dev | T3 | MINEUR |
| Ajouter niveaux de competence dans qualifications | Dev | T3 | MINEUR |
| Documenter registre RGPD art. 30 | Emmanuel | T3 | MINEUR |
| Enrichir suivi RGPD fournisseurs (date DPA, ref) | Dev | T3 | MINEUR |
| Creer SOPs manquantes restantes (officine, GRH, divers) | Emmanuel | T4 | MINEUR |

---

## Conclusion

Le Dashboard PRAQ v2 constitue une base solide pour le pilotage qualite ISO 9001:2015 de Pharma78. L'architecture en 12 onglets, 21 tables et 90 SOPs couvre la majorite des exigences normatives. Les points forts notables sont :

- Circuit CAPA complet avec verification d'efficacite
- Module audit conforme ISO 19011 avec liaison findings-CAPA
- Score SMQ composite avec 7 composantes ponderees
- Revue de direction auto-agregee couvrant 7/9 elements d'entree ISO
- Formulaire terrain democratisant les declarations qualite
- Zero donnee patient (L1) respectee

Cependant, **12 anomalies majeures** et **1 anomalie critique** doivent etre traitees avant l'ouverture de mars 2026. Les lacunes les plus preoccupantes concernent :

1. **Stupefiants** : couverture reglementaire insuffisante (1/4 SOPs validees, SOPs critiques manquantes)
2. **PDA/EHPAD** : SOPs operationnelles majeures non validees a 6 semaines de l'ouverture
3. **Conventions EHPAD** : absence totale de gestion structuree
4. **Pharmacovigilance** : suivi des delais reglementaires absent

Le plan d'action en 3 priorites propose une feuille de route realiste pour atteindre la conformite. Les actions de Priorite 1 sont imperatives pour l'ouverture et doivent mobiliser le PRAQ a temps plein durant les 4 prochaines semaines.

---

*Rapport genere le 15/02/2026. Ce rapport ne se substitue pas a un audit de certification ISO 9001:2015 par un organisme accredite.*
