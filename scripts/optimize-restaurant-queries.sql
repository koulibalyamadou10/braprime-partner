-- ============================================================================
-- SCRIPT D'OPTIMISATION DES REQUÊTES RESTAURANT
-- ============================================================================
-- Ce script optimise les requêtes de la page restaurant pour améliorer les performances

-- ============================================================================
-- ANALYSE DES TABLES
-- ============================================================================

-- Analyser les tables pour optimiser les requêtes
ANALYZE businesses;
ANALYZE menu_categories;
ANALYZE menu_items;

-- ============================================================================
-- CRÉATION D'INDEX OPTIMISÉS
-- ============================================================================

-- Index pour les requêtes de business
CREATE INDEX IF NOT EXISTS idx_businesses_active_id 
ON businesses(id) 
WHERE is_active = true;

-- Index pour les catégories de menu par business
CREATE INDEX IF NOT EXISTS idx_menu_categories_business_active_sort 
ON menu_categories(business_id, is_active, sort_order) 
WHERE is_active = true;

-- Index pour les articles de menu par business
CREATE INDEX IF NOT EXISTS idx_menu_items_business_available_created 
ON menu_items(business_id, is_available, created_at DESC) 
WHERE is_available = true;

-- Index pour le filtrage par catégorie
CREATE INDEX IF NOT EXISTS idx_menu_items_category_business 
ON menu_items(category_id, business_id, is_available) 
WHERE is_available = true;

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_businesses_complete 
ON businesses(id, name, cuisine_type, rating, delivery_time, is_active) 
WHERE is_active = true;

-- ============================================================================
-- VUES OPTIMISÉES
-- ============================================================================

-- Vue pour les données complètes d'un restaurant
CREATE OR REPLACE VIEW restaurant_complete_data AS
SELECT 
  b.*,
  ARRAY_AGG(DISTINCT mc.id) as category_ids,
  ARRAY_AGG(DISTINCT mc.name) as category_names,
  COUNT(mi.id) as menu_item_count
FROM businesses b
LEFT JOIN menu_categories mc ON b.id = mc.business_id AND mc.is_active = true
LEFT JOIN menu_items mi ON b.id = mi.business_id AND mi.is_available = true
WHERE b.is_active = true
GROUP BY b.id, b.name, b.description, b.cuisine_type, b.cover_image, 
         b.logo, b.rating, b.review_count, b.delivery_time, b.delivery_fee, 
         b.address, b.phone, b.opening_hours, b.is_popular, b.created_at, b.updated_at;

-- Vue pour les articles de menu avec catégories
CREATE OR REPLACE VIEW menu_items_with_categories AS
SELECT 
  mi.*,
  mc.name as category_name,
  mc.sort_order as category_sort_order
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.is_available = true AND mc.is_active = true
ORDER BY mc.sort_order, mi.created_at DESC;

-- ============================================================================
-- FONCTIONS OPTIMISÉES
-- ============================================================================

-- Fonction pour récupérer toutes les données d'un restaurant
CREATE OR REPLACE FUNCTION get_restaurant_complete_data(business_id_param INTEGER)
RETURNS TABLE (
  business_data JSONB,
  categories_data JSONB,
  menu_items_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT to_jsonb(b.*) FROM businesses b WHERE b.id = business_id_param AND b.is_active = true) as business_data,
    (SELECT to_jsonb(array_agg(mc.*)) FROM menu_categories mc WHERE mc.business_id = business_id_param AND mc.is_active = true ORDER BY mc.sort_order) as categories_data,
    (SELECT to_jsonb(array_agg(mi.*)) FROM menu_items mi WHERE mi.business_id = business_id_param AND mi.is_available = true ORDER BY mi.created_at DESC) as menu_items_data;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer les données essentielles d'un restaurant
CREATE OR REPLACE FUNCTION get_restaurant_essential_data(business_id_param INTEGER)
RETURNS TABLE (
  business_data JSONB,
  categories_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT to_jsonb(b.*) FROM businesses b WHERE b.id = business_id_param AND b.is_active = true) as business_data,
    (SELECT to_jsonb(array_agg(mc.*)) FROM menu_categories mc WHERE mc.business_id = business_id_param AND mc.is_active = true ORDER BY mc.sort_order) as categories_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TEST DES OPTIMISATIONS
-- ============================================================================

-- Test de la fonction complète
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM get_restaurant_complete_data(1);

-- Test de la fonction essentielle
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM get_restaurant_essential_data(1);

-- Test de la vue complète
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM restaurant_complete_data WHERE id = 1;

-- Test de la vue des articles avec catégories
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM menu_items_with_categories WHERE business_id = 1;

-- ============================================================================
-- STATISTIQUES DE PERFORMANCE
-- ============================================================================

-- Afficher les statistiques des index
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename IN ('businesses', 'menu_categories', 'menu_items')
ORDER BY tablename, indexname;

-- Afficher les statistiques des tables
SELECT 
  schemaname,
  tablename,
  n_tup_ins as insertions,
  n_tup_upd as updates,
  n_tup_del as deletions,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables 
WHERE tablename IN ('businesses', 'menu_categories', 'menu_items')
ORDER BY tablename;

-- ============================================================================
-- RÉSULTATS
-- ============================================================================

SELECT 
  '✅ Optimisations terminées!' as result,
  'Les index et vues ont été créés pour améliorer les performances des requêtes restaurant.' as message;

SELECT 
  '📊 Statistiques des optimisations:' as info;

SELECT 
  'Index créés: 5' as index_count,
  'Vues créées: 2' as view_count,
  'Fonctions créées: 2' as function_count; 