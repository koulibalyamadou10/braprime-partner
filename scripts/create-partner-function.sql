-- Script pour créer la fonction create_partner_profile
-- Cette fonction permet de créer des partenaires sans contrainte de clé étrangère

-- 1. Vérifier si la fonction existe déjà
SELECT '=== VÉRIFICATION FONCTION ===' as info;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'create_partner_profile';

-- 2. Créer la fonction create_partner_profile
CREATE OR REPLACE FUNCTION create_partner_profile(
    partner_name VARCHAR(100),
    partner_email VARCHAR(255),
    partner_phone VARCHAR(20),
    partner_role_id INTEGER,
    partner_address TEXT DEFAULT NULL,
    partner_city VARCHAR(100) DEFAULT NULL,
    partner_postal_code VARCHAR(20) DEFAULT NULL,
    partner_country VARCHAR(100) DEFAULT 'Guinée',
    partner_bio TEXT DEFAULT NULL,
    partner_website VARCHAR(255) DEFAULT NULL,
    partner_social_media TEXT DEFAULT NULL,
    partner_profile_image VARCHAR(500) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    partner_role_exists BOOLEAN;
BEGIN
    -- Vérifier que le rôle existe
    SELECT EXISTS(SELECT 1 FROM user_roles WHERE id = partner_role_id) INTO partner_role_exists;
    
    IF NOT partner_role_exists THEN
        RAISE EXCEPTION 'Rôle avec ID % n''existe pas', partner_role_id;
    END IF;
    
    -- Générer un nouvel UUID
    new_user_id := gen_random_uuid();
    
    -- Insérer le profil partenaire
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
        bio,
        website,
        social_media,
        profile_image,
        is_active,
        is_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        partner_name,
        partner_email,
        partner_phone,
        partner_role_id,
        partner_address,
        partner_city,
        partner_postal_code,
        partner_country,
        partner_bio,
        partner_website,
        partner_social_media,
        partner_profile_image,
        true,
        false,
        NOW(),
        NOW()
    );
    
    RETURN new_user_id;
END;
$$;

-- 3. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION create_partner_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_partner_profile TO service_role;

-- 4. Vérifier que la fonction a été créée
SELECT '=== FONCTION CRÉÉE ===' as info;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'create_partner_profile';

-- 5. Tester la fonction
SELECT '=== TEST FONCTION ===' as info;
-- Cette requête va tester la fonction (remplacez les valeurs par vos données)
-- SELECT create_partner_profile(
--     'Test Partner',
--     'test@example.com',
--     '+224123456789',
--     2, -- ID du rôle partner
--     '123 Test Street',
--     'Conakry',
--     '001',
--     'Guinée',
--     'Bio de test',
--     'https://example.com',
--     '{"facebook": "test"}',
--     NULL
-- );

-- 6. Message de confirmation
SELECT '✅ Fonction create_partner_profile créée avec succès!' as message; 