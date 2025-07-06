-- ============================================================================
-- SCRIPT POUR CORRIGER LES RÔLES DES DRIVERS
-- ============================================================================
-- Ce script vérifie et corrige les rôles des utilisateurs qui sont des drivers
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- DIAGNOSTIC DES RÔLES ACTUELS
-- ============================================================================

-- Voir tous les rôles disponibles
SELECT 'RÔLES DISPONIBLES:' as info;
SELECT id, name, description FROM user_roles ORDER BY id;

-- Voir les utilisateurs avec leurs rôles
SELECT 'UTILISATEURS ET LEURS RÔLES:' as info;
SELECT 
    up.id,
    up.name,
    up.email,
    ur.name as role_name,
    ur.id as role_id
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at DESC;

-- Voir les drivers avec leurs profils utilisateur
SELECT 'DRIVERS ET PROFILS UTILISATEUR:' as info;
SELECT 
    d.id as driver_id,
    d.name as driver_name,
    d.email as driver_email,
    up.id as user_profile_id,
    up.name as user_name,
    up.email as user_email,
    ur.name as user_role,
    CASE 
        WHEN up.id IS NULL THEN 'PAS DE PROFIL UTILISATEUR'
        WHEN ur.name != 'driver' THEN 'MAUVAIS RÔLE'
        ELSE 'OK'
    END as status
FROM drivers d
LEFT JOIN user_profiles up ON d.email = up.email
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY d.created_at DESC;

-- ============================================================================
-- CORRECTION AUTOMATIQUE
-- ============================================================================

-- Trouver l'ID du rôle driver
DO $$
DECLARE
    driver_role_id INTEGER;
BEGIN
    -- Récupérer l'ID du rôle driver
    SELECT id INTO driver_role_id FROM user_roles WHERE name = 'driver';
    
    IF driver_role_id IS NULL THEN
        RAISE NOTICE '❌ Rôle "driver" non trouvé dans user_roles';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Rôle driver trouvé avec ID: %', driver_role_id;
    
    -- Mettre à jour les profils utilisateur des drivers qui ont le mauvais rôle
    UPDATE user_profiles 
    SET role_id = driver_role_id
    WHERE email IN (
        SELECT d.email 
        FROM drivers d 
        WHERE d.email IS NOT NULL
    )
    AND (role_id != driver_role_id OR role_id IS NULL);
    
    RAISE NOTICE '✅ Rôles des drivers corrigés';
END $$;

-- ============================================================================
-- VÉRIFICATION POST-CORRECTION
-- ============================================================================

-- Vérifier les corrections
SELECT 'VÉRIFICATION POST-CORRECTION:' as info;
SELECT 
    d.id as driver_id,
    d.name as driver_name,
    d.email as driver_email,
    up.id as user_profile_id,
    up.name as user_name,
    ur.name as user_role,
    CASE 
        WHEN up.id IS NULL THEN '❌ PAS DE PROFIL UTILISATEUR'
        WHEN ur.name = 'driver' THEN '✅ RÔLE CORRECT'
        ELSE '❌ MAUVAIS RÔLE'
    END as status
FROM drivers d
LEFT JOIN user_profiles up ON d.email = up.email
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY d.created_at DESC;

-- ============================================================================
-- CRÉATION DE PROFILS UTILISATEUR MANQUANTS
-- ============================================================================

-- Créer des profils utilisateur pour les drivers qui n'en ont pas
INSERT INTO user_profiles (id, name, email, phone_number, role_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    d.name,
    d.email,
    d.phone,
    (SELECT id FROM user_roles WHERE name = 'driver'),
    NOW(),
    NOW()
FROM drivers d
WHERE d.email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.email = d.email
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Script de correction des rôles drivers exécuté avec succès!';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour confirmer les corrections.';
END $$; 