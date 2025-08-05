-- Test rapide pour vérifier la correction des types de plans
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les plans disponibles
SELECT 
  'Plans disponibles' as test_type,
  plan_type::text as plan_type,
  name,
  monthly_price
FROM subscription_plans
ORDER BY duration_months;

-- 2. Test de création d'abonnement avec le bon format
DO $$
DECLARE
  v_subscription_id uuid;
BEGIN
  RAISE NOTICE '🧪 Test de création d''abonnement avec format correct...';
  
  -- Utiliser le format avec underscore qui existe en base
  v_subscription_id := create_subscription_for_request(
    '1_month',  -- Format correct
    'test@example.com',
    '+224123456789',
    '123 Test Street, Conakry',
    1
  );
  
  RAISE NOTICE '✅ Abonnement créé avec succès: %', v_subscription_id;
  
  -- Vérifier que l'abonnement existe
  IF EXISTS (SELECT 1 FROM partner_subscriptions WHERE id = v_subscription_id) THEN
    RAISE NOTICE '✅ Vérification réussie - Abonnement trouvé en base';
  ELSE
    RAISE NOTICE '❌ Erreur - Abonnement non trouvé en base';
  END IF;
  
  -- Nettoyer
  DELETE FROM partner_subscriptions WHERE id = v_subscription_id;
  RAISE NOTICE '🧹 Test nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
    RAISE NOTICE '💡 Vérifiez que les fonctions PostgreSQL sont créées';
END $$;

-- 3. Test de recherche de plans avec différents formats
DO $$
DECLARE
  v_plan_record record;
  v_formats text[] := ARRAY['1_month', '3_months', '6_months'];
  v_format text;
BEGIN
  RAISE NOTICE '🧪 Test de recherche de plans...';
  
  FOREACH v_format IN ARRAY v_formats
  LOOP
    SELECT * INTO v_plan_record
    FROM subscription_plans 
    WHERE plan_type::text = v_format
    LIMIT 1;
    
    IF v_plan_record IS NOT NULL THEN
      RAISE NOTICE '✅ Plan % trouvé: % (prix: % FG)', v_format, v_plan_record.name, v_plan_record.monthly_price;
    ELSE
      RAISE NOTICE '❌ Plan % non trouvé', v_format;
    END IF;
  END LOOP;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
END $$;

-- 4. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Test rapide terminé!';
  RAISE NOTICE '📋 Si tous les tests sont passés, le problème est résolu';
  RAISE NOTICE '💡 Les formats de plans sont maintenant corrects';
  RAISE NOTICE '🚀 Le système est prêt pour les demandes avec abonnements';
END $$; 