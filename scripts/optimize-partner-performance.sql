-- Script d'optimisation des performances pour les partenaires
-- À exécuter dans Supabase SQL Editor

-- 1. INDEX POUR OPTIMISER LES REQUÊTES PARTENAIRES

-- Index sur les commandes par business et date
CREATE INDEX IF NOT EXISTS idx_orders_business_created_at 
ON orders(business_id, created_at DESC);

-- Index sur les commandes par statut et business
CREATE INDEX IF NOT EXISTS idx_orders_business_status 
ON orders(business_id, status);

-- Index sur les articles de menu par business et catégorie
CREATE INDEX IF NOT EXISTS idx_menu_items_business_category 
ON menu_items(business_id, category_id, sort_order);

-- Index sur les catégories de menu par business
CREATE INDEX IF NOT EXISTS idx_menu_categories_business 
ON menu_categories(business_id, sort_order);

-- Index sur les livreurs par business et statut
CREATE INDEX IF NOT EXISTS idx_drivers_business_active 
ON drivers(business_id, is_active);

-- Index sur les avis par business et date
CREATE INDEX IF NOT EXISTS idx_reviews_business_created 
ON reviews(business_id, created_at DESC);

-- Index sur les notifications par user_id et date (corrigé)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Index composite pour les statistiques de revenus
CREATE INDEX IF NOT EXISTS idx_orders_business_status_total 
ON orders(business_id, status, grand_total, created_at);

-- 2. FONCTION RPC POUR LES STATISTIQUES PARTENAIRES (optimisée)

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
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
      COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as total_customers
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
$$;

-- 3. FONCTION RPC POUR LES DONNÉES DE REVENUS (optimisée)

CREATE OR REPLACE FUNCTION get_partner_revenue_data(
  business_id_param INTEGER,
  period_param TEXT DEFAULT 'monthly'
)
RETURNS TABLE (
  date_label TEXT,
  revenue NUMERIC,
  orders_count BIGINT,
  average_order_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CASE 
        WHEN period_param = 'daily' THEN CURRENT_DATE - INTERVAL '30 days'
        WHEN period_param = 'weekly' THEN CURRENT_DATE - INTERVAL '12 weeks'
        WHEN period_param = 'monthly' THEN CURRENT_DATE - INTERVAL '12 months'
        ELSE CURRENT_DATE - INTERVAL '12 months'
      END,
      CURRENT_DATE,
      CASE 
        WHEN period_param = 'daily' THEN INTERVAL '1 day'
        WHEN period_param = 'weekly' THEN INTERVAL '1 week'
        WHEN period_param = 'monthly' THEN INTERVAL '1 month'
        ELSE INTERVAL '1 month'
      END
    )::DATE as date
  ),
  order_aggregates AS (
    SELECT 
      CASE 
        WHEN period_param = 'daily' THEN DATE(created_at)
        WHEN period_param = 'weekly' THEN DATE_TRUNC('week', created_at)::DATE
        WHEN period_param = 'monthly' THEN DATE_TRUNC('month', created_at)::DATE
        ELSE DATE_TRUNC('month', created_at)::DATE
      END as order_date,
      SUM(grand_total) as daily_revenue,
      COUNT(*) as daily_orders,
      AVG(grand_total) as daily_avg
    FROM orders 
    WHERE business_id = business_id_param
      AND status = 'delivered'
    GROUP BY 
      CASE 
        WHEN period_param = 'daily' THEN DATE(created_at)
        WHEN period_param = 'weekly' THEN DATE_TRUNC('week', created_at)::DATE
        WHEN period_param = 'monthly' THEN DATE_TRUNC('month', created_at)::DATE
        ELSE DATE_TRUNC('month', created_at)::DATE
      END
  )
  SELECT 
    CASE 
      WHEN period_param = 'daily' THEN ds.date::TEXT
      WHEN period_param = 'weekly' THEN 'Semaine ' || TO_CHAR(ds.date, 'IYYY-"W"IW')
      WHEN period_param = 'monthly' THEN TO_CHAR(ds.date, 'Mon YYYY')
      ELSE TO_CHAR(ds.date, 'Mon YYYY')
    END as date_label,
    COALESCE(oa.daily_revenue, 0) as revenue,
    COALESCE(oa.daily_orders, 0) as orders_count,
    COALESCE(oa.daily_avg, 0) as average_order_value
  FROM date_series ds
  LEFT JOIN order_aggregates oa ON ds.date = oa.order_date
  ORDER BY ds.date;
END;
$$;

-- 4. FONCTION RPC POUR LES ARTICLES POPULAIRES (optimisée)

