-- Script de debug pour vérifier les données du dashboard admin
-- Exécutez ce script dans Supabase SQL Editor pour voir les données

-- 1. Vérifier les utilisateurs
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM user_profiles;

-- 2. Vérifier les rôles utilisateurs
SELECT 
  ur.name as role_name,
  COUNT(up.id) as user_count
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE up.is_active = true
GROUP BY ur.name, ur.id
ORDER BY user_count DESC;

-- 3. Vérifier les commerces
SELECT 
  COUNT(*) as total_businesses,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_businesses,
  COUNT(CASE WHEN is_open = true THEN 1 END) as open_businesses
FROM businesses;

-- 4. Vérifier les commandes (ce mois)
SELECT 
  COUNT(*) as total_orders_this_month,
  COUNT(CASE WHEN status IN ('pending', 'confirmed', 'preparing') THEN 1 END) as pending_orders,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
  SUM(CASE WHEN payment_status = 'completed' THEN grand_total ELSE 0 END) as total_revenue
FROM orders 
WHERE created_at >= date_trunc('month', CURRENT_DATE);

-- 5. Vérifier les commandes (toutes)
SELECT 
  COUNT(*) as total_orders_all_time,
  COUNT(CASE WHEN status IN ('pending', 'confirmed', 'preparing') THEN 1 END) as pending_orders_all_time,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments_all_time,
  SUM(CASE WHEN payment_status = 'completed' THEN grand_total ELSE 0 END) as total_revenue_all_time
FROM orders;

-- 6. Vérifier les livreurs
SELECT 
  COUNT(*) as total_drivers,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_drivers
FROM drivers;

-- 7. Vérifier les sessions de travail actives
SELECT 
  COUNT(*) as active_work_sessions
FROM work_sessions 
WHERE status = 'active';

-- 8. Vérifier les commandes par statut
SELECT 
  status,
  COUNT(*) as count
FROM orders 
WHERE created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY status
ORDER BY count DESC;

-- 9. Vérifier les commandes par méthode de paiement
SELECT 
  payment_method,
  payment_status,
  COUNT(*) as count,
  SUM(grand_total) as total_amount
FROM orders 
WHERE created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY payment_method, payment_status
ORDER BY count DESC;

-- 10. Vérifier les données récentes
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as count,
  MAX(created_at) as latest_record
FROM user_profiles
UNION ALL
SELECT 
  'businesses' as table_name,
  COUNT(*) as count,
  MAX(created_at) as latest_record
FROM businesses
UNION ALL
SELECT 
  'orders' as table_name,
  COUNT(*) as count,
  MAX(created_at) as latest_record
FROM orders
UNION ALL
SELECT 
  'drivers' as table_name,
  COUNT(*) as count,
  MAX(created_at) as latest_record
FROM drivers; 