# Interface d'Inscription des Joueurs

Cette interface permet aux joueurs de s'inscrire en fournissant diverses informations personnelles et préférences, afin de collecter des données sur la dynamique de frappe.

## Fonctionnalités

- Formulaire d'inscription en plusieurs étapes
- Collecte d'informations personnelles (pseudo, âge, genre, latéralité)
- Collecte de préférences et d'expérience (niveau d'éducation, fréquence de jeu, expérience de frappe, type d'appareil)
- Consentement pour l'utilisation des données
- Interface responsive et conviviale

## Données collectées

L'interface recueille plusieurs types d'informations:

- **Informations personnelles**
  - Pseudo
  - Âge
  - Genre
  - Main dominante (droitier/gaucher/ambidextre)

- **Préférences & Expérience**
  - Niveau d'éducation
  - Fréquence de jeu
  - Expérience de frappe au clavier
  - Type d'appareil utilisé

Ces données sont utilisées pour analyser les dynamiques de frappe et améliorer l'expérience de jeu en fonction des différents profils d'utilisateurs.

## Installation et lancement

### Prérequis
- Node.js (version 14.0.0 ou supérieure)
- npm (version 6.0.0 ou supérieure)

### Installation
```bash
# Installer les dépendances
npm install
```

### Démarrage
```bash
# Lancer l'application en mode développement
npm run dev
```

## Structure du projet

```
chat_enrollement_interface/
├── src/
│   ├── EnrollmentInterface.jsx    # Interface principale d'inscription
│   ├── App.jsx                    # Composant racine de l'application
│   ├── main.jsx                   # Point d'entrée de l'application
│   └── index.css                  # Styles globaux
├── index.html                     # Fichier HTML principal
├── package.json                   # Configuration du projet
├── tailwind.config.js            # Configuration de Tailwind CSS
└── README.md                     # Documentation du projet
``` 