-- =====================================================
-- FONCTIONS RPC SUPPLÉMENTAIRES POUR OPTIMISATION MAXIMALE
-- =====================================================
-- Ces fonctions optimisent les services :
-- - BillingService (facturation)
-- - PartnerOrders (liste complète des commandes)
-- - AdminDashboard (statistiques admin)
-- =====================================================

-- =====================================================
-- 1. FONCTION : get_billing_stats
-- =====================================================
-- Remplace BillingService.getBillingStats()
-- Calcule les stats de facturation en une seule requête
-- =====================================================

CREATE OR REPLACE FUNCTION get_billing_stats(
  p_business_id INTEGER,
  p_period TEXT DEFAULT 'month'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_date_from TIMESTAMP;
  v_weeks_in_period INTEGER;
BEGIN
  -- Calculer la date de début selon la période
  CASE p_period
    WHEN 'week' THEN
      v_date_from := CURRENT_DATE - INTERVAL '7 days';
      v_weeks_in_period := 1;
    WHEN 'year' THEN
      v_date_from := CURRENT_DATE - INTERVAL '1 year';
      v_weeks_in_period := 52;
    ELSE -- 'month' par défaut
      v_date_from := CURRENT_DATE - INTERVAL '30 days';
      v_weeks_in_period := 4;
  END CASE;

  -- Calculer toutes les statistiques de facturation
  WITH order_stats AS (
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(grand_total), 0) as total_revenue,
      COALESCE(AVG(grand_total), 0) as average_order
    FROM orders
    WHERE business_id = p_business_id
      AND status = 'delivered'
      AND created_at >= v_date_from
  ),
  weekly_data AS (
    SELECT
      json_agg(
        json_build_object(
          'week', week_num,
          'orders', order_count,
          'revenue', revenue
        ) ORDER BY week_num
      ) as data
    FROM (
      SELECT
        EXTRACT(WEEK FROM created_at)::INTEGER as week_num,
        COUNT(*) as order_count,
        COALESCE(SUM(grand_total), 0) as revenue
      FROM orders
      WHERE business_id = p_business_id
        AND status = 'delivered'
        AND created_at >= v_date_from
      GROUP BY EXTRACT(WEEK FROM created_at)
      ORDER BY week_num DESC
      LIMIT 12
    ) weeks
  ),
  top_items AS (
    SELECT
      json_agg(
        json_build_object(
          'name', item_name,
          'orders', order_count,
          'revenue', revenue,
          'percentage', percentage
        ) ORDER BY order_count DESC
      ) as data
    FROM (
      SELECT
        oi.name as item_name,
        COUNT(*) as order_count,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
        ROUND((COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM order_items oi2
          JOIN orders o2 ON o2.id = oi2.order_id
          WHERE o2.business_id = p_business_id
            AND o2.status = 'delivered'
            AND o2.created_at >= v_date_from), 0)) * 100, 2) as percentage
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.business_id = p_business_id
        AND o.status = 'delivered'
        AND o.created_at >= v_date_from
      GROUP BY oi.name
      ORDER BY order_count DESC
      LIMIT 10
    ) items
  )
  SELECT json_build_object(
    'totalRevenue', os.total_revenue,
    'totalOrders', os.total_orders,
    'averageOrder', os.average_order,
    'ordersPerWeek', ROUND(os.total_orders::NUMERIC / v_weeks_in_period, 2),
    'weeklyData', COALESCE(wd.data, '[]'::JSON),
    'topMenuItems', COALESCE(ti.data, '[]'::JSON)
  )
  INTO v_result
  FROM order_stats os
  CROSS JOIN weekly_data wd
  CROSS JOIN top_items ti;

  RETURN v_result;
END;
$$;

