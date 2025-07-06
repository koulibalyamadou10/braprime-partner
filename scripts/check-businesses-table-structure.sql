-- Script pour vérifier la structure de la table businesses
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table businesses
SELECT '=== STRUCTURE DE LA TABLE BUSINESSES ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes de la table
SELECT '=== CONTRAINTES DE LA TABLE BUSINESSES ===' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'businesses' 
AND tc.table_schema = 'public';

-- 3. Vérifier les séquences et valeurs par défaut
SELECT '=== SÉQUENCES ET VALEURS PAR DÉFAUT ===' as info;
SELECT 
    column_name,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
AND column_default IS NOT NULL;

-- 4. Vérifier si RLS est activé
SELECT '=== RLS (ROW LEVEL SECURITY) ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'businesses' 
AND schemaname = 'public';

-- 5. Vérifier les politiques RLS actuelles
SELECT '=== POLITIQUES RLS ACTUELLES ===' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'businesses' 
AND schemaname = 'public';

-- 6. Tester une insertion simple (commentée pour sécurité)
-- SELECT '=== TEST D''INSERTION SIMPLE ===' as info;
-- INSERT INTO businesses (
--     name,
--     description,
--     address,
--     phone,
--     email,
--     owner_id,
--     is_active,
--     is_open,
--     delivery_time,
--     delivery_fee,
--     rating,
--     review_count
-- ) VALUES (
--     'Test Business',
--     'Description de test',
--     'Adresse de test',
--     '+224123456789',
--     'test@business.com',
--     gen_random_uuid(),
--     true,
--     true,
--     '30-45 min',
--     5000,
--     0,
--     0
-- ) RETURNING id, name, owner_id;

-- 7. Vérifier les données existantes
SELECT '=== DONNÉES EXISTANTES ===' as info;
SELECT 
    id,
    name,
    owner_id,
    is_active,
    is_open,
    created_at
FROM businesses 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Vérifier les permissions sur la table
SELECT '=== PERMISSIONS SUR LA TABLE ===' as info;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'businesses' 
AND table_schema = 'public';

-- 9. Message de diagnostic
SELECT '✅ Diagnostic de la table businesses terminé!' as message;
SELECT '📋 Vérifiez les résultats ci-dessus pour identifier les problèmes' as info;
SELECT '🔧 Si des problèmes sont détectés, exécutez le script de correction' as next_step; 