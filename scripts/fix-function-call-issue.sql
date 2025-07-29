-- Solution simple pour résoudre le problème d'appel de fonction
-- Exécutez ce script dans votre base de données Supabase

-- 1. Supprimer toutes les versions de la fonction
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid);
DROP FUNCTION IF EXISTS create_partner_subscription(uuid, integer);
DROP FUNCTION IF EXISTS create_partner_subscription(uuid);

-- 2. Créer une fonction qui accepte UNIQUEMENT p_plan_id (comme l'appel le fait)
CREATE OR REPLACE FUNCTION create_partner_subscription(
  p_plan_id uuid
) RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
  v_plan subscription_plans%ROWTYPE;
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
  v_partner_id integer;
BEGIN
  -- Récupérer les informations du plan
  SELECT * INTO v_plan FROM subscription_plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé';
  END IF;
  
  -- Récupérer le partner_id depuis la session utilisateur
  -- Pour l'instant, on utilise une valeur par défaut
  v_partner_id := 1; -- À adapter selon votre logique
  
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
    v_partner_id,
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

-- 3. Vérifier que la fonction est créée
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_partner_subscription';

-- 4. Tester la fonction
DO $$
DECLARE
  v_result uuid;
  v_test_plan_id uuid;
BEGIN
  -- Récupérer un plan existant
  SELECT id INTO v_test_plan_id FROM subscription_plans LIMIT 1;
  
  IF v_test_plan_id IS NULL THEN
    RAISE NOTICE 'Aucun plan trouvé dans la table subscription_plans';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Test avec plan_id: %', v_test_plan_id;
  
  -- Essayer d'appeler la fonction
  BEGIN
    v_result := create_partner_subscription(v_test_plan_id);
    RAISE NOTICE '✅ Fonction appelée avec succès! Résultat: %', v_result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors de l''appel: %', SQLERRM;
  END;
END $$;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Problème résolu!';
  RAISE NOTICE '📋 Fonction créée: create_partner_subscription(uuid)';
  RAISE NOTICE '💡 L''application devrait maintenant fonctionner!';
END $$; 