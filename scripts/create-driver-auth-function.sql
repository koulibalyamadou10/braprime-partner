-- ============================================================================
-- FONCTION POUR CRÉER DES COMPTES AUTH DES LIVREURS
-- ============================================================================
-- Cette fonction crée un compte auth pour un livreur existant
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- FONCTION PRINCIPALE
-- ============================================================================

CREATE OR REPLACE FUNCTION create_driver_auth_account(
    p_driver_id UUID,
    p_email VARCHAR(255),
    p_phone VARCHAR(20),
    p_password VARCHAR(255)
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
    -- Vérifier que le livreur existe
    SELECT * INTO driver_record FROM drivers WHERE id = p_driver_id;
    
    IF driver_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Livreur non trouvé'
        );
    END IF;

    -- Vérifier que l'email n'est pas déjà utilisé
    IF EXISTS (SELECT 1 FROM user_profiles WHERE email = p_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cet email est déjà utilisé'
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

    -- Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        email,
        phone,
        encrypted_password,
        email_confirmed_at,
        phone_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        p_email,
        p_phone,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        jsonb_build_object('role', 'driver', 'driver_id', p_driver_id),
        jsonb_build_object('name', driver_record.name, 'phone', p_phone)
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
        p_email,
        driver_role_id,
        p_phone,
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
        p_driver_id,
        driver_record.vehicle_type,
        driver_record.vehicle_plate
    ) RETURNING id INTO new_driver_profile_id;

    -- Retourner les informations créées
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'user_profile_id', new_user_profile_id,
        'driver_id', p_driver_id,
        'driver_profile_id', new_driver_profile_id,
        'message', 'Compte auth créé avec succès'
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
-- FONCTION POUR RÉINITIALISER UN MOT DE PASSE
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_driver_password(
    p_user_id UUID,
    p_new_password VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Mettre à jour le mot de passe
    UPDATE auth.users 
    SET 
        encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Utilisateur non trouvé'
        );
    END IF;

    result := json_build_object(
        'success', true,
        'message', 'Mot de passe réinitialisé avec succès'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la réinitialisation du mot de passe'
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION POUR SUPPRIMER UN COMPTE AUTH
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_driver_auth_account(
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Supprimer les liens
    DELETE FROM driver_profiles WHERE user_profile_id = p_user_id;
    DELETE FROM user_profiles WHERE id = p_user_id;
    DELETE FROM auth.users WHERE id = p_user_id;

    result := json_build_object(
        'success', true,
        'message', 'Compte auth supprimé avec succès'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la suppression du compte auth'
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLITIQUES RLS POUR LES FONCTIONS
-- ============================================================================

-- Permettre aux partenaires d'utiliser ces fonctions
GRANT EXECUTE ON FUNCTION create_driver_auth_account(UUID, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_driver_password(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_driver_auth_account(UUID) TO authenticated;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Fonction de création de comptes auth créée avec succès!';
    RAISE NOTICE 'Utilisez: create_driver_auth_account(driver_id, email, phone, password)';
END $$; 