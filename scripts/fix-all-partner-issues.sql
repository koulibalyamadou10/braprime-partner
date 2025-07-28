-- SCRIPT COMPLET POUR CORRIGER TOUS LES PROBLÈMES PARTENAIRES
-- Ce script corrige les erreurs de clés étrangères, fonctions manquantes et vues

-- ============================================================================
-- 1. VÉRIFICATION ET CRÉATION DES TYPES DE BUSINESS
-- ============================================================================

-- Vérifier si la table business_types existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'business_types') THEN
    RAISE EXCEPTION 'La table business_types n''existe pas!';
  END IF;
END $$;

-- Supprimer les types existants pour éviter les doublons
DELETE FROM business_types WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- Insérer les types de business avec des IDs fixes
INSERT INTO business_types (id, name, icon, color, description, features) VALUES
(1, 'Restaurant', '🍽️', '#FF6B6B', 'Restaurants et établissements de restauration', '["menu_management", "delivery", "reservations", "analytics"]'),
(2, 'Café', '☕', '#4ECDC4', 'Cafés et établissements de boissons', '["menu_management", "delivery", "analytics"]'),
(3, 'Marché', '🛒', '#45B7D1', 'Marchés et épiceries locales', '["inventory_management", "delivery", "analytics"]'),
(4, 'Supermarché', '🏪', '#96CEB4', 'Supermarchés et grandes surfaces', '["inventory_management", "delivery", "analytics", "loyalty_program"]'),
(5, 'Pharmacie', '💊', '#FFEAA7', 'Pharmacies et parapharmacies', '["inventory_management", "delivery", "prescription_management"]'),
(6, 'Électronique', '📱', '#DDA0DD', 'Magasins d''électronique et technologie', '["inventory_management", "delivery", "warranty_management"]'),
(7, 'Beauté', '💄', '#FFB6C1', 'Salons de beauté et cosmétiques', '["appointment_booking", "delivery", "loyalty_program"]'),
(8, 'Autre', '🏢', '#A8E6CF', 'Autres types de commerces', '["basic_management", "delivery"]');

-- ============================================================================
-- 2. CRÉATION DE LA FONCTION GET_PARTNER_STATS
-- ============================================================================

-- Supprimer la fonction si elle existe déjà
DROP FUNCTION IF EXISTS get_partner_stats(INTEGER);

