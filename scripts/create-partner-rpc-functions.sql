-- =====================================================
-- FONCTIONS RPC POUR OPTIMISER LE DASHBOARD PARTENAIRE
-- =====================================================
-- Ces fonctions remplacent les requêtes multiples côté client
-- par des calculs optimisés côté serveur PostgreSQL
-- =====================================================

-- =====================================================
-- 1. FONCTION : get_partner_stats
-- =====================================================
-- Remplace getPartnerStatsFallback()
-- Calcule toutes les statistiques en une seule requête
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_stats(p_business_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_today TIMESTAMP;
  v_week_ago TIMESTAMP;
  v_month_ago TIMESTAMP;
BEGIN
  -- Définir les périodes
  v_today := CURRENT_DATE;
  v_week_ago := v_today - INTERVAL '7 days';
  v_month_ago := v_today - INTERVAL '30 days';

  -- Calculer toutes les statistiques en une seule requête
  WITH order_stats AS (
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(grand_total), 0) as total_revenue,
      COALESCE(AVG(grand_total), 0) as average_order_value,
      COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
      COUNT(DISTINCT user_id) as total_customers,
      COUNT(*) FILTER (WHERE created_at >= v_today) as today_orders,
      COALESCE(SUM(grand_total) FILTER (WHERE created_at >= v_today), 0) as today_revenue,
      COUNT(*) FILTER (WHERE created_at >= v_week_ago) as week_orders,
      COALESCE(SUM(grand_total) FILTER (WHERE created_at >= v_week_ago), 0) as week_revenue,
      COUNT(*) FILTER (WHERE created_at >= v_month_ago) as month_orders,
      COALESCE(SUM(grand_total) FILTER (WHERE created_at >= v_month_ago), 0) as month_revenue
    FROM orders
    WHERE business_id = p_business_id
  ),
  review_stats AS (
    SELECT
      COUNT(*) as review_count,
      COALESCE(AVG(rating), 0) as rating
    FROM reviews
    WHERE business_id = p_business_id
  )
  SELECT json_build_object(
    'totalOrders', os.total_orders,
    'totalRevenue', os.total_revenue,
    'averageOrderValue', os.average_order_value,
    'completedOrders', os.completed_orders,
    'pendingOrders', os.pending_orders,
    'cancelledOrders', os.cancelled_orders,
    'totalCustomers', os.total_customers,
    'rating', rs.rating,
    'reviewCount', rs.review_count,
    'todayOrders', os.today_orders,
    'todayRevenue', os.today_revenue,
    'weekOrders', os.week_orders,
    'weekRevenue', os.week_revenue,
    'monthOrders', os.month_orders,
    'monthRevenue', os.month_revenue
  )
  INTO v_result
  FROM order_stats os
  CROSS JOIN review_stats rs;

  RETURN v_result;
END;
$$;

-- =====================================================
-- 2. FONCTION : get_weekly_data
-- =====================================================
-- Remplace getWeeklyData()
-- Récupère les données des 7 derniers jours en une seule requête
-- =====================================================

CREATE OR REPLACE FUNCTION get_weekly_data(p_business_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_week_start DATE;
BEGIN
  -- Calculer le début de la semaine (lundi)
  v_week_start := CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7);

  -- Générer les données pour chaque jour de la semaine
  WITH RECURSIVE dates AS (
    SELECT 
      v_week_start + (n || ' days')::INTERVAL as date,
      CASE n
        WHEN 0 THEN 'Lundi'
        WHEN 1 THEN 'Mardi'
        WHEN 2 THEN 'Mercredi'
        WHEN 3 THEN 'Jeudi'
        WHEN 4 THEN 'Vendredi'
        WHEN 5 THEN 'Samedi'
        WHEN 6 THEN 'Dimanche'
      END as day
    FROM generate_series(0, 6) n
  ),
  daily_stats AS (
    SELECT
      d.day,
      d.date,
      COUNT(o.id) as orders,
      COALESCE(SUM(o.grand_total), 0) as revenue
    FROM dates d
    LEFT JOIN orders o ON 
      o.business_id = p_business_id
      AND DATE(o.created_at) = d.date
      AND o.status IN ('delivered', 'completed', 'out_for_delivery')
    GROUP BY d.day, d.date
    ORDER BY d.date
  )
  SELECT json_agg(json_build_object(
    'day', day,
    'date', date,
    'orders', orders,
    'revenue', revenue
  ))
  INTO v_result
  FROM daily_stats;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- =====================================================