-- =====================================================
-- 2. FONCTION : get_partner_all_orders
-- =====================================================
-- Remplace PartnerOrders.loadOrders()
-- Récupère toutes les commandes avec leurs détails en 1 requête
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_all_orders(
  p_business_id INTEGER,
  p_limit INTEGER DEFAULT 100,
  p_status TEXT DEFAULT NULL,
  p_delivery_type TEXT DEFAULT NULL
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
    AND (p_status IS NULL OR status = p_status)
    AND (p_delivery_type IS NULL OR delivery_type = p_delivery_type);

  -- Récupérer les commandes avec tous les détails
  SELECT json_agg(order_data ORDER BY created_at DESC)
  INTO v_orders
  FROM (
    SELECT json_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total', o.total,
      'delivery_fee', o.delivery_fee,
      'grand_total', o.grand_total,
      'delivery_method', o.delivery_method,
      'delivery_address', o.delivery_address,
      'delivery_instructions', o.delivery_instructions,
      'payment_method', o.payment_method,
      'payment_status', o.payment_status,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'delivery_type', o.delivery_type,
      'preferred_delivery_time', o.preferred_delivery_time,
      'is_grouped_delivery', o.is_grouped_delivery,
      'delivery_group_id', o.delivery_group_id,
      'zone', o.zone,
      'landmark', o.landmark,
      'customer', json_build_object(
        'name', up.name,
        'phone_number', up.phone_number
      ),
      'driver', CASE 
        WHEN o.driver_id IS NOT NULL THEN json_build_object(
          'name', dp.name,
          'phone_number', dp.phone_number,
          'vehicle_type', dp.vehicle_type,
          'vehicle_plate', dp.vehicle_plate
        )
        ELSE NULL
      END,
      'items', (
        SELECT json_agg(json_build_object(
          'id', oi.id,
          'name', oi.name,
          'price', oi.price,
          'quantity', oi.quantity,
          'image', oi.image,
          'special_instructions', oi.special_instructions
        ))
        FROM order_items oi
        WHERE oi.order_id = o.id
      )
    ) as order_data
    FROM orders o
    LEFT JOIN user_profiles up ON up.id = o.user_id
    LEFT JOIN driver_profiles dp ON dp.id = o.driver_id
    WHERE o.business_id = p_business_id
      AND (p_status IS NULL OR o.status = p_status)
      AND (p_delivery_type IS NULL OR o.delivery_type = p_delivery_type)
    ORDER BY o.created_at DESC
    LIMIT p_limit
  ) orders_with_details;

  RETURN json_build_object(
    'orders', COALESCE(v_orders, '[]'::JSON),
    'total', v_total
  );
END;
$$;

-- =====================================================
-- 3. FONCTION : get_available_orders_for_driver
-- =====================================================
-- Récupère les commandes disponibles pour assignation
-- =====================================================

CREATE OR REPLACE FUNCTION get_available_orders_for_driver(
  p_business_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_orders JSON;
BEGIN
  SELECT json_agg(json_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'grand_total', o.grand_total,
    'delivery_address', o.delivery_address,
    'delivery_type', o.delivery_type,
    'preferred_delivery_time', o.preferred_delivery_time,
    'created_at', o.created_at,
    'customer', json_build_object(
      'name', up.name,
      'phone_number', up.phone_number
    ),
    'items', (
      SELECT json_agg(json_build_object(
        'name', oi.name,
        'quantity', oi.quantity
      ))
      FROM order_items oi
      WHERE oi.order_id = o.id
    )
  ) ORDER BY o.created_at ASC)
  INTO v_orders
  FROM orders o
  LEFT JOIN user_profiles up ON up.id = o.user_id
  WHERE o.business_id = p_business_id
    AND o.driver_id IS NULL
    AND o.status = 'ready'
  LIMIT 50;

  RETURN COALESCE(v_orders, '[]'::JSON);
END;
$$;

-- =====================================================
-- 4. FONCTION : get_partner_menu_with_categories
-- =====================================================
-- Récupère le menu complet avec catégories en 1 requête
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_menu_with_categories(
  p_business_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', mc.id,
      'name', mc.name,
      'description', mc.description,
      'sort_order', mc.sort_order,
      'items', (
        SELECT json_agg(
          json_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', mi.description,
            'price', mi.price,
            'image', mi.image,
            'is_available', mi.is_available,
            'is_popular', mi.is_popular,
            'preparation_time', mi.preparation_time,
            'allergens', mi.allergens,
            'nutritional_info', mi.nutritional_info
          ) ORDER BY mi.sort_order, mi.name
        )
        FROM menu_items mi
        WHERE mi.category_id = mc.id
          AND mi.is_available = true
      )
    ) ORDER BY mc.sort_order, mc.name
  )
  INTO v_result
  FROM menu_categories mc
  WHERE mc.business_id = p_business_id
    AND mc.is_active = true;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- =====================================================
