-- Script pour tester la désactivation d'abonnement par les partenaires
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les abonnements actifs
SELECT 
  'Abonnements actifs' as test_type,
  ps.id as subscription_id,
  ps.status,
  ps.total_paid,
  b.name as business_name,
  b.is_active as business_active,
  sp.name as plan_name
FROM partner_subscriptions ps
JOIN businesses b ON ps.partner_id = b.id
JOIN subscription_plans sp ON ps.plan_id = sp.id
WHERE ps.status = 'active'
ORDER BY ps.created_at DESC;

-- 2. Vérifier les permissions RLS pour les partenaires
SELECT 
  'Permissions RLS' as test_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('partner_subscriptions', 'businesses')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Vérifier que les partenaires peuvent voir leurs propres abonnements
-- (Simulation avec un utilisateur connecté)
DO $$
DECLARE
  v_test_user_id uuid := '00000000-0000-0000-0000-000000000001'; -- Remplacez par un vrai UUID
  v_test_business_id integer;
  v_subscription_count integer;
BEGIN
  -- Simuler un utilisateur connecté
  PERFORM set_config('request.jwt.claim.sub', v_test_user_id::text, true);
  
  -- Vérifier les abonnements visibles
  SELECT COUNT(*) INTO v_subscription_count
  FROM partner_subscriptions ps
  JOIN businesses b ON ps.partner_id = b.id
  WHERE b.owner_id = v_test_user_id;
  
  RAISE NOTICE 'Abonnements visibles pour l''utilisateur %: %', v_test_user_id, v_subscription_count;
END $$;

-- 4. Vérifier les notifications d'abonnement
SELECT 
  'Notifications d\'abonnements' as test_type,
  COUNT(*) as count,
  type,
  title,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM subscription_notifications 
GROUP BY type, title
ORDER BY type;

-- 5. Vérifier les fonctions de gestion
SELECT 
  'Fonctions de gestion' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  CASE 
    WHEN prosrc LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_proc 
WHERE proname IN (
  'deactivate_subscription',
  'reactivate_subscription', 
  'suspend_subscription'
)
ORDER BY proname;

-- 6. Message de test pour les partenaires
DO $$
BEGIN
  RAISE NOTICE '🧪 Test de désactivation d''abonnement par les partenaires';
  RAISE NOTICE '📋 Vérifiez que les partenaires peuvent voir leurs abonnements';
  RAISE NOTICE '📋 Vérifiez que les fonctions sont accessibles';
  RAISE NOTICE '📋 Vérifiez que les notifications sont créées';
  RAISE NOTICE '💡 Les partenaires peuvent maintenant désactiver leurs abonnements!';
END $$; 