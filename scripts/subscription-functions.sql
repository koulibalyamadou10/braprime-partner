-- ========================================
-- SCRIPTS POUR LES ABONNEMENTS BRAPRIME
-- ========================================
-- Ce fichier contient uniquement les fonctions et vues nécessaires
-- pour la gestion des abonnements partenaires.
-- Exécutez ce script dans l'éditeur SQL de Supabase.

-- ========================================
-- TYPES ET ENUMS
-- ========================================

-- Créer les types d'abonnement s'ils n'existent pas
DO $$ BEGIN
    CREATE TYPE subscription_plan_type AS ENUM (
        '1_month',
        '3_months', 
        '6_months',
        '12_months'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'pending',
        'active',
        'expired',
        'cancelled',
        'suspended'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'completed',
        'failed',
        'refunded',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'card',
        'bank_transfer',
        'mobile_money',
        'cash'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- DONNÉES PAR DÉFAUT
-- ========================================

-- Insérer les plans d'abonnement par défaut
INSERT INTO subscription_plans (
    plan_type,
    name,
    description,
    duration_months,
    price,
    monthly_price,
    savings_percentage,
    features,
    is_active
) VALUES 
    (
        '1_month',
        '1 Mois',
        'Formule flexible pour tester nos services',
        1,
        200000,
        200000,
        0,
        '["Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable"]',
        true
    ),
    (
        '3_months',
        '3 Mois',
        'Formule recommandée pour les commerces établis',
        3,
        450000,
        150000,
        25,
        '["Tout du plan 1 mois", "Économie de 25%", "Visibilité continue sur l''application BraPrime"]',
        true
    ),
    (
        '6_months',
        '6 Mois',
        'Formule économique pour les commerces sérieux',
        6,
        800000,
        133333,
        33,
        '["Tout du plan 3 mois", "Économie de 33%", "Visibilité continue sur l''application BraPrime"]',
        true
    ),
    (
        '12_months',
        '12 Mois',
        'Formule la plus économique pour les commerces fidèles',
        12,
        1400000,
        116667,
        41.7,
        '["Tout du plan 6 mois", "Économie de 41,7%", "Visibilité continue sur l''application BraPrime"]',
        true
    )
ON CONFLICT (plan_type) DO NOTHING;

-- ========================================
-- FONCTIONS POSTGRESQL
-- ========================================

-- Fonction pour calculer les dates d'abonnement
CREATE OR REPLACE FUNCTION calculate_subscription_dates(
  p_start_date timestamp with time zone,
  p_duration_months integer
) RETURNS TABLE (
  start_date timestamp with time zone,
  end_date timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_start_date as start_date,
    p_start_date + (p_duration_months || ' months')::interval as end_date;
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
  
  -- Créer une notification
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
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les abonnements expirés
CREATE OR REPLACE FUNCTION check_expired_subscriptions() RETURNS void AS $$
BEGIN
  UPDATE partner_subscriptions 
  SET status = 'expired'
  WHERE end_date < now() AND status = 'active';
  
  -- Créer des notifications pour les abonnements expirés
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
    'Votre abonnement BraPrime a expiré. Renouvelez pour continuer à bénéficier de nos services.'
  FROM partner_subscriptions 
  WHERE end_date < now() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_subscriptions_updated_at ON partner_subscriptions;
CREATE TRIGGER update_partner_subscriptions_updated_at 
  BEFORE UPDATE ON partner_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_payments_updated_at ON subscription_payments;
CREATE TRIGGER update_subscription_payments_updated_at 
  BEFORE UPDATE ON subscription_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_invoices_updated_at ON subscription_invoices;
CREATE TRIGGER update_subscription_invoices_updated_at 
  BEFORE UPDATE ON subscription_invoices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INDEX
-- ========================================

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON partner_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_end_date ON partner_subscriptions(end_date);

-- Index unique pour éviter les abonnements actifs multiples
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_subscriptions_active_unique 
ON partner_subscriptions(partner_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_subscription_id ON subscription_notifications(subscription_id);

-- ========================================
-- VUES
-- ========================================

-- Supprimer les vues existantes si elles existent
DROP VIEW IF EXISTS active_subscriptions CASCADE;
DROP VIEW IF EXISTS subscription_payments_summary CASCADE;

-- Vue pour les abonnements actifs avec détails
CREATE VIEW active_subscriptions AS
SELECT 
  ps.*,
  sp.name as plan_name,
  sp.description as plan_description,
  sp.duration_months,
  sp.price as plan_price,
  sp.monthly_price as plan_monthly_price,
  sp.savings_percentage as plan_savings_percentage,
  b.name as business_name
FROM partner_subscriptions ps
JOIN subscription_plans sp ON ps.plan_id = sp.id
JOIN businesses b ON ps.partner_id = b.id
WHERE ps.status = 'active';

-- Vue pour le résumé des paiements d'abonnement
CREATE VIEW subscription_payments_summary AS
SELECT 
  ps.id as subscription_id,
  ps.partner_id,
  ps.plan_id,
  ps.status,
  ps.start_date,
  ps.end_date,
  ps.total_paid,
  COUNT(sp.id) as total_payments,
  SUM(CASE WHEN sp.status = 'completed' THEN sp.amount ELSE 0 END) as total_paid_amount,
  MAX(sp.payment_date) as last_payment_date
FROM partner_subscriptions ps
LEFT JOIN subscription_payments sp ON ps.id = sp.subscription_id
GROUP BY ps.id, ps.partner_id, ps.plan_id, ps.status, ps.start_date, ps.end_date, ps.total_paid;

-- ========================================
-- POLITIQUES RLS (Row Level Security)
-- ========================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "subscription_plans_select_policy" ON subscription_plans;
DROP POLICY IF EXISTS "partner_subscriptions_select_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "partner_subscriptions_insert_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "partner_subscriptions_update_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "subscription_payments_select_policy" ON subscription_payments;
DROP POLICY IF EXISTS "subscription_invoices_select_policy" ON subscription_invoices;
DROP POLICY IF EXISTS "subscription_notifications_select_policy" ON subscription_notifications;

-- Activer RLS sur les tables d'abonnement
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour subscription_plans (lecture publique)
CREATE POLICY "subscription_plans_select_policy" ON subscription_plans
    FOR SELECT USING (true);

-- Politiques pour partner_subscriptions
CREATE POLICY "partner_subscriptions_select_policy" ON partner_subscriptions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT owner_id FROM businesses WHERE id = partner_subscriptions.partner_id
        ) OR
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE role_id = 4
        )
    );

