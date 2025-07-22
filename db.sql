-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_users (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  display_name character varying NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'user'::admin_role,
  partenaire_id uuid,
  active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titre character varying NOT NULL,
  description text,
  type USER-DEFINED NOT NULL,
  statut USER-DEFINED NOT NULL DEFAULT 'Nouvelle'::alert_status,
  source character varying,
  assigne_a uuid,
  date_creation timestamp with time zone DEFAULT now(),
  date_resolution timestamp with time zone,
  priorite integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_assigne_a_fkey FOREIGN KEY (assigne_a) REFERENCES public.admin_users(id)
);
CREATE TABLE public.avis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid,
  partner_id uuid,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text,
  type_retour text CHECK (type_retour = ANY (ARRAY['positif'::text, 'negatif'::text])),
  date_avis timestamp with time zone DEFAULT now(),
  approuve boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT avis_pkey PRIMARY KEY (id),
  CONSTRAINT avis_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT avis_employe_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT avis_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id)
);
CREATE TABLE public.dashboard_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom character varying NOT NULL,
  type USER-DEFINED NOT NULL,
  configuration jsonb,
  position_x integer,
  position_y integer,
  largeur integer DEFAULT 1,
  hauteur integer DEFAULT 1,
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dashboard_widgets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.demandes_avance_salaire (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employe_id uuid,
  montant_demande numeric NOT NULL,
  motif text NOT NULL,
  date_demande timestamp with time zone DEFAULT now(),
  statut USER-DEFINED DEFAULT 'EN_ATTENTE'::demande_statut,
  commentaire text,
  date_traitement timestamp with time zone,
  numero_reception character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT demandes_avance_salaire_pkey PRIMARY KEY (id),
  CONSTRAINT demandes_avance_salaire_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employees(id)
);
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid,
  nom character varying NOT NULL,
  prenom character varying NOT NULL,
  genre USER-DEFINED NOT NULL,
  email character varying UNIQUE,
  telephone character varying,
  adresse text,
  poste character varying NOT NULL,
  role character varying,
  type_contrat USER-DEFINED NOT NULL,
  salaire_net numeric,
  date_embauche date,
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  photo_url character varying,
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id),
  CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  montant numeric NOT NULL,
  type USER-DEFINED NOT NULL,
  description text,
  partenaire_id uuid,
  utilisateur_id uuid,
  service_id uuid,
  statut USER-DEFINED NOT NULL DEFAULT 'En attente'::transaction_status,
  date_transaction timestamp with time zone DEFAULT now(),
  date_validation timestamp with time zone,
  reference character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  transaction_id bigint,
  CONSTRAINT financial_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT financial_transactions_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT financial_transactions_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.employees(id),
  CONSTRAINT financial_transactions_partenaire_id_fkey FOREIGN KEY (partenaire_id) REFERENCES public.partners(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  titre character varying NOT NULL,
  message text,
  type USER-DEFINED NOT NULL DEFAULT 'Information'::notification_type,
  lu boolean DEFAULT false,
  date_creation timestamp with time zone DEFAULT now(),
  date_lecture timestamp with time zone,
  employee_id uuid,
  partner_id uuid,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id),
  CONSTRAINT notifications_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id)
);
CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom character varying NOT NULL,
  type character varying NOT NULL,
  secteur character varying NOT NULL,
  description text,
  nom_representant character varying,
  email_representant character varying,
  telephone_representant character varying,
  nom_rh character varying,
  email_rh character varying,
  telephone_rh character varying,
  rccm character varying,
  nif character varying,
  email character varying,
  telephone character varying,
  adresse text,
  site_web character varying,
  logo_url character varying,
  date_adhesion timestamp with time zone DEFAULT now(),
  actif boolean DEFAULT true,
  nombre_employes integer DEFAULT 0,
  salaire_net_total numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  poste_representant text,
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.partnership_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name character varying NOT NULL,
  legal_status character varying NOT NULL,
  rccm character varying NOT NULL,
  nif character varying NOT NULL,
  activity_domain character varying NOT NULL,
  headquarters_address text NOT NULL,
  phone character varying NOT NULL CHECK (length(phone::text) <= 20),
  email character varying NOT NULL CHECK (email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  employees_count integer NOT NULL CHECK (employees_count > 0),
  payroll character varying NOT NULL,
  cdi_count integer NOT NULL CHECK (cdi_count >= 0),
  cdd_count integer NOT NULL CHECK (cdd_count >= 0),
  payment_date date NOT NULL,
  rep_full_name character varying NOT NULL,
  rep_position character varying NOT NULL,
  rep_email character varying NOT NULL CHECK (rep_email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  rep_phone character varying NOT NULL CHECK (length(rep_phone::text) <= 20),
  hr_full_name character varying NOT NULL,
  hr_email character varying NOT NULL CHECK (hr_email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  hr_phone character varying NOT NULL CHECK (length(hr_phone::text) <= 20),
  agreement boolean NOT NULL DEFAULT false,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'in_review'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  motivation_letter_url text,
  motivation_letter_text text,
  payment_day integer CHECK (payment_day >= 1 AND payment_day <= 31),
  CONSTRAINT partnership_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.password_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  user_agent text,
  attempt_count integer DEFAULT 1,
  last_attempt timestamp with time zone DEFAULT now(),
  locked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT password_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom character varying NOT NULL,
  valeur numeric NOT NULL,
  unite character varying,
  categorie character varying,
  date_mesure date NOT NULL,
  periode character varying DEFAULT 'jour'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT performance_metrics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.salary_advance_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employe_id uuid,
  partenaire_id uuid,
  montant_demande numeric NOT NULL,
  type_motif character varying NOT NULL,
  motif text NOT NULL,
  numero_reception character varying,
  frais_service numeric DEFAULT 0,
  montant_total numeric NOT NULL,
  salaire_disponible numeric,
  avance_disponible numeric,
  statut USER-DEFINED NOT NULL DEFAULT 'En attente'::transaction_status,
  date_creation timestamp with time zone DEFAULT now(),
  date_validation timestamp with time zone,
  date_rejet timestamp with time zone,
  motif_rejet text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT salary_advance_requests_pkey PRIMARY KEY (id),
  CONSTRAINT salary_advance_requests_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employees(id),
  CONSTRAINT salary_advance_requests_partenaire_id_fkey FOREIGN KEY (partenaire_id) REFERENCES public.partners(id)
);
CREATE TABLE public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  ip_address inet,
  user_agent text,
  location_data jsonb,
  risk_score integer DEFAULT 0,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT security_events_pkey PRIMARY KEY (id),
  CONSTRAINT security_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom character varying NOT NULL,
  description text,
  categorie character varying NOT NULL,
  frais_attribues numeric,
  pourcentage_max numeric,
  duree character varying,
  disponible boolean DEFAULT true,
  image_url character varying,
  date_creation timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  demande_avance_id uuid,
  employe_id uuid,
  entreprise_id uuid,
  montant numeric NOT NULL,
  numero_transaction character varying NOT NULL UNIQUE,
  methode_paiement USER-DEFINED NOT NULL,
  numero_compte character varying,
  numero_reception character varying,
  date_transaction timestamp with time zone DEFAULT now(),
  recu_url character varying,
  date_creation timestamp with time zone DEFAULT now(),
  statut USER-DEFINED DEFAULT 'EFFECTUEE'::transaction_statut,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  message_callback text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_demande_avance_id_fkey FOREIGN KEY (demande_avance_id) REFERENCES public.salary_advance_requests(id),
  CONSTRAINT transactions_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employees(id),
  CONSTRAINT transactions_entreprise_id_fkey FOREIGN KEY (entreprise_id) REFERENCES public.partners(id)
);
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action character varying NOT NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  risk_score integer DEFAULT 0,
  CONSTRAINT user_activities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  nom character varying NOT NULL,
  prenom character varying NOT NULL,
  telephone character varying,
  adresse text,
  type USER-DEFINED NOT NULL DEFAULT 'Étudiant'::user_type,
  statut USER-DEFINED NOT NULL DEFAULT 'En attente'::user_status,
  photo_url character varying,
  organisation character varying,
  poste character varying,
  niveau_etudes character varying,
  etablissement character varying,
  date_inscription timestamp with time zone DEFAULT now(),
  derniere_connexion timestamp with time zone,
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  encrypted_password text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- ========================================
-- TABLES POUR LA GESTION DES ABONNEMENTS BRAPRIME
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
  partner_id uuid NOT NULL,
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
  CONSTRAINT partner_subscriptions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE,
  CONSTRAINT partner_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT partner_subscriptions_partner_active_unique UNIQUE (partner_id, status) WHERE status = 'active'
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