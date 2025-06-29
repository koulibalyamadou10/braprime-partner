# Guide de Migration vers le Schéma Mobile - BraPrime

## 🎯 Objectif

Migrer complètement de l'ancien schéma vers le nouveau schéma mobile plus complet et moderne.

## ⚠️ ATTENTION IMPORTANTE

**Cette migration va supprimer toutes les données existantes !**
- Faites une sauvegarde complète avant de commencer
- Testez d'abord sur une base de développement
- Assurez-vous d'avoir sauvegardé toutes les données importantes

## 📋 Prérequis

1. **Sauvegarde de la base actuelle**
2. **Accès administrateur à Supabase**
3. **Fichiers SQL prêts** :
   - `scripts/clean-and-migrate-to-mobile.sql`
   - `supabase-schema-mobile.sql`
   - `scripts/create-admin-user.sql`

## 🚀 Étapes de Migration

### Étape 1 : Sauvegarde (OBLIGATOIRE)

```bash
# Via l'interface Supabase
1. Allez dans Settings > Database
2. Cliquez sur "Backup" 
3. Téléchargez la sauvegarde complète
```

### Étape 2 : Nettoyage de la Base

1. **Ouvrez l'éditeur SQL de Supabase**
2. **Exécutez le script de nettoyage** :

```sql
-- Copiez et exécutez le contenu de :
-- scripts/clean-and-migrate-to-mobile.sql
```

Ce script va :
- ✅ Désactiver les triggers
- ✅ Supprimer toutes les tables existantes
- ✅ Supprimer toutes les fonctions et vues
- ✅ Réactiver les triggers
- ✅ Insérer les données de base

### Étape 3 : Application du Schéma Mobile

1. **Exécutez le schéma mobile complet** :

```sql
-- Copiez et exécutez le contenu de :
-- supabase-schema-mobile.sql
```

Ce schéma va créer :
- ✅ Toutes les tables avec les nouvelles fonctionnalités
- ✅ Les fonctions GPS et calculs
- ✅ Les triggers automatiques
- ✅ Les vues optimisées
- ✅ Les politiques RLS

### Étape 4 : Création de l'Admin

1. **Exécutez le script de création d'admin** :

```sql
-- Copiez et exécutez le contenu de :
-- scripts/create-admin-user.sql
```

Ce script va créer :
- ✅ Un utilisateur admin dans `auth.users`
- ✅ Un profil admin dans `user_profiles`
- ✅ Un business de test pour l'admin

### Étape 5 : Vérification

1. **Vérifiez que tout fonctionne** :

```sql
-- Vérifier les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier l'admin
SELECT * FROM user_profiles WHERE role = 'admin';

-- Vérifier les données de base
SELECT COUNT(*) as business_types_count FROM business_types;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as order_statuses_count FROM order_statuses;
```

## 🔐 Informations de Connexion Admin

Après la migration, vous pourrez vous connecter avec :

- **Email** : `admin@bradelivery.com`
- **Mot de passe** : `admin123`
- **Rôle** : `admin`

## 🆕 Nouvelles Fonctionnalités Disponibles

### Pour les Chauffeurs :
- ✅ Système d'offres de livraison
- ✅ Gestion des documents
- ✅ Sessions de travail
- ✅ Statistiques avancées
- ✅ Suivi GPS en temps réel

### Pour l'Administration :
- ✅ Historique détaillé des commandes
- ✅ Gestion complète des chauffeurs
- ✅ Vues optimisées pour l'analyse
- ✅ Fonctions de calcul automatiques

### Pour les Restaurants :
- ✅ Assignation de tables pour réservations
- ✅ Gestion avancée des commandes
- ✅ Traçabilité complète

## 🧪 Test de la Migration

### Test 1 : Connexion Admin
1. Connectez-vous avec les identifiants admin
2. Vérifiez l'accès au dashboard admin
3. Testez la navigation

### Test 2 : Création de Données
1. Créez un nouveau business
2. Ajoutez des catégories de menu
3. Créez des articles de menu
4. Testez la création de commandes

### Test 3 : Fonctionnalités Avancées
1. Testez l'assignation de chauffeurs
2. Vérifiez les calculs GPS
3. Testez les notifications
4. Vérifiez les statistiques

## 🔧 Résolution de Problèmes

### Problème : Erreur de contraintes
```sql
-- Si vous avez des erreurs de contraintes
SET session_replication_role = replica;
-- Exécutez le nettoyage
SET session_replication_role = DEFAULT;
```

### Problème : Admin non créé
```sql
-- Vérifiez que l'admin existe
SELECT * FROM user_profiles WHERE email = 'admin@bradelivery.com';

-- Si pas d'admin, réexécutez le script create-admin-user.sql
```

### Problème : Tables manquantes
```sql
-- Vérifiez les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Si des tables manquent, réexécutez supabase-schema-mobile.sql
```

## 📊 Vérification Post-Migration

### Checklist de Validation :

- [ ] Toutes les tables sont créées (31 tables)
- [ ] L'admin peut se connecter
- [ ] Les données de base sont présentes
- [ ] Les fonctions GPS fonctionnent
- [ ] Les triggers sont actifs
- [ ] Les vues sont créées
- [ ] Les politiques RLS sont en place

### Commandes de Vérification :

```sql
-- Compter les tables
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vérifier les fonctions
SELECT COUNT(*) as total_functions 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Vérifier les vues
SELECT COUNT(*) as total_views 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Vérifier les triggers
SELECT COUNT(*) as total_triggers 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🎉 Migration Terminée !

Une fois toutes les étapes terminées avec succès :

1. **Testez l'application** avec l'admin
2. **Créez quelques données de test**
3. **Vérifiez toutes les fonctionnalités**
4. **Documentez les changements**

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans l'éditeur SQL
2. Consultez la documentation Supabase
3. Vérifiez que tous les scripts ont été exécutés dans l'ordre

---

**Félicitations ! Votre base de données BraPrime est maintenant migrée vers le schéma mobile complet ! 🚀** 