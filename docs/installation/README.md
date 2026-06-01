# Guide d'Installation - Maison Habé

Ce dossier contient les instructions pour installer et configurer l'application Maison Habé localement ou en production.

## Prérequis
- **Node.js** (Version 18 ou supérieure)
- **npm** ou **yarn**
- Un projet **Firebase** (pour l'authentification et la base de données)

## Installation Locale

1. **Cloner le projet** :
   ```bash
   git clone <url-du-depot>
   cd maison-habe
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configuration de l'environnement** :
   Créez un fichier `.env` à la racine et ajoutez vos clés API Firebase :
   ```env
   VITE_FIREBASE_API_KEY=votre_cle
   VITE_FIREBASE_AUTH_DOMAIN=votre_domaine
   VITE_FIREBASE_PROJECT_ID=votre_projet_id
   VITE_FIREBASE_STORAGE_BUCKET=votre_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   VITE_FIREBASE_APP_ID=votre_app_id
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera disponible sur `http://localhost:3000`.

## Déploiement

1. **Générer le build de production** :
   ```bash
   npm run build
   ```

2. **Déployer sur Firebase Hosting** (ou autre service) :
   ```bash
   firebase deploy
   ```

## Installation sur Mobile (Android & iOS)

L'application est configurée comme une **PWA (Progressive Web App)**. C'est la méthode recommandée pour l'installer sans passer par un store.

### Sur Android (Chrome)
1. Ouvrez l'URL de l'application dans Chrome.
2. Appuyez sur les **trois points** en haut à droite.
3. Sélectionnez **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**.

### Sur iOS (Safari)
1. Ouvrez l'URL de l'application dans Safari.
2. Appuyez sur l'icône de **partage** (carré avec une flèche vers le haut).
3. Faites défiler et sélectionnez **"Sur l'écran d'accueil"**.

---

## Génération d'un fichier APK (Android Natif)

Pour transformer cette application web en un fichier `.apk` installable :

1. Assurez-vous d'avoir **Android Studio** installé sur votre ordinateur.
2. Exécutez le script d'aide à la configuration :
   ```bash
   bash scripts/build-apk-guide.sh
   ```
3. Suivez les instructions affichées pour finaliser la compilation dans Android Studio.

---

## Structure du Projet
- `/src` : Code source de l'application (React + Tailwind).
- `/src/components` : Composants réutilisables (Header, Footer, Section, etc.).
- `/src/context` : Gestion de l'état global avec React Context.
- `/public` : Actifs statiques et images.
