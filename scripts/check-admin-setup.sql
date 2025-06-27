-- ============================================================================
-- SCRIPT DE DIAGNOSTIC POUR LA CONFIGURATION ADMIN
-- ============================================================================
-- Ce script vérifie que la configuration admin est correcte

-- ============================================================================
-- 1. VÉRIFIER L'EXISTENCE DES TABLES NÉCESSAIRES
-- ============================================================================

DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    required_tables TEXT[] := ARRAY['user_profiles', 'businesses', 'orders', 'drivers', 'roles'];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES TABLES ===';
    
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '❌ Table manquante: %', table_name;
        ELSE
            RAISE NOTICE '✅ Table existante: %', table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Tables manquantes: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'Toutes les tables requises sont présentes';
    END IF;
END $$;

-- ============================================================================
-- 2. VÉRIFIER LE RÔLE ADMIN
-- ============================================================================

DO $$
DECLARE
    admin_role_count INTEGER;
    admin_role RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DU RÔLE ADMIN ===';
    
    SELECT COUNT(*) INTO admin_role_count FROM roles WHERE name = 'admin';
    
    IF admin_role_count = 0 THEN
        RAISE NOTICE '❌ Rôle admin manquant';
        RAISE NOTICE 'Exécutez: INSERT INTO roles (id, name, description) VALUES (3, ''admin'', ''Administrateur'')';
    ELSE
        SELECT * INTO admin_role FROM roles WHERE name = 'admin';
        RAISE NOTICE '✅ Rôle admin trouvé (ID: %, Description: %)', admin_role.id, admin_role.description;
    END IF;
END $$;

-- ============================================================================
-- 3. VÉRIFIER LES UTILISATEURS ADMIN
-- ============================================================================

DO $$
DECLARE
    admin_users_count INTEGER;
    admin_user RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DES UTILISATEURS ADMIN ===';
    
    SELECT COUNT(*) INTO admin_users_count 
    FROM user_profiles up 
    JOIN roles r ON up.role_id = r.id 
    WHERE r.name = 'admin';
    
    IF admin_users_count = 0 THEN
        RAISE NOTICE '❌ Aucun utilisateur admin trouvé';
        RAISE NOTICE 'Exécutez le script setup-admin-role.sql pour créer un admin';
    ELSE
        RAISE NOTICE '✅ % utilisateur(s) admin trouvé(s)', admin_users_count;
        
        FOR admin_user IN 
            SELECT up.id, up.name, up.email, up.role_id, r.name as role_name
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE r.name = 'admin'
        LOOP
            RAISE NOTICE '   - ID: %, Nom: %, Email: %', admin_user.id, admin_user.name, admin_user.email;
        END LOOP;
    END IF;
END $$;

-- ============================================================================
-- 4. VÉRIFIER LES POLITIQUES RLS ADMIN
-- ============================================================================

DO $$
DECLARE
    admin_policies_count INTEGER;
    policy RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DES POLITIQUES RLS ADMIN ===';
    
    SELECT COUNT(*) INTO admin_policies_count 
    FROM pg_policies 
    WHERE policyname LIKE '%Admin%' OR policyname LIKE '%admin%';
    
    IF admin_policies_count = 0 THEN
        RAISE NOTICE '❌ Aucune politique RLS admin trouvée';
        RAISE NOTICE 'Exécutez le script setup-admin-role.sql pour configurer les politiques';
    ELSE
        RAISE NOTICE '✅ % politique(s) RLS admin trouvée(s)', admin_policies_count;
        
        FOR policy IN 
            SELECT tablename, policyname, cmd, permissive
            FROM pg_policies 
            WHERE policyname LIKE '%Admin%' OR policyname LIKE '%admin%'
            ORDER BY tablename, policyname
        LOOP
            RAISE NOTICE '   - Table: %, Politique: %, Commande: %, Permissive: %', 
                policy.tablename, policy.policyname, policy.cmd, policy.permissive;
        END LOOP;
    END IF;
END $$;

-- ============================================================================
-- 5. VÉRIFIER LES DONNÉES DE TEST
-- ============================================================================

