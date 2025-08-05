-- ========================================
-- MIGRATION POUR LA GESTION DES ABONNEMENTS BRAPRIME
-- ========================================

-- Types d'abonnement disponibles
CREATE TYPE subscription_plan_type AS ENUM (
  '1_month',
  '3_months', 
  '6_months',
  '12_months'
);

-- Statuts d'abonnement
CREATE TYPE subscription_status AS ENUM (
  'active',
  'expired',
  'cancelled',
  'pending',
  'suspended'
);

-- Statuts de paiement
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

-- Méthodes de paiement
CREATE TYPE payment_method AS ENUM (
  'card',
  'bank_transfer',
  'mobile_money',
  'cash'
);

-- Table des plans d'abonnement
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_type subscription_plan_type NOT NULL,
  name character varying NOT NULL,
  description text,
  duration_months integer NOT NULL,
  price numeric NOT NULL,
  monthly_price numeric NOT NULL,
  savings_percentage numeric,
  features jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_plans_plan_type_unique UNIQUE (plan_type)
);

-- Table des abonnements des partenaires
CREATE TABLE public.partner_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id integer NOT NULL,
  plan_id uuid NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  auto_renew boolean DEFAULT false,
  total_paid numeric NOT NULL,
  monthly_amount numeric NOT NULL,
  savings_amount numeric DEFAULT 0,
  billing_email character varying,
  billing_phone character varying,
  billing_address text,
  tax_id character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partner_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT partner_subscriptions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT partner_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);

-- Table des paiements d'abonnement
CREATE TABLE public.subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_reference character varying,
  payment_date timestamp with time zone,
  processed_date timestamp with time zone,
  failure_reason text,
  receipt_url character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_payments_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE
);

-- Table des changements de plan
CREATE TABLE public.subscription_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  old_plan_id uuid,
  new_plan_id uuid NOT NULL,
  change_reason text,
  effective_date timestamp with time zone NOT NULL,
  price_difference numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_changes_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_changes_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT subscription_changes_old_plan_id_fkey FOREIGN KEY (old_plan_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT subscription_changes_new_plan_id_fkey FOREIGN KEY (new_plan_id) REFERENCES public.subscription_plans(id)
);

-- Table des factures
CREATE TABLE public.subscription_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  payment_id uuid,
  invoice_number character varying NOT NULL UNIQUE,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date timestamp with time zone NOT NULL,
  paid_date timestamp with time zone,
  invoice_url character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT subscription_invoices_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.subscription_payments(id)
);

-- Table des notifications d'abonnement
CREATE TABLE public.subscription_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_notifications_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.partner_subscriptions(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_partner_subscriptions_partner_id ON public.partner_subscriptions(partner_id);
CREATE INDEX idx_partner_subscriptions_status ON public.partner_subscriptions(status);
CREATE INDEX idx_partner_subscriptions_end_date ON public.partner_subscriptions(end_date);

-- Contrainte d'unicité pour un seul abonnement actif par partenaire
CREATE UNIQUE INDEX idx_partner_subscriptions_active_unique 
ON public.partner_subscriptions(partner_id) 
WHERE status = 'active';
CREATE INDEX idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX idx_subscription_payments_status ON public.subscription_payments(status);
CREATE INDEX idx_subscription_invoices_subscription_id ON public.subscription_invoices(subscription_id);
CREATE INDEX idx_subscription_notifications_subscription_id ON public.subscription_notifications(subscription_id);

-- Insertion des plans d'abonnement par défaut
INSERT INTO public.subscription_plans (plan_type, name, description, duration_months, price, monthly_price, savings_percentage, features) VALUES
('1_month', '1 Mois', 'Formule flexible pour tester nos services', 1, 200000, 200000, 0, '["Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]'),
('3_months', '3 Mois', 'Formule recommandée pour les commerces établis', 3, 450000, 150000, 25, '["Tout du plan 1 mois", "Économie de 25%", "Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]'),
('6_months', '6 Mois', 'Formule économique pour les commerces sérieux', 6, 800000, 133333, 33, '["Tout du plan 3 mois", "Économie de 33%", "Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]'),
('12_months', '12 Mois', 'Formule la plus économique pour les commerces fidèles', 12, 1400000, 116667, 41.7, '["Tout du plan 6 mois", "Économie de 41,7%", "Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]');

-- Fonction pour calculer automatiquement les dates d'abonnement
CREATE OR REPLACE FUNCTION calculate_subscription_dates(
  p_start_date timestamp with time zone,
  p_duration_months integer
) RETURNS TABLE(start_date timestamp with time zone, end_date timestamp with time zone) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_start_date,
    p_start_date + (p_duration_months || ' months')::interval;
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
    v_plan.savings_percentage * v_plan.price / 100,
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
  WHERE end_date < now() AND status = 'expired';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables d'abonnement
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_subscriptions_updated_at BEFORE UPDATE ON partner_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_payments_updated_at BEFORE UPDATE ON subscription_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_invoices_updated_at BEFORE UPDATE ON subscription_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vues utiles pour les requêtes
CREATE VIEW active_subscriptions AS
SELECT 
  ps.id,
  ps.partner_id,
  b.name as partner_name,
  sp.name as plan_name,
  sp.plan_type,
  ps.status,
  ps.start_date,
  ps.end_date,
  ps.total_paid,
  ps.monthly_amount,
  ps.savings_amount,
  ps.billing_email,
  ps.billing_phone
FROM partner_subscriptions ps
JOIN businesses b ON ps.partner_id = b.id
JOIN subscription_plans sp ON ps.plan_id = sp.id
WHERE ps.status = 'active';

CREATE VIEW subscription_payments_summary AS
SELECT 
  ps.id as subscription_id,
  ps.partner_id,
  b.name as partner_name,
  COUNT(sp.id) as total_payments,
  SUM(sp.amount) as total_amount,
  MAX(sp.payment_date) as last_payment_date
FROM partner_subscriptions ps
JOIN businesses b ON ps.partner_id = b.id
LEFT JOIN subscription_payments sp ON ps.id = sp.subscription_id
GROUP BY ps.id, ps.partner_id, b.name;

-- Commentaires sur les tables
COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement disponibles pour les partenaires BraPrime';
COMMENT ON TABLE partner_subscriptions IS 'Abonnements actifs des partenaires';
COMMENT ON TABLE subscription_payments IS 'Historique des paiements d''abonnement';
COMMENT ON TABLE subscription_changes IS 'Historique des changements de plan';
COMMENT ON TABLE subscription_invoices IS 'Factures générées pour les abonnements';
COMMENT ON TABLE subscription_notifications IS 'Notifications liées aux abonnements'; 