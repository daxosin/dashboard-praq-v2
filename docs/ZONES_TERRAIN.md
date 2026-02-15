# Zones du formulaire terrain

Liste des 18 zones disponibles dans le formulaire de déclaration terrain (`/declare/form`).

## Zones PDA (2)
1. PDA Robot 1
2. PDA Robot 2

## Zones Qualité (2)
3. Contrôle qualité
4. Conditionnement

## Zones Stock (3)
5. Stock chambre froide
6. Stock ambiant
7. Stock stupéfiants

## Zones Officine (2)
8. Officine comptoir
9. Officine back-office

## Zones Activités spécialisées (3)
10. Orthopédie
11. Luxe L'Écrin
12. Nature

## Zones Livraison (3)
13. Livraison véhicule 1
14. Livraison véhicule 2
15. Livraison véhicule 3

## Zones Support (3)
16. Cabine téléconsultation
17. Locaux techniques
18. Salle pause

---

## Mapping zone → domaine suggéré

Cette table suggère un mapping entre les zones et les domaines qualité pertinents.

| Zone | Domaine(s) suggéré(s) |
|------|----------------------|
| PDA Robot 1, 2 | Préparation PDA |
| Contrôle qualité | Contrôle qualité |
| Conditionnement | Préparation PDA |
| Stock chambre froide, ambiant | Gestion des stocks |
| Stock stupéfiants | Stupéfiants |
| Officine comptoir, back-office | Dispensation |
| Orthopédie | Orthopédie |
| Luxe L'Écrin, Nature | Officine luxe |
| Livraison véhicule 1, 2, 3 | Livraison |
| Cabine téléconsultation | Téléconsultation |
| Locaux techniques | Maintenance |
| Salle pause | Gestion RH |

Note : Le domaine est choisi librement par le déclarant. Ce mapping est purement indicatif.

---

## Exemples de déclarations par zone

### PDA Robot 1
- Non-conformité : "Étiquette déchirée sur sachet"
- Anomalie : "Tiroir A12 difficile à ouvrir"
- Near miss : "Sachet presque tombé lors du retrait"

### Stock chambre froide
- Non-conformité : "Température relevée à 12°C (seuil : 2-8°C)"
- Anomalie : "Alarme sonore porte restée ouverte ne fonctionne pas"
- Near miss : "Porte presque restée ouverte toute la nuit"

### Officine comptoir
- Non-conformité : "Ordonnance dispensée sans validation pharmacien"
- Anomalie : "Caisse enregistreuse bloquée pendant 15 min"
- Near miss : "Patient presque reparti avec mauvais médicament"

### Livraison véhicule 1
- Non-conformité : "Colis non réfrigéré pendant 2h (panne glacière)"
- Anomalie : "GPS véhicule affiche position erronée"
- Near miss : "Presque oublié commande EHPAD dans le coffre"
