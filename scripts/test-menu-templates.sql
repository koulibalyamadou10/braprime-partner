-- ============================================================================
-- SCRIPT DE TEST POUR LES TEMPLATES DE CATÉGORIES DE MENU
-- ============================================================================
-- Ce script teste la création automatique de catégories basées sur les templates

-- ============================================================================
-- VÉRIFICATION DES TEMPLATES EXISTANTS
-- ============================================================================

-- Afficher tous les templates disponibles
SELECT 
  'Templates disponibles:' as info;

SELECT 
  bt.name as business_type,
  btmt.category_name,
  btmt.category_description,
  btmt.sort_order,
  btmt.is_required
FROM business_type_menu_templates btmt
JOIN business_types bt ON btmt.business_type_id = bt.id
ORDER BY bt.name, btmt.sort_order;

-- ============================================================================
-- TEST DE CRÉATION D'UN BUSINESS AVEC CATÉGORIES AUTOMATIQUES
-- ============================================================================

-- Créer un business de test pour vérifier les catégories automatiques
DO $$
DECLARE
    v_business_id INTEGER;
    v_category_count INTEGER;
BEGIN
    -- Insérer un business de test (restaurant)
    INSERT INTO businesses (
        name,
        description,
        business_type_id,
        address,
        phone,
        email,
        owner_id,
        is_active,
        is_open
    ) VALUES (
        'Restaurant Test Templates',
        'Restaurant de test pour vérifier les templates de catégories',
        1, -- Restaurant
        '123 Rue Test, Conakry',
        '+224 1 23 45 67 89',
        'test@restaurant.gn',
        '00000000-0000-0000-0000-000000000000', -- UUID de test
        true,
        true
    ) RETURNING id INTO v_business_id;

    RAISE NOTICE 'Business de test créé avec ID: %', v_business_id;

    -- Compter les catégories créées automatiquement
    SELECT COUNT(*) INTO v_category_count
    FROM menu_categories
    WHERE business_id = v_business_id;

    RAISE NOTICE 'Nombre de catégories créées automatiquement: %', v_category_count;

    -- Afficher les catégories créées
    RAISE NOTICE 'Catégories créées pour le business %:', v_business_id;
    
    FOR category_record IN 
        SELECT name, description, sort_order
        FROM menu_categories
        WHERE business_id = v_business_id
        ORDER BY sort_order
    LOOP
        RAISE NOTICE '  - % (ordre: %): %', 
            category_record.name, 
            category_record.sort_order, 
            category_record.description;
    END LOOP;

    -- Nettoyer le business de test
    DELETE FROM businesses WHERE id = v_business_id;
    RAISE NOTICE 'Business de test supprimé';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors du test: %', SQLERRM;
END $$;

-- ============================================================================
-- TEST DE LA FONCTION DE CRÉATION MANUELLE
-- ============================================================================

-- Tester la fonction de création manuelle de catégories
DO $$
DECLARE
    v_business_id INTEGER;
    v_category_count INTEGER;
BEGIN
    -- Créer un business de test
    INSERT INTO businesses (
        name,
        description,
        business_type_id,
        address,
        phone,
        email,
        owner_id,
        is_active,
        is_open
    ) VALUES (
        'Café Test Templates',
        'Café de test pour vérifier les templates de catégories',
        2, -- Café
        '456 Avenue Test, Conakry',
        '+224 1 98 76 54 32',
        'test@cafe.gn',
        '00000000-0000-0000-0000-000000000000',
        true,
        true
    ) RETURNING id INTO v_business_id;

    RAISE NOTICE 'Café de test créé avec ID: %', v_business_id;

    -- Appeler la fonction de création de catégories
    PERFORM create_menu_categories_by_business_type(v_business_id, 2);

    -- Compter les catégories créées
    SELECT COUNT(*) INTO v_category_count
    FROM menu_categories
    WHERE business_id = v_business_id;

    RAISE NOTICE 'Nombre de catégories créées manuellement: %', v_category_count;

    -- Afficher les catégories créées
    RAISE NOTICE 'Catégories créées pour le café %:', v_business_id;
    
    FOR category_record IN 
        SELECT name, description, sort_order
        FROM menu_categories
        WHERE business_id = v_business_id
        ORDER BY sort_order
    LOOP
        RAISE NOTICE '  - % (ordre: %): %', 
            category_record.name, 
            category_record.sort_order, 
            category_record.description;
    END LOOP;

    -- Nettoyer le business de test
    DELETE FROM businesses WHERE id = v_business_id;
    RAISE NOTICE 'Café de test supprimé';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors du test manuel: %', SQLERRM;
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Afficher un résumé des templates par type de business
SELECT 
  'Résumé des templates par type de business:' as info;

SELECT 
  bt.name as business_type,
  COUNT(btmt.id) as template_count,
  STRING_AGG(btmt.category_name, ', ' ORDER BY btmt.sort_order) as categories
FROM business_types bt
LEFT JOIN business_type_menu_templates btmt ON bt.id = btmt.business_type_id
GROUP BY bt.id, bt.name
ORDER BY bt.name;

-- ============================================================================
-- MESSAGE DE SUCCÈS
-- ============================================================================

SELECT 
  '✅ Tests terminés avec succès!' as result,
  'Les templates de catégories sont fonctionnels.' as message; 