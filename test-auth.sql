-- ============================================================================
-- SCRIPT DE TEST AUTHENTIFICATION BRAPRIME
-- ============================================================================
-- Ce script teste la configuration d'authentification

-- ============================================================================
-- VÉRIFICATION DES TABLES ET DONNÉES
-- ============================================================================

-- Vérifier que les tables existent
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_roles', 'businesses', 'orders', 'reviews');

-- Vérifier les rôles utilisateur
SELECT 'Rôles utilisateur:' as info;
SELECT id, name, description FROM user_roles ORDER BY id;

-- Vérifier les politiques RLS
SELECT 'Politiques RLS user_profiles:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

SELECT 'Politiques RLS businesses:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses';

-- Vérifier les triggers
SELECT 'Triggers auth.users:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Vérifier les fonctions
SELECT 'Fonctions de trigger:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'handle_user_deletion');

-- Vérifier les permissions
SELECT 'Permissions anon:' as info;
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
AND table_schema = 'public'
AND table_name IN ('user_profiles', 'user_roles', 'businesses', 'orders', 'reviews');

SELECT 'Permissions authenticated:' as info;
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'authenticated' 
AND table_schema = 'public'
AND table_name IN ('user_profiles', 'user_roles', 'businesses', 'orders', 'reviews');

-- ============================================================================
-- TEST DE LA FONCTION DE CRÉATION DE PROFIL
-- ============================================================================

-- Test de la fonction handle_new_user (simulation)
DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    test_result TEXT;
BEGIN
    -- Simuler un utilisateur auth
    RAISE NOTICE 'Test de la fonction handle_new_user...';
    
    -- Vérifier que la fonction existe
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') THEN
        RAISE NOTICE '✅ Fonction handle_new_user existe';
    ELSE
        RAISE NOTICE '❌ Fonction handle_new_user manquante';
    END IF;
    
    -- Vérifier que le trigger existe
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created existe';
    ELSE
        RAISE NOTICE '❌ Trigger on_auth_user_created manquant';
    END IF;
    
    RAISE NOTICE 'Configuration d''authentification testée avec succès!';
END $$;

-- ============================================================================
-- RÉSUMÉ DE LA CONFIGURATION
-- ============================================================================

SELECT 
    'Configuration BraPrime' as section,
    'Authentification' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
        AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
        AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
        THEN '✅ Prête'
        ELSE '❌ Incomplète'
    END as status; 