# Tests du formulaire terrain

Plan de test complet pour valider le formulaire de déclaration terrain (`/declare`).

## Prérequis

1. Base de données Supabase configurée avec les tables `staff`, `staff_pins`, `capas`, `domains`
2. Variables d'environnement définies dans `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Bucket Storage `photos` créé avec policies
4. Au moins 1 staff avec PIN seed (voir `scripts/seed-staff-pin.sql`)
5. Au moins 1 domaine dans la table `domains`

## Tests PIN Pad (/declare)

### T1 : Affichage initial
- [ ] Page charge en mode nuit uniquement
- [ ] Header affiche "Pharma78" avec le "a" en vert
- [ ] Sous-titre "Déclaration terrain" visible
- [ ] Pavé numérique 3x4 affiché correctement
- [ ] 4 dots PIN affichés (vides)
- [ ] Boutons tactiles 48px min hauteur
- [ ] Fond card, border brd, texte 24px bold

### T2 : Saisie PIN
- [ ] Clic sur chiffre remplit dot correspondant
- [ ] Dots remplis en couleur accent (#00FF88)
- [ ] Maximum 4 chiffres acceptés
- [ ] Bouton "Suppr." fonctionne
- [ ] Bouton "Suppr." disabled si pin vide

### T3 : PIN correct
- [ ] API `/api/verify-pin` appelée au 4ème chiffre
- [ ] Message "Bonjour [Prénom]" affiché
- [ ] Check vert affiché
- [ ] Redirect vers `/declare/form` après 1.5s
- [ ] Cookie `staff_auth` créé avec {id, name, role}

### T4 : PIN incorrect
- [ ] Animation shake sur les 4 dots
- [ ] Message "PIN incorrect" en rouge
- [ ] Dots réinitialisés automatiquement
- [ ] Possibilité de ressaisir immédiatement

### T5 : Blocage après 5 échecs
- [ ] Après 5 échecs : message "Compte bloqué. Contactez le PRAQ."
- [ ] Plus de possibilité de saisir
- [ ] API retourne `locked: true`
- [ ] En BDD : `staff_pins.locked = true`, `failed_attempts = 5`

### T6 : Mes déclarations
- [ ] Section "Mes déclarations" affichée après auth
- [ ] 5 dernières déclarations du staff affichées
- [ ] Pour chaque : date, type, zone, statut (Badge)
- [ ] Lecture seule (pas de clic)
- [ ] Si 0 déclaration : section masquée

## Tests Formulaire (/declare/form)

### T7 : Auth guard
- [ ] Redirect vers `/declare` si pas de cookie `staff_auth`
- [ ] Cookie vérifié au chargement
- [ ] Si cookie invalide : redirect

### T8 : Affichage initial
- [ ] Mode nuit uniquement
- [ ] Max-width 480px centré
- [ ] Colonne unique verticale
- [ ] Tous les champs dans l'ordre PRD

### T9 : Type d'événement
- [ ] 3 gros boutons (48px min)
- [ ] Non-conformité (rouge), Anomalie (ambre), Near miss (vert)
- [ ] Un seul sélectionnable à la fois
- [ ] Couleur de fond change selon sélection
- [ ] Border 2px colorée

### T10 : Domaine
- [ ] Select dropdown fonctionnel
- [ ] Liste des 16 domaines chargée depuis Supabase
- [ ] Ordre alphabétique
- [ ] Placeholder "Sélectionnez un domaine"

### T11 : Zone
- [ ] Select dropdown fonctionnel
- [ ] Liste des 18 zones affichée
- [ ] Ordre : PDA, Qualité, Stock, Officine, Activités, Livraison, Support
- [ ] Placeholder "Sélectionnez une zone"

### T12 : Date
- [ ] Input date pré-rempli avec aujourd'hui
- [ ] Format ISO (YYYY-MM-DD)
- [ ] Modifiable

### T13 : Description
- [ ] Textarea 5 lignes minimum
- [ ] Placeholder "Décrivez l'événement (10 caractères min.)"
- [ ] Compteur caractères affiché
- [ ] Couleur verte si ≥ 10 chars
- [ ] Validation min 10 chars

### T14 : Gravité ressentie (optionnel)
- [ ] 3 boutons toggle : Faible, Moyenne, Élevée
- [ ] Couleurs : vert, ambre, rouge
- [ ] Peut être désélectionné (clic sur bouton actif)
- [ ] Non requis pour validation

### T15 : Photo (optionnel)
- [ ] Bouton upload avec icône UploadIcon
- [ ] Affiche nom fichier si sélectionné
- [ ] Preview image affichée (max 192px height)
- [ ] Accept : image/*
- [ ] Non requis pour validation

### T16 : Bouton Envoyer
- [ ] Fixé en bas de l'écran (sticky bottom)
- [ ] Pleine largeur
- [ ] Fond accent, texte bold noir
- [ ] Disabled si type OU domaine OU zone OU description < 10 chars
- [ ] Opacité réduite si disabled
- [ ] Cursor not-allowed si disabled

### T17 : Validation formulaire
- [ ] Requis : type, domaine, zone, description ≥ 10 chars
- [ ] Optionnel : gravité, photo
- [ ] Bouton "Envoyer" enabled uniquement si tout requis rempli

### T18 : Upload photo
- [ ] Photo uploadée vers Supabase Storage bucket `photos`
- [ ] Dossier : `terrain-photos/`
- [ ] Nom fichier : `{staff_id}-{timestamp}.{ext}`
- [ ] URL publique retournée
- [ ] Géré les erreurs upload

### T19 : Insert CAPA
- [ ] Insert dans table `capas` réussi
- [ ] source = "Terrain"
- [ ] type = type sélectionné
- [ ] domain_id = domaine sélectionné
- [ ] description = description saisie
- [ ] status = "Ouverte"
- [ ] terrain_zone = zone sélectionnée
- [ ] terrain_severity = gravité ou null
- [ ] terrain_photo_url = url ou null
- [ ] created_by = staff.id
- [ ] owner = null
- [ ] due_date = null

### T20 : Écran confirmation
- [ ] Check vert affiché
- [ ] Titre "Déclaration enregistrée"
- [ ] Message "Votre signalement a été transmis au PRAQ"
- [ ] Bouton "Nouvelle déclaration" affiché
- [ ] Bouton "Retour" affiché

### T21 : Nouvelle déclaration
- [ ] Clic "Nouvelle déclaration" reset le formulaire
- [ ] Tous champs vidés sauf date (réinitialisée à aujourd'hui)
- [ ] Retour sur formulaire vide

### T22 : Retour
- [ ] Clic "Retour" redirect vers `/declare`
- [ ] Cookie `staff_auth` conservé
- [ ] Mes déclarations affichées (maintenant +1)

## Tests API

### T23 : POST /api/verify-pin - Success
```json
Request: { "pin": "1234" }
Response: {
  "success": true,
  "staff": {
    "id": "uuid",
    "name": "Sophie Martin",
    "role": "Préparateur"
  }
}
```
- [ ] Status 200
- [ ] `staff_pins.failed_attempts` reset à 0

### T24 : POST /api/verify-pin - Failure
```json
Request: { "pin": "9999" }
Response: {
  "success": false,
  "message": "PIN incorrect"
}
```
- [ ] Status 401

### T25 : POST /api/verify-pin - Locked
```json
Request: { "pin": "1234" }
Response: {
  "success": false,
  "locked": true,
  "message": "Compte bloqué"
}
```
- [ ] Status 401
- [ ] Si `staff_pins.locked = true`

### T26 : POST /api/verify-pin - Invalid PIN
```json
Request: { "pin": "123" }
Response: {
  "success": false,
  "message": "PIN invalide"
}
```
- [ ] Status 400
- [ ] Si PIN != 4 chiffres

## Tests de performance

### T27 : < 60 secondes pour déclaration complète
- [ ] Chronomètre du premier clic PIN jusqu'à écran confirmation
- [ ] Objectif : < 60 secondes
- [ ] Scénario : PIN correct, formulaire pré-rempli, pas de photo

### T28 : Responsive tablette
- [ ] Test sur écran ≥ 768px
- [ ] Layout adaptatif
- [ ] Boutons tactiles accessibles
- [ ] Pas de scroll horizontal

## Tests de sécurité

### T29 : Bcrypt hash
- [ ] PIN jamais stocké en clair
- [ ] Hash bcrypt avec salt 10 rounds minimum
- [ ] Comparaison serveur uniquement

### T30 : RLS Policies
- [ ] Staff ne peut voir que ses propres déclarations
- [ ] Staff peut insert dans `capas` avec source="Terrain"
- [ ] Staff ne peut pas modifier/supprimer CAPA après création
- [ ] Upload photo restreint au dossier `terrain-photos/`

## Critères d'acceptance (rappel PRD)

- **CA-T1** : PIN fonctionnel avec bcrypt
- **CA-T2** : Blocage après 5 échecs
- **CA-T3** : Déclaration complète en < 60 secondes
- **CA-T4** : Insert CAPA réussi
- **CA-T5** : Notification PRAQ (V2.0d - pas encore implémenté)
- **CA-T6** : Notification responsable (V2.0d - pas encore implémenté)
- **CA-T7** : Notification déclarant (V2.0d - pas encore implémenté)
- **CA-T8** : Mes 5 dernières déclarations affichées
- **CA-T9** : Zéro donnée médicale
- **CA-T10** : Upload photo fonctionnel

## Bugs connus / À améliorer

### V2.0c (actuel)
- Pas de notification email
- Pas d'incrémentation `failed_attempts` côté API (à implémenter)
- Pas de rate limiting par IP

### V2.1 (futur)
- Ajout notification email PRAQ immédiate
- Ajout notification email responsable domaine
- Ajout notification email déclarant quand qualifié
- Ajout rate limiting IP
- Ajout audit trail des tentatives PIN
