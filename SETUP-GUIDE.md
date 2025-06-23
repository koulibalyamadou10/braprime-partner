# 🚀 Guide de Configuration Rapide - BraPrime + Supabase

## ✅ Étape 1: Variables d'Environnement (Déjà fait!)

Les variables d'environnement sont déjà configurées dans `.env.local` :
- URL: `https://jeumizxzlwjvgerrcpjr.supabase.co`
- Clé: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🗄️ Étape 2: Initialiser la Base de Données

### ⚠️ **IMPORTANT: Si vous avez l'erreur "column 'restaurant_id' does not exist"**

1. **Nettoyez d'abord la base de données** :
   - Allez sur https://jeumizxzlwjvgerrcpjr.supabase.co
   - Naviguez vers **SQL Editor**
   - Exécutez ce script de nettoyage :

```sql
-- Nettoyer toutes les tables existantes
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les fonctions et triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
```

2. **Exécutez le schéma corrigé** :
   - Copiez le contenu du fichier `supabase-schema-fixed.sql`
   - Collez-le dans l'éditeur SQL de Supabase
   - Exécutez le script complet

### Option A: Manuel (Recommandé)

1. **Allez sur votre dashboard Supabase** :
   ```
   https://jeumizxzlwjvgerrcpjr.supabase.co
   ```

2. **Connectez-vous** à votre compte Supabase

3. **Naviguez vers SQL Editor** dans le menu de gauche

4. **Copiez le contenu** du fichier `supabase-schema-fixed.sql`

5. **Collez et exécutez** le script SQL

6. **Vérifiez** que les tables ont été créées dans "Table Editor"

### Option B: Automatique (Script Node.js)

```bash
# Installer les dépendances si nécessaire
npm install @supabase/supabase-js

# Exécuter le script d'initialisation
node init-supabase.js
```

## 🔧 Étape 3: Configurer l'Authentification

1. Dans le dashboard Supabase, allez dans **Authentication > Settings**

2. Configurez :
   - **Site URL**: `http://localhost:8084/` (ou le port actuel)
   - **Redirect URLs**: `http://localhost:8084/**`
   - **Enable email confirmations**: Désactivé (pour le développement)

## 🧪 Étape 4: Tester l'Application

1. **Démarrez le serveur** (déjà en cours sur le port 8084)

2. **Ouvrez** http://localhost:8084

3. **Testez l'authentification** :
   - Créez un compte client
   - Connectez-vous
   - Vérifiez que le profil est créé dans Supabase

4. **Testez les restaurants** :
   - Parcourez la liste des restaurants
   - Consultez les menus
   - Vérifiez que les données viennent de Supabase

5. **Testez les commandes** :
   - Ajoutez des articles au panier
   - Passez une commande
   - Vérifiez que la commande apparaît dans Supabase

## 📊 Vérification dans Supabase

Après l'initialisation, vous devriez voir ces tables dans "Table Editor" :

- ✅ `users` - Profils utilisateurs
- ✅ `restaurants` - Restaurants
- ✅ `menu_items` - Articles de menu
- ✅ `orders` - Commandes
- ✅ `categories` - Catégories
- ✅ `user_addresses` - Adresses utilisateurs
- ✅ `reservations` - Réservations

## 🔍 Données de Test

Le schéma inclut des données de test :

### Restaurants
- Le Petit Baoulé (Cuisine Guinéenne)
- Conakry Grill House (Grillades)
- Fruits de Mer Conakry (Fruits de Mer)

### Articles de Menu
- Poulet Yassa (60,000 GNF)
- Sauce Arachide (55,000 GNF)
- Jus de Gingembre (15,000 GNF)
- Et plus...

## 🚨 Dépannage

### Erreur de Connexion
- Vérifiez que le projet Supabase est actif
- Vérifiez les variables d'environnement

### Erreur d'Authentification
- Vérifiez la configuration des redirections
- Assurez-vous que les politiques RLS sont correctes

### Erreur de Base de Données
- Vérifiez que le schéma SQL a été exécuté
- Consultez les logs dans le dashboard Supabase

### Erreur "column 'restaurant_id' does not exist"
- **Solution** : Utilisez le fichier `supabase-schema-fixed.sql`
- **Alternative** : Consultez `TROUBLESHOOTING.md` pour plus de détails

## 🛠️ Diagnostic

Si vous rencontrez des problèmes, exécutez le script de diagnostic :

1. Copiez le contenu de `diagnostic.sql`
2. Exécutez-le dans l'éditeur SQL de Supabase
3. Vérifiez les résultats pour identifier les problèmes

## 🎯 Prochaines Étapes

Une fois tout configuré :

1. **Testez toutes les fonctionnalités**
2. **Ajoutez vos propres restaurants**
3. **Personnalisez les menus**
4. **Configurez les paiements** (optionnel)
5. **Déployez en production**

---

**🎉 Félicitations ! Votre application BraPrime est maintenant connectée à Supabase !**

Pour toute question, consultez :
- `README-SUPABASE.md` - Guide complet
- `TROUBLESHOOTING.md` - Guide de dépannage
- `SUPABASE-INTEGRATION-SUMMARY.md` - Résumé de l'intégration 