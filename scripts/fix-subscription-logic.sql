-- Script pour corriger la logique de création d'abonnements
-- Exécutez ce script dans votre base de données Supabase

-- 1. Supprimer la fonction existante
DROP FUNCTION IF EXISTS create_partner_subscription(uuid);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid);

-- 2. Créer une fonction qui crée l'abonnement avec le bon statut
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
  
  -- Vérifier si l'utilisateur a déjà un abonnement actif
  IF EXISTS (
    SELECT 1 FROM partner_subscriptions 
    WHERE partner_id = v_partner_id 
    AND status IN ('active', 'pending')
  ) THEN
    RAISE EXCEPTION 'Vous avez déjà un abonnement actif ou en attente';
  END IF;
  
  -- Récupérer les informations du plan
  SELECT * INTO v_plan FROM subscription_plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé';
  END IF;
  
  -- Calculer les dates
  v_start_date := now();
  v_end_date := v_start_date + (v_plan.duration_months || ' months')::interval;
  
  -- Créer l'abonnement avec le statut 'pending' (en attente de paiement)
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
    'pending', -- Statut en attente de paiement
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

-- 3. Créer une fonction pour activer l'abonnement après paiement
CREATE OR REPLACE FUNCTION activate_subscription_after_payment(
  p_subscription_id uuid
) RETURNS void AS $$
BEGIN
  -- Mettre à jour le statut de l'abonnement
  UPDATE partner_subscriptions 
  SET 
    status = 'active',
    updated_at = now()
  WHERE id = p_subscription_id;
  
  -- Mettre à jour le business
  UPDATE businesses 
  SET 
    subscription_status = 'active',
    is_active = true,
    updated_at = now()
  WHERE current_subscription_id = p_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Vérifier que les fonctions sont créées
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_partner_subscription', 'activate_subscription_after_payment')
ORDER BY proname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Logique de création d''abonnements corrigée!';
  RAISE NOTICE '📋 create_partner_subscription(uuid) - Crée un abonnement pending';
  RAISE NOTICE '📋 activate_subscription_after_payment(uuid) - Active après paiement';
  RAISE NOTICE '💡 Les abonnements sont maintenant créés avec le bon statut!';
END $$; 