-- 3. FONCTION : get_partner_dashboard_data
-- =====================================================
-- Charge TOUTES les données du dashboard en une seule requête
-- Combine business, stats, orders récentes, et données hebdomadaires
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_dashboard_data(p_business_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_stats JSON;
  v_weekly_data JSON;
  v_recent_orders JSON;
BEGIN
  -- Récupérer les stats
  SELECT get_partner_stats(p_business_id) INTO v_stats;
  
  -- Récupérer les données hebdomadaires
  SELECT get_weekly_data(p_business_id) INTO v_weekly_data;
  
  -- Récupérer les 10 commandes récentes
  SELECT json_agg(row_to_json(orders_with_details))
  INTO v_recent_orders
  FROM (
    SELECT 
      o.id,
      o.order_number,
      o.user_id,
      o.status,
      o.total,
      o.delivery_fee,
      o.grand_total,
      o.delivery_method,
      o.delivery_address,
      o.payment_method,
      o.payment_status,
      o.created_at,
      o.updated_at,
      json_build_object(
        'name', up.name,
        'phone_number', up.phone_number
      ) as customer,
      json_build_object(
        'name', dp.name,
        'phone_number', dp.phone_number
      ) as driver
    FROM orders o
    LEFT JOIN user_profiles up ON up.id = o.user_id
    LEFT JOIN driver_profiles dp ON dp.id = o.driver_id
    WHERE o.business_id = p_business_id
    ORDER BY o.created_at DESC
    LIMIT 10
  ) orders_with_details;

  -- Combiner toutes les données
  SELECT json_build_object(
    'stats', v_stats,
    'weeklyData', v_weekly_data,
    'recentOrders', COALESCE(v_recent_orders, '[]'::JSON)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================================================
-- 4. FONCTION : get_partner_orders_paginated
-- =====================================================
-- Récupère les commandes avec pagination et filtres optimisés
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_orders_paginated(
  p_business_id INTEGER,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_orders JSON;
  v_total INTEGER;
BEGIN
  -- Compter le total
  SELECT COUNT(*)
  INTO v_total
  FROM orders
  WHERE business_id = p_business_id
    AND (p_status IS NULL OR status = p_status);

  -- Récupérer les commandes avec les détails
  SELECT json_agg(row_to_json(orders_with_details))
  INTO v_orders
  FROM (
    SELECT 
      o.id,
      o.order_number,
      o.user_id,
      o.status,
      o.total,
      o.delivery_fee,
      o.grand_total,
      o.delivery_method,
      o.delivery_address,
      o.delivery_instructions,
      o.payment_method,
      o.payment_status,
      o.created_at,
      o.updated_at,
      o.delivery_type,
      o.preferred_delivery_time,
      json_build_object(
        'name', up.name,
        'phone_number', up.phone_number
      ) as customer,
      CASE 
        WHEN o.driver_id IS NOT NULL THEN
          json_build_object(
            'name', dp.name,
            'phone_number', dp.phone_number,
            'vehicle_type', dp.vehicle_type,
            'vehicle_plate', dp.vehicle_plate
          )
        ELSE NULL
      END as driver,
      (
        SELECT json_agg(json_build_object(
          'id', oi.id,
          'name', oi.name,
          'price', oi.price,
          'quantity', oi.quantity,
          'image', oi.image
        ))
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) as items
    FROM orders o
    LEFT JOIN user_profiles up ON up.id = o.user_id
    LEFT JOIN driver_profiles dp ON dp.id = o.driver_id
    WHERE o.business_id = p_business_id
      AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) orders_with_details;

  RETURN json_build_object(
    'orders', COALESCE(v_orders, '[]'::JSON),
    'total', v_total
  );
END;
$$;

-- =====================================================
-- 5. INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les requêtes fréquentes sur orders
CREATE INDEX IF NOT EXISTS idx_orders_business_created 
  ON orders(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_business_status 
  ON orders(business_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_business_status_created 
  ON orders(business_id, status, created_at DESC);

-- Index pour les reviews
CREATE INDEX IF NOT EXISTS idx_reviews_business 
  ON reviews(business_id);

-- Index pour les order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order 
  ON order_items(order_id);

-- Index pour les user_profiles (déjà existant normalement)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id 
  ON user_profiles(id);

-- Index pour les driver_profiles
CREATE INDEX IF NOT EXISTS idx_driver_profiles_id 
  ON driver_profiles(id);

-- =====================================================
-- COMMENTAIRES ET METADATA
-- =====================================================

COMMENT ON FUNCTION get_partner_stats(INTEGER) IS 
  'Calcule toutes les statistiques du partenaire en une seule requête optimisée';

COMMENT ON FUNCTION get_weekly_data(INTEGER) IS 
  'Récupère les données des 7 derniers jours pour le graphique hebdomadaire';

COMMENT ON FUNCTION get_partner_dashboard_data(INTEGER) IS 
  'Charge toutes les données du dashboard en une seule requête';

COMMENT ON FUNCTION get_partner_orders_paginated(INTEGER, INTEGER, INTEGER, TEXT) IS 
  'Récupère les commandes avec pagination et filtres optimisés';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Pour exécuter ce script :
-- psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f create-partner-rpc-functions.sql
-- Ou via Supabase Dashboard : SQL Editor > New Query > Coller le contenu
-- =====================================================