DO $$
DECLARE
    users_count INTEGER;
    businesses_count INTEGER;
    orders_count INTEGER;
    drivers_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DES DONNÉES ===';
    
    SELECT COUNT(*) INTO users_count FROM user_profiles;
    SELECT COUNT(*) INTO businesses_count FROM businesses;
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO drivers_count FROM drivers;
    
    RAISE NOTICE 'Utilisateurs: %', users_count;
    RAISE NOTICE 'Commerces: %', businesses_count;
    RAISE NOTICE 'Commandes: %', orders_count;
    RAISE NOTICE 'Livreurs: %', drivers_count;
    
    IF users_count = 0 THEN
        RAISE NOTICE '⚠️  Aucun utilisateur dans la base de données';
    END IF;
    
    IF businesses_count = 0 THEN
        RAISE NOTICE '⚠️  Aucun commerce dans la base de données';
    END IF;
    
    IF orders_count = 0 THEN
        RAISE NOTICE '⚠️  Aucune commande dans la base de données';
    END IF;
    
    IF drivers_count = 0 THEN
        RAISE NOTICE '⚠️  Aucun livreur dans la base de données';
    END IF;
END $$;

-- ============================================================================
-- 6. VÉRIFIER LA CONFIGURATION AUTH
-- ============================================================================

DO $$
DECLARE
    auth_users_count INTEGER;
    current_user_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DE L''AUTHENTIFICATION ===';
    
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '⚠️  Aucun utilisateur connecté';
    ELSE
        RAISE NOTICE '✅ Utilisateur connecté: %', current_user_id;
        
        SELECT COUNT(*) INTO auth_users_count FROM auth.users;
        RAISE NOTICE 'Utilisateurs auth: %', auth_users_count;
    END IF;
END $$;

-- ============================================================================
-- 7. TEST DES PERMISSIONS ADMIN
-- ============================================================================

DO $$
DECLARE
    can_read_users BOOLEAN;
    can_read_businesses BOOLEAN;
    can_read_orders BOOLEAN;
    can_read_drivers BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST DES PERMISSIONS ===';
    
    -- Test lecture utilisateurs
    BEGIN
        PERFORM 1 FROM user_profiles LIMIT 1;
        can_read_users := TRUE;
        RAISE NOTICE '✅ Lecture utilisateurs: OK';
    EXCEPTION WHEN OTHERS THEN
        can_read_users := FALSE;
        RAISE NOTICE '❌ Lecture utilisateurs: ÉCHEC - %', SQLERRM;
    END;
    
    -- Test lecture commerces
    BEGIN
        PERFORM 1 FROM businesses LIMIT 1;
        can_read_businesses := TRUE;
        RAISE NOTICE '✅ Lecture commerces: OK';
    EXCEPTION WHEN OTHERS THEN
        can_read_businesses := FALSE;
        RAISE NOTICE '❌ Lecture commerces: ÉCHEC - %', SQLERRM;
    END;
    
    -- Test lecture commandes
    BEGIN
        PERFORM 1 FROM orders LIMIT 1;
        can_read_orders := TRUE;
        RAISE NOTICE '✅ Lecture commandes: OK';
    EXCEPTION WHEN OTHERS THEN
        can_read_orders := FALSE;
        RAISE NOTICE '❌ Lecture commandes: ÉCHEC - %', SQLERRM;
    END;
    
    -- Test lecture livreurs
    BEGIN
        PERFORM 1 FROM drivers LIMIT 1;
        can_read_drivers := TRUE;
        RAISE NOTICE '✅ Lecture livreurs: OK';
    EXCEPTION WHEN OTHERS THEN
        can_read_drivers := FALSE;
        RAISE NOTICE '❌ Lecture livreurs: ÉCHEC - %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- 8. RÉSUMÉ ET RECOMMANDATIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE 'Diagnostic terminé. Vérifiez les messages ci-dessus.';
    RAISE NOTICE '';
    RAISE NOTICE 'Si des problèmes sont détectés:';
    RAISE NOTICE '1. Exécutez: \i scripts/setup-admin-role.sql';
    RAISE NOTICE '2. Vérifiez les politiques RLS';
    RAISE NOTICE '3. Testez la connexion admin';
    RAISE NOTICE '4. Consultez le guide: GUIDE-DASHBOARD-ADMIN.md';
END $$; 