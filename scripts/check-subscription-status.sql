-- Script pour vérifier le statut des abonnements
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier tous les abonnements existants
SELECT 
  ps.id as subscription_id,
  ps.status,
  ps.total_paid,
  ps.monthly_amount,
  ps.start_date,
  ps.end_date,
  b.name as business_name,
  sp.name as plan_name,
  sp.price as plan_price
FROM partner_subscriptions ps
JOIN businesses b ON ps.partner_id = b.id
JOIN subscription_plans sp ON ps.plan_id = sp.id
ORDER BY ps.created_at DESC;

-- 2. Vérifier les paiements d'abonnements
SELECT 
  sp.id as payment_id,
  sp.subscription_id,
  sp.amount,
  sp.payment_method,
  sp.status as payment_status,
  sp.transaction_reference,
  sp.created_at
FROM subscription_payments sp
ORDER BY sp.created_at DESC;

-- 3. Vérifier les plans disponibles
SELECT 
  id,
  plan_type,
  name,
  price,
  monthly_price,
  duration_months,
  is_active
FROM subscription_plans
ORDER BY duration_months;

-- 4. Compter les abonnements par statut
SELECT 
  status,
  COUNT(*) as count
FROM partner_subscriptions
GROUP BY status;

-- 5. Vérifier les businesses avec abonnements
SELECT 
  b.id,
  b.name,
  b.is_active,
  ps.id as subscription_id,
  ps.status as subscription_status,
  ps.total_paid
FROM businesses b
LEFT JOIN partner_subscriptions ps ON b.id = ps.partner_id
ORDER BY b.created_at DESC; 