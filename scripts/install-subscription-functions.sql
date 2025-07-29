-- Script pour installer les fonctions de subscription
-- Exécutez ce script dans votre base de données Supabase

-- Fonction pour calculer les dates d'abonnement
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

-- Fonction pour créer un nouvel abonnement
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

-- Fonction pour activer un abonnement après paiement
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

-- Fonction pour vérifier les abonnements expirés
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

-- Fonction pour mettre à jour la colonne updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer les triggers pour updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_subscriptions_updated_at ON partner_subscriptions;
CREATE TRIGGER update_partner_subscriptions_updated_at 
  BEFORE UPDATE ON partner_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON partner_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_end_date ON partner_subscriptions(end_date);

-- Index unique pour un seul abonnement actif par partenaire
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_subscriptions_active_unique 
  ON partner_subscriptions(partner_id) 
  WHERE status = 'active';

-- Vues utiles
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  ps.*,
  sp.name as plan_name,
  sp.description as plan_description,
  sp.plan_type,
  sp.price as plan_price,
  sp.monthly_price as plan_monthly_price,
  sp.savings_percentage as plan_savings_percentage
FROM partner_subscriptions ps
JOIN subscription_plans sp ON ps.plan_id = sp.id
WHERE ps.status = 'active';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonctions de subscription installées avec succès!';
END $$; 