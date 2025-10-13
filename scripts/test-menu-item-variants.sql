-- Script de test pour vérifier l'enregistrement des variantes

-- 1. Vérifier que la table existe
SELECT 'Table menu_item_variants existe:' as check_name, 
       EXISTS (
           SELECT 1 
           FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = 'menu_item_variants'
       ) as result;

-- 2. Afficher la structure de la table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'menu_item_variants'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes (clés étrangères)
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON rc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'menu_item_variants'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. Afficher tous les menu_items avec leurs variantes
SELECT 
    mi.id,
    mi.name,
    mi.business_id,
    COUNT(miv.id) as variant_count
FROM menu_items mi
LEFT JOIN menu_item_variants miv ON mi.id = miv.menu_item_id
GROUP BY mi.id, mi.name, mi.business_id
HAVING COUNT(miv.id) > 0
ORDER BY mi.id DESC
LIMIT 10;

-- 5. Afficher les détails des variantes récentes
SELECT 
    miv.id,
    miv.menu_item_id,
    mi.name as item_name,
    miv.variant_type,
    miv.variant_value,
    miv.price_adjustment,
    miv.stock_quantity,
    miv.is_available,
    miv.sku,
    miv.sort_order,
    miv.created_at
FROM menu_item_variants miv
JOIN menu_items mi ON miv.menu_item_id = mi.id
ORDER BY miv.created_at DESC
LIMIT 20;

-- 6. Statistiques globales
SELECT 
    'Total variantes' as metric,
    COUNT(*) as value
FROM menu_item_variants
UNION ALL
SELECT 
    'Articles avec variantes',
    COUNT(DISTINCT menu_item_id)
FROM menu_item_variants
UNION ALL
SELECT 
    'Variantes disponibles',
    COUNT(*)
FROM menu_item_variants
WHERE is_available = true
UNION ALL
SELECT 
    'Variantes indisponibles',
    COUNT(*)
FROM menu_item_variants
WHERE is_available = false;

-- 7. Test d'insertion (commenté, décommenter pour tester)
/*
-- Créer un article de test
INSERT INTO menu_items (name, description, price, business_id, category_id, track_stock)
VALUES ('T-shirt Test', 'Article de test pour variantes', 35000, 84, 1, true)
RETURNING id;

-- Insérer des variantes (remplacer <ID> par l'ID retourné ci-dessus)
INSERT INTO menu_item_variants (menu_item_id, variant_type, variant_value, price_adjustment, stock_quantity, is_available, sort_order)
VALUES 
    (<ID>, 'taille', 'S', 0, 15, true, 0),
    (<ID>, 'taille', 'M', 0, 20, true, 1),
    (<ID>, 'taille', 'L', 2000, 10, true, 2),
    (<ID>, 'taille', 'XL', 2000, 5, true, 3);

-- Vérifier l'insertion
SELECT * FROM menu_item_variants WHERE menu_item_id = <ID>;
*/

