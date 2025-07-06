-- Script pour tester l'interface des demandes
-- Vérifie que toutes les fonctionnalités sont opérationnelles

-- 1. Vérifier la structure de la table
SELECT '=== VÉRIFICATION STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes
SELECT '=== VÉRIFICATION CONTRAINTES ===' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'requests'::regclass;

-- 3. Vérifier les politiques RLS
SELECT '=== VÉRIFICATION POLITIQUES RLS ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'requests';

-- 4. Vérifier les fonctions
SELECT '=== VÉRIFICATION FONCTIONS ===' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%request%'
ORDER BY routine_name;

-- 5. Vérifier les vues
SELECT '=== VÉRIFICATION VUES ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%request%'
ORDER BY table_name;

-- 6. Tester la création d'une demande (simulation)
SELECT '=== TEST CRÉATION DEMANDE ===' as info;
-- Note: Cette requête simule la création d'une demande
-- En réalité, elle sera créée via l'interface utilisateur

-- 7. Vérifier les données existantes
SELECT '=== DONNÉES EXISTANTES ===' as info;
SELECT 
    COUNT(*) as total_demandes,
    COUNT(CASE WHEN type = 'partner' THEN 1 END) as demandes_partenaires,
    COUNT(CASE WHEN type = 'driver' THEN 1 END) as demandes_chauffeurs,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as en_attente,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approuvees,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejetees,
    COUNT(CASE WHEN status = 'under_review' THEN 1 END) as en_revision
FROM requests;

-- 8. Vérifier les utilisateurs disponibles
SELECT '=== UTILISATEURS DISPONIBLES ===' as info;
SELECT 
    COUNT(*) as total_utilisateurs,
    COUNT(CASE WHEN role_id = 1 THEN 1 END) as clients,
    COUNT(CASE WHEN role_id = 2 THEN 1 END) as partenaires,
    COUNT(CASE WHEN role_id = 3 THEN 1 END) as admins,
    COUNT(CASE WHEN role_id = 4 THEN 1 END) as chauffeurs
FROM user_profiles;

-- 9. Test des permissions (simulation)
SELECT '=== TEST PERMISSIONS ===' as info;
-- Vérifier que les politiques RLS sont actives
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'requests';

-- 10. Message de confirmation
SELECT '✅ Tests de l''interface des demandes terminés!' as message;
SELECT '📊 Vérifiez les résultats ci-dessus pour vous assurer que tout fonctionne' as details; 