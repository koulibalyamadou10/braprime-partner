-- Script pour recréer les fonctions de subscription sans triggers
-- Exécutez ce script APRÈS avoir supprimé tous les triggers

-- 1. Supprimer toutes les fonctions de subscription existantes
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid);
DROP FUNCTION IF EXISTS create_partner_subscription(uuid, integer);
DROP FUNCTION IF EXISTS create_partner_subscription(uuid);
DROP FUNCTION IF EXISTS activate_subscription(uuid);
DROP FUNCTION IF EXISTS calculate_subscription_dates(timestamp with time zone, integer);
DROP FUNCTION IF EXISTS check_expired_subscriptions();
DROP FUNCTION IF EXISTS activate_business_after_subscription(uuid);

-- 2. Créer la fonction calculate_subscription_dates
CREATE OR REPLACE FUNCTION calculate_subscription_dates(
  p_start_date timestamp with time zone,
  p_duration_months integer
) RETURNS RECORD AS $$
DECLARE
  v_result RECORD;
BEGIN
  v_result.start_date := p_start_date;
  v_result.end_date := p_start_date + (p_duration_months || ' months')::interval;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer la fonction create_partner_subscription
CREATE OR REPLACE FUNCTION create_partner_subscription(
  p_partner_id integer,
  p_plan_id uuid
) RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
  v_plan subscription_plans%ROWTYPE;
  v_dates RECORD;
BEGIN
  -- Récupérer les informations du plan
  SELECT * INTO v_plan FROM subscription_plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé';
  END IF;
  
  -- Calculer les dates
  SELECT * INTO v_dates FROM calculate_subscription_dates(now(), v_plan.duration_months);
  
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
    v_dates.start_date,
    v_dates.end_date,
    v_plan.price,
    v_plan.monthly_price,
    COALESCE(v_plan.savings_percentage, 0) * v_plan.price / 100
  ) RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer la fonction activate_subscription
CREATE OR REPLACE FUNCTION activate_subscription(
  p_subscription_id uuid
) RETURNS void AS $$
BEGIN
  UPDATE partner_subscriptions 
  SET status = 'active'
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer la fonction check_expired_subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions() RETURNS void AS $$
BEGIN
  UPDATE partner_subscriptions 
  SET status = 'expired'
  WHERE end_date < now() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- 6. Créer la fonction activate_business_after_subscription
CREATE OR REPLACE FUNCTION activate_business_after_subscription(
  p_subscription_id uuid
) RETURNS void AS $$
BEGIN
  UPDATE businesses 
  SET 
    is_active = true,
    subscription_status = 'active',
    updated_at = now()
  WHERE current_subscription_id = p_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Vérifier que toutes les fonctions sont créées
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname IN (
  'create_partner_subscription',
  'activate_subscription', 
  'calculate_subscription_dates',
  'check_expired_subscriptions',
  'activate_business_after_subscription'
)
ORDER BY proname;

-- 8. Tester la fonction principale
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

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Toutes les fonctions de subscription ont été recréées!';
  RAISE NOTICE '📋 Fonctions disponibles:';
  RAISE NOTICE '   - create_partner_subscription(integer, uuid)';
  RAISE NOTICE '   - activate_subscription(uuid)';
  RAISE NOTICE '   - calculate_subscription_dates(timestamp, integer)';
  RAISE NOTICE '   - check_expired_subscriptions()';
  RAISE NOTICE '   - activate_business_after_subscription(uuid)';
  RAISE NOTICE '💡 Testez maintenant votre application!';
END $$; 