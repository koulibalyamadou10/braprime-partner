-- Fonction pour créer des abonnements lors des demandes (contourne RLS)
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les types de plans disponibles
SELECT 
  'Types de plans disponibles' as test_type,
  plan_type,
  name,
  monthly_price
FROM subscription_plans
ORDER BY duration_months;

-- 2. Créer la fonction de création d'abonnement
CREATE OR REPLACE FUNCTION create_subscription_for_request(
  p_plan_type VARCHAR(50),
  p_billing_email VARCHAR(255),
  p_billing_phone VARCHAR(20),
  p_billing_address TEXT,
  p_duration_months INTEGER DEFAULT 1
) RETURNS uuid AS $$
DECLARE
  v_plan_id uuid;
  v_subscription_id uuid;
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
  v_plan_record record;
BEGIN
  -- Récupérer les détails du plan
  SELECT * INTO v_plan_record
  FROM subscription_plans 
  WHERE plan_type::text = p_plan_type
  LIMIT 1;
  
  IF v_plan_record IS NULL THEN
    -- Essayer avec différents formats de nom
    SELECT * INTO v_plan_record
    FROM subscription_plans 
    WHERE plan_type::text IN (p_plan_type, p_plan_type || '_month', p_plan_type || '-month')
    LIMIT 1;
  END IF;
  
  IF v_plan_record IS NULL THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé pour le type: %. Plans disponibles: %', 
      p_plan_type, 
      (SELECT string_agg(plan_type::text, ', ') FROM subscription_plans);
  END IF;
  
  v_plan_id := v_plan_record.id;
  
  -- Calculer les dates
  v_start_date := NOW();
  v_end_date := NOW() + (v_plan_record.duration_months || ' months')::interval;
  
  -- Créer l'abonnement avec SECURITY DEFINER (contourne RLS)
  INSERT INTO partner_subscriptions (
    partner_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew,
    total_paid,
    monthly_amount,
    savings_amount,
    billing_email,
    billing_phone,
    billing_address
  ) VALUES (
    NULL, -- partner_id sera mis à jour après création du business
    v_plan_id,
    'pending',
    v_start_date,
    v_end_date,
    false,
    0,
    v_plan_record.monthly_price,
    COALESCE(v_plan_record.savings_percentage, 0),
    p_billing_email,
    p_billing_phone,
    p_billing_address
  ) RETURNING id INTO v_subscription_id;
  
  RAISE NOTICE 'Abonnement créé avec ID: % pour le plan: % (type: %)', 
    v_subscription_id, v_plan_record.name, v_plan_record.plan_type;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer la fonction de liaison d'abonnement au business
CREATE OR REPLACE FUNCTION link_subscription_to_business(
  p_subscription_id uuid,
  p_business_id integer
) RETURNS boolean AS $$
BEGIN
  -- Mettre à jour l'abonnement avec l'ID du business
  UPDATE partner_subscriptions 
  SET partner_id = p_business_id
  WHERE id = p_subscription_id;
  
  -- Mettre à jour le business avec l'ID de l'abonnement
  UPDATE businesses 
  SET 
    current_subscription_id = p_subscription_id,
    subscription_status = 'pending'
  WHERE id = p_business_id;
  
  RAISE NOTICE 'Abonnement % lié au business %', p_subscription_id, p_business_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer la fonction de création complète de demande avec abonnement
