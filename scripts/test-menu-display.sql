-- Script de test pour vérifier l'affichage des articles de menu
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- VÉRIFICATION DES DONNÉES DE MENU POUR LE SERVICE ID 1
-- ============================================================================

-- 1. Vérifier le service
SELECT 
  'Service ID 1:' as info;
SELECT 
  id,
  name,
  cuisine_type,
  rating,
  review_count,
  delivery_time,
  delivery_fee,
  is_active
FROM businesses 
WHERE id = 1;

-- 2. Vérifier les catégories de menu
SELECT 
  'Catégories de menu:' as info;
SELECT 
  id,
  name,
  sort_order,
  is_active,
  created_at
FROM menu_categories 
WHERE business_id = 1 
ORDER BY sort_order;

-- 3. Vérifier les articles de menu
SELECT 
  'Articles de menu:' as info;
SELECT 
  mi.id,
  mi.name,
  mi.price,
  mi.is_popular,
  mi.is_available,
  mi.preparation_time,
  mc.name as category_name,
  mi.allergens,
  mi.nutritional_info
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1
ORDER BY mc.sort_order, mi.name;

-- 4. Compter les articles par catégorie
SELECT 
  'Nombre d''articles par catégorie:' as info;
SELECT 
  mc.name as category_name,
  COUNT(mi.id) as items_count,
  COUNT(CASE WHEN mi.is_popular = true THEN 1 END) as popular_items,
  COUNT(CASE WHEN mi.is_available = true THEN 1 END) as available_items
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
WHERE mc.business_id = 1
GROUP BY mc.id, mc.name, mc.sort_order
ORDER BY mc.sort_order;

-- 5. Vérifier les articles populaires
SELECT 
  'Articles populaires:' as info;
SELECT 
  mi.name,
  mi.price,
  mc.name as category_name,
  mi.preparation_time
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1 AND mi.is_popular = true
ORDER BY mc.sort_order, mi.name;

-- 6. Vérifier les articles avec allergènes
SELECT 
  'Articles avec allergènes:' as info;
SELECT 
  mi.name,
  mi.allergens,
  mc.name as category_name
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1 AND mi.allergens IS NOT NULL AND jsonb_array_length(mi.allergens) > 0
ORDER BY mc.sort_order, mi.name;

-- 7. Vérifier les informations nutritionnelles
SELECT 
  'Articles avec infos nutritionnelles:' as info;
SELECT 
  mi.name,
  mi.nutritional_info,
  mc.name as category_name
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1 AND mi.nutritional_info IS NOT NULL
ORDER BY mc.sort_order, mi.name;

-- 8. Résumé final
SELECT 
  'Résumé final:' as info;
SELECT 
  'Service' as type,
  COUNT(*) as count
FROM businesses 
WHERE id = 1
UNION ALL
SELECT 
  'Catégories' as type,
  COUNT(*) as count
FROM menu_categories 
WHERE business_id = 1 AND is_active = true
UNION ALL
SELECT 
  'Articles' as type,
  COUNT(*) as count
FROM menu_items 
WHERE business_id = 1 AND is_available = true
UNION ALL
SELECT 
  'Articles populaires' as type,
  COUNT(*) as count
FROM menu_items 
WHERE business_id = 1 AND is_popular = true;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

SELECT 
  'Test terminé !' as status,
  'Vérifiez que toutes les données sont présentes pour l''affichage du menu.' as message; 