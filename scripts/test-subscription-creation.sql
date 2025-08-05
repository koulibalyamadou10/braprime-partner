-- Script de test pour la création d'abonnements
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les plans disponibles
SELECT 
  'Plans disponibles' as test_type,
  id,
  name,
  plan_type,
  monthly_price,
  duration_months
FROM subscription_plans
ORDER BY duration_months;

-- 2. Vérifier les politiques RLS
SELECT 
  'Politiques RLS partner_subscriptions' as test_type,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'partner_subscriptions'
AND schemaname = 'public'
ORDER BY policyname;

-- 3. Test de création d'abonnement via fonction
DO $$
DECLARE
  v_subscription_id uuid;
  v_plan_type varchar := '1-month';
BEGIN
  RAISE NOTICE '🧪 Test de création d''abonnement via fonction...';
  
  -- Vérifier que le plan existe
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type = v_plan_type) THEN
    RAISE NOTICE '⚠️  Plan % non trouvé, utilisation du premier plan disponible', v_plan_type;
    SELECT plan_type INTO v_plan_type FROM subscription_plans LIMIT 1;
  END IF;
  
  RAISE NOTICE '📋 Utilisation du plan: %', v_plan_type;
  
  -- Créer l'abonnement
  v_subscription_id := create_subscription_for_request(
    v_plan_type,
    'test@example.com',
    '+224123456789',
    '123 Test Street, Conakry',
    1
  );
  
  RAISE NOTICE '✅ Abonnement créé avec ID: %', v_subscription_id;
  
  -- Vérifier que l'abonnement a été créé
  IF EXISTS (SELECT 1 FROM partner_subscriptions WHERE id = v_subscription_id) THEN
    RAISE NOTICE '✅ Vérification réussie - Abonnement trouvé en base';
  ELSE
    RAISE NOTICE '❌ Erreur - Abonnement non trouvé en base';
  END IF;
  
  -- Nettoyer le test
  DELETE FROM partner_subscriptions WHERE id = v_subscription_id;
  RAISE NOTICE '🧹 Test nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
END $$;

-- 4. Test de création de demande complète
DO $$
DECLARE
  v_request_id uuid;
  v_plan_type varchar := '1-month';
BEGIN
  RAISE NOTICE '🧪 Test de création de demande complète...';
  
  -- Vérifier que le plan existe
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type = v_plan_type) THEN
    RAISE NOTICE '⚠️  Plan % non trouvé, utilisation du premier plan disponible', v_plan_type;
    SELECT plan_type INTO v_plan_type FROM subscription_plans LIMIT 1;
  END IF;
  
  RAISE NOTICE '📋 Utilisation du plan: %', v_plan_type;
  
  -- Créer la demande complète
  v_request_id := create_partner_request_with_subscription(
    'Test User',
    'test@example.com',
    '+224123456789',
    'Restaurant Test',
    'restaurant',
    '123 Test Street, Conakry',
    '+224123456789',
    'restaurant@test.com',
    'Restaurant de test',
    '8h-22h',
    5,
    'Africaine',
    ARRAY['Poulet', 'Poisson'],
    v_plan_type,
    'Test de création'
  );
  
  RAISE NOTICE '✅ Demande créée avec ID: %', v_request_id;
  
  -- Vérifier que la demande a été créée
  IF EXISTS (SELECT 1 FROM requests WHERE id = v_request_id) THEN
    RAISE NOTICE '✅ Vérification réussie - Demande trouvée en base';
    
    -- Afficher les métadonnées
    SELECT metadata FROM requests WHERE id = v_request_id;
  ELSE
    RAISE NOTICE '❌ Erreur - Demande non trouvée en base';
  END IF;
  
  -- Nettoyer le test
  DELETE FROM requests WHERE id = v_request_id;
  RAISE NOTICE '🧹 Test nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
END $$;

-- 5. Vérifier les fonctions disponibles
SELECT 
  'Fonctions disponibles' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_subscription_for_request', 'link_subscription_to_business', 'create_partner_request_with_subscription')
ORDER BY proname;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Tests de création d''abonnement terminés!';
  RAISE NOTICE '📋 Si tous les tests sont passés, le système est prêt';
  RAISE NOTICE '💡 Les erreurs RLS devraient maintenant être résolues';
END $$; 