CREATE OR REPLACE FUNCTION get_partner_top_items(
  business_id_param INTEGER,
  period_param TEXT DEFAULT 'monthly',
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
  item_id INTEGER,
  item_name TEXT,
  category_name TEXT,
  total_quantity BIGINT,
  total_revenue NUMERIC,
  average_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH   order_items AS (
    SELECT 
      (item->>'id')::INTEGER as item_id,
      item->>'name' as item_name,
      SUM((item->>'quantity')::INTEGER) as total_quantity,
      SUM((item->>'price')::INTEGER * (item->>'quantity')::INTEGER) as total_revenue
    FROM orders o,
         jsonb_array_elements(o.items) as item
    WHERE o.business_id = business_id_param
      AND o.status = 'delivered'
      AND o.created_at >= CASE 
        WHEN period_param = 'daily' THEN CURRENT_DATE - INTERVAL '30 days'
        WHEN period_param = 'weekly' THEN CURRENT_DATE - INTERVAL '12 weeks'
        WHEN period_param = 'monthly' THEN CURRENT_DATE - INTERVAL '12 months'
        ELSE CURRENT_DATE - INTERVAL '12 months'
      END
    GROUP BY (item->>'id')::INTEGER, item->>'name'
  ),
  item_ratings AS (
    SELECT 
      mi.id as item_id,
      AVG(r.rating) as average_rating
    FROM menu_items mi
    LEFT JOIN reviews r ON r.business_id = mi.business_id
    WHERE mi.business_id = business_id_param
    GROUP BY mi.id
  )
  SELECT 
    oi.item_id,
    oi.item_name,
    mc.name as category_name,
    oi.total_quantity,
    oi.total_revenue,
    COALESCE(ir.average_rating, 0) as average_rating
  FROM order_items oi
  LEFT JOIN menu_items mi ON mi.id = oi.item_id
  LEFT JOIN menu_categories mc ON mc.id = mi.category_id
  LEFT JOIN item_ratings ir ON ir.item_id = oi.item_id
  ORDER BY oi.total_quantity DESC, oi.total_revenue DESC
  LIMIT limit_param;
END;
$$;

-- 5. VUE MATÉRIALISÉE POUR LES STATISTIQUES RAPIDES

CREATE MATERIALIZED VIEW IF NOT EXISTS partner_dashboard_stats AS
SELECT 
  b.id as business_id,
  b.name as business_name,
  COUNT(o.id) as total_orders,
  COALESCE(SUM(o.grand_total), 0) as total_revenue,
  COALESCE(AVG(o.grand_total), 0) as average_order_value,
  COUNT(*) FILTER (WHERE o.status = 'delivered') as completed_orders,
  COUNT(*) FILTER (WHERE o.status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE o.status = 'cancelled') as cancelled_orders,
  COUNT(DISTINCT o.user_id) FILTER (WHERE o.user_id IS NOT NULL) as total_customers,
  COALESCE(AVG(r.rating), 0) as rating,
  COUNT(r.id) as review_count,
  COUNT(*) FILTER (WHERE o.created_at >= CURRENT_DATE) as today_orders,
  COALESCE(SUM(o.grand_total) FILTER (WHERE o.created_at >= CURRENT_DATE), 0) as today_revenue,
  COUNT(*) FILTER (WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days') as week_orders,
  COALESCE(SUM(o.grand_total) FILTER (WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as week_revenue,
  COUNT(*) FILTER (WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days') as month_orders,
  COALESCE(SUM(o.grand_total) FILTER (WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as month_revenue,
  NOW() as last_updated
FROM businesses b
LEFT JOIN orders o ON o.business_id = b.id
LEFT JOIN reviews r ON r.business_id = b.id
WHERE b.is_active = true
GROUP BY b.id, b.name;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_dashboard_stats_business 
ON partner_dashboard_stats(business_id);

-- 6. FONCTION POUR RAFRAÎCHIR LA VUE MATÉRIALISÉE

CREATE OR REPLACE FUNCTION refresh_partner_dashboard_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY partner_dashboard_stats;
END;
$$;

-- 7. TRIGGER POUR MAINTENIR LA VUE MATÉRIALISÉE À JOUR

CREATE OR REPLACE FUNCTION trigger_refresh_partner_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Rafraîchir la vue matérialisée de manière différée
  PERFORM pg_notify('refresh_partner_stats', '');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer les triggers
DROP TRIGGER IF EXISTS trigger_orders_partner_stats ON orders;
CREATE TRIGGER trigger_orders_partner_stats
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_partner_stats();

DROP TRIGGER IF EXISTS trigger_reviews_partner_stats ON reviews;
CREATE TRIGGER trigger_reviews_partner_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_partner_stats();

-- 8. FONCTION POUR LES NOTIFICATIONS EN TEMPS RÉEL

CREATE OR REPLACE FUNCTION notify_partner_order_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'partner_order_update',
      json_build_object(
        'business_id', NEW.business_id,
        'order_id', NEW.id,
        'status', NEW.status,
        'action', 'created'
      )::text
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM pg_notify(
      'partner_order_update',
      json_build_object(
        'business_id', NEW.business_id,
        'order_id', NEW.id,
        'status', NEW.status,
        'action', 'updated'
      )::text
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer le trigger pour les notifications
DROP TRIGGER IF EXISTS trigger_notify_partner_order ON orders;
CREATE TRIGGER trigger_notify_partner_order
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_partner_order_update();

-- 9. FONCTION POUR OPTIMISER LES REQUÊTES DE PAGINATION

CREATE OR REPLACE FUNCTION get_partner_orders_paginated(
  business_id_param INTEGER,
  page_size INTEGER DEFAULT 10,
  page_number INTEGER DEFAULT 1,
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  orders JSON,
  total_count BIGINT,
  total_pages INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val INTEGER;
  total_count_val BIGINT;
  total_pages_val INTEGER;
BEGIN
  offset_val := (page_number - 1) * page_size;
  
  -- Compter le total
  SELECT COUNT(*) INTO total_count_val
  FROM orders o
  WHERE o.business_id = business_id_param
    AND (status_filter IS NULL OR o.status = status_filter);
  
  total_pages_val := CEIL(total_count_val::NUMERIC / page_size);
  
  RETURN QUERY
  SELECT 
    COALESCE(
      json_agg(
        json_build_object(
          'id', o.id,
          'user_id', o.user_id,
          'customer_name', up.name,
          'customer_phone', up.phone_number,
          'items', o.items,
          'status', o.status,
          'total', o.total,
          'delivery_fee', o.delivery_fee,
          'grand_total', o.grand_total,
          'delivery_address', o.delivery_address,
          'delivery_instructions', o.delivery_instructions,
          'payment_method', o.payment_method,
          'payment_status', o.payment_status,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'estimated_delivery', o.estimated_delivery,
          'driver_name', o.driver_name,
          'driver_phone', o.driver_phone
        )
      ),
      '[]'::json
    ) as orders,
    total_count_val as total_count,
    total_pages_val as total_pages
  FROM orders o
  LEFT JOIN user_profiles up ON up.id = o.user_id
  WHERE o.business_id = business_id_param
    AND (status_filter IS NULL OR o.status = status_filter)
  ORDER BY o.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- 10. FONCTION POUR RÉCUPÉRER LES NOTIFICATIONS D'UN PARTENAIRE (corrigée)

CREATE OR REPLACE FUNCTION get_partner_notifications(
  business_owner_id UUID,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  notifications JSON,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count_val BIGINT;
BEGIN
  -- Compter le total des notifications pour le propriétaire du business
  SELECT COUNT(*) INTO total_count_val
  FROM notifications n
  WHERE n.user_id = business_owner_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(
      json_agg(
        json_build_object(
          'id', n.id,
          'type', n.type,
          'title', n.title,
          'message', n.message,
          'priority', n.priority,
          'is_read', n.is_read,
          'data', n.data,
          'expires_at', n.expires_at,
          'created_at', n.created_at
        )
      ),
      '[]'::json
    ) as notifications,
    total_count_val as total_count
  FROM notifications n
  WHERE n.user_id = business_owner_id
  ORDER BY n.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- 11. COMMENTAIRES POUR LA DOCUMENTATION

COMMENT ON FUNCTION get_partner_stats(INTEGER) IS 'Récupère toutes les statistiques d''un partenaire en une seule requête optimisée';
COMMENT ON FUNCTION get_partner_revenue_data(INTEGER, TEXT) IS 'Récupère les données de revenus pour les graphiques avec pagination temporelle';
COMMENT ON FUNCTION get_partner_top_items(INTEGER, TEXT, INTEGER) IS 'Récupère les articles les plus populaires d''un partenaire';
COMMENT ON MATERIALIZED VIEW partner_dashboard_stats IS 'Vue matérialisée pour les statistiques rapides du dashboard partenaire';
COMMENT ON FUNCTION get_partner_orders_paginated(INTEGER, INTEGER, INTEGER, TEXT) IS 'Récupère les commandes avec pagination optimisée';
COMMENT ON FUNCTION get_partner_notifications(UUID, INTEGER, INTEGER) IS 'Récupère les notifications d''un partenaire avec pagination';

-- 12. GRANT DES PERMISSIONS

-- Donner les permissions aux rôles appropriés
GRANT EXECUTE ON FUNCTION get_partner_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_revenue_data(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_top_items(INTEGER, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_orders_paginated(INTEGER, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_notifications(UUID, INTEGER, INTEGER) TO authenticated;
GRANT SELECT ON partner_dashboard_stats TO authenticated;

-- 13. MESSAGE DE CONFIRMATION

DO $$
BEGIN
  RAISE NOTICE 'Optimisations des performances partenaires terminées avec succès!';
  RAISE NOTICE 'Index créés: 8';
  RAISE NOTICE 'Fonctions RPC créées: 5';
  RAISE NOTICE 'Vue matérialisée créée: 1';
  RAISE NOTICE 'Triggers créés: 3';
  RAISE NOTICE 'Correction: Suppression des références à business_id dans notifications';
END $$; 