# ANAS FRAGRANCES - Boutique de Parfums de Luxe

Une application e-commerce moderne pour la vente de parfums de luxe, construite avec React, TypeScript, Vite et Supabase.

## 🌟 Aperçu du Projet

ANAS FRAGRANCES est une boutique en ligne spécialisée dans la vente de parfums de luxe pour hommes, femmes et unisexes. L'application offre une expérience d'achat complète avec des fonctionnalités d'administration robustes.

### Fonctionnalités Principales
- **Catalogue de Produits** : Navigation et recherche avancée de parfums
- **Panier et Commande** : Processus d'achat simplifié avec validation en temps réel
- **Gestion des Utilisateurs** : Authentification, profils et historique des commandes
- **Espace Administrateur** : Gestion complète des produits, commandes et clients
- **Internationalisation** : Support multilingue (i18n)
- **Responsive Design** : Expérience optimale sur tous les appareils
- **Thèmes** : Support du mode clair/sombre

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le bundling rapide
- **Tailwind CSS** pour le styling
- **shadcn/ui** composants UI réutilisables
- **React Router** pour la navigation
- **React Hook Form** pour la gestion des formulaires
- **Zod** pour la validation des données
- **TanStack Query** pour la gestion des états serveur

### Backend & Authentification
- **Supabase** (Backend-as-a-Service)
  - Base de données PostgreSQL
  - Authentification utilisateur
  - Stockage de fichiers
  - Fonctions serverless

### Outils de Développement
- **ESLint** et **Prettier** pour le linting
- **TypeScript** pour le typage statique
- **Vitest** pour les tests (configurable)

## 📁 Structure du Projet

```
src/
├── components/          # Composants React réutilisables
│   ├── admin/          # Composants spécifiques à l'administration
│   ├── auth/           # Composants d'authentification
│   ├── ui/             # Composants UI (shadcn)
│   └── ...             # Autres composants
├── contexts/           # Contextes React (Auth, Cart, etc.)
├── hooks/              # Hooks personnalisés
├── integrations/       # Intégrations tierces (Supabase)
├── lib/                # Fonctions utilitaires et logique métier
├── pages/              # Pages de l'application
│   ├── admin/          # Pages d'administration
│   └── ...             # Pages utilisateur
├── App.tsx             # Composant racine
└── main.tsx            # Point d'entrée de l'application
```

## 🚀 Installation et Configuration

### Prérequis

- Node.js 16+ (recommandé : 18+)
- npm ou yarn
- Compte Supabase (pour le développement)

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-depot>
   cd anas-fragrances
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Modifier le fichier `.env` avec vos clés d'API Supabase.

4. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

L'application sera accessible à l'adresse `http://localhost:3000`.

## 📦 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run build:dev` - Compile en mode développement
- `npm run preview` - Prévisualise la version compilée
- `npm run lint` - Vérifie le code avec ESLint

## 🏗️ Architecture et Bonnes Pratiques

### Organisation du Code
- **Séparation des préoccupations** : Logique métier séparée des composants UI
- **Context API** : Gestion d'état globale pour l'authentification et le panier
- **Hooks personnalisés** : Réutilisation de logique dans l'application
- **Typage strict** : Utilisation complète de TypeScript

### Gestion des Données
- **Supabase Client** : Intégration directe avec l'API Supabase
- **TanStack Query** : Gestion du cache et synchronisation des données
- **Validation Zod** : Validation des données côté client

### Internationalisation
- **react-i18next** : Support multilingue
- Fichiers de traduction organisés par langue
- Détection automatique de la langue du navigateur

## 🔐 Sécurité

- Authentification JWT via Supabase
- Protection des routes administratives
- Validation des données côté client et serveur
- Protection contre les attaques XSS et CSRF

## 🎨 Design et UX

- **Design System** : Basé sur shadcn/ui avec personnalisation
- **Responsive** : Complètement adapté aux mobiles et tablettes
- **Accessibilité** : Respect des standards WCAG
- **Animations** : Transitions fluides avec Framer Motion

## 🧪 Tests

- Tests unitaires avec Vitest
- Tests d'intégration pour les composants critiques
- Tests E2E (à configurer séparément)

## 🚢 Déploiement

### Déploiement Vercel (Recommandé)
1. Lier le dépôt à Vercel
2. Configurer les variables d'environnement
3. Déploiement automatique des branches

### Déploiement Manuel
```bash
npm run build
# Déployer le contenu du dossier dist/
```

## 📊 Monitoring et Analytics

- Suivi des performances avec Web Vitals
- Tracking des événements utilisateur
- Intégration analytics personnalisée

## 🤝 Contribution

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pusher vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [Supabase](https://supabase.io/) pour le backend
- [Vite](https://vitejs.dev/) pour le bundler
- Toute la communauté open-source

## 📞 Support

Pour tout problème ou question, veuillez créer une issue sur le dépôt GitHub.
