-- ============================================================================
-- EXEMPLE D'AJOUT D'UN BUSINESS PHARMACIE
-- ============================================================================
-- Ce script montre comment ajouter une pharmacie avec ses catégories automatiques

-- ============================================================================
-- ÉTAPE 1: VÉRIFICATION DES DONNÉES PRÉ-REQUISES
-- ============================================================================

-- Vérifier que le type "pharmacy" existe
SELECT 
  'Vérification du type pharmacy:' as info;

SELECT 
  id,
  name,
  icon,
  color,
  description
FROM business_types 
WHERE name = 'pharmacy';

-- Vérifier les templates de catégories pour les pharmacies
SELECT 
  'Templates de catégories pour pharmacies:' as info;

SELECT 
  category_name,
  category_description,
  sort_order,
  is_required
FROM business_type_menu_templates btmt
JOIN business_types bt ON btmt.business_type_id = bt.id
WHERE bt.name = 'pharmacy'
ORDER BY sort_order;

-- ============================================================================
-- ÉTAPE 2: CRÉATION DU BUSINESS PHARMACIE
-- ============================================================================

-- Créer une pharmacie de test
DO $$
DECLARE
    v_business_id INTEGER;
    v_category_count INTEGER;
    category_record RECORD;
BEGIN
    -- Insérer la pharmacie
    INSERT INTO businesses (
        name,
        description,
        business_type_id,
        address,
        phone,
        email,
        owner_id,
        is_active,
        is_open,
        delivery_fee,
        delivery_time,
        opening_hours,
        rating,
        review_count
    ) VALUES (
        'Pharmacie Centrale de Conakry',
        'Votre pharmacie de confiance au cœur de Conakry. Médicaments, produits de santé et conseils pharmaceutiques.',
        5, -- ID du type pharmacy
        '123 Avenue de la République, Kaloum, Conakry',
        '+224 1 23 45 67 89',
        'contact@pharmaciecentrale.gn',
        '00000000-0000-0000-0000-000000000000', -- UUID du propriétaire
        true,
        true,
        3000, -- Frais de livraison en GNF
        '30-45 min',
        'Lun-Sam: 8h-20h, Dim: 9h-18h',
        4.8,
        127
    ) RETURNING id INTO v_business_id;

    RAISE NOTICE '✅ Pharmacie créée avec succès!';
    RAISE NOTICE '   ID: %', v_business_id;
    RAISE NOTICE '   Nom: Pharmacie Centrale de Conakry';
    RAISE NOTICE '   Type: Pharmacy';

    -- Vérifier les catégories créées automatiquement
    SELECT COUNT(*) INTO v_category_count
    FROM menu_categories
    WHERE business_id = v_business_id;

    RAISE NOTICE '';
    RAISE NOTICE '📋 Catégories créées automatiquement: %', v_category_count;

    -- Afficher toutes les catégories créées
    RAISE NOTICE '';
    RAISE NOTICE '📂 Détail des catégories:';
    
    FOR category_record IN 
        SELECT name, description, sort_order, is_active
        FROM menu_categories
        WHERE business_id = v_business_id
        ORDER BY sort_order
    LOOP
        RAISE NOTICE '   %d. %s', 
            category_record.sort_order,
            category_record.name;
        RAISE NOTICE '      Description: %s', 
            category_record.description;
    END LOOP;

    -- Afficher un exemple d'ajout d'articles
    RAISE NOTICE '';
    RAISE NOTICE '🛍️ Exemple d''ajout d''articles dans les catégories:';
    RAISE NOTICE '   - Médicaments Prescrits: Paracétamol, Ibuprofène, etc.';
    RAISE NOTICE '   - Médicaments en Vente Libre: Vitamine C, Probiotiques, etc.';
    RAISE NOTICE '   - Soins du Corps: Crèmes hydratantes, Déodorants, etc.';
    RAISE NOTICE '   - Soins du Visage: Nettoyants, Crèmes de jour, etc.';
    RAISE NOTICE '   - Hygiène Bucco-dentaire: Brosses à dents, Dentifrices, etc.';
    RAISE NOTICE '   - Vitamines et Compléments: Multivitamines, Oméga-3, etc.';
    RAISE NOTICE '   - Premiers Soins: Pansements, Antiseptiques, etc.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors de la création de la pharmacie: %', SQLERRM;
END $$;

-- ============================================================================
-- ÉTAPE 3: VÉRIFICATION DES RÉSULTATS
-- ============================================================================

-- Afficher la pharmacie créée
SELECT 
  'Pharmacie créée:' as info;

SELECT 
  b.id,
  b.name,
  b.description,
  bt.name as business_type,
  b.address,
  b.phone,
  b.delivery_fee,
  b.delivery_time,
  b.is_active,
  b.is_open
