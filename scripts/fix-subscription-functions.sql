-- Script pour corriger les fonctions de subscription
-- Exécutez ce script dans votre base de données Supabase

-- Supprimer les fonctions existantes qui causent des conflits
DROP FUNCTION IF EXISTS calculate_subscription_dates(timestamp with time zone, integer);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS activate_subscription(uuid);
DROP FUNCTION IF EXISTS check_expired_subscriptions();

-- Recréer la fonction calculate_subscription_dates
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

-- Recréer la fonction create_partner_subscription
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

-- Recréer la fonction activate_subscription
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

-- Recréer la fonction check_expired_subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions() RETURNS void AS $$
BEGIN
  UPDATE partner_subscriptions 
  SET status = 'expired'
  WHERE end_date < now() AND status = 'active';
  
  -- Créer des notifications pour les abonnements expirés (si la table existe)
  BEGIN
    INSERT INTO subscription_notifications (
      subscription_id,
      type,
      title,
      message
    )
    SELECT 
      id,
      'subscription_expired',
      'Abonnement expiré',
      'Votre abonnement BraPrime a expiré. Veuillez le renouveler.'
    FROM partner_subscriptions 
    WHERE end_date < now() AND status = 'expired';
  EXCEPTION WHEN undefined_table THEN
    -- La table n'existe pas, on ignore
    NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonctions de subscription corrigées avec succès!';
  RAISE NOTICE 'Fonctions disponibles: calculate_subscription_dates, create_partner_subscription, activate_subscription, check_expired_subscriptions';
END $$; 