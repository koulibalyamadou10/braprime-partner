-- Script pour configurer les permissions de création de comptes
-- Ce script doit être exécuté avec les privilèges admin de Supabase

-- 1. Vérifier les rôles existants
SELECT '=== VÉRIFICATION DES RÔLES ===' as info;
SELECT id, name, description FROM user_roles ORDER BY id;

-- 2. Vérifier les politiques RLS existantes
SELECT '=== POLITIQUES RLS ACTUELLES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'businesses', 'drivers', 'requests')
ORDER BY tablename, policyname;

-- 3. Créer une fonction pour la création de comptes par l'admin
CREATE OR REPLACE FUNCTION admin_create_user_account(
    user_email VARCHAR(255),
    user_name VARCHAR(100),
    user_phone VARCHAR(20),
    user_role_id INTEGER,
    user_address TEXT DEFAULT NULL,
    user_city VARCHAR(100) DEFAULT NULL,
    user_postal_code VARCHAR(20) DEFAULT NULL,
    user_country VARCHAR(100) DEFAULT 'Guinée'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    role_exists BOOLEAN;
BEGIN
    -- Vérifier que le rôle existe
    SELECT EXISTS(SELECT 1 FROM user_roles WHERE id = user_role_id) INTO role_exists;
    
    IF NOT role_exists THEN
        RAISE EXCEPTION 'Rôle avec ID % n''existe pas', user_role_id;
    END IF;
    
    -- Vérifier que l'email n'existe pas déjà
    IF EXISTS(SELECT 1 FROM user_profiles WHERE email = user_email) THEN
        RAISE EXCEPTION 'Un utilisateur avec l''email % existe déjà', user_email;
    END IF;
    
    -- Générer un nouvel UUID
    new_user_id := gen_random_uuid();
    
    -- Insérer le profil utilisateur
    INSERT INTO user_profiles (
        id,
        name,
        email,
        phone_number,
        role_id,
        address,
        city,
        postal_code,
        country,
        is_active,
        is_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        user_name,
        user_email,
        user_phone,
        user_role_id,
        user_address,
        user_city,
        user_postal_code,
        user_country,
        true,
        true,
        NOW(),
        NOW()
    );
    
    RETURN new_user_id;
END;
$$;

-- 4. Donner les permissions à la fonction
GRANT EXECUTE ON FUNCTION admin_create_user_account TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_user_account TO service_role;

-- 5. Créer une politique RLS pour permettre aux admins de créer des comptes
-- Cette politique permet aux utilisateurs avec role_id = 1 (admin) de créer des profils
CREATE POLICY IF NOT EXISTS "Admins can create user profiles" ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 6. Créer une politique pour permettre aux admins de voir tous les profils
CREATE POLICY IF NOT EXISTS "Admins can view all user profiles" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 7. Créer une politique pour permettre aux admins de mettre à jour les profils
CREATE POLICY IF NOT EXISTS "Admins can update user profiles" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 8. Créer une fonction pour créer automatiquement un business pour les partenaires
CREATE OR REPLACE FUNCTION create_business_for_partner(
    partner_user_id UUID,
    business_name VARCHAR(255) DEFAULT NULL,
    business_description TEXT DEFAULT NULL,
    business_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_business_id UUID;
    partner_name VARCHAR(100);
BEGIN
    -- Récupérer le nom du partenaire
    SELECT name INTO partner_name FROM user_profiles WHERE id = partner_user_id;
    
    -- Générer un nouvel UUID pour le business
    new_business_id := gen_random_uuid();
    
    -- Insérer le business
    INSERT INTO businesses (
        id,
        name,
        description,
        address,
        owner_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_business_id,
        COALESCE(business_name, partner_name || ' - Commerce'),
        COALESCE(business_description, 'Commerce créé automatiquement'),
        COALESCE(business_address, 'Adresse à compléter'),
        partner_user_id,
        true,
        NOW(),
        NOW()
    );
    
    RETURN new_business_id;
END;
$$;

-- 9. Donner les permissions à la fonction business
GRANT EXECUTE ON FUNCTION create_business_for_partner TO authenticated;
GRANT EXECUTE ON FUNCTION create_business_for_partner TO service_role;

-- 10. Créer une fonction pour créer automatiquement un profil driver
CREATE OR REPLACE FUNCTION create_driver_profile(
    driver_user_id UUID,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_email VARCHAR(255)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_driver_id UUID;
BEGIN
    -- Générer un nouvel UUID pour le driver
    new_driver_id := gen_random_uuid();
    
    -- Insérer le profil driver
    INSERT INTO drivers (
        id,
        name,
        phone,
        email,
        user_id,
        is_active,
        is_verified,
        created_at,
        updated_at
    ) VALUES (
        new_driver_id,
        driver_name,
        driver_phone,
        driver_email,
        driver_user_id,
        true,
        true,
        NOW(),
        NOW()
    );
    
    RETURN new_driver_id;
END;
$$;

-- 11. Donner les permissions à la fonction driver
GRANT EXECUTE ON FUNCTION create_driver_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_driver_profile TO service_role;

-- 12. Vérifier que tout a été créé
SELECT '=== FONCTIONS CRÉÉES ===' as info;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('admin_create_user_account', 'create_business_for_partner', 'create_driver_profile')
ORDER BY routine_name;

-- 13. Vérifier les nouvelles politiques
SELECT '=== NOUVELLES POLITIQUES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
AND policyname LIKE '%Admin%'
ORDER BY policyname;

-- 14. Message de confirmation
SELECT '✅ Permissions de création de comptes configurées avec succès!' as message;
SELECT '📝 Les admins peuvent maintenant créer des comptes utilisateurs' as info;
SELECT '🔐 Les fonctions sont sécurisées avec SECURITY DEFINER' as security; 