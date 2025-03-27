# Application Web Keystroke

## Description
Interface web pour l'application Keystroke, permettant de visualiser et d'analyser les données de frappe de touches.

## Installation

1. Accédez au dossier de l'application web :
```bash
cd appweb
```

2. Créez un environnement virtuel Python :
```bash
python -m venv venv
source venv/bin/activate  # Sur Unix/macOS
# ou
.\venv\Scripts\activate  # Sur Windows
```

3. Installez les dépendances :
```bash
pip install -r requirements.txt
```

## Démarrage

Pour lancer l'application :
```bash
python server.py
```

## Structure du Projet
```
appweb/
├── frontend/         # Interface utilisateur
├── backend/          # Logique serveur
├── jsExample/        # Exemples JavaScript
├── server.py         # Point d'entrée du serveur
└── requirements.txt  # Dépendances Python
```

## Technologies Utilisées
- Backend : Python
- Frontend : HTML/CSS/JavaScript
- API : REST/WebSocket


## Fonctionnalités
- Interface utilisateur web
- Visualisation des données de frappe
- API RESTful

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request
