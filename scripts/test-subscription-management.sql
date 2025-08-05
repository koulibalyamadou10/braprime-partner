-- Script pour tester les fonctions de gestion d'abonnements
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les abonnements existants
SELECT 
  'Abonnements existants' as test_type,
  COUNT(*) as count,
  status,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM partner_subscriptions 
GROUP BY status
ORDER BY status;

-- 2. Vérifier les businesses avec abonnements
SELECT 
  'Businesses avec abonnements' as test_type,
  b.name as business_name,
  b.is_active,
  ps.status as subscription_status,
  ps.total_paid,
  sp.name as plan_name
FROM businesses b
LEFT JOIN partner_subscriptions ps ON b.current_subscription_id = ps.id
LEFT JOIN subscription_plans sp ON ps.plan_id = sp.id
WHERE ps.id IS NOT NULL
ORDER BY ps.created_at DESC;

-- 3. Tester la fonction de désactivation (remplacez l'UUID par un vrai ID)
-- SELECT deactivate_subscription('votre-subscription-id-ici', 'Test de désactivation');

-- 4. Tester la fonction de suspension (remplacez l'UUID par un vrai ID)
-- SELECT suspend_subscription('votre-subscription-id-ici', 3, 'Test de suspension');

-- 5. Tester la fonction de réactivation (remplacez l'UUID par un vrai ID)
-- SELECT reactivate_subscription('votre-subscription-id-ici');

-- 6. Vérifier les notifications créées
SELECT 
  'Notifications d\'abonnements' as test_type,
  COUNT(*) as count,
  type,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM subscription_notifications 
GROUP BY type
ORDER BY type;

-- 7. Vérifier les triggers
SELECT 
  'Triggers actifs' as test_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%subscription%'
ORDER BY trigger_name;

-- 8. Vérifier les fonctions créées
SELECT 
  'Fonctions de gestion' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  prosrc as source
FROM pg_proc 
WHERE proname IN (
  'deactivate_subscription',
  'reactivate_subscription', 
  'suspend_subscription',
  'reactivate_expired_suspensions',
  'check_and_reactivate_suspensions'
)
ORDER BY proname;

-- 9. Message de test
DO $$
BEGIN
  RAISE NOTICE '🧪 Tests de gestion d''abonnements terminés!';
  RAISE NOTICE '📋 Vérifiez les résultats ci-dessus';
  RAISE NOTICE '💡 Pour tester les fonctions, décommentez les lignes avec SELECT';
  RAISE NOTICE '⚠️  Remplacez les UUID par de vrais IDs d''abonnements';
END $$; 