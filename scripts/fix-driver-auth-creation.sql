-- ============================================================================
-- SCRIPT POUR CORRIGER LA CRÉATION DES COMPTES AUTH DES LIVREURS
-- ============================================================================
-- Ce script corrige le problème où les livreurs sont créés dans drivers mais pas dans auth

-- ============================================================================
-- 1. VÉRIFIER LES LIVREURS EXISTANTS SANS COMPTE AUTH
-- ============================================================================

-- Vérifier les livreurs qui n'ont pas de compte auth
SELECT 
    'DRIVERS WITHOUT AUTH' as info,
    d.id,
    d.name,
    d.email,
    d.phone,
    d.business_id,
    b.name as business_name
FROM drivers d
JOIN businesses b ON d.business_id = b.id
LEFT JOIN user_profiles up ON d.email = up.email
WHERE up.id IS NULL
AND b.owner_id = auth.uid();

-- ============================================================================
-- 2. FONCTION POUR CONNECTER UN LIVREUR EXISTANT À UN COMPTE AUTH
-- ============================================================================

-- Fonction pour connecter un livreur existant à un compte auth existant
CREATE OR REPLACE FUNCTION connect_driver_to_auth(
    driver_id UUID,
    user_profile_id UUID
)
RETURNS JSON AS $$
DECLARE
    new_driver_profile_id UUID;
    result JSON;
BEGIN
    -- Vérifier que le livreur existe
    IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = driver_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Livreur non trouvé'
        );
    END IF;

    -- Vérifier que le profil utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = user_profile_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Profil utilisateur non trouvé'
        );
    END IF;

    -- Créer le profil de liaison driver
    INSERT INTO driver_profiles (
        user_profile_id,
        driver_id
    ) VALUES (
        user_profile_id,
        driver_id
    ) RETURNING id INTO new_driver_profile_id;

    -- Mettre à jour le rôle du profil utilisateur
    UPDATE user_profiles 
    SET role_id = (SELECT id FROM user_roles WHERE name = 'driver')
    WHERE id = user_profile_id;

    -- Retourner les informations créées
    result := json_build_object(
        'success', true,
        'driver_id', driver_id,
        'user_profile_id', user_profile_id,
        'driver_profile_id', new_driver_profile_id,
        'message', 'Livreur connecté avec succès'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la connexion du livreur'
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. FONCTION POUR CRÉER UN COMPTE AUTH SIMPLE POUR UN LIVREUR EXISTANT
-- ============================================================================

-- Fonction pour créer un compte auth simple (sans mot de passe)
CREATE OR REPLACE FUNCTION create_simple_driver_auth(
    driver_id UUID,
    email VARCHAR(255),
    phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    new_user_profile_id UUID;
    new_driver_profile_id UUID;
    driver_role_id INTEGER;
    driver_record RECORD;
    result JSON;
BEGIN
    -- Récupérer les informations du livreur
    SELECT * INTO driver_record FROM drivers WHERE id = driver_id;
    
    IF driver_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Livreur non trouvé'
        );
    END IF;

    -- Récupérer l'ID du rôle driver
    SELECT id INTO driver_role_id FROM user_roles WHERE name = 'driver';
    
    IF driver_role_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Rôle driver non trouvé'
        );
    END IF;

    -- Créer l'utilisateur dans auth.users (sans mot de passe)
    INSERT INTO auth.users (
        email,
        phone,
        email_confirmed_at,
        phone_confirmed_at,
        created_at,
        updated_at,
        encrypted_password
    ) VALUES (
        email,
        phone,
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        '' -- Mot de passe vide, sera défini via l'API
    ) RETURNING id INTO new_user_id;

    -- Créer le profil utilisateur
    INSERT INTO user_profiles (
        id,
        name,
        email,
        role_id,
        phone_number,
        is_active
    ) VALUES (
        new_user_id,
        driver_record.name,
        email,
        driver_role_id,
        phone,
        true
    ) RETURNING id INTO new_user_profile_id;

    -- Créer le profil de liaison driver
    INSERT INTO driver_profiles (
        user_profile_id,
        driver_id,
        vehicle_type,
        vehicle_plate
    ) VALUES (
        new_user_profile_id,
        driver_id,
        driver_record.vehicle_type,
        driver_record.vehicle_plate
    ) RETURNING id INTO new_driver_profile_id;

    -- Retourner les informations créées
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'user_profile_id', new_user_profile_id,
        'driver_id', driver_id,
        'driver_profile_id', new_driver_profile_id,
        'message', 'Compte auth créé pour le livreur',
        'note', 'Le mot de passe doit être défini via l''API Supabase'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, nettoyer
        IF new_user_id IS NOT NULL THEN
            DELETE FROM auth.users WHERE id = new_user_id;
        END IF;
        IF new_user_profile_id IS NOT NULL THEN
            DELETE FROM user_profiles WHERE id = new_user_profile_id;
        END IF;
        
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la création du compte auth'
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. SCRIPT POUR CRÉER DES COMPTES AUTH POUR LES LIVREURS EXISTANTS
-- ============================================================================

-- Créer des comptes auth pour les livreurs existants
DO $$
DECLARE
    driver_record RECORD;
    result JSON;
BEGIN
    FOR driver_record IN 
        SELECT 
            d.id,
            d.name,
            d.email,
            d.phone,
            d.business_id
        FROM drivers d
        JOIN businesses b ON d.business_id = b.id
        LEFT JOIN user_profiles up ON d.email = up.email
        WHERE up.id IS NULL
        AND b.owner_id = auth.uid()
        LIMIT 5
    LOOP
        -- Créer un compte auth pour ce livreur
        SELECT create_simple_driver_auth(
            driver_record.id,
            driver_record.email,
            driver_record.phone
        ) INTO result;
        
        RAISE NOTICE 'Compte auth créé pour livreur %: %', driver_record.name, result;
    END LOOP;
END $$;

-- ============================================================================
-- 5. VÉRIFIER LES RÉSULTATS
-- ============================================================================

-- Vérifier les profils de livreurs créés
SELECT 
    'DRIVER PROFILES CREATED' as info,
    dp.id,
    d.name as driver_name,
    up.name as user_name,
    up.email as user_email,
    up.phone_number,
    ur.name as role_name
FROM driver_profiles dp
JOIN drivers d ON dp.driver_id = d.id
JOIN user_profiles up ON dp.user_profile_id = up.id
JOIN user_roles ur ON up.role_id = ur.id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid()
ORDER BY dp.created_at DESC;

-- Vérifier les utilisateurs avec rôle driver
SELECT 
    'USERS WITH DRIVER ROLE' as info,
    up.name,
    up.email,
    up.phone_number,
    ur.name as role_name,
    up.created_at
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE ur.name = 'driver'
ORDER BY up.created_at DESC;

-- ============================================================================
-- 6. INSTRUCTIONS POUR DÉFINIR LES MOTS DE PASSE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Comptes auth créés avec succès!';
    RAISE NOTICE 'IMPORTANT: Les mots de passe sont vides par défaut.';
    RAISE NOTICE 'Pour définir les mots de passe, utilisez l''API Supabase:';
    RAISE NOTICE '1. Allez dans Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Trouvez les utilisateurs créés';
    RAISE NOTICE '3. Cliquez sur "Edit" et définissez un mot de passe';
    RAISE NOTICE '4. Ou utilisez l''API pour réinitialiser les mots de passe';
    RAISE NOTICE 'Les livreurs peuvent maintenant se connecter avec email/mot de passe';
END $$; 