-- 5. FONCTION : get_admin_dashboard_stats
-- =====================================================
-- Statistiques globales pour l'admin (tous les businesses)
-- =====================================================

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
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
  v_today := CURRENT_DATE;
  v_week_ago := v_today - INTERVAL '7 days';
  v_month_ago := v_today - INTERVAL '30 days';

  WITH global_stats AS (
    SELECT
      COUNT(DISTINCT b.id) as total_businesses,
      COUNT(DISTINCT CASE WHEN b.is_active = true THEN b.id END) as active_businesses,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.grand_total), 0) as total_revenue,
      COUNT(DISTINCT o.user_id) as total_customers,
      COUNT(DISTINCT dp.id) as total_drivers,
      COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= v_today) as today_orders,
      COALESCE(SUM(o.grand_total) FILTER (WHERE o.created_at >= v_today), 0) as today_revenue,
      COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= v_week_ago) as week_orders,
      COALESCE(SUM(o.grand_total) FILTER (WHERE o.created_at >= v_week_ago), 0) as week_revenue,
      COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= v_month_ago) as month_orders,
      COALESCE(SUM(o.grand_total) FILTER (WHERE o.created_at >= v_month_ago), 0) as month_revenue,
      COUNT(*) FILTER (WHERE o.status = 'pending') as pending_orders,
      COUNT(*) FILTER (WHERE o.status = 'delivered') as completed_orders,
      COUNT(*) FILTER (WHERE o.status = 'cancelled') as cancelled_orders
    FROM businesses b
    LEFT JOIN orders o ON o.business_id = b.id
    LEFT JOIN driver_profiles dp ON TRUE
  )
  SELECT json_build_object(
    'totalBusinesses', gs.total_businesses,
    'activeBusinesses', gs.active_businesses,
    'totalOrders', gs.total_orders,
    'totalRevenue', gs.total_revenue,
    'totalCustomers', gs.total_customers,
    'totalDrivers', gs.total_drivers,
    'todayOrders', gs.today_orders,
    'todayRevenue', gs.today_revenue,
    'weekOrders', gs.week_orders,
    'weekRevenue', gs.week_revenue,
    'monthOrders', gs.month_orders,
    'monthRevenue', gs.month_revenue,
    'pendingOrders', gs.pending_orders,
    'completedOrders', gs.completed_orders,
    'cancelledOrders', gs.cancelled_orders,
    'averageOrderValue', CASE 
      WHEN gs.total_orders > 0 THEN gs.total_revenue / gs.total_orders 
      ELSE 0 
    END
  )
  INTO v_result
  FROM global_stats gs;

  RETURN v_result;
END;
$$;

-- =====================================================
-- 6. FONCTION : get_partner_drivers_with_stats
-- =====================================================
-- Récupère les livreurs avec leurs statistiques
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_drivers_with_stats(
  p_business_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_drivers JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', dp.id,
      'name', dp.name,
      'phone_number', dp.phone_number,
      'email', dp.email,
      'vehicle_type', dp.vehicle_type,
      'vehicle_plate', dp.vehicle_plate,
      'is_active', dp.is_active,
      'is_available', dp.is_available,
      'created_at', dp.created_at,
      'stats', json_build_object(
        'totalDeliveries', (
          SELECT COUNT(*)
          FROM orders
          WHERE driver_id = dp.id
            AND status = 'delivered'
        ),
        'pendingDeliveries', (
          SELECT COUNT(*)
          FROM orders
          WHERE driver_id = dp.id
            AND status IN ('out_for_delivery', 'ready')
        ),
        'totalRevenue', (
          SELECT COALESCE(SUM(grand_total), 0)
          FROM orders
          WHERE driver_id = dp.id
            AND status = 'delivered'
        ),
        'rating', (
          SELECT COALESCE(AVG(customer_rating), 0)
          FROM orders
          WHERE driver_id = dp.id
            AND customer_rating IS NOT NULL
        )
      )
    ) ORDER BY dp.created_at DESC
  )
  INTO v_drivers
  FROM driver_profiles dp
  WHERE dp.business_id = p_business_id;

  RETURN COALESCE(v_drivers, '[]'::JSON);
END;
$$;

-- =====================================================
-- 7. FONCTION : get_order_complete_details
-- =====================================================
-- Récupère tous les détails d'une commande en 1 requête
-- =====================================================

