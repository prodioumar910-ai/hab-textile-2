#!/bin/bash

# Script de préparation pour la génération d'un APK Android (via Capacitor)
# Ce script doit être exécuté dans un environnement disposant d'Android Studio.

echo "--- Préparation de Maison Habé pour Android ---"

# 1. Installation des outils Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialisation du projet Capacitor
npx cap init "Maison Habé" "com.maisonhabe.app" --web-dir dist

# 3. Construction du projet Web
npm run build

# 4. Ajout de la plateforme Android
npx cap add android

# 5. Copie des fichiers web vers le projet Android
npx cap copy

# 6. Ouverture dans Android Studio pour générer l'APK
echo "Prêt ! Ouvrez maintenant le dossier 'android' dans Android Studio pour générer votre APK (Build > Build Bundle(s) / APK(s) > Build APK(s))."
