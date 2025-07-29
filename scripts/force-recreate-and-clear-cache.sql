-- Script pour forcer la recréation et vider le cache
-- Exécutez ce script dans votre base de données Supabase

-- 1. Supprimer TOUTES les versions possibles de la fonction
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid);
DROP FUNCTION IF EXISTS create_partner_subscription(uuid, integer);
DROP FUNCTION IF EXISTS create_partner_subscription(uuid);

-- 2. Attendre un peu pour que les changements se propagent
SELECT pg_sleep(1);

-- 3. Recréer la fonction avec la signature exacte
CREATE OR REPLACE FUNCTION create_partner_subscription(
  p_partner_id integer,
  p_plan_id uuid
) RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
  v_plan subscription_plans%ROWTYPE;
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
BEGIN
  -- Récupérer les informations du plan
  SELECT * INTO v_plan FROM subscription_plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé';
  END IF;
  
  -- Calculer les dates
  v_start_date := now();
  v_end_date := v_start_date + (v_plan.duration_months || ' months')::interval;
  
  -- Créer l'abonnement
  INSERT INTO partner_subscriptions (
    partner_id,
    plan_id,
    status,
    start_date,
    end_date,
    total_paid,
    monthly_amount,
    savings_amount
  ) VALUES (
    p_partner_id,
    p_plan_id,
    'pending',
    v_start_date,
    v_end_date,
    v_plan.price,
    v_plan.monthly_price,
    COALESCE(v_plan.savings_percentage, 0) * v_plan.price / 100
  ) RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Vérifier que la fonction est bien créée
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'create_partner_subscription';

-- 5. Tester la fonction
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
    RAISE NOTICE '✅ Fonction appelée avec succès! Résultat: %', v_result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors de l''appel: %', SQLERRM;
  END;
END $$;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Fonction create_partner_subscription recréée avec succès!';
  RAISE NOTICE '📋 Signature: create_partner_subscription(integer, uuid)';
  RAISE NOTICE '💡 Testez maintenant votre application!';
END $$; 