# 🔧 Solution pour l'Erreur 42703: "column 'restaurant_id' does not exist"

## 🚨 **Problème Identifié**

Vous rencontrez l'erreur PostgreSQL **42703** qui indique que la colonne `restaurant_id` n'existe pas. Cela se produit généralement quand :

1. **Les tables n'ont pas été créées dans le bon ordre**
2. **Le schéma SQL n'a pas été exécuté complètement**
3. **Il y a des conflits avec des tables existantes**

## ✅ **Solution Immédiate**

### **Étape 1: Nettoyer la Base de Données**

1. Allez sur https://jeumizxzlwjvgerrcpjr.supabase.co
2. Naviguez vers **SQL Editor**
3. Exécutez ce script de nettoyage :

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

### **Étape 2: Exécuter le Schéma Corrigé**

1. **Copiez le contenu** du fichier `supabase-schema-fixed.sql`
2. **Collez-le** dans l'éditeur SQL de Supabase
3. **Exécutez** le script complet

### **Étape 3: Vérifier l'Installation**

1. Allez dans **Table Editor**
2. Vérifiez que ces tables existent :
   - ✅ `users`
   - ✅ `categories`
   - ✅ `restaurants`
   - ✅ `menu_items`
   - ✅ `orders`
   - ✅ `user_addresses`
   - ✅ `reservations`

## 🔍 **Pourquoi cette Erreur se Produit**

### **Ordre de Création des Tables**
Le problème vient souvent de l'ordre de création des tables. Dans notre schéma :

1. `users` doit être créé en premier
2. `categories` peut être créé indépendamment
3. `restaurants` dépend de `users` (pour `partner_id`)
4. `menu_items` dépend de `restaurants` (pour `restaurant_id`)
5. `orders` dépend de `users` et `restaurants`
6. `reservations` dépend de `users` et `restaurants`

### **Dépendances de Clés Étrangères**
```sql
-- menu_items.restaurant_id → restaurants.id
restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE

-- orders.restaurant_id → restaurants.id
restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE

-- reservations.restaurant_id → restaurants.id
restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE
```

## 🛠️ **Script de Diagnostic**

Exécutez ce script pour vérifier l'état de votre base de données :

```sql
-- Diagnostic de la base de données BraPrime

-- 1. Vérifier les extensions
SELECT 'Extensions' as check_type, extname as name, extversion as version
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 2. Lister toutes les tables
SELECT 'Tables' as check_type, table_name as name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Vérifier la structure de la table restaurants
SELECT 'Restaurants Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'restaurants'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table menu_items
SELECT 'Menu Items Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;

-- 5. Compter les enregistrements
SELECT 'Record Counts' as check_type, 
       'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Record Counts', 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'Record Counts', 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Record Counts', 'users', COUNT(*) FROM users;
```

## 🎯 **Vérification Rapide**

Après avoir exécuté le schéma corrigé, testez avec ces requêtes :

```sql
-- Test 1: Vérifier que restaurants existe
SELECT COUNT(*) FROM restaurants;

-- Test 2: Vérifier que menu_items existe et a restaurant_id
SELECT COUNT(*) FROM menu_items WHERE restaurant_id IS NOT NULL;

-- Test 3: Vérifier les relations
SELECT r.name, COUNT(m.id) as menu_items_count
FROM restaurants r
LEFT JOIN menu_items m ON r.id = m.restaurant_id
GROUP BY r.id, r.name;
```

## 🚀 **Prochaines Étapes**

Une fois l'erreur résolue :

1. **Testez l'application** sur http://localhost:8084
2. **Vérifiez l'authentification** (créer un compte)
3. **Testez les restaurants** (parcourir la liste)
4. **Testez les commandes** (ajouter au panier)

## 📞 **Support Supplémentaire**

Si le problème persiste :

1. **Consultez** `TROUBLESHOOTING.md` pour plus de détails
2. **Vérifiez** les logs dans le dashboard Supabase
3. **Testez** avec des données minimales d'abord
4. **Vérifiez** la console du navigateur pour les erreurs JavaScript

---

**💡 Conseil** : Le fichier `supabase-schema-fixed.sql` inclut des instructions `DROP TABLE` au début pour éviter les conflits. C'est la solution la plus sûre pour résoudre cette erreur. 