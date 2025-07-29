-- Script simple pour nettoyer et recréer les fonctions de subscription
-- Exécutez ce script dans votre base de données Supabase

-- 1. Supprimer toutes les fonctions existantes
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid);
DROP FUNCTION IF EXISTS activate_subscription(uuid);
DROP FUNCTION IF EXISTS calculate_subscription_dates(timestamp with time zone, integer);

-- 2. Créer une fonction simple pour créer un abonnement
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

-- 3. Créer une fonction simple pour activer un abonnement
CREATE OR REPLACE FUNCTION activate_subscription(
  p_subscription_id uuid
) RETURNS void AS $$
BEGIN
  UPDATE partner_subscriptions 
  SET status = 'active'
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Vérifier que les fonctions sont créées
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_partner_subscription', 'activate_subscription')
ORDER BY proname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonctions simplifiées créées avec succès!';
  RAISE NOTICE 'create_partner_subscription(integer, uuid)';
  RAISE NOTICE 'activate_subscription(uuid)';
END $$; 