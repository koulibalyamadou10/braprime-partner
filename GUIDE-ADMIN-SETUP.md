# Guide de Configuration de l'Administrateur BraPrime

Ce guide vous explique comment créer et configurer un utilisateur administrateur pour la plateforme BraPrime.

## 📋 Prérequis

- Projet Supabase configuré
- Variables d'environnement configurées
- Node.js installé (pour le script automatisé)

## 🚀 Méthode 1: Script Automatisé (Recommandé)

### Étape 1: Configuration des Variables d'Environnement

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** La `SUPABASE_SERVICE_ROLE_KEY` est nécessaire pour créer des utilisateurs administrateurs.

### Étape 2: Installation des Dépendances

```bash
npm install @supabase/supabase-js dotenv
```

### Étape 3: Exécution du Script

```bash
node scripts/create-admin.js
```

Le script va :
- ✅ Vérifier la configuration
- ✅ Créer l'utilisateur dans Supabase Auth
- ✅ Créer le profil admin dans la base de données
- ✅ Afficher les informations de connexion

### Étape 4: Connexion

Utilisez les informations affichées pour vous connecter :
- **Email:** `admin@bradelivery.gn`
- **Mot de passe:** `Admin123!`
- **URL:** `/admin-dashboard`

## 🔧 Méthode 2: Configuration Manuelle

### Étape 1: Créer l'Utilisateur via l'Interface Supabase

1. Allez dans votre projet Supabase
2. Navigation → Authentication → Users
3. Cliquez sur "Add User"
4. Remplissez les informations :
   - **Email:** `admin@bradelivery.gn`
   - **Password:** `Admin123!`
   - **User Metadata:**
     ```json
     {
       "first_name": "Admin",
       "last_name": "BraPrime",
       "role": "admin"
     }
     ```

### Étape 2: Exécuter le Script SQL

1. Allez dans l'éditeur SQL de Supabase
2. Exécutez le script `scripts/create-admin-user.sql`
3. Remplacez l'UUID par l'ID réel de l'utilisateur créé

### Étape 3: Vérification

Vérifiez que le profil admin a été créé :

```sql
SELECT * FROM user_profiles WHERE role = 'admin';
```

## 🔐 Sécurité

### Changement de Mot de Passe

Après la première connexion, changez immédiatement le mot de passe :

1. Connectez-vous avec les identifiants par défaut
2. Allez dans les paramètres du compte
3. Changez le mot de passe pour quelque chose de sécurisé

### Authentification à Deux Facteurs

Activez l'authentification à deux facteurs pour plus de sécurité :

1. Dans les paramètres du compte
2. Section "Sécurité"
3. Activez l'authentification à deux facteurs

## 📊 Accès au Dashboard Admin

Une fois connecté en tant qu'admin, vous pouvez accéder à :

- **Dashboard Principal:** `/admin-dashboard`
- **Gestion des Utilisateurs:** `/admin-dashboard/users`
- **Gestion des Entreprises:** `/admin-dashboard/businesses`
- **Statistiques Globales:** `/admin-dashboard/stats`
- **Configuration Système:** `/admin-dashboard/settings`

## 🔍 Fonctionnalités Admin

### Statistiques Globales
- Nombre total d'utilisateurs
- Nombre total d'entreprises
- Nombre total de commandes
- Revenus totaux
- Nombre de livreurs actifs

### Gestion des Utilisateurs
- Voir tous les utilisateurs
- Modifier les rôles
- Activer/désactiver des comptes
- Voir l'historique des activités

### Gestion des Entreprises
- Voir toutes les entreprises
- Approuver de nouvelles entreprises
- Modifier les informations
- Gérer les statuts

### Surveillance Système
- Logs d'activité
- Performances système
- Erreurs et alertes
- Sauvegardes

## 🛠️ Dépannage

### Erreur: "Clé de service manquante"

```bash
# Vérifiez que SUPABASE_SERVICE_ROLE_KEY est définie
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Erreur: "Accès non autorisé"

Vérifiez que les politiques RLS sont correctement configurées :

```sql
-- Vérifier les politiques admin
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

### Erreur: "Utilisateur déjà existant"

Le script détecte automatiquement les admins existants. Si vous voulez forcer la création :

```bash
# Supprimer l'admin existant d'abord
node scripts/delete-admin.js
```

## 📝 Personnalisation

### Changer les Informations Admin

Modifiez le fichier `scripts/create-admin.js` :

```javascript
const adminConfig = {
  email: 'votre-email@domaine.com',
  password: 'VotreMotDePasse123!',
  first_name: 'Votre Prénom',
  last_name: 'Votre Nom',
  phone: '+224 123 456 789'
};
```

### Ajouter des Rôles Personnalisés

Pour ajouter de nouveaux rôles d'administration :

1. Modifiez le script SQL
2. Ajoutez les nouvelles politiques RLS
3. Créez les fonctions correspondantes

## 🔄 Mise à Jour

Pour mettre à jour un admin existant :

```bash
# Mettre à jour les informations
node scripts/update-admin.js

# Ou supprimer et recréer
node scripts/delete-admin.js
node scripts/create-admin.js
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console
2. Consultez la documentation Supabase
3. Vérifiez les politiques RLS
4. Contactez l'équipe de développement

---

**Note:** Gardez toujours les identifiants admin en lieu sûr et ne les partagez jamais publiquement. 