CREATE POLICY "partner_subscriptions_insert_policy" ON partner_subscriptions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT owner_id FROM businesses WHERE id = partner_subscriptions.partner_id
        ) OR
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE role_id = 4
        )
    );

CREATE POLICY "partner_subscriptions_update_policy" ON partner_subscriptions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM businesses WHERE id = partner_subscriptions.partner_id
        ) OR
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE role_id = 4
        )
    );

-- Politiques pour subscription_payments
CREATE POLICY "subscription_payments_select_policy" ON subscription_payments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT b.owner_id 
            FROM businesses b 
            JOIN partner_subscriptions ps ON b.id = ps.partner_id 
            WHERE ps.id = subscription_payments.subscription_id
        )
    );

-- Politiques pour subscription_invoices
CREATE POLICY "subscription_invoices_select_policy" ON subscription_invoices
    FOR SELECT USING (
        auth.uid() IN (
            SELECT b.owner_id 
            FROM businesses b 
            JOIN partner_subscriptions ps ON b.id = ps.partner_id 
            WHERE ps.id = subscription_invoices.subscription_id
        )
    );

-- Politiques pour subscription_notifications
CREATE POLICY "subscription_notifications_select_policy" ON subscription_notifications
    FOR SELECT USING (
        auth.uid() IN (
            SELECT b.owner_id 
            FROM businesses b 
            JOIN partner_subscriptions ps ON b.id = ps.partner_id 
            WHERE ps.id = subscription_notifications.subscription_id
        )
    );

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Script d''abonnement exécuté avec succès!';
    RAISE NOTICE 'Fonctions créées: calculate_subscription_dates, create_partner_subscription, activate_subscription, check_expired_subscriptions';
    RAISE NOTICE 'Vues créées: active_subscriptions, subscription_payments_summary';
    RAISE NOTICE 'Politiques RLS configurées pour la sécurité';
    RAISE NOTICE 'Plans d''abonnement par défaut insérés';
END $$; 