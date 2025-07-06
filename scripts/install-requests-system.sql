-- Script d'installation complet du système de demandes
-- Ce script exécute tous les scripts nécessaires dans le bon ordre

-- 1. Vérifier et corriger les rôles utilisateurs
\echo '=== ÉTAPE 1: CORRECTION DES RÔLES UTILISATEURS ==='
\i scripts/fix-user-roles.sql

-- 2. Créer la table des demandes
\echo '=== ÉTAPE 2: CRÉATION DE LA TABLE DES DEMANDES ==='
\i scripts/create-requests-table.sql

-- 3. Tester le système
\echo '=== ÉTAPE 3: TEST DU SYSTÈME ==='
\i scripts/test-requests-system.sql

-- 4. Vérification finale
\echo '=== VÉRIFICATION FINALE ==='

-- Vérifier que tous les rôles existent
SELECT 'Vérification des rôles:' as check_type;
SELECT id, name FROM user_roles ORDER BY id;

-- Vérifier que la table requests existe
SELECT 'Vérification de la table requests:' as check_type;
SELECT table_name FROM information_schema.tables WHERE table_name = 'requests';

-- Vérifier les politiques RLS
SELECT 'Vérification des politiques RLS:' as check_type;
SELECT policyname FROM pg_policies WHERE tablename = 'requests';

-- Vérifier les demandes de test
SELECT 'Vérification des demandes de test:' as check_type;
SELECT type, status, user_name FROM requests ORDER BY created_at DESC;

-- Vérifier les statistiques
SELECT 'Vérification des statistiques:' as check_type;
SELECT * FROM requests_stats;

\echo '✅ Installation du système de demandes terminée avec succès!'
\echo '✅ Le système est maintenant prêt à être utilisé.'
\echo ''
\echo '📋 Prochaines étapes:'
\echo '1. Tester la création de demandes via l''interface utilisateur'
\echo '2. Tester la gestion des demandes via le dashboard admin'
\echo '3. Vérifier que les badges de statut s''affichent correctement' 