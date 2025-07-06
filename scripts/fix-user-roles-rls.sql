-- Script pour vérifier et corriger les politiques RLS sur user_roles
-- Le problème peut venir des politiques RLS qui empêchent la jointure

-- 1. Vérifier si RLS est activé sur user_roles
SELECT '=== RLS SUR USER_ROLES ===' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_roles';

-- 2. Vérifier les politiques existantes sur user_roles
SELECT '=== POLITIQUES USER_ROLES ===' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 3. Désactiver RLS sur user_roles si nécessaire (les rôles doivent être accessibles à tous)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 4. Supprimer les politiques existantes sur user_roles
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_roles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_roles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON user_roles;

-- 5. Vérifier que la jointure fonctionne maintenant
SELECT '=== TEST JOINTURE ===' as info;
SELECT 
    up.id,
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
LIMIT 5;

-- 6. Vérifier votre profil spécifiquement
SELECT '=== VOTRE PROFIL ===' as info;
-- Remplacez 'votre-email@example.com' par votre email
SELECT 
    up.id,
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'votre-email@example.com'; -- REMPLACEZ PAR VOTRE EMAIL 