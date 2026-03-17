# CLAUDE.md — QDSi Ballpark Estimator

## Projet
Prototype d'outil d'estimation budgétaire (ballpark) pour QDS International (QDSi).
Destiné à être présenté en rencontre de cadrage avec Nicolas Isabelle, Abigaëlle Parisé et Noah L'Abbée.

## Stack
- **React** (JSX, composants inline)
- **Vite** (build + dev server)
- **Google Fonts** : Syne (titres/UI) + Space Mono (chiffres/labels)
- **Deploy** : Netlify (auto-deploy sur push main)
- **Repo** : `git@github.com:pierremichaudpm/qdsi_ballpark.git`

## Structure
```
├── src/
│   ├── App.jsx           # Composant principal (tout-en-un)
│   └── main.jsx          # Point d'entrée React
├── public/assets/
│   ├── logo-white.webp   # Logo QDSi blanc sur fond transparent
│   └── logo.png          # Logo QDSi noir sur fond blanc
├── assets/               # Assets source (non servis)
├── index.html
├── vite.config.js
├── netlify.toml          # Config deploy Netlify
└── ballpark-proto.jsx    # Fichier proto original (référence)
```

## Branding QDSi
- **Couleurs** : fond sombre `#06060f`, rouge QDSi `#cc2b2b`, cyan `#0693e3`, violet `#9b51e0`, rose `#f78da7`
- **Logo** : `public/assets/logo-white.webp` (blanc, fond transparent — pour thème sombre)
- **Footer** : "Propulsé par Studio Micho"

## Modèle de calcul — 9 postes budgétaires
1. **Location** — `rentalPerWeek × rentalWeeks` (durée saisie par l'utilisateur)
2. **Direction technique** — `(mountDays + unmountDays) × DT_DAILY`
3. **Vols DT** — 2 allers-retours (montage + démontage), modulés par région et saison
4. **Hébergement DT** — nuits = mountDays + unmountDays
5. **Per diem DT** — idem
6. **Main-d'œuvre locale** — `crew × (mountDays + unmountDays) × LOCAL_DAILY`
7. **Opérateur machinerie** — selon profil (light/medium/heavy)
8. **Chariot élévateur** — selon profil
9. **Transport installation** — selon région

## Logique métier importante
- Le DT fait **2 déplacements séparés** (montage puis démontage), pas un séjour continu
- La **durée de location** (semaines d'exploitation) est indépendante des jours de travail DT
- Les données mountDays/unmountDays sont fictives — QDSi fournira les vraies valeurs
- Fourchette basse/haute avec multiplicateurs saisonniers

## Contraintes
- Single file React (tout dans App.jsx)
- Pas de backend, pas de localStorage, pas d'auth
- Données en mémoire / state React
- Design quality > feature quantity
- Interface en français québécois naturel
