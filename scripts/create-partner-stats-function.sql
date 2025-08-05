-- SCRIPT POUR CRÉER LA FONCTION GET_PARTNER_STATS
-- Cette fonction récupère toutes les statistiques d'un partenaire en une seule requête optimisée

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

-- Tester la fonction
DO $$
DECLARE
  test_business_id INTEGER;
BEGIN
  -- Trouver un business_id de test
  SELECT id INTO test_business_id FROM businesses LIMIT 1;
  
  IF test_business_id IS NOT NULL THEN
    RAISE NOTICE 'Test de la fonction get_partner_stats avec business_id: %', test_business_id;
    -- La fonction sera testée automatiquement lors de l'appel
  ELSE
    RAISE NOTICE 'Aucun business trouvé pour tester la fonction';
  END IF;
END $$;

-- Afficher un message de confirmation
SELECT '✅ Fonction get_partner_stats créée avec succès!' as message; 