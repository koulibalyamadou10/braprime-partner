-- Script pour vérifier et corriger les fonctions de subscription
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les fonctions existantes
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_partner_subscription', 'activate_subscription', 'calculate_subscription_dates')
ORDER BY proname;

-- 2. Supprimer toutes les versions de la fonction create_partner_subscription
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying, character varying);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying, character varying, character varying);

-- 3. Recréer la fonction avec la bonne signature
CREATE OR REPLACE FUNCTION create_partner_subscription(
  p_partner_id integer,
  p_plan_id uuid,
  p_billing_email character varying DEFAULT NULL,
  p_billing_phone character varying DEFAULT NULL,
  p_billing_address text DEFAULT NULL,
  p_tax_id character varying DEFAULT NULL
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
    savings_amount,
    billing_email,
    billing_phone,
    billing_address,
    tax_id
  ) VALUES (
    p_partner_id,
    p_plan_id,
    'pending',
    v_dates.start_date,
    v_dates.end_date,
    v_plan.price,
    v_plan.monthly_price,
    COALESCE(v_plan.savings_percentage, 0) * v_plan.price / 100,
    p_billing_email,
    p_billing_phone,
    p_billing_address,
    p_tax_id
  ) RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Recréer la fonction calculate_subscription_dates si elle n'existe pas
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

-- 5. Recréer la fonction activate_subscription
CREATE OR REPLACE FUNCTION activate_subscription(
  p_subscription_id uuid
) RETURNS void AS $$
BEGIN
  UPDATE partner_subscriptions 
  SET status = 'active'
  WHERE id = p_subscription_id;
  
  -- Créer une notification (si la table existe)
  BEGIN
    INSERT INTO subscription_notifications (
      subscription_id,
      type,
      title,
      message
    ) VALUES (
      p_subscription_id,
      'subscription_activated',
      'Abonnement activé',
      'Votre abonnement BraPrime a été activé avec succès.'
    );
  EXCEPTION WHEN undefined_table THEN
    -- La table n'existe pas, on ignore
    NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- 6. Vérifier que les fonctions sont bien créées
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_partner_subscription', 'activate_subscription', 'calculate_subscription_dates')
ORDER BY proname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonctions de subscription vérifiées et corrigées!';
  RAISE NOTICE 'Fonctions disponibles: create_partner_subscription, activate_subscription, calculate_subscription_dates';
END $$; 