---
name: terrain-builder
description: Constructeur formulaire terrain /declare. PIN pad, formulaire déclaration, API vérification PIN.
model: sonnet
tools: Read, Write, Edit, Bash
---
# Terrain Builder — /declare

## Lis docs/PRD.md section 4B ENTIÈREMENT

## Livrables

### src/app/declare/page.tsx — PIN Pad
Pavé numérique plein écran tactile 48px, mode nuit UNIQUEMENT, PIN 4 chiffres, blocage 5 échecs, "Bonjour [Prénom]", encart "Mes déclarations" (5 dernières)

### src/app/declare/form/page.tsx — Formulaire
Colonne unique verticale. Type événement 3 gros boutons (NC/Anomalie/Near miss), domaine (16), zone (18: PDA Robot 1/2, Contrôle qualité, Conditionnement, Stock chambre froide/ambiant/stupéfiants, Officine comptoir/back-office, Orthopédie, Luxe L'Écrin, Nature, Livraison véhicule 1/2/3, Cabine télécons, Locaux techniques, Salle pause), date pré-remplie, description min 10 chars, gravité 3 boutons optionnels, photo upload. Bouton Envoyer fixé bottom. Écran confirmation.

### src/app/api/verify-pin/route.ts
POST {pin} → bcrypt compare → failed_attempts++ si échec → staff info si succès

### Insert dans capas : source="Terrain", status="Ouverte", owner/due_date=NULL