FROM businesses b
JOIN business_types bt ON b.business_type_id = bt.id
WHERE b.name = 'Pharmacie Centrale de Conakry';

-- Afficher les catégories de la pharmacie
SELECT 
  'Catégories de la pharmacie:' as info;

SELECT 
  mc.name as category_name,
  mc.description as category_description,
  mc.sort_order,
  mc.is_active,
  COUNT(mi.id) as item_count
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
WHERE mc.business_id = (
    SELECT id FROM businesses WHERE name = 'Pharmacie Centrale de Conakry'
)
GROUP BY mc.id, mc.name, mc.description, mc.sort_order, mc.is_active
ORDER BY mc.sort_order;

-- ============================================================================
-- ÉTAPE 4: EXEMPLE D'AJOUT D'ARTICLES
-- ============================================================================

-- Exemple d'ajout d'articles dans les catégories
DO $$
DECLARE
    v_business_id INTEGER;
    v_category_id INTEGER;
BEGIN
    -- Récupérer l'ID de la pharmacie
    SELECT id INTO v_business_id 
    FROM businesses 
    WHERE name = 'Pharmacie Centrale de Conakry';

    -- Exemple: Ajouter un article dans "Médicaments en Vente Libre"
    SELECT id INTO v_category_id
    FROM menu_categories 
    WHERE business_id = v_business_id 
    AND name = 'Médicaments en Vente Libre';

    IF v_category_id IS NOT NULL THEN
        INSERT INTO menu_items (
            name,
            description,
            price,
            category_id,
            business_id,
            is_available,
            image_url,
            nutritional_info,
            allergens
        ) VALUES (
            'Paracétamol 500mg',
            'Antidouleur et antipyrétique. Boîte de 20 comprimés.',
            2500, -- Prix en GNF
            v_category_id,
            v_business_id,
            true,
            '/images/medicaments/paracetamol.jpg',
            '{"dosage": "500mg", "forme": "comprimé", "quantite": "20 comprimés"}',
            '["aucun"]'
        );

        RAISE NOTICE '✅ Article ajouté: Paracétamol 500mg dans "Médicaments en Vente Libre"';
    END IF;

    -- Exemple: Ajouter un article dans "Vitamines et Compléments"
    SELECT id INTO v_category_id
    FROM menu_categories 
    WHERE business_id = v_business_id 
    AND name = 'Vitamines et Compléments';

    IF v_category_id IS NOT NULL THEN
        INSERT INTO menu_items (
            name,
            description,
            price,
            category_id,
            business_id,
            is_available,
            image_url,
            nutritional_info,
            allergens
        ) VALUES (
            'Vitamine C 1000mg',
            'Complément alimentaire riche en vitamine C. Boîte de 30 comprimés effervescents.',
            4500, -- Prix en GNF
            v_category_id,
            v_business_id,
            true,
            '/images/vitamines/vitamine-c.jpg',
            '{"dosage": "1000mg", "forme": "comprimé effervescent", "quantite": "30 comprimés"}',
            '["aucun"]'
        );

        RAISE NOTICE '✅ Article ajouté: Vitamine C 1000mg dans "Vitamines et Compléments"';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors de l''ajout d''articles: %', SQLERRM;
END $$;

-- ============================================================================
-- ÉTAPE 5: AFFICHAGE FINAL
-- ============================================================================

-- Afficher un résumé final
SELECT 
  '📊 RÉSUMÉ FINAL' as info;

SELECT 
  'Pharmacie créée avec succès!' as result,
  'Toutes les catégories ont été créées automatiquement.' as details;

-- Afficher le nombre total d'articles
SELECT 
  'Nombre total d''articles ajoutés:' as info,
  COUNT(*) as total_items
FROM menu_items mi
JOIN businesses b ON mi.business_id = b.id
WHERE b.name = 'Pharmacie Centrale de Conakry';

-- ============================================================================
-- NETTOYAGE (OPTIONNEL)
-- ============================================================================

-- Pour nettoyer les données de test, décommentez les lignes suivantes:
/*
DELETE FROM menu_items WHERE business_id = (
    SELECT id FROM businesses WHERE name = 'Pharmacie Centrale de Conakry'
);

DELETE FROM menu_categories WHERE business_id = (
    SELECT id FROM businesses WHERE name = 'Pharmacie Centrale de Conakry'
);

DELETE FROM businesses WHERE name = 'Pharmacie Centrale de Conakry';

SELECT '🧹 Données de test supprimées' as cleanup_result;
*/

-- ============================================================================
-- MESSAGE DE SUCCÈS
-- ============================================================================

SELECT 
  '🎉 EXEMPLE TERMINÉ AVEC SUCCÈS!' as final_result,
  'La pharmacie a été créée avec toutes ses catégories automatiques.' as message; 