CREATE OR REPLACE FUNCTION create_partner_request_with_subscription(
  p_user_name VARCHAR(100),
  p_user_email VARCHAR(255),
  p_user_phone VARCHAR(20),
  p_business_name VARCHAR(100),
  p_business_type VARCHAR(50),
  p_business_address TEXT,
  p_business_phone VARCHAR(20),
  p_business_email VARCHAR(255),
  p_business_description TEXT,
  p_opening_hours TEXT,
  p_delivery_radius INTEGER,
  p_cuisine_type VARCHAR(50),
  p_specialties TEXT[],
  p_plan_type VARCHAR(50),
  p_notes TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_request_id uuid;
  v_subscription_id uuid;
  v_plan_record record;
BEGIN
  -- Récupérer les informations du plan
  SELECT * INTO v_plan_record
  FROM subscription_plans 
  WHERE plan_type::text = p_plan_type
  LIMIT 1;
  
  IF v_plan_record IS NULL THEN
    -- Essayer avec différents formats de nom
    SELECT * INTO v_plan_record
    FROM subscription_plans 
    WHERE plan_type::text IN (p_plan_type, p_plan_type || '_month', p_plan_type || '-month')
    LIMIT 1;
  END IF;
  
  IF v_plan_record IS NULL THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé pour le type: %. Plans disponibles: %', 
      p_plan_type, 
      (SELECT string_agg(plan_type::text, ', ') FROM subscription_plans);
  END IF;
  
  -- Créer la demande
  INSERT INTO requests (
    type,
    status,
    user_name,
    user_email,
    user_phone,
    business_name,
    business_type,
    business_address,
    business_phone,
    business_email,
    business_description,
    opening_hours,
    delivery_radius,
    cuisine_type,
    specialties,
    notes,
    metadata
  ) VALUES (
    'partner',
    'pending',
    p_user_name,
    p_user_email,
    p_user_phone,
    p_business_name,
    p_business_type,
    p_business_address,
    p_business_phone,
    p_business_email,
    p_business_description,
    p_opening_hours,
    p_delivery_radius,
    p_cuisine_type,
    p_specialties,
    COALESCE(p_notes, '') || E'\n\nPlan sélectionné: ' || v_plan_record.name || ' - ' || v_plan_record.monthly_price || ' FG',
    jsonb_build_object(
      'selected_plan_id', v_plan_record.id,
      'selected_plan_name', v_plan_record.name,
      'selected_plan_price', v_plan_record.monthly_price,
      'plan_type', v_plan_record.plan_type::text
    )
  ) RETURNING id INTO v_request_id;
  
  -- Créer l'abonnement
  v_subscription_id := create_subscription_for_request(
    v_plan_record.plan_type::text,
    p_user_email,
    p_user_phone,
    p_business_address,
    v_plan_record.duration_months
  );
  
  -- Mettre à jour la demande avec l'ID de l'abonnement
  UPDATE requests 
  SET metadata = metadata || jsonb_build_object('subscription_id', v_subscription_id)
  WHERE id = v_request_id;
  
  RAISE NOTICE 'Demande créée avec ID: % et abonnement: %', v_request_id, v_subscription_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Test de la fonction
DO $$
DECLARE
  v_request_id uuid;
  v_plan_type varchar;
BEGIN
  RAISE NOTICE '🧪 Test de création de demande avec abonnement...';
  
  -- Récupérer le premier plan disponible
  SELECT plan_type::text INTO v_plan_type FROM subscription_plans LIMIT 1;
  
  IF v_plan_type IS NULL THEN
    RAISE NOTICE '❌ Aucun plan d''abonnement trouvé dans la base de données';
    RETURN;
  END IF;
  
  RAISE NOTICE '📋 Utilisation du plan: %', v_plan_type;
  
  v_request_id := create_partner_request_with_subscription(
    'Test User',
    'test@example.com',
    '+224123456789',
    'Restaurant Test',
    'restaurant',
    '123 Test Street, Conakry',
    '+224123456789',
    'restaurant@test.com',
    'Restaurant de test',
    '8h-22h',
    5,
    'Africaine',
    ARRAY['Poulet', 'Poisson'],
    v_plan_type,
    'Test de création'
  );
  
  RAISE NOTICE '✅ Test réussi - Demande créée avec ID: %', v_request_id;
  
  -- Nettoyer le test
  DELETE FROM requests WHERE id = v_request_id;
  RAISE NOTICE '🧹 Test nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
END $$;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Fonctions de création d''abonnement créées!';
  RAISE NOTICE '📋 create_subscription_for_request() - Crée un abonnement';
  RAISE NOTICE '📋 link_subscription_to_business() - Lie l''abonnement au business';
  RAISE NOTICE '📋 create_partner_request_with_subscription() - Crée demande + abonnement';
  RAISE NOTICE '💡 Utilisez ces fonctions pour contourner les politiques RLS';
END $$; 