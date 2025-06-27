-- ============================================================================
-- SCRIPT DE VÉRIFICATION DE L'ÉTAT ACTUEL
-- ============================================================================
-- Ce script vérifie l'état actuel de la base de données

-- Vérifier si la table drivers existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') 
        THEN '✅ Table drivers existe'
        ELSE '❌ Table drivers n''existe pas'
    END as status;

-- Si la table existe, afficher sa structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Structure actuelle de la table drivers:';
        RAISE NOTICE '=====================================';
    END IF;
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'drivers' 
ORDER BY ordinal_position;

-- Vérifier spécifiquement business_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'drivers' AND column_name = 'business_id'
        ) 
        THEN '✅ Colonne business_id existe'
        ELSE '❌ Colonne business_id MANQUANTE'
    END as business_id_status;

-- Vérifier si la table businesses existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') 
        THEN '✅ Table businesses existe'
        ELSE '❌ Table businesses n''existe pas'
    END as businesses_status;

-- Compter le nombre de tables créées
SELECT 
    COUNT(*) as total_tables,
    STRING_AGG(table_name, ', ') as table_names
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_roles', 'user_profiles', 'businesses', 'drivers', 
    'orders', 'reservations', 'reviews', 'notifications'
); 