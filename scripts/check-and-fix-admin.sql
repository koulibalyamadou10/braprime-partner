-- Script pour vérifier et corriger les données admin et business
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier les rôles utilisateurs
SELECT '=== VÉRIFICATION DES RÔLES ===' as info;
SELECT id, name, description FROM user_roles ORDER BY id;

-- 2. Vérifier les utilisateurs admin
SELECT '=== UTILISATEURS ADMIN ===' as info;
SELECT 
    up.id,
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name,
    up.is_active,
    up.created_at
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE ur.name = 'admin' OR up.role_id = 1
ORDER BY up.created_at DESC;

-- 3. Vérifier les businesses existants
SELECT '=== BUSINESSES EXISTANTS ===' as info;
SELECT 
    b.id,
    b.name,
    b.owner_id,
    b.business_type_id,
    bt.name as business_type_name,
    b.is_active,
    b.is_open,
    b.created_at,
    up.name as owner_name,
    up.email as owner_email
FROM businesses b
LEFT JOIN business_types bt ON b.business_type_id = bt.id
LEFT JOIN user_profiles up ON b.owner_id = up.id
ORDER BY b.created_at DESC;

-- 4. Vérifier les business_types
SELECT '=== TYPES DE BUSINESS ===' as info;
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- 5. Vérifier les catégories
SELECT '=== CATÉGORIES ===' as info;
SELECT id, name, description FROM categories ORDER BY id;

-- 6. Corriger les businesses sans business_type_id
SELECT '=== CORRECTION DES BUSINESSES ===' as info;
UPDATE businesses 
SET business_type_id = 1 
WHERE business_type_id IS NULL;

-- 7. Corriger les businesses sans category_id
UPDATE businesses 
SET category_id = 1 
WHERE category_id IS NULL;

-- 8. Vérifier les corrections
SELECT '=== VÉRIFICATION APRÈS CORRECTION ===' as info;
SELECT 
    b.id,
    b.name,
    b.business_type_id,
    bt.name as business_type_name,
    b.category_id,
    c.name as category_name,
    b.is_active
FROM businesses b
LEFT JOIN business_types bt ON b.business_type_id = bt.id
LEFT JOIN categories c ON b.category_id = c.id
ORDER BY b.id;

-- 9. Créer un admin de test si nécessaire
SELECT '=== CRÉATION ADMIN DE TEST ===' as info;
-- Vérifier si un admin existe
SELECT COUNT(*) as admin_count FROM user_profiles WHERE role_id = 1;

-- Si aucun admin, en créer un (décommentez si nécessaire)
-- INSERT INTO user_profiles (
--     id,
--     name,
--     email,
--     role_id,
--     is_active,
--     is_verified,
--     created_at,
--     updated_at
-- ) VALUES (
--     gen_random_uuid(),
--     'Admin Test',
--     'admin@test.com',
--     1,
--     true,
--     true,
--     NOW(),
--     NOW()
-- );

-- 10. Message de confirmation
SELECT '✅ Vérification et correction terminées!' as message;
SELECT '📋 Vérifiez les résultats ci-dessus pour identifier les problèmes' as info;
SELECT '🔧 Les businesses sans type ou catégorie ont été corrigés' as correction; 