-- ============================================================================
-- SCRIPT AUTOMATISÉ POUR CRÉER UN ADMINISTRATEUR
-- ============================================================================
-- Ce script crée automatiquement un utilisateur admin
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- VARIABLES CONFIGURABLES
-- ============================================================================

-- Modifiez ces variables selon vos besoins
DO $$
DECLARE
    admin_email TEXT := 'admin@bradelivery.gn';
    admin_password TEXT := 'Admin123!'; -- Changez ce mot de passe
    admin_first_name TEXT := 'Admin';
    admin_last_name TEXT := 'BraPrime';
    admin_phone TEXT := '+224 123 456 789';
BEGIN

-- ============================================================================
-- FONCTION POUR CRÉER L'ADMIN AUTOMATIQUEMENT
-- ============================================================================

-- Cette fonction sera appelée après la création de l'utilisateur via l'API
CREATE OR REPLACE FUNCTION create_admin_profile(admin_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insérer le profil admin
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
        admin_user_id,
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

    RAISE NOTICE 'Profil admin créé avec succès pour l''utilisateur: %', admin_user_id;
END;
$$;

-- ============================================================================
-- INSTRUCTIONS D'UTILISATION
-- ============================================================================

RAISE NOTICE '============================================================================';
RAISE NOTICE 'INSTRUCTIONS POUR CRÉER L''ADMIN:';
RAISE NOTICE '============================================================================';
RAISE NOTICE '1. Installez les dépendances Node.js: npm install @supabase/supabase-js';
RAISE NOTICE '2. Créez un fichier create-admin.js avec le script ci-dessous';
RAISE NOTICE '3. Remplacez YOUR_SUPABASE_URL et YOUR_SERVICE_ROLE_KEY par vos vraies valeurs';
RAISE NOTICE '4. Exécutez: node create-admin.js';
RAISE NOTICE '5. Connectez-vous avec admin@bradelivery.gn / Admin123!';
RAISE NOTICE '6. Accédez à /admin-dashboard pour le tableau de bord admin';
RAISE NOTICE '============================================================================';

END $$; 