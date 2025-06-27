-- ============================================================================
-- SCRIPT POUR CONFIGURER LE RÔLE ADMINISTRATEUR
-- ============================================================================
-- Ce script ajoute le rôle administrateur et configure les permissions nécessaires

-- ============================================================================
-- 1. AJOUTER LE RÔLE ADMINISTRATEUR
-- ============================================================================

-- Insérer le rôle admin dans la table roles si il n'existe pas
INSERT INTO roles (id, name, description, permissions)
VALUES (
    3, 
    'admin', 
    'Administrateur de la plateforme avec accès complet',
    '{"all": true}'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- ============================================================================
-- 2. CRÉER UN UTILISATEUR ADMIN PAR DÉFAUT
-- ============================================================================

-- Créer un utilisateur admin de test (à modifier selon vos besoins)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Créer l'utilisateur auth
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@braprime.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Créer le profil utilisateur admin
    INSERT INTO user_profiles (
        id,
        name,
        email,
        phone,
        role_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Administrateur BraPrime',
        'admin@braprime.com',
        '+224 123 456 789',
        3, -- role admin
        true,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Utilisateur admin créé avec l''ID: %', admin_user_id;
    RAISE NOTICE 'Email: admin@braprime.com';
    RAISE NOTICE 'Mot de passe: admin123';
END $$;

-- ============================================================================
-- 3. CONFIGURER LES POLITIQUES RLS POUR L'ADMIN
-- ============================================================================

-- Politique pour que l'admin puisse voir tous les utilisateurs
DROP POLICY IF EXISTS "Admins can view all users" ON user_profiles;
CREATE POLICY "Admins can view all users" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse modifier tous les utilisateurs
DROP POLICY IF EXISTS "Admins can update all users" ON user_profiles;
CREATE POLICY "Admins can update all users" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse voir tous les commerces
DROP POLICY IF EXISTS "Admins can view all businesses" ON businesses;
CREATE POLICY "Admins can view all businesses" ON businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse modifier tous les commerces
DROP POLICY IF EXISTS "Admins can update all businesses" ON businesses;
CREATE POLICY "Admins can update all businesses" ON businesses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse voir toutes les commandes
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse modifier toutes les commandes
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse voir tous les livreurs
DROP POLICY IF EXISTS "Admins can view all drivers" ON drivers;
CREATE POLICY "Admins can view all drivers" ON drivers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- Politique pour que l'admin puisse modifier tous les livreurs
DROP POLICY IF EXISTS "Admins can update all drivers" ON drivers;
CREATE POLICY "Admins can update all drivers" ON drivers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 3
        )
    );

-- ============================================================================
-- 4. VÉRIFICATION
-- ============================================================================

-- Vérifier que le rôle admin existe
SELECT 
    'ROLE ADMIN' as check_type,
    id,
    name,
    description
FROM roles 
WHERE name = 'admin';

-- Vérifier que l'utilisateur admin existe
SELECT 
    'ADMIN USER' as check_type,
    up.id,
    up.name,
    up.email,
    up.role_id,
    r.name as role_name
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE r.name = 'admin';

-- Vérifier les politiques RLS pour l'admin
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE policyname LIKE '%Admin%' OR policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Configuration du rôle administrateur terminée!';
    RAISE NOTICE 'Utilisateur admin créé: admin@braprime.com / admin123';
    RAISE NOTICE 'Politiques RLS configurées pour l''accès administrateur';
    RAISE NOTICE 'Vous pouvez maintenant vous connecter en tant qu''admin';
END $$; 