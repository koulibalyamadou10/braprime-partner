# 🚀 Guide de Migration Corrigé - BraPrime Mobile

## ⚠️ **PROBLÈME RÉSOLU**

L'erreur `relation "user_profiles" does not exist` a été corrigée en séparant le nettoyage de l'insertion des données.

## 📋 **Ordre d'Exécution Correct**

### **Étape 1 : Sauvegarde (OBLIGATOIRE)**
```bash
# Via l'interface Supabase
Settings > Database > Backup
```

### **Étape 2 : Nettoyage Pur**
```sql
-- Exécuter : scripts/clean-database-only.sql
-- Ce script supprime TOUTES les tables sans essayer d'insérer des données
```

### **Étape 3 : Application du Schéma Mobile**
```sql
-- Exécuter : supabase-schema-mobile.sql
-- Ce script crée toutes les tables, fonctions, vues, triggers, etc.
```

### **Étape 4 : Insertion des Données de Base**
```sql
-- Exécuter : scripts/insert-base-data.sql
-- Ce script crée l'admin et insère les données de base
```

### **Étape 5 : Vérification**
```sql
-- Exécuter : scripts/verify-migration.sql
-- Ce script vérifie que tout fonctionne correctement
```

## 🔧 **Scripts Créés**

### 1. **`scripts/clean-database-only.sql`**
- ✅ Supprime toutes les tables existantes
- ✅ Supprime toutes les fonctions et vues
- ✅ Ne tente PAS d'insérer des données
- ✅ Base propre prête pour le nouveau schéma

### 2. **`scripts/insert-base-data.sql`**
- ✅ Crée l'utilisateur admin dans `auth.users`
- ✅ Crée le profil admin dans `user_profiles`
- ✅ Insère les types de business (11 types)
- ✅ Insère les catégories (11 catégories)
- ✅ Insère les statuts de commande (7 statuts)
- ✅ Insère les méthodes de paiement (4 méthodes)
- ✅ Insère les statuts de réservation (4 statuts)
- ✅ Insère les types de notification (5 types)

## 🎯 **Résultat Final**

Après la migration, vous aurez :
- ✅ **31 tables** avec toutes les fonctionnalités modernes
- ✅ **11 fonctions** pour les calculs automatiques
- ✅ **10 vues** optimisées pour les performances
- ✅ **Triggers automatiques** pour la traçabilité
- ✅ **Politiques RLS** pour la sécurité
- ✅ **Admin fonctionnel** : `admin@bradelivery.com` / `admin123`
- ✅ **Données de base** prêtes à l'emploi

## 🚀 **Exécution Rapide**

### **Option 1 : Exécution Manuelle**
1. Ouvrez l'éditeur SQL de Supabase
2. Exécutez chaque script dans l'ordre ci-dessus
3. Vérifiez les résultats après chaque étape

### **Option 2 : Exécution Automatique**
```sql
-- Vous pouvez copier-coller tous les scripts dans l'ordre
-- L'éditeur SQL de Supabase les exécutera séquentiellement
```

## 🔍 **Vérification Post-Migration**

### **Test de Connexion Admin**
- **Email** : `admin@bradelivery.com`
- **Mot de passe** : `admin123`
- **Rôle** : `admin`

### **Vérification des Données**
```sql
-- Vérifier les tables créées
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vérifier l'admin
SELECT * FROM user_profiles WHERE email = 'admin@bradelivery.com';

-- Vérifier les données de base
SELECT 'Types de business' as table_name, COUNT(*) as count FROM business_types
UNION ALL
SELECT 'Catégories', COUNT(*) FROM categories
UNION ALL
SELECT 'Statuts de commande', COUNT(*) FROM order_statuses;
```

## 🆕 **Nouvelles Fonctionnalités Disponibles**

### **Pour les Chauffeurs**
- ✅ Système d'offres de livraison
- ✅ Gestion des documents
- ✅ Sessions de travail
- ✅ Statistiques avancées
- ✅ Suivi GPS en temps réel

### **Pour l'Administration**
- ✅ Historique détaillé des commandes
- ✅ Gestion complète des chauffeurs
- ✅ Vues optimisées pour l'analyse
- ✅ Fonctions de calcul automatiques

### **Pour les Restaurants**
- ✅ Assignation de tables pour réservations
- ✅ Gestion avancée des commandes
- ✅ Traçabilité complète

## 🔧 **Résolution de Problèmes**

### **Si vous avez encore l'erreur "relation does not exist"**
1. Vérifiez que vous avez exécuté les scripts dans l'ordre
2. Assurez-vous que le schéma mobile a été appliqué avant l'insertion des données
3. Vérifiez les logs dans l'éditeur SQL

### **Si l'admin n'est pas créé**
```sql
-- Vérifiez que l'admin existe
SELECT * FROM user_profiles WHERE email = 'admin@bradelivery.com';

-- Si pas d'admin, réexécutez scripts/insert-base-data.sql
```

### **Si des tables manquent**
```sql
-- Vérifiez les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Si des tables manquent, réexécutez supabase-schema-mobile.sql
```

## 🎉 **Migration Terminée !**

Une fois toutes les étapes terminées avec succès :

1. **Testez l'application** avec l'admin
2. **Créez quelques données de test**
3. **Vérifiez toutes les fonctionnalités**
4. **Documentez les changements**

---

**🎯 Votre base de données BraPrime est maintenant migrée vers le schéma mobile complet et moderne !**

**🚀 Le schéma mobile étendu transforme BraPrime en une plateforme de livraison de niveau professionnel !** 