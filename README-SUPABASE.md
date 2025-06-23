# Configuration Supabase pour BraPrime

Ce guide vous explique comment configurer Supabase pour le projet BraPrime.

## 🚀 Étapes de Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL de projet et votre clé anon

### 2. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Initialiser la Base de Données

1. Allez dans votre dashboard Supabase
2. Naviguez vers l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `supabase-schema.sql`

### 4. Configurer l'Authentification

1. Dans le dashboard Supabase, allez dans **Authentication > Settings**
2. Configurez les paramètres suivants :
   - **Site URL** : `http://localhost:8080` (pour le développement)
   - **Redirect URLs** : `http://localhost:8080/**`
   - **Enable email confirmations** : Désactivé (pour le développement)

### 5. Configurer le Stockage (Optionnel)

Si vous voulez utiliser le stockage Supabase pour les images :

1. Allez dans **Storage** dans le dashboard
2. Créez un bucket `restaurant-images`
3. Configurez les politiques RLS pour le bucket

## 📊 Structure de la Base de Données

### Tables Principales

- **users** : Profils des utilisateurs (clients et partenaires)
- **restaurants** : Informations des restaurants
- **menu_items** : Articles du menu
- **orders** : Commandes des clients
- **categories** : Catégories de services
- **user_addresses** : Adresses des utilisateurs
- **reservations** : Réservations de restaurants

### Relations

- Un utilisateur peut avoir plusieurs commandes
- Un restaurant peut avoir plusieurs articles de menu
- Un restaurant appartient à un partenaire
- Une commande appartient à un utilisateur et un restaurant

## 🔐 Sécurité (RLS)

Le projet utilise Row Level Security (RLS) pour sécuriser les données :

- Les utilisateurs ne peuvent voir que leurs propres données
- Les partenaires ne peuvent gérer que leurs restaurants
- Les commandes sont isolées par utilisateur et restaurant

## 🧪 Données de Test

Le schéma inclut des données de test :

### Restaurants de Test
- Le Petit Baoulé (Cuisine Guinéenne)
- Conakry Grill House (Grillades)
- Fruits de Mer Conakry (Fruits de Mer)

### Articles de Menu de Test
- Poulet Yassa, Sauce Arachide, Alloco, etc.
- Prix en Francs Guinéens (GNF)

## 🔧 Services Implémentés

### AuthService
- Inscription/Connexion utilisateurs
- Gestion des profils
- Écoute des changements d'authentification

### RestaurantService
- Récupération des restaurants
- Gestion des menus
- Recherche et filtrage

### OrderService
- Création et gestion des commandes
- Suivi des statuts
- Statistiques pour les partenaires

## 🚀 Démarrage Rapide

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env.local
   # Éditer .env.local avec vos clés Supabase
   ```

3. **Initialiser la base de données** :
   - Exécuter le script SQL dans Supabase

4. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

## 🔍 Test de l'Intégration

### Test d'Authentification
1. Créez un compte client
2. Connectez-vous
3. Vérifiez que le profil est créé dans Supabase

### Test des Commandes
1. Ajoutez des articles au panier
2. Passez une commande
3. Vérifiez que la commande apparaît dans Supabase

### Test des Restaurants
1. Parcourez la liste des restaurants
2. Consultez les menus
3. Vérifiez que les données sont récupérées depuis Supabase

## 🛠️ Développement

### Ajouter de Nouvelles Tables

1. Modifiez le fichier `supabase-schema.sql`
2. Ajoutez les types TypeScript dans `src/lib/supabase.ts`
3. Créez un service correspondant dans `src/lib/services/`

### Ajouter de Nouvelles Fonctionnalités

1. Créez un service dans `src/lib/services/`
2. Mettez à jour les contextes si nécessaire
3. Ajoutez les composants UI

## 🔧 Dépannage

### Erreurs de Connexion
- Vérifiez vos variables d'environnement
- Assurez-vous que votre projet Supabase est actif

### Erreurs d'Authentification
- Vérifiez la configuration des redirections dans Supabase
- Assurez-vous que les politiques RLS sont correctes

### Erreurs de Base de Données
- Vérifiez que le schéma SQL a été exécuté
- Consultez les logs dans le dashboard Supabase

## 📱 Fonctionnalités Avancées

### Temps Réel
Le projet utilise les subscriptions Supabase pour :
- Mise à jour en temps réel des commandes
- Notifications de statut
- Synchronisation multi-utilisateurs

### Optimisations
- Index sur les colonnes fréquemment utilisées
- Pagination pour les grandes listes
- Cache local avec localStorage

## 🚀 Production

Pour déployer en production :

1. **Variables d'environnement** :
   - Mettez à jour les URLs de redirection
   - Utilisez des clés de production

2. **Base de données** :
   - Sauvegardez vos données de test
   - Configurez les sauvegardes automatiques

3. **Sécurité** :
   - Activez l'authentification par email
   - Configurez les politiques RLS strictes
   - Utilisez HTTPS

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation Supabase
2. Vérifiez les logs dans le dashboard
3. Testez avec les données de test fournies

---

**BraPrime** - Livraison rapide en Guinée Conakry 🚀 