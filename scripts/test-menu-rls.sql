-- ============================================================================
-- SCRIPT DE TEST POUR LES POLITIQUES RLS DES TABLES DE MENU
-- ============================================================================
-- Ce script teste les politiques de sécurité pour les tables menu_categories et menu_items

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES EXISTANTES
-- ============================================================================

-- Afficher toutes les politiques sur les tables de menu
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('menu_items', 'menu_categories')
ORDER BY tablename, policyname;

-- ============================================================================
-- TEST DES POLITIQUES POUR LES PARTENAIRES
-- ============================================================================

-- Vérifier qu'un partenaire peut voir ses propres catégories
-- (Remplacez 'user-uuid-here' par l'UUID d'un utilisateur partenaire réel)
DO $$
DECLARE
    partner_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Remplacez par un vrai UUID
    business_id INTEGER;
BEGIN
    -- Trouver un business appartenant à ce partenaire
    SELECT id INTO business_id 
    FROM businesses 
    WHERE owner_id = partner_user_id 
    LIMIT 1;
    
    IF business_id IS NOT NULL THEN
        RAISE NOTICE 'Test pour le partenaire % avec business_id %', partner_user_id, business_id;
        
        -- Test de lecture des catégories
        RAISE NOTICE 'Catégories du partenaire:';
        PERFORM COUNT(*) FROM menu_categories WHERE business_id = business_id;
        
        -- Test de lecture des articles
        RAISE NOTICE 'Articles du partenaire:';
        PERFORM COUNT(*) FROM menu_items WHERE business_id = business_id;
        
    ELSE
        RAISE NOTICE 'Aucun business trouvé pour le partenaire %', partner_user_id;
    END IF;
END $$;

-- ============================================================================
-- TEST DES POLITIQUES POUR LES CLIENTS
-- ============================================================================

-- Vérifier que les clients peuvent voir les menus des commerces actifs
SELECT 
    'Test lecture publique des articles' as test_type,
    COUNT(*) as total_items,
    COUNT(DISTINCT business_id) as total_businesses
FROM menu_items mi
JOIN businesses b ON mi.business_id = b.id
WHERE b.is_active = true AND b.is_open = true;

SELECT 
    'Test lecture publique des catégories' as test_type,
    COUNT(*) as total_categories,
    COUNT(DISTINCT business_id) as total_businesses
FROM menu_categories mc
JOIN businesses b ON mc.business_id = b.id
WHERE b.is_active = true AND b.is_open = true AND mc.is_active = true;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES DE TEST
-- ============================================================================

-- Afficher quelques exemples de données
SELECT 
    'Exemples de catégories' as info,
    id,
    name,
    business_id,
    is_active,
    sort_order
FROM menu_categories 
ORDER BY business_id, sort_order 
LIMIT 10;

SELECT 
    'Exemples d''articles' as info,
    id,
    name,
    price,
    business_id,
    category_id,
    is_available,
    is_popular
FROM menu_items 
ORDER BY business_id, name 
LIMIT 10;

-- ============================================================================
-- VÉRIFICATION DES RELATIONS
-- ============================================================================

-- Vérifier que tous les articles ont une catégorie valide
SELECT 
    'Articles sans catégorie valide' as issue,
    COUNT(*) as count
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mc.id IS NULL;

-- Vérifier que tous les articles et catégories ont un business valide
SELECT 
    'Articles sans business valide' as issue,
    COUNT(*) as count
FROM menu_items mi
LEFT JOIN businesses b ON mi.business_id = b.id
WHERE b.id IS NULL;

SELECT 
    'Catégories sans business valide' as issue,
    COUNT(*) as count
FROM menu_categories mc
LEFT JOIN businesses b ON mc.business_id = b.id
WHERE b.id IS NULL;

-- ============================================================================
-- STATISTIQUES GÉNÉRALES
-- ============================================================================

SELECT 
    'Statistiques générales' as info,
    (SELECT COUNT(*) FROM menu_categories) as total_categories,
    (SELECT COUNT(*) FROM menu_items) as total_items,
    (SELECT COUNT(*) FROM businesses) as total_businesses,
    (SELECT COUNT(*) FROM businesses WHERE is_active = true) as active_businesses;

-- ============================================================================
-- MESSAGE DE FIN
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Tests des politiques RLS terminés!';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour vous assurer que tout fonctionne correctement.';
END $$; 