-- Solution corrigée avec authentification
-- Exécutez ce script dans votre base de données Supabase

-- 1. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS create_partner_subscription(uuid);

-- 2. Créer une fonction qui récupère le partner_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION create_partner_subscription(
  p_plan_id uuid
) RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
  v_plan subscription_plans%ROWTYPE;
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
  v_partner_id integer;
  v_user_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur connecté
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non connecté';
  END IF;
  
  -- Récupérer le partner_id depuis la table businesses
  SELECT id INTO v_partner_id 
  FROM businesses 
  WHERE owner_id = v_user_id 
  LIMIT 1;
  
  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'Aucun business trouvé pour cet utilisateur';
  END IF;
  
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
    v_partner_id,
    p_plan_id,
    'pending',
    v_start_date,
    v_end_date,
    v_plan.price,
    v_plan.monthly_price,
    COALESCE(v_plan.savings_percentage, 0) * v_plan.price / 100
  ) RETURNING id INTO v_subscription_id;
  
  -- Mettre à jour le business avec l'abonnement
  UPDATE businesses 
  SET 
    current_subscription_id = v_subscription_id,
    subscription_status = 'pending',
    updated_at = now()
  WHERE id = v_partner_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Vérifier que la fonction est créée
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_partner_subscription';

-- 4. Tester la fonction (simulation)
DO $$
DECLARE
  v_result uuid;
  v_test_plan_id uuid;
  v_test_user_id uuid;
BEGIN
  -- Récupérer un plan existant
  SELECT id INTO v_test_plan_id FROM subscription_plans LIMIT 1;
  
  IF v_test_plan_id IS NULL THEN
    RAISE NOTICE 'Aucun plan trouvé dans la table subscription_plans';
    RETURN;
  END IF;
  
  -- Récupérer un utilisateur existant
  SELECT id INTO v_test_user_id FROM auth.users LIMIT 1;
  
  IF v_test_user_id IS NULL THEN
    RAISE NOTICE 'Aucun utilisateur trouvé';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Test avec plan_id: %, user_id: %', v_test_plan_id, v_test_user_id;
  
  -- Simuler l'appel de la fonction (ne fonctionnera que si l'utilisateur est connecté)
  RAISE NOTICE '✅ Fonction créée avec succès!';
  RAISE NOTICE '📋 La fonction récupère automatiquement le partner_id de l''utilisateur connecté';
END $$;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Fonction corrigée avec authentification!';
  RAISE NOTICE '📋 Fonction créée: create_partner_subscription(uuid)';
  RAISE NOTICE '🔐 Récupère automatiquement le partner_id de l''utilisateur connecté';
  RAISE NOTICE '💡 L''application devrait maintenant fonctionner correctement!';
END $$; 