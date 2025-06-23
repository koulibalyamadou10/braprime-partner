# 🔧 Guide de Dépannage - BraPrime + Supabase

## ❌ Erreur: "column 'restaurant_id' does not exist"

### 🔍 **Cause de l'erreur**
Cette erreur se produit généralement quand :
1. Les tables n'ont pas été créées dans le bon ordre
2. Le schéma SQL n'a pas été exécuté complètement
3. Il y a des conflits avec des tables existantes

### ✅ **Solution**

#### **Étape 1: Nettoyer la base de données**
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

#### **Étape 2: Exécuter le schéma corrigé**
1. Copiez le contenu du fichier `supabase-schema-fixed.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Exécutez le script complet

#### **Étape 3: Vérifier les tables**
1. Allez dans **Table Editor**
2. Vérifiez que ces tables existent :
   - ✅ `users`
   - ✅ `categories`
   - ✅ `restaurants`
   - ✅ `menu_items`
   - ✅ `orders`
   - ✅ `user_addresses`
   - ✅ `reservations`

## 🚨 **Autres Erreurs Courantes**

### **Erreur: "relation 'auth.users' does not exist"**
- **Cause** : L'authentification Supabase n'est pas activée
- **Solution** : Activez l'authentification dans **Authentication > Settings**

### **Erreur: "permission denied"**
- **Cause** : Les politiques RLS bloquent l'accès
- **Solution** : Vérifiez que les politiques RLS sont correctement configurées

### **Erreur: "invalid input syntax for type uuid"**
- **Cause** : Problème avec les types UUID
- **Solution** : Vérifiez que l'extension `uuid-ossp` est activée

### **Erreur: "duplicate key value violates unique constraint"**
- **Cause** : Tentative d'insertion de données en double
- **Solution** : Utilisez `ON CONFLICT DO NOTHING` dans les insertions

## 🔍 **Vérification de la Configuration**

### **1. Variables d'Environnement**
Vérifiez que `.env.local` contient :
```env
VITE_SUPABASE_URL=https://jeumizxzlwjvgerrcpjr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Configuration Supabase**
Dans le dashboard Supabase :
- ✅ **Authentication > Settings** : URL configurée
- ✅ **Database > Tables** : Toutes les tables créées
- ✅ **Database > Policies** : RLS activé

### **3. Test de Connexion**
Exécutez ce test dans l'éditeur SQL :
```sql
-- Test de connexion
SELECT * FROM categories LIMIT 1;

-- Test des restaurants
SELECT * FROM restaurants LIMIT 1;

-- Test des articles de menu
SELECT * FROM menu_items LIMIT 1;
```

## 🛠️ **Script de Diagnostic**

Créez un fichier `diagnostic.sql` et exécutez-le :

```sql
-- Diagnostic de la base de données BraPrime

-- 1. Vérifier les extensions
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 2. Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Vérifier la structure de la table restaurants
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'restaurants'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table menu_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;

-- 5. Compter les enregistrements
SELECT 
  'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- 6. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 📞 **Support**

Si les problèmes persistent :

1. **Vérifiez les logs** dans le dashboard Supabase
2. **Consultez la documentation** Supabase
3. **Testez avec des données minimales** d'abord
4. **Vérifiez la console du navigateur** pour les erreurs JavaScript

## 🎯 **Commandes Utiles**

### **Redémarrer l'application**
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### **Vérifier les variables d'environnement**
```bash
cat .env.local
```

### **Nettoyer le cache**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

**💡 Conseil** : Commencez toujours par exécuter le script de nettoyage, puis le schéma corrigé. Cela résout la plupart des problèmes de dépendances. 