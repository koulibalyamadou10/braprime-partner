-- ============================================================================
-- SCRIPT POUR CONFIGURER LE SYSTÈME D'AUTHENTIFICATION DES LIVREURS
-- ============================================================================
-- Ce script configure l'authentification et les rôles pour les livreurs
-- Adapté au schéma existant avec user_roles et user_profiles

-- ============================================================================
-- 1. AJOUTER LE RÔLE DRIVER DANS USER_ROLES
-- ============================================================================

-- Ajouter le rôle 'driver' dans la table user_roles existante
INSERT INTO user_roles (name, description)
VALUES ('driver', 'Livreur - Peut voir et gérer ses commandes de livraison')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. CRÉER LA TABLE DRIVER_PROFILES POUR LES DONNÉES SPÉCIFIQUES
-- ============================================================================

-- Créer la table driver_profiles pour lier user_profiles avec drivers
CREATE TABLE IF NOT EXISTS driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_profile_id, driver_id)
);

-- ============================================================================
-- 3. AJOUTER LES INDEX POUR LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_profile ON driver_profiles(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_driver ON driver_profiles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_active ON driver_profiles(is_active);

-- ============================================================================
-- 4. CRÉER LES POLITIQUES RLS POUR DRIVER_PROFILES
-- ============================================================================

-- Activer RLS sur driver_profiles
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les livreurs voient leur propre profil
CREATE POLICY "Drivers can view their own profile" ON driver_profiles
    FOR SELECT USING (
        user_profile_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Politique pour que les livreurs mettent à jour leur propre profil
CREATE POLICY "Drivers can update their own profile" ON driver_profiles
    FOR UPDATE USING (
        user_profile_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Politique pour que les partenaires voient les profils de leurs livreurs
CREATE POLICY "Partners can view their drivers profiles" ON driver_profiles
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- 5. CRÉER LA FONCTION POUR ASSIGNER LE RÔLE DRIVER
-- ============================================================================

-- Fonction pour assigner automatiquement le rôle 'driver' à un utilisateur
CREATE OR REPLACE FUNCTION assign_driver_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le rôle dans user_profiles
    UPDATE user_profiles 
    SET role_id = (SELECT id FROM user_roles WHERE name = 'driver')
    WHERE id = NEW.user_profile_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour assigner automatiquement le rôle driver
DROP TRIGGER IF EXISTS trigger_assign_driver_role ON driver_profiles;
CREATE TRIGGER trigger_assign_driver_role
    AFTER INSERT ON driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_driver_role();

-- ============================================================================
-- 6. CRÉER LA FONCTION POUR CRÉER UN COMPTE LIVREUR COMPLET
-- ============================================================================

-- Fonction pour créer un compte livreur complet
CREATE OR REPLACE FUNCTION create_driver_account(
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_email VARCHAR(255),
    business_id INTEGER,
    vehicle_type VARCHAR(50) DEFAULT 'motorcycle',
    vehicle_plate VARCHAR(20) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    new_user_profile_id UUID;
    new_driver_id UUID;
    new_driver_profile_id UUID;
    driver_role_id INTEGER;
    result JSON;
BEGIN
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
        email_confirmed_at,
        phone_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        driver_email,
        driver_phone,
        NOW(),
        NOW(),
        NOW(),
        NOW()
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
        driver_name,
        driver_email,
        driver_role_id,
        driver_phone,
        true
    ) RETURNING id INTO new_user_profile_id;

    -- Créer le livreur dans la table drivers
    INSERT INTO drivers (
        name,
        phone,
        email,
        business_id,
        vehicle_type,
        vehicle_plate,
        is_active
    ) VALUES (
        driver_name,
        driver_phone,
        driver_email,
        business_id,
        vehicle_type,
        vehicle_plate,
        true
    ) RETURNING id INTO new_driver_id;

    -- Créer le profil de liaison driver
    INSERT INTO driver_profiles (
        user_profile_id,
        driver_id,
        vehicle_type,
        vehicle_plate
    ) VALUES (
        new_user_profile_id,
        new_driver_id,
        vehicle_type,
        vehicle_plate
    ) RETURNING id INTO new_driver_profile_id;

    -- Retourner les informations créées
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'user_profile_id', new_user_profile_id,
        'driver_id', new_driver_id,
        'driver_profile_id', new_driver_profile_id,
        'message', 'Compte livreur créé avec succès'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, nettoyer et retourner l'erreur
        IF new_user_id IS NOT NULL THEN
            DELETE FROM auth.users WHERE id = new_user_id;
        END IF;
        IF new_user_profile_id IS NOT NULL THEN
            DELETE FROM user_profiles WHERE id = new_user_profile_id;
        END IF;
        IF new_driver_id IS NOT NULL THEN
            DELETE FROM drivers WHERE id = new_driver_id;
        END IF;
        
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la création du compte livreur'
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. CRÉER LA FONCTION POUR CONNECTER UN LIVREUR EXISTANT
-- ============================================================================

-- Fonction pour connecter un livreur existant à un compte auth
CREATE OR REPLACE FUNCTION connect_existing_driver(
    driver_id UUID,
    user_email VARCHAR(255),
    user_phone VARCHAR(20),
    user_name VARCHAR(100)
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    new_user_profile_id UUID;
    new_driver_profile_id UUID;
    driver_role_id INTEGER;
    result JSON;
BEGIN
    -- Vérifier que le livreur existe
    IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = driver_id) THEN
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

    -- Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        email,
        phone,
        email_confirmed_at,
        phone_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        user_email,
        user_phone,
        NOW(),
        NOW(),
        NOW(),
        NOW()
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
        user_name,
        user_email,
        driver_role_id,
        user_phone,
        true
    ) RETURNING id INTO new_user_profile_id;

    -- Créer le profil de liaison driver
    INSERT INTO driver_profiles (
        user_profile_id,
        driver_id
    ) VALUES (
        new_user_profile_id,
        driver_id
    ) RETURNING id INTO new_driver_profile_id;

    -- Retourner les informations créées
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'user_profile_id', new_user_profile_id,
        'driver_id', driver_id,
        'driver_profile_id', new_driver_profile_id,
        'message', 'Livreur connecté avec succès'
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
            'message', 'Erreur lors de la connexion du livreur'
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. CRÉER LES POLITIQUES RLS POUR LES LIVREURS
-- ============================================================================

-- Politique pour que les livreurs voient leurs propres commandes
CREATE POLICY "Drivers can view their own orders" ON orders
    FOR SELECT USING (
        driver_id IN (
            SELECT dp.driver_id 
            FROM driver_profiles dp 
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );

-- Politique pour que les livreurs mettent à jour leurs propres commandes
CREATE POLICY "Drivers can update their own orders" ON orders
    FOR UPDATE USING (
        driver_id IN (
            SELECT dp.driver_id 
            FROM driver_profiles dp 
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );

-- ============================================================================
-- 9. CRÉER DES LIVREURS DE TEST AVEC COMPTES AUTH
-- ============================================================================

-- Créer des comptes livreurs de test pour les businesses existantes
DO $$
DECLARE
    business_record RECORD;
    result JSON;
BEGIN
    FOR business_record IN 
        SELECT id, name 
        FROM businesses 
        WHERE owner_id = auth.uid() 
        LIMIT 2
    LOOP
        -- Créer un livreur de test
        SELECT create_driver_account(
            'Mamadou Diallo',
            '+224 123 456 789',
            'mamadou.diallo@driver.com',
            business_record.id,
            'motorcycle',
            'ABC 123'
        ) INTO result;
        
        RAISE NOTICE 'Livreur créé pour business %: %', business_record.name, result;
        
        -- Créer un deuxième livreur
        SELECT create_driver_account(
            'Fatoumata Camara',
            '+224 987 654 321',
            'fatoumata.camara@driver.com',
            business_record.id,
            'car',
            'XYZ 789'
        ) INTO result;
        
        RAISE NOTICE 'Livreur créé pour business %: %', business_record.name, result;
    END LOOP;
END $$;

-- ============================================================================
-- 10. VÉRIFIER LA CONFIGURATION
-- ============================================================================

-- Vérifier les rôles créés
SELECT 
    'USER ROLES' as info,
    name,
    description
FROM user_roles
WHERE name = 'driver';

-- Vérifier les profils de livreurs créés
SELECT 
    'DRIVER PROFILES' as info,
    dp.id,
    dp.user_profile_id,
    dp.driver_id,
    d.name as driver_name,
    d.vehicle_type,
    up.name as user_name,
    up.email as user_email
FROM driver_profiles dp
JOIN drivers d ON dp.driver_id = d.id
JOIN user_profiles up ON dp.user_profile_id = up.id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid();

-- Vérifier les rôles assignés
SELECT 
    'USER PROFILES WITH DRIVER ROLE' as info,
    up.name,
    up.email,
    ur.name as role_name
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE ur.name = 'driver';

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Système d''authentification des livreurs configuré avec succès!';
    RAISE NOTICE 'Rôle "driver" ajouté dans user_roles';
    RAISE NOTICE 'Table driver_profiles créée avec RLS';
    RAISE NOTICE 'Fonctions de création de comptes livreurs créées';
    RAISE NOTICE 'Livreurs de test créés avec comptes auth';
    RAISE NOTICE 'Les livreurs peuvent maintenant se connecter avec leur email/téléphone';
END $$; 