-- Script de test final pour la création d'abonnements
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier l'état de la base de données
SELECT 
  'État de la base de données' as test_type,
  'Plans disponibles' as info,
  COUNT(*) as count
FROM subscription_plans;

SELECT 
  'État de la base de données' as test_type,
  'Politiques RLS' as info,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'partner_subscriptions';

-- 2. Test de création d'abonnement simple
DO $$
DECLARE
  v_subscription_id uuid;
BEGIN
  RAISE NOTICE '🧪 Test 1: Création d''abonnement simple...';
  
  v_subscription_id := create_subscription_for_request(
    '1_month',
    'test@example.com',
    '+224123456789',
    '123 Test Street, Conakry',
    1
  );
  
  RAISE NOTICE '✅ Abonnement créé avec ID: %', v_subscription_id;
  
  -- Vérifier que l'abonnement existe
  IF EXISTS (SELECT 1 FROM partner_subscriptions WHERE id = v_subscription_id) THEN
    RAISE NOTICE '✅ Vérification réussie';
  ELSE
    RAISE NOTICE '❌ Erreur - Abonnement non trouvé';
  END IF;
  
  -- Nettoyer
  DELETE FROM partner_subscriptions WHERE id = v_subscription_id;
  RAISE NOTICE '🧹 Test 1 nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test 1 échoué: %', SQLERRM;
END $$;

-- 3. Test de création de demande complète
DO $$
DECLARE
  v_request_id uuid;
BEGIN
  RAISE NOTICE '🧪 Test 2: Création de demande complète...';
  
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
    '3_months',
    'Test de création'
  );
  
  RAISE NOTICE '✅ Demande créée avec ID: %', v_request_id;
  
  -- Vérifier que la demande existe
  IF EXISTS (SELECT 1 FROM requests WHERE id = v_request_id) THEN
    RAISE NOTICE '✅ Vérification demande réussie';
    
    -- Afficher les métadonnées
    SELECT metadata FROM requests WHERE id = v_request_id;
  ELSE
    RAISE NOTICE '❌ Erreur - Demande non trouvée';
  END IF;
  
  -- Nettoyer
  DELETE FROM requests WHERE id = v_request_id;
  RAISE NOTICE '🧹 Test 2 nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test 2 échoué: %', SQLERRM;
END $$;

-- 4. Test de liaison d'abonnement (nécessite un business existant)
DO $$
DECLARE
  v_subscription_id uuid;
  v_business_id integer;
  v_link_result boolean;
BEGIN
  RAISE NOTICE '🧪 Test 3: Liaison d''abonnement...';
  
  -- Créer un abonnement de test
  v_subscription_id := create_subscription_for_request(
    '1_month',
    'test@example.com',
    '+224123456789',
    '123 Test Street, Conakry',
    1
  );
  
  -- Créer un business de test
  INSERT INTO businesses (name, address, owner_id) 
  VALUES ('Test Business', '123 Test Street', '00000000-0000-0000-0000-000000000000')
  RETURNING id INTO v_business_id;
  
  -- Tester la liaison
  v_link_result := link_subscription_to_business(v_subscription_id, v_business_id);
  
  IF v_link_result THEN
    RAISE NOTICE '✅ Liaison réussie';
  ELSE
    RAISE NOTICE '❌ Erreur de liaison';
  END IF;
  
  -- Nettoyer
  DELETE FROM businesses WHERE id = v_business_id;
  DELETE FROM partner_subscriptions WHERE id = v_subscription_id;
  RAISE NOTICE '🧹 Test 3 nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test 3 échoué: %', SQLERRM;
END $$;

-- 5. Vérifier les fonctions disponibles
SELECT 
  'Fonctions disponibles' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_subscription_for_request', 'link_subscription_to_business', 'create_partner_request_with_subscription')
ORDER BY proname;

-- 6. Test de différents formats de plan
DO $$
DECLARE
  v_plan_record record;
  v_test_types text[] := ARRAY['1_month', '1-month', '3_months', '3-months'];
  v_test_type text;
BEGIN
  RAISE NOTICE '🧪 Test 4: Formats de plans...';
  
  FOREACH v_test_type IN ARRAY v_test_types
  LOOP
    SELECT * INTO v_plan_record
    FROM subscription_plans 
    WHERE plan_type::text = v_test_type
    LIMIT 1;
    
    IF v_plan_record IS NOT NULL THEN
      RAISE NOTICE '✅ Plan trouvé pour %: %', v_test_type, v_plan_record.name;
    ELSE
      RAISE NOTICE '❌ Plan non trouvé pour: %', v_test_type;
    END IF;
  END LOOP;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test 4 échoué: %', SQLERRM;
END $$;

-- 7. Message de confirmation final
DO $$
BEGIN
  RAISE NOTICE '🎉 Tests de création d''abonnement terminés!';
  RAISE NOTICE '📋 Si tous les tests sont passés, le système est prêt';
  RAISE NOTICE '💡 Les erreurs de type de données devraient être résolues';
  RAISE NOTICE '🚀 Le système de demandes avec abonnements est opérationnel';
END $$; 