CREATE OR REPLACE FUNCTION get_order_complete_details(p_order_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'order', json_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'total', o.total,
      'delivery_fee', o.delivery_fee,
      'grand_total', o.grand_total,
      'delivery_method', o.delivery_method,
      'delivery_address', o.delivery_address,
      'delivery_instructions', o.delivery_instructions,
      'payment_method', o.payment_method,
      'payment_status', o.payment_status,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'delivery_type', o.delivery_type,
      'preferred_delivery_time', o.preferred_delivery_time,
      'landmark', o.landmark,
      'zone', o.zone,
      'verification_code', o.verification_code
    ),
    'customer', json_build_object(
      'id', up.id,
      'name', up.name,
      'phone_number', up.phone_number,
      'email', up.email
    ),
    'driver', CASE 
      WHEN o.driver_id IS NOT NULL THEN json_build_object(
        'id', dp.id,
        'name', dp.name,
        'phone_number', dp.phone_number,
        'vehicle_type', dp.vehicle_type,
        'vehicle_plate', dp.vehicle_plate
      )
      ELSE NULL
    END,
    'items', (
      SELECT json_agg(json_build_object(
        'id', oi.id,
        'name', oi.name,
        'description', oi.description,
        'price', oi.price,
        'quantity', oi.quantity,
        'image', oi.image,
        'special_instructions', oi.special_instructions
      ))
      FROM order_items oi
      WHERE oi.order_id = o.id
    ),
    'business', json_build_object(
      'id', b.id,
      'name', b.name,
      'phone', b.phone,
      'address', b.address
    )
  )
  INTO v_result
  FROM orders o
  LEFT JOIN user_profiles up ON up.id = o.user_id
  LEFT JOIN driver_profiles dp ON dp.id = o.driver_id
  LEFT JOIN businesses b ON b.id = o.business_id
  WHERE o.id = p_order_id;

  RETURN v_result;
END;
$$;

-- =====================================================
-- 8. FONCTION : get_partner_revenue_summary
-- =====================================================
-- Résumé des revenus par période
-- =====================================================

CREATE OR REPLACE FUNCTION get_partner_revenue_summary(
  p_business_id INTEGER,
  p_period TEXT DEFAULT 'month'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_date_from TIMESTAMP;
BEGIN
  -- Calculer la date de début
  CASE p_period
    WHEN 'daily' THEN v_date_from := CURRENT_DATE;
    WHEN 'weekly' THEN v_date_from := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'yearly' THEN v_date_from := CURRENT_DATE - INTERVAL '1 year';
    ELSE v_date_from := CURRENT_DATE - INTERVAL '30 days'; -- monthly
  END CASE;

  WITH revenue_data AS (
    SELECT
      COUNT(*) as order_count,
      COALESCE(SUM(o.grand_total), 0) as total_revenue,
      COALESCE(AVG(o.grand_total), 0) as average_order,
      json_agg(DISTINCT o.payment_method) as payment_methods,
      json_agg(DISTINCT o.delivery_type) as delivery_types
    FROM orders o
    WHERE o.business_id = p_business_id
      AND o.status IN ('delivered', 'completed')
      AND o.created_at >= v_date_from
  ),
  top_items AS (
    SELECT json_agg(
      json_build_object(
        'name', oi.name,
        'quantity', SUM(oi.quantity),
        'revenue', SUM(oi.price * oi.quantity)
      ) ORDER BY SUM(oi.quantity) DESC
    ) as items
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.business_id = p_business_id
      AND o.status IN ('delivered', 'completed')
      AND o.created_at >= v_date_from
    GROUP BY oi.name
    LIMIT 5
  )
  SELECT json_build_object(
    'period', p_period,
    'orderCount', rd.order_count,
    'totalRevenue', rd.total_revenue,
    'averageOrder', rd.average_order,
    'paymentMethods', rd.payment_methods,
    'deliveryTypes', rd.delivery_types,
    'topItems', COALESCE(ti.items, '[]'::JSON)
  )
  INTO v_result
  FROM revenue_data rd
  CROSS JOIN top_items ti;

  RETURN v_result;
END;
$$;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON FUNCTION get_billing_stats(INTEGER, TEXT) IS 
  'Calcule les statistiques de facturation avec top items et données hebdomadaires';

COMMENT ON FUNCTION get_partner_all_orders(INTEGER, INTEGER, TEXT, TEXT) IS 
  'Récupère toutes les commandes avec détails complets (customer, driver, items)';

COMMENT ON FUNCTION get_available_orders_for_driver(INTEGER) IS 
  'Récupère les commandes disponibles pour assignation à un livreur';

COMMENT ON FUNCTION get_partner_menu_with_categories(INTEGER) IS 
  'Récupère le menu complet organisé par catégories';

COMMENT ON FUNCTION get_partner_drivers_with_stats(INTEGER) IS 
  'Récupère les livreurs avec leurs statistiques de livraison';

COMMENT ON FUNCTION get_partner_revenue_summary(INTEGER, TEXT) IS 
  'Résumé des revenus avec top items par période';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

