-- ============================================================================
-- SCRIPT DE CRÉATION DE L'UTILISATEUR ADMIN
-- ============================================================================
-- À exécuter après la migration vers le schéma mobile

-- ============================================================================
-- ÉTAPE 1: CRÉATION DE L'UTILISATEUR DANS AUTH.USERS
-- ============================================================================

-- Générer un UUID pour l'admin
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Insérer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        admin_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@bradelivery.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );

    -- Insérer le profil admin dans user_profiles
    INSERT INTO user_profiles (
        id,
        name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_uuid,
        'Administrateur BraPrime',
        'admin@bradelivery.com',
        'admin',
        true,
        NOW(),
        NOW()
    );

    -- Afficher les informations de connexion
    RAISE NOTICE 'Admin créé avec succès!';
    RAISE NOTICE 'UUID: %', admin_uuid;
    RAISE NOTICE 'Email: admin@bradelivery.com';
    RAISE NOTICE 'Mot de passe: admin123';
END $$;

-- ============================================================================
-- ÉTAPE 2: VÉRIFICATION
-- ============================================================================

-- Vérifier que l'admin a été créé
SELECT 
    up.id,
    up.name,
    up.email,
    up.role,
    up.is_active,
    up.created_at
FROM user_profiles up
WHERE up.email = 'admin@bradelivery.com';

-- ============================================================================
-- ÉTAPE 3: CONFIGURATION SUPPLÉMENTAIRE
-- ============================================================================

-- Créer un business de test pour l'admin (optionnel)
INSERT INTO businesses (
    name,
    description,
    business_type_id,
    owner_id,
    address,
    phone,
    opening_hours,
    is_active,
    is_open,
    delivery_fee,
    minimum_order,
    rating,
    review_count,
    cover_image,
    logo
) VALUES (
    'Restaurant Test Admin',
    'Restaurant de test pour l''administrateur',
    1, -- restaurant
    (SELECT id FROM user_profiles WHERE email = 'admin@bradelivery.com'),
    '123 Rue de Test, Ville Test',
    '+1234567890',
    'Lun-Dim: 8h-22h',
    true,
    true,
    500, -- 5€
    1000, -- 10€
    4.5,
    0,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'
);

-- ============================================================================
-- ÉTAPE 4: CONFIRMATION FINALE
-- ============================================================================

SELECT 'Administrateur créé avec succès!' as status; 