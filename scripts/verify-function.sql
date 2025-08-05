-- Script pour vérifier la fonction create_partner_subscription
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier toutes les fonctions existantes
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'create_partner_subscription';

-- 2. Tester l'appel de la fonction
DO $$
DECLARE
  v_result uuid;
  v_test_partner_id integer := 1;
  v_test_plan_id uuid;
BEGIN
  -- Récupérer un plan existant
  SELECT id INTO v_test_plan_id FROM subscription_plans LIMIT 1;
  
  IF v_test_plan_id IS NULL THEN
    RAISE NOTICE 'Aucun plan trouvé dans la table subscription_plans';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Test avec partner_id: %, plan_id: %', v_test_partner_id, v_test_plan_id;
  
  -- Essayer d'appeler la fonction
  BEGIN
    v_result := create_partner_subscription(v_test_partner_id, v_test_plan_id);
    RAISE NOTICE 'Fonction appelée avec succès! Résultat: %', v_result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''appel: %', SQLERRM;
  END;
END $$;

-- 3. Vérifier les données de test
SELECT 'subscription_plans' as table_name, COUNT(*) as count FROM subscription_plans
UNION ALL
SELECT 'partner_subscriptions' as table_name, COUNT(*) as count FROM partner_subscriptions; 