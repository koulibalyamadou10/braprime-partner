-- ============================================================================
-- SCRIPT DE TEST ET OPTIMISATION DES PERFORMANCES
-- ============================================================================
-- Ce script teste et optimise les requêtes de la page d'accueil

-- ============================================================================
-- VÉRIFICATION DES INDEX EXISTANTS
-- ============================================================================

-- Afficher les index existants pour les tables principales
SELECT 
  'Index existants:' as info;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('businesses', 'menu_items', 'menu_categories', 'categories', 'orders')
ORDER BY tablename, indexname;

-- ============================================================================
-- ANALYSE DES PERFORMANCES DES REQUÊTES
-- ============================================================================

-- Analyser la table businesses
ANALYZE businesses;

-- Analyser la table menu_items
ANALYZE menu_items;

-- Analyser la table menu_categories
ANALYZE menu_categories;

-- Analyser la table categories
ANALYZE categories;

-- Analyser la table orders
ANALYZE orders;

-- ============================================================================
-- CRÉATION D'INDEX OPTIMISÉS
-- ============================================================================

-- Index pour les requêtes de statistiques
CREATE INDEX IF NOT EXISTS idx_businesses_active_rating 
ON businesses(is_active, rating DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_menu_items_available_popular 
ON menu_items(is_available, is_popular, created_at DESC) 
WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_menu_categories_business_active 
ON menu_categories(business_id, is_active, sort_order) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_categories_active 
ON categories(is_active, name) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Index pour les jointures fréquentes
CREATE INDEX IF NOT EXISTS idx_menu_items_business_category 
ON menu_items(business_id, menu_category_id);

CREATE INDEX IF NOT EXISTS idx_businesses_type_active 
ON businesses(business_type_id, is_active) 
WHERE is_active = true;

-- ============================================================================
-- TEST DES REQUÊTES OPTIMISÉES
-- ============================================================================

-- Test de la requête des statistiques
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT o.customer_id) as total_customers,
  COALESCE(AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.created_at))/60), 30) as avg_delivery_time
FROM businesses b
LEFT JOIN orders o ON b.id = o.business_id
WHERE b.is_active = true;

-- Test de la requête des restaurants populaires
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  b.*,
  COUNT(o.id) as order_count
FROM businesses b
LEFT JOIN orders o ON b.id = o.business_id
WHERE b.is_active = true
GROUP BY b.id
ORDER BY b.rating DESC, order_count DESC
LIMIT 8;

-- Test de la requête des articles en vedette
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  mi.*,
  b.name as business_name,
  b.cuisine_type,
  mc.name as category_name
FROM menu_items mi
JOIN businesses b ON mi.business_id = b.id
LEFT JOIN menu_categories mc ON mi.menu_category_id = mc.id
WHERE mi.is_available = true 
  AND (mi.is_popular = true OR mi.is_featured = true)
  AND b.is_active = true
ORDER BY mi.created_at DESC
LIMIT 8;

-- ============================================================================
-- OPTIMISATION DES VUES
-- ============================================================================

-- Créer une vue optimisée pour les statistiques
CREATE OR REPLACE VIEW homepage_stats_view AS
SELECT 
  (SELECT COUNT(*) FROM businesses WHERE is_active = true) as total_restaurants,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(DISTINCT customer_id) FROM orders) as total_customers,
  COALESCE(
    (SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))/60) 
     FROM orders 
     WHERE delivered_at IS NOT NULL), 
    30
  ) as average_delivery_time;

-- Créer une vue optimisée pour les restaurants populaires
CREATE OR REPLACE VIEW popular_restaurants_view AS
SELECT 
  b.*,
  COUNT(o.id) as order_count,
  ROW_NUMBER() OVER (ORDER BY b.rating DESC, COUNT(o.id) DESC) as rank
FROM businesses b
LEFT JOIN orders o ON b.id = o.business_id
WHERE b.is_active = true
GROUP BY b.id, b.name, b.description, b.cuisine_type, b.cover_image, 
         b.logo, b.rating, b.review_count, b.delivery_time, b.delivery_fee, 
         b.address, b.is_popular, b.created_at, b.updated_at;

-- ============================================================================
-- TEST DES VUES OPTIMISÉES
-- ============================================================================

-- Test de la vue des statistiques
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM homepage_stats_view;

-- Test de la vue des restaurants populaires
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM popular_restaurants_view WHERE rank <= 8;

-- ============================================================================
-- RÉSULTATS DES TESTS
-- ============================================================================

SELECT 
  '✅ Optimisations terminées!' as result,
  'Les index et vues ont été créés pour améliorer les performances.' as message;

-- Afficher les nouvelles statistiques
SELECT 
  'Nouvelles statistiques de performance:' as info;

SELECT 
  schemaname,
  tablename,
  n_tup_ins as insertions,
  n_tup_upd as updates,
  n_tup_del as deletions,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE tablename IN ('businesses', 'menu_items', 'menu_categories', 'categories', 'orders')
ORDER BY tablename; 