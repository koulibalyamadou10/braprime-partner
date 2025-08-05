-- Script complet pour installer le système de subscription
-- Exécutez ce script dans votre base de données Supabase

-- 1. Créer les types ENUM si ils n'existent pas
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
        'active',
        'expired',
        'cancelled',
        'pending',
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
        'mobile_money',
        'bank_transfer',
        'cash'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Créer les tables si elles n'existent pas
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type subscription_plan_type NOT NULL UNIQUE,
    name varchar(100) NOT NULL,
    description text,
    duration_months integer NOT NULL,
    price integer NOT NULL,
    monthly_price integer NOT NULL,
    savings_percentage integer DEFAULT 0,
    features text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partner_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id integer REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'pending',
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    auto_renew boolean DEFAULT false,
    total_paid integer DEFAULT 0,
    monthly_amount integer NOT NULL,
    savings_amount integer DEFAULT 0,
    billing_email varchar(255),
    billing_phone varchar(50),
    billing_address text,
    tax_id varchar(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE,
    amount integer NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_reference varchar(255),
    payment_date timestamp with time zone,
    processed_date timestamp with time zone,
    failure_reason text,
    receipt_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE,
    payment_id uuid REFERENCES public.subscription_payments(id) ON DELETE SET NULL,
    invoice_number varchar(50) UNIQUE NOT NULL,
    amount integer NOT NULL,
    tax_amount integer DEFAULT 0,
    total_amount integer NOT NULL,
    status payment_status DEFAULT 'pending',
    due_date timestamp with time zone NOT NULL,
    paid_date timestamp with time zone,
    invoice_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE,
    type varchar(50) NOT NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Supprimer les fonctions existantes avant de les recréer
DROP FUNCTION IF EXISTS calculate_subscription_dates(timestamp with time zone, integer);
DROP FUNCTION IF EXISTS create_partner_subscription(integer, uuid, character varying, character varying, text, character varying);
DROP FUNCTION IF EXISTS activate_subscription(uuid);
DROP FUNCTION IF EXISTS check_expired_subscriptions();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 4. Créer les fonctions
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
    'Votre abonnement BraPrime a expiré. Veuillez le renouveler.'
  FROM partner_subscriptions 
  WHERE end_date < now() AND status = 'expired';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Créer les triggers
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

-- 6. Créer les index
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON partner_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_end_date ON partner_subscriptions(end_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_subscriptions_active_unique 
  ON partner_subscriptions(partner_id) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_subscription_id ON subscription_notifications(subscription_id);

-- 7. Insérer les plans par défaut si ils n'existent pas
INSERT INTO subscription_plans (plan_type, name, description, duration_months, price, monthly_price, savings_percentage, features, is_active)
VALUES 
  ('1_month', 'Plan 1 Mois', 'Accès complet à la plateforme pour 1 mois', 1, 200000, 200000, 0, ARRAY['Accès complet', 'Support prioritaire', 'Analytics avancées'], true),
  ('3_months', 'Plan 3 Mois', 'Accès complet à la plateforme pour 3 mois avec économies', 3, 540000, 180000, 10, ARRAY['Accès complet', 'Support prioritaire', 'Analytics avancées', '10% d''économie'], true),
  ('6_months', 'Plan 6 Mois', 'Accès complet à la plateforme pour 6 mois avec économies', 6, 1020000, 170000, 15, ARRAY['Accès complet', 'Support prioritaire', 'Analytics avancées', '15% d''économie'], true),
  ('12_months', 'Plan 12 Mois', 'Accès complet à la plateforme pour 12 mois avec économies', 12, 1920000, 160000, 20, ARRAY['Accès complet', 'Support prioritaire', 'Analytics avancées', '20% d''économie'], true)
ON CONFLICT (plan_type) DO NOTHING;

-- 8. Créer les vues utiles
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

CREATE OR REPLACE VIEW subscription_payments_summary AS
SELECT 
  sp.subscription_id,
  ps.partner_id,
  COUNT(*) as total_payments,
  SUM(CASE WHEN sp.status = 'completed' THEN sp.amount ELSE 0 END) as total_paid,
  MAX(sp.payment_date) as last_payment_date
FROM subscription_payments sp
JOIN partner_subscriptions ps ON sp.subscription_id = ps.id
GROUP BY sp.subscription_id, ps.partner_id;

-- 9. Configurer les politiques RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "subscription_plans_select_policy" ON subscription_plans;
DROP POLICY IF EXISTS "partner_subscriptions_select_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "partner_subscriptions_insert_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "partner_subscriptions_update_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "subscription_payments_select_policy" ON subscription_payments;
DROP POLICY IF EXISTS "subscription_payments_insert_policy" ON subscription_payments;
DROP POLICY IF EXISTS "subscription_notifications_select_policy" ON subscription_notifications;

-- Politiques pour subscription_plans (lecture publique)
CREATE POLICY "subscription_plans_select_policy" ON subscription_plans
  FOR SELECT USING (true);

-- Politiques pour partner_subscriptions
CREATE POLICY "partner_subscriptions_select_policy" ON partner_subscriptions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM businesses WHERE id = partner_id
    )
  );

CREATE POLICY "partner_subscriptions_insert_policy" ON partner_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM businesses WHERE id = partner_id
    )
  );

CREATE POLICY "partner_subscriptions_update_policy" ON partner_subscriptions
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM businesses WHERE id = partner_id
    )
  );

-- Politiques pour subscription_payments
CREATE POLICY "subscription_payments_select_policy" ON subscription_payments
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM partner_subscriptions WHERE partner_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "subscription_payments_insert_policy" ON subscription_payments
  FOR INSERT WITH CHECK (
    subscription_id IN (
      SELECT id FROM partner_subscriptions WHERE partner_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

-- Politiques pour subscription_notifications
CREATE POLICY "subscription_notifications_select_policy" ON subscription_notifications
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM partner_subscriptions WHERE partner_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Système de subscription installé avec succès!';
  RAISE NOTICE 'Fonctions créées: calculate_subscription_dates, create_partner_subscription, activate_subscription, check_expired_subscriptions';
  RAISE NOTICE 'Tables créées: subscription_plans, partner_subscriptions, subscription_payments, subscription_invoices, subscription_notifications';
  RAISE NOTICE 'Plans par défaut insérés: 1 mois, 3 mois, 6 mois, 12 mois';
END $$; 