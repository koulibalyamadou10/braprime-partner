-- Script de débogage pour vérifier les données de menu
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- DÉBOGAGE DES DONNÉES DE MENU
-- ============================================================================

-- 1. Vérifier la structure de la table menu_categories
SELECT 
  'Structure de menu_categories:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'menu_categories' 
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table menu_items
SELECT 
  'Structure de menu_items:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- 3. Vérifier tous les commerces
SELECT 
  'Tous les commerces:' as info;
SELECT 
  id,
  name,
  cuisine_type,
  is_active,
  is_open
FROM businesses 
ORDER BY id;

-- 4. Vérifier toutes les catégories de menu
SELECT 
  'Toutes les catégories de menu:' as info;
SELECT 
  id,
  name,
  business_id,
  sort_order,
  created_at
FROM menu_categories 
ORDER BY business_id, sort_order;

-- 5. Vérifier tous les articles de menu
SELECT 
  'Tous les articles de menu:' as info;
SELECT 
  id,
  name,
  price,
  category_id,
  business_id,
  is_available,
  is_popular
FROM menu_items 
ORDER BY business_id, category_id;

-- 6. Vérifier les données pour le business ID 1 spécifiquement
SELECT 
  'Données pour business ID 1:' as info;

-- Catégories du business 1
SELECT 
  'Catégories du business 1:' as detail;
SELECT 
  id,
  name,
  business_id,
  sort_order
FROM menu_categories 
WHERE business_id = 1 
ORDER BY sort_order;

-- Articles du business 1
SELECT 
  'Articles du business 1:' as detail;
SELECT 
  mi.id,
  mi.name,
  mi.price,
  mi.category_id,
  mi.business_id,
  mi.is_available,
  mc.name as category_name
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1
ORDER BY mc.sort_order, mi.name;

-- 7. Compter les articles par business
SELECT 
  'Nombre d''articles par business:' as info;
SELECT 
  b.id,
  b.name,
  COUNT(mi.id) as total_items,
  COUNT(CASE WHEN mi.is_available = true THEN 1 END) as available_items,
  COUNT(mc.id) as total_categories
FROM businesses b
LEFT JOIN menu_categories mc ON b.id = mc.business_id
LEFT JOIN menu_items mi ON b.id = mi.business_id
GROUP BY b.id, b.name
ORDER BY b.id;

-- 8. Vérifier les articles sans catégorie
SELECT 
  'Articles sans catégorie:' as info;
SELECT 
  mi.id,
  mi.name,
  mi.business_id,
  mc.name as category_name
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mc.id IS NULL;

-- 9. Vérifier les catégories sans articles
SELECT 
  'Catégories sans articles:' as info;
SELECT 
  mc.id,
  mc.name,
  mc.business_id,
  COUNT(mi.id) as items_count
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
GROUP BY mc.id, mc.name, mc.business_id
HAVING COUNT(mi.id) = 0
ORDER BY mc.business_id, mc.sort_order;

-- 10. Test de la requête exacte utilisée par le service
SELECT 
  'Test de la requête du service:' as info;

-- Requête pour les catégories (comme dans le service)
SELECT 
  'Catégories (requête service):' as detail;
SELECT 
  id,
  name,
  business_id,
  sort_order
FROM menu_categories 
WHERE business_id = '1'  -- Notez que l'ID est passé comme string
ORDER BY sort_order;

-- Requête pour les articles (comme dans le service)
SELECT 
  'Articles (requête service):' as detail;
SELECT 
  id,
  name,
  description,
  price,
  image,
  is_popular,
  category_id,
  business_id,
  is_available,
  preparation_time,
  allergens,
  nutritional_info,
  created_at,
  updated_at
FROM menu_items 
WHERE business_id = '1' AND is_available = true
ORDER BY name; 