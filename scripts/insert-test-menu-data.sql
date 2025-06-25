-- ============================================================================
-- SCRIPT POUR INSÉRER DES DONNÉES DE TEST POUR LES MENUS
-- ============================================================================
-- Ce script insère des données de test pour tester les fonctionnalités de menu

-- ============================================================================
-- INSÉRER UN BUSINESS DE TEST
-- ============================================================================

-- Insérer un business de test (remplacez l'owner_id par un vrai UUID d'utilisateur)
INSERT INTO businesses (
    name, 
    description, 
    business_type_id, 
    category_id,
    cover_image,
    logo,
    delivery_time,
    delivery_fee,
    address,
    phone,
    email,
    opening_hours,
    cuisine_type,
    is_active,
    is_open,
    owner_id
) VALUES (
    'Restaurant Test BraPrime',
    'Un restaurant de test pour les fonctionnalités de menu',
    1, -- restaurant
    1, -- Restaurants
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    '30-45 min',
    5000,
    '123 Rue Test, Conakry, Guinée',
    '+224 123 456 789',
    'test@braprime.com',
    'Lun-Dim: 8h-22h',
    'Africaine',
    true,
    true,
    '00000000-0000-0000-0000-000000000000' -- Remplacez par un vrai UUID
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSÉRER DES CATÉGORIES DE MENU
-- ============================================================================

-- Récupérer l'ID du business de test
DO $$
DECLARE
    test_business_id INTEGER;
BEGIN
    SELECT id INTO test_business_id 
    FROM businesses 
    WHERE name = 'Restaurant Test BraPrime' 
    LIMIT 1;

    IF test_business_id IS NOT NULL THEN
        -- Insérer des catégories de menu
        INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
        ('Entrées', 'Plats d''entrée et apéritifs', test_business_id, true, 1),
        ('Plats Principaux', 'Plats principaux traditionnels', test_business_id, true, 2),
        ('Accompagnements', 'Riz, légumes et sauces', test_business_id, true, 3),
        ('Boissons', 'Boissons fraîches et chaudes', test_business_id, true, 4),
        ('Desserts', 'Desserts et pâtisseries', test_business_id, true, 5)
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Catégories insérées pour le business_id: %', test_business_id;
    ELSE
        RAISE NOTICE 'Business de test non trouvé';
    END IF;
END $$;

-- ============================================================================
-- INSÉRER DES ARTICLES DE MENU
-- ============================================================================

DO $$
DECLARE
    test_business_id INTEGER;
    entrees_id INTEGER;
    plats_id INTEGER;
    accompagnements_id INTEGER;
    boissons_id INTEGER;
    desserts_id INTEGER;
BEGIN
    -- Récupérer l'ID du business de test
    SELECT id INTO test_business_id 
    FROM businesses 
    WHERE name = 'Restaurant Test BraPrime' 
    LIMIT 1;

    IF test_business_id IS NOT NULL THEN
        -- Récupérer les IDs des catégories
        SELECT id INTO entrees_id FROM menu_categories WHERE business_id = test_business_id AND name = 'Entrées' LIMIT 1;
        SELECT id INTO plats_id FROM menu_categories WHERE business_id = test_business_id AND name = 'Plats Principaux' LIMIT 1;
        SELECT id INTO accompagnements_id FROM menu_categories WHERE business_id = test_business_id AND name = 'Accompagnements' LIMIT 1;
        SELECT id INTO boissons_id FROM menu_categories WHERE business_id = test_business_id AND name = 'Boissons' LIMIT 1;
        SELECT id INTO desserts_id FROM menu_categories WHERE business_id = test_business_id AND name = 'Desserts' LIMIT 1;

        -- Insérer des articles de menu
        INSERT INTO menu_items (
            name, 
            description, 
            price, 
            image, 
            category_id, 
            business_id, 
            is_popular, 
            is_available, 
            allergens, 
            nutritional_info, 
            preparation_time, 
            sort_order
        ) VALUES
        -- Entrées
        (
            'Salade de Fruits de Mer',
            'Salade fraîche avec crevettes, calamars et fruits de mer locaux',
            15000,
            'https://images.unsplash.com/photo-1551248429-40975aa4de74?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            entrees_id,
            test_business_id,
            true,
            true,
            ARRAY['Poisson', 'Crustacés'],
            '{"calories": 180, "proteines": 25, "glucides": 8, "lipides": 6, "fibres": 3}',
            15,
            1
        ),
        (
            'Bouillon de Viande',
            'Bouillon traditionnel avec viande et légumes',
            8000,
            'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            entrees_id,
            test_business_id,
            false,
            true,
            ARRAY['Gluten'],
            '{"calories": 120, "proteines": 15, "glucides": 12, "lipides": 4, "fibres": 2}',
            10,
            2
        ),
        
        -- Plats Principaux
        (
            'Poulet Yassa',
            'Poulet mariné aux oignons et citron, spécialité guinéenne',
            25000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            plats_id,
            test_business_id,
            true,
            true,
            ARRAY['Œufs'],
            '{"calories": 450, "proteines": 35, "glucides": 25, "lipides": 18, "fibres": 4}',
            25,
            1
        ),
        (
            'Mafé de Bœuf',
            'Ragoût de bœuf à la sauce d''arachide et légumes',
            28000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            plats_id,
            test_business_id,
            true,
            true,
            ARRAY['Arachides'],
            '{"calories": 520, "proteines": 40, "glucides": 30, "lipides": 22, "fibres": 6}',
            30,
            2
        ),
        (
            'Poisson Braisé',
            'Poisson frais braisé aux herbes et épices locales',
            22000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            plats_id,
            test_business_id,
            false,
            true,
            ARRAY['Poisson'],
            '{"calories": 380, "proteines": 45, "glucides": 15, "lipides": 12, "fibres": 3}',
            20,
            3
        ),
        
        -- Accompagnements
        (
            'Riz Basmati',
            'Riz basmati parfumé cuit à la vapeur',
            5000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            accompagnements_id,
            test_business_id,
            false,
            true,
            ARRAY[],
            '{"calories": 200, "proteines": 4, "glucides": 45, "lipides": 0, "fibres": 1}',
            15,
            1
        ),
        (
            'Légumes Braisés',
            'Mélange de légumes de saison braisés',
            8000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            accompagnements_id,
            test_business_id,
            false,
            true,
            ARRAY[],
            '{"calories": 120, "proteines": 6, "glucides": 20, "lipides": 3, "fibres": 8}',
            12,
            2
        ),
        
        -- Boissons
        (
            'Bissap',
            'Boisson traditionnelle à base d''hibiscus',
            3000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            boissons_id,
            test_business_id,
            true,
            true,
            ARRAY[],
            '{"calories": 80, "proteines": 0, "glucides": 20, "lipides": 0, "fibres": 0}',
            5,
            1
        ),
        (
            'Café Touba',
            'Café traditionnel avec épices',
            2000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            boissons_id,
            test_business_id,
            false,
            true,
            ARRAY[],
            '{"calories": 5, "proteines": 0, "glucides": 1, "lipides": 0, "fibres": 0}',
            3,
            2
        ),
        
        -- Desserts
        (
            'Thiakry',
            'Dessert traditionnel à base de mil et lait caillé',
            6000,
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desserts_id,
            test_business_id,
            true,
            true,
            ARRAY['Lactose'],
            '{"calories": 280, "proteines": 8, "glucides": 45, "lipides": 8, "fibres": 2}',
            8,
            1
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Articles de menu insérés pour le business_id: %', test_business_id;
    ELSE
        RAISE NOTICE 'Business de test non trouvé';
    END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================

-- Afficher les données insérées
SELECT 
    'Résumé des données insérées' as info,
    (SELECT COUNT(*) FROM businesses WHERE name = 'Restaurant Test BraPrime') as businesses,
    (SELECT COUNT(*) FROM menu_categories mc 
     JOIN businesses b ON mc.business_id = b.id 
     WHERE b.name = 'Restaurant Test BraPrime') as categories,
    (SELECT COUNT(*) FROM menu_items mi 
     JOIN businesses b ON mi.business_id = b.id 
     WHERE b.name = 'Restaurant Test BraPrime') as items;

-- Afficher les catégories
SELECT 
    'Catégories créées' as info,
    mc.name,
    mc.description,
    mc.is_active,
    mc.sort_order
FROM menu_categories mc
JOIN businesses b ON mc.business_id = b.id
WHERE b.name = 'Restaurant Test BraPrime'
ORDER BY mc.sort_order;

-- Afficher les articles
SELECT 
    'Articles créés' as info,
    mi.name,
    mi.price,
    mc.name as category,
    mi.is_available,
    mi.is_popular,
    mi.preparation_time
FROM menu_items mi
JOIN businesses b ON mi.business_id = b.id
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE b.name = 'Restaurant Test BraPrime'
ORDER BY mc.sort_order, mi.sort_order;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Données de test insérées avec succès!';
    RAISE NOTICE 'Vous pouvez maintenant tester les fonctionnalités de menu.';
    RAISE NOTICE 'N''oubliez pas de remplacer l''UUID dans le script par un vrai utilisateur partenaire.';
END $$; 