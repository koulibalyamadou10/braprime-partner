-- ============================================================================
-- SCRIPT DE DIAGNOSTIC POUR LA TABLE DRIVER_PROFILES
-- ============================================================================
-- Ce script vérifie l'état actuel de la table driver_profiles et ses politiques RLS

-- ============================================================================
-- 1. VÉRIFIER L'EXISTENCE DE LA TABLE
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'driver_profiles') THEN
        RAISE NOTICE '✅ Table driver_profiles existe';
    ELSE
        RAISE NOTICE '❌ Table driver_profiles n''existe PAS';
    END IF;
END $$;

-- ============================================================================
-- 2. VÉRIFIER LA STRUCTURE DE LA TABLE
-- ============================================================================

SELECT 
    'TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'driver_profiles'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. VÉRIFIER L'ACTIVATION RLS
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'driver_profiles' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS est activé sur driver_profiles';
    ELSE
        RAISE NOTICE '❌ RLS n''est PAS activé sur driver_profiles';
    END IF;
END $$;

-- ============================================================================
-- 4. VÉRIFIER LES POLITIQUES RLS
-- ============================================================================

SELECT 
    'RLS POLICIES' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'driver_profiles'
ORDER BY policyname;

-- ============================================================================
-- 5. VÉRIFIER LES INDEX
-- ============================================================================

SELECT 
    'INDEXES' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'driver_profiles'
ORDER BY indexname;

-- ============================================================================
-- 6. VÉRIFIER LES DONNÉES EXISTANTES
-- ============================================================================

SELECT 
    'EXISTING DATA' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_profiles,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_profiles
FROM driver_profiles;

-- ============================================================================
-- 7. VÉRIFIER LES RELATIONS AVEC DRIVERS
-- ============================================================================

SELECT 
    'DRIVER RELATIONS' as info,
    dp.id as profile_id,
    dp.user_profile_id,
    dp.driver_id,
    dp.vehicle_type,
    dp.is_active,
    d.name as driver_name,
    d.phone as driver_phone,
    b.name as business_name
FROM driver_profiles dp
JOIN drivers d ON dp.driver_id = d.id
JOIN businesses b ON d.business_id = b.id
ORDER BY dp.created_at DESC
LIMIT 5;

-- ============================================================================
-- 8. VÉRIFIER LES PERMISSIONS DE L'UTILISATEUR ACTUEL
-- ============================================================================

DO $$
DECLARE
    current_user_id UUID;
    user_role VARCHAR;
    business_count INTEGER;
    driver_count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    RAISE NOTICE 'Utilisateur actuel: %', current_user_id;
    
    -- Vérifier le rôle de l'utilisateur
    SELECT ur.name INTO user_role
    FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = current_user_id;
    
    RAISE NOTICE 'Rôle utilisateur: %', user_role;
    
    -- Vérifier les businesses de l'utilisateur
    SELECT COUNT(*) INTO business_count
    FROM businesses
    WHERE owner_id = current_user_id;
    
    RAISE NOTICE 'Businesses possédées: %', business_count;
    
    -- Vérifier les livreurs de l'utilisateur
    SELECT COUNT(*) INTO driver_count
    FROM drivers d
    JOIN businesses b ON d.business_id = b.id
    WHERE b.owner_id = current_user_id;
    
    RAISE NOTICE 'Livreurs possédés: %', driver_count;
END $$;

-- ============================================================================
-- 9. TESTER LES PERMISSIONS RLS
-- ============================================================================

DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    -- Tester si l'utilisateur peut voir les profils de ses livreurs
    SELECT EXISTS (
        SELECT 1 FROM driver_profiles dp
        JOIN drivers d ON dp.driver_id = d.id
        JOIN businesses b ON d.business_id = b.id
        WHERE b.owner_id = auth.uid()
        LIMIT 1
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE '✅ L''utilisateur peut voir les profils de ses livreurs';
    ELSE
        RAISE NOTICE '❌ L''utilisateur ne peut pas voir les profils de ses livreurs';
    END IF;
    
    -- Tester si l'utilisateur peut créer des profils
    -- (Ce test ne fait que vérifier la logique, pas l'insertion réelle)
    SELECT EXISTS (
        SELECT 1 FROM drivers d
        JOIN businesses b ON d.business_id = b.id
        WHERE b.owner_id = auth.uid()
        LIMIT 1
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE '✅ L''utilisateur a des livreurs pour créer des profils';
    ELSE
        RAISE NOTICE '❌ L''utilisateur n''a pas de livreurs pour créer des profils';
    END IF;
END $$;

-- ============================================================================
-- MESSAGE DE RÉSUMÉ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC DRIVER_PROFILES TERMINÉ';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier';
    RAISE NOTICE 'les problèmes avec la table driver_profiles.';
    RAISE NOTICE '';
    RAISE NOTICE 'Si des politiques INSERT manquent, exécutez:';
    RAISE NOTICE 'scripts/fix-driver-profiles-rls.sql';
    RAISE NOTICE '';
END $$; 