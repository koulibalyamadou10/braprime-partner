-- ============================================================================
-- SCRIPT POUR CRÉER UN UTILISATEUR ADMINISTRATEUR
-- ============================================================================
-- Ce script crée un utilisateur admin avec tous les privilèges nécessaires
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- CRÉATION DE L'UTILISATEUR ADMIN
-- ============================================================================

-- Créer l'utilisateur admin dans auth.users (via Supabase Auth)
-- Note: Cette partie doit être faite manuellement via l'interface Supabase
-- ou via l'API Supabase Auth

-- ============================================================================
-- CRÉATION DU PROFIL ADMIN
-- ============================================================================

-- Insérer le profil admin dans user_profiles
INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- UUID de l'admin (à remplacer par l'ID réel)
    'admin@bradelivery.gn',
    'Admin',
    'BraPrime',
    '+224 123 456 789',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================================================
-- ATTRIBUTION DES PRIVILÈGES ADMIN
-- ============================================================================

-- Créer un rôle admin personnalisé si il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role;
    END IF;
END
$$;

-- Accorder les privilèges au rôle admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin_role;

-- ============================================================================
-- POLITIQUES RLS POUR L'ADMIN
-- ============================================================================

-- Politique pour permettre à l'admin d'accéder à toutes les données
-- Note: Ces politiques doivent être créées pour chaque table

-- Exemple pour la table businesses
DROP POLICY IF EXISTS "Admin can access all businesses" ON businesses;
CREATE POLICY "Admin can access all businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Exemple pour la table orders
DROP POLICY IF EXISTS "Admin can access all orders" ON orders;
CREATE POLICY "Admin can access all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Exemple pour la table drivers
DROP POLICY IF EXISTS "Admin can access all drivers" ON drivers;
CREATE POLICY "Admin can access all drivers" ON drivers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Exemple pour la table user_profiles
DROP POLICY IF EXISTS "Admin can access all user profiles" ON user_profiles;
CREATE POLICY "Admin can access all user profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
        )
    );

-- ============================================================================
-- FONCTIONS ADMIN
-- ============================================================================

-- Fonction pour obtenir les statistiques globales (admin seulement)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_users INTEGER,
    total_businesses INTEGER,
    total_orders INTEGER,
    total_revenue DECIMAL,
    active_drivers INTEGER
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM user_profiles WHERE role != 'admin') as total_users,
        (SELECT COUNT(*) FROM businesses) as total_businesses,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(grand_total), 0) FROM orders WHERE status = 'delivered') as total_revenue,
        (SELECT COUNT(*) FROM drivers WHERE is_active = true) as active_drivers;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir tous les utilisateurs (admin seulement)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;

    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.first_name,
        up.last_name,
        up.phone,
        up.role,
        up.is_active,
        up.created_at
    FROM user_profiles up
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir toutes les entreprises (admin seulement)
CREATE OR REPLACE FUNCTION get_all_businesses()
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    owner_id UUID,
    owner_email TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;

    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.description,
        b.owner_id,
        up.email as owner_email,
        b.is_active,
        b.created_at
    FROM businesses b
    LEFT JOIN user_profiles up ON b.owner_id = up.id
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONNÉES DE TEST POUR L'ADMIN
-- ============================================================================

-- Insérer des données de test pour que l'admin puisse voir des statistiques
-- (Ces données sont optionnelles et peuvent être supprimées en production)

-- Insérer quelques utilisateurs de test
INSERT INTO user_profiles (id, email, first_name, last_name, phone, role, is_active, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'user1@test.gn', 'Mamadou', 'Diallo', '+224 111 111 111', 'customer', true, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'user2@test.gn', 'Fatoumata', 'Camara', '+224 222 222 222', 'customer', true, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'partner1@test.gn', 'Ibrahima', 'Sow', '+224 333 333 333', 'partner', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques entreprises de test
INSERT INTO businesses (name, description, owner_id, is_active, created_at, updated_at)
SELECT 
    'Restaurant Test 1',
    'Restaurant de test pour l\'admin',
    up.id,
    true,
    NOW(),
    NOW()
FROM user_profiles up 
WHERE up.role = 'partner' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Script de création d''admin exécuté avec succès!';
    RAISE NOTICE 'IMPORTANT: Vous devez maintenant créer l''utilisateur admin manuellement via Supabase Auth';
    RAISE NOTICE '1. Allez dans l''interface Supabase > Authentication > Users';
    RAISE NOTICE '2. Créez un nouvel utilisateur avec l''email: admin@bradelivery.gn';
    RAISE NOTICE '3. Remplacez l''UUID dans le script par l''ID réel de l''utilisateur créé';
    RAISE NOTICE '4. Réexécutez la partie INSERT INTO user_profiles avec le bon UUID';
    RAISE NOTICE '5. L''utilisateur admin aura accès à toutes les fonctionnalités d''administration';
END $$; 