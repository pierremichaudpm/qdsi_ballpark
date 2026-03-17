# WORKING_LOG — QDSi Ballpark Estimator

## Session 2026-03-17

### Progrès
- Création du projet Vite + React à partir du prototype `ballpark-proto.jsx`
- Branding QDSi appliqué : couleurs extraites du site qdsinternational.com, logo intégré
- Typographie culturelle : Syne + Space Mono (Google Fonts)
- 13 installations du catalogue officiel QDSi intégrées
- Catalogue mis à jour avec noms officiels (Impulsion, Celestia, Prismatica, Îlot de chaleur, etc.)
- Formulaire : Installation, Destination (7 régions), Saison, Durée de location (semaines)
- Résultats : 9 postes budgétaires, fourchette basse/haute, barre de répartition visuelle
- Dropdowns custom React (remplacent les `<select>` natifs)
- Deploy Netlify configuré (`netlify.toml`)
- Repo poussé sur `github.com:pierremichaudpm/qdsi_ballpark`

### Décisions techniques
- **Dropdowns custom** : les `<select>` natifs avec `appearance: none` positionnaient le popup hors du conteneur de l'app. Composant `Select` custom avec fermeture au clic extérieur.
- **2 vols DT** : le directeur technique fait 2 déplacements séparés (montage + démontage), donc 2 allers-retours facturés, pas un séjour continu.
- **Location vs exploitation** : les frais locatifs sont calculés en semaines (durée d'exploitation saisie), indépendamment des jours de montage/démontage.
- **Champ Jours DT retiré** : les mountDays/unmountDays sont dans les données d'installation, pas de saisie manuelle — prototype simplifié.
- **Tarifs locatifs par semaine** (`rentalPerWeek`) plutôt qu'un montant fixe, pour refléter la durée variable d'exploitation.

### Problèmes rencontrés
- Logo QDSi introuvable via fetch HTML (chargé dynamiquement par JS/CSS). Résolu avec le fichier webp fourni par le client.
- Select natifs : popup dropdown se positionnait en haut à gauche de l'écran, hors de l'app. Résolu avec composant custom.
- Parsing error après édits multiples (accolade en trop). Résolu en vérifiant le build Vite.

### Prochaines étapes
- [ ] Obtenir les vraies données mountDays/unmountDays de QDSi
- [ ] Obtenir les vrais tarifs locatifs par installation
- [ ] Obtenir le nombre réel de crew par installation
- [ ] Valider les régions et tarifs transport avec l'équipe QDSi
- [ ] Ajouter export PDF de l'estimation
- [ ] Ajouter la possibilité de comparer 2-3 scénarios côte à côte
- [ ] Connecter à Supabase pour persistance (post-prototype)
- [ ] Intégrer le vrai logo SVG si disponible
- [ ] Tester sur mobile (téléphone réel)
- [ ] Déployer sur Netlify et partager l'URL avec l'équipe QDSi
