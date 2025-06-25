-- ============================================================================
-- SCRIPT TEMPORAIRE POUR DÉSACTIVER RLS
-- ============================================================================
-- ⚠️ ATTENTION: Ce script désactive temporairement RLS pour le débogage
-- À utiliser uniquement en développement et à supprimer en production

-- ============================================================================
-- DÉSACTIVER RLS TEMPORAIREMENT
-- ============================================================================

-- Désactiver RLS sur menu_items
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur menu_categories
ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier l'état RLS
SELECT 
    'État RLS après désactivation' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('menu_items', 'menu_categories')
ORDER BY tablename;

-- ============================================================================
-- TEST D'INSERTION
-- ============================================================================

-- Test d'insertion d'une catégorie
DO $$
DECLARE
    test_business_id INTEGER;
BEGIN
    -- Trouver un business de test
    SELECT id INTO test_business_id 
    FROM businesses 
    LIMIT 1;
    
    IF test_business_id IS NOT NULL THEN
        -- Insérer une catégorie de test
        INSERT INTO menu_categories (name, business_id, is_active, sort_order) VALUES
        ('Catégorie Test RLS', test_business_id, true, 1)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Catégorie de test insérée avec business_id: %', test_business_id;
    ELSE
        RAISE NOTICE 'Aucun business trouvé pour le test';
    END IF;
END $$;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS désactivé temporairement!';
    RAISE NOTICE 'Vous pouvez maintenant tester les opérations CRUD.';
    RAISE NOTICE 'N''oubliez pas de réactiver RLS après les tests.';
END $$; 