-- Créer la fonction get_partner_stats
CREATE OR REPLACE FUNCTION get_partner_stats(business_id_param INTEGER)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  average_order_value NUMERIC,
  completed_orders BIGINT,
  pending_orders BIGINT,
  cancelled_orders BIGINT,
  total_customers BIGINT,
  rating NUMERIC,
  review_count BIGINT,
  today_orders BIGINT,
  today_revenue NUMERIC,
  week_orders BIGINT,
  week_revenue NUMERIC,
  month_orders BIGINT,
  month_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH order_stats AS (
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(grand_total), 0) as total_revenue,
      COALESCE(AVG(grand_total), 0) as average_order_value,
      COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
      COUNT(DISTINCT user_id) as total_customers
    FROM orders 
    WHERE business_id = business_id_param
  ),
  period_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_orders,
      COALESCE(SUM(grand_total) FILTER (WHERE created_at >= CURRENT_DATE), 0) as today_revenue,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_orders,
      COALESCE(SUM(grand_total) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as week_revenue,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_orders,
      COALESCE(SUM(grand_total) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as month_revenue
    FROM orders 
    WHERE business_id = business_id_param
  ),
  review_stats AS (
    SELECT 
      COALESCE(AVG(rating), 0) as rating,
      COUNT(*) as review_count
    FROM reviews 
    WHERE business_id = business_id_param
  )
  SELECT 
    os.total_orders,
    os.total_revenue,
    os.average_order_value,
    os.completed_orders,
    os.pending_orders,
    os.cancelled_orders,
    os.total_customers,
    rs.rating,
    rs.review_count,
    ps.today_orders,
    ps.today_revenue,
    ps.week_orders,
    ps.week_revenue,
    ps.month_orders,
    ps.month_revenue
  FROM order_stats os
  CROSS JOIN period_stats ps
  CROSS JOIN review_stats rs;
END;
$$ LANGUAGE plpgsql;

-- Ajouter des commentaires à la fonction
COMMENT ON FUNCTION get_partner_stats(INTEGER) IS 'Récupère toutes les statistiques d''un partenaire en une seule requête optimisée';

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_partner_stats(INTEGER) TO authenticated;

-- ============================================================================
-- 3. CRÉATION DE LA VUE CART_DETAILS
-- ============================================================================

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS cart_details;

-- Créer la vue cart_details
CREATE OR REPLACE VIEW cart_details AS
SELECT 
  c.id as cart_id,
  c.user_id,
  c.business_id,
  c.business_name,
  c.items,
  c.delivery_method,
  c.delivery_address,
  c.delivery_instructions,
  c.created_at as cart_created_at,
  c.updated_at as cart_updated_at,
  
  -- Informations du business
  b.name as business_name_full,
  b.address as business_address,
  b.phone as business_phone,
  b.email as business_email,
  b.opening_hours,
  b.delivery_time,
  b.delivery_fee,
  b.is_open,
  b.is_active,
  
  -- Informations de l'utilisateur
  up.name as user_name,
  up.email as user_email,
  up.phone_number as user_phone,
  
  -- Calculs du panier
  (
    SELECT COALESCE(SUM(
      (item->>'price')::numeric * (item->>'quantity')::integer
    ), 0)
    FROM jsonb_array_elements(c.items) as item
  ) as total_items_price,
  
  -- Nombre total d'items
  (
    SELECT COALESCE(SUM((item->>'quantity')::integer), 0)
    FROM jsonb_array_elements(c.items) as item
  ) as total_items_count,
  
  -- Nombre d'items uniques
  jsonb_array_length(c.items) as unique_items_count,
  
  -- Total final avec frais de livraison
  (
    SELECT COALESCE(SUM(
      (item->>'price')::numeric * (item->>'quantity')::integer
    ), 0)
    FROM jsonb_array_elements(c.items) as item
  ) + COALESCE(b.delivery_fee, 0) as grand_total

FROM cart c
LEFT JOIN businesses b ON c.business_id = b.id
LEFT JOIN user_profiles up ON c.user_id = up.id
WHERE c.items IS NOT NULL AND jsonb_array_length(c.items) > 0;

-- Ajouter des commentaires à la vue
COMMENT ON VIEW cart_details IS 'Vue détaillée du panier avec informations business et utilisateur';

-- Donner les permissions de lecture
GRANT SELECT ON cart_details TO authenticated, anon;

-- ============================================================================
-- 4. VÉRIFICATION DES RÔLES UTILISATEURS
-- ============================================================================

-- Vérifier si les rôles existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'partner') THEN
    INSERT INTO user_roles (name, description) VALUES ('partner', 'Propriétaire de commerce');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'customer') THEN
    INSERT INTO user_roles (name, description) VALUES ('customer', 'Client');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'driver') THEN
    INSERT INTO user_roles (name, description) VALUES ('driver', 'Chauffeur de livraison');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'admin') THEN
    INSERT INTO user_roles (name, description) VALUES ('admin', 'Administrateur');
  END IF;
END $$;

-- ============================================================================
-- 5. VÉRIFICATION FINALE
-- ============================================================================

-- Afficher les types de business créés
SELECT 'Types de business créés:' as info;
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- Vérifier que la fonction existe
SELECT 'Fonction get_partner_stats:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_partner_stats';

-- Vérifier que la vue existe
SELECT 'Vue cart_details:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'cart_details';

-- Vérifier les rôles
SELECT 'Rôles utilisateurs:' as info;
SELECT id, name, description FROM user_roles ORDER BY id;

-- Message de confirmation final
SELECT '✅ Tous les problèmes partenaires ont été corrigés!' as message; 