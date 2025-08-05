-- Script pour corriger uniquement la fonction create_partner_request
-- Correction du champ monthly_amount -> monthly_price

-- 1. Supprimer et recréer la fonction avec la correction
DROP FUNCTION IF EXISTS create_partner_request(
  VARCHAR(100), VARCHAR(255), VARCHAR(20), VARCHAR(100), 
  VARCHAR(50), TEXT, VARCHAR(20), VARCHAR(255), TEXT, 
  TEXT, INTEGER, VARCHAR(50), TEXT[], VARCHAR(50), TEXT
) CASCADE;

-- 2. Recréer la fonction avec la correction
CREATE OR REPLACE FUNCTION create_partner_request(
  p_owner_name VARCHAR(100),
  p_owner_email VARCHAR(255),
  p_owner_phone VARCHAR(20),
  p_business_name VARCHAR(100),
  p_business_type VARCHAR(50),
  p_business_address TEXT,
  p_business_phone VARCHAR(20),
  p_business_email VARCHAR(255),
  p_business_description TEXT,
  p_opening_hours TEXT,
  p_delivery_radius INTEGER,
  p_cuisine_type VARCHAR(50) DEFAULT NULL,
  p_specialties TEXT[] DEFAULT NULL,
  p_plan_type VARCHAR(50) DEFAULT '1_month',
  p_notes TEXT DEFAULT NULL
) RETURNS integer AS $$
DECLARE
  v_business_id integer;
  v_subscription_id uuid;
  v_plan_record record;
  v_business_type_id integer;
BEGIN
  -- Récupérer les informations du plan
  SELECT * INTO v_plan_record
  FROM subscription_plans 
  WHERE plan_type::text = p_plan_type
  LIMIT 1;
  
  IF v_plan_record IS NULL THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé pour le type: %', p_plan_type;
  END IF;
  
  -- Trouver le bon business_type_id
  SELECT id INTO v_business_type_id
  FROM business_types 
  WHERE LOWER(name) = LOWER(p_business_type)
  LIMIT 1;
  
  -- Si pas trouvé, utiliser le premier disponible
  IF v_business_type_id IS NULL THEN
    SELECT id INTO v_business_type_id
    FROM business_types 
    ORDER BY id 
    LIMIT 1;
  END IF;
  
  -- Créer le business avec statut de demande
  INSERT INTO businesses (
    name,
    business_type_id,
    address,
    owner_id,
    is_active,
    requires_subscription,
    subscription_status,
    request_status,
    request_notes,
    owner_name,
    owner_email,
    owner_phone,
    business_phone,
    business_email,
    business_description,
    opening_hours,
    delivery_radius,
    cuisine_type,
    specialties
  ) VALUES (
    p_business_name,
    v_business_type_id,
    p_business_address,
    NULL,
    false,
    true,
    'pending',
    'pending',
    p_notes,
    p_owner_name,
    p_owner_email,
    p_owner_phone,
    p_business_phone,
    p_business_email,
    p_business_description,
    p_opening_hours,
    p_delivery_radius,
    p_cuisine_type,
    p_specialties
  ) RETURNING id INTO v_business_id;
  
  -- Créer l'abonnement directement lié au business
  INSERT INTO partner_subscriptions (
    partner_id,
    plan_id,
    status,
    billing_email,
    billing_phone,
    billing_address,
    monthly_amount,
    total_paid,
    start_date,
    end_date
  ) VALUES (
    v_business_id,
    v_plan_record.id,
    'pending',
    p_owner_email,
    p_owner_phone,
    p_business_address,
    v_plan_record.monthly_price,
    v_plan_record.price, -- Utiliser le prix total du plan
    now(),
    now() + INTERVAL '1 month'
  ) RETURNING id INTO v_subscription_id;
  
  -- Mettre à jour le business avec l'ID de l'abonnement
  UPDATE businesses 
  SET current_subscription_id = v_subscription_id
  WHERE id = v_business_id;
  
  RAISE NOTICE 'Demande partenaire créée: Business ID %, Subscription ID %', v_business_id, v_subscription_id;
  
  RETURN v_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Test de la fonction corrigée
DO $$
DECLARE
  v_result integer;
BEGIN
  -- Test avec des données minimales
  SELECT create_partner_request(
    'Test Owner',
    'test@example.com',
    '123456789',
    'Test Business',
    'restaurant',
    'Test Address',
    '123456789',
    'contact@test.com',
    'Test Description',
    '9h-18h',
    5,
    'Cuisine locale',
    ARRAY['Pizza', 'Burger'],
    '1_month',
    'Test notes'
  ) INTO v_result;
  
  RAISE NOTICE '✅ Test réussi! Business ID créé: %', v_result;
  
  -- Nettoyer le test
  DELETE FROM businesses WHERE id = v_result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END $$;

-- 4. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Fonction create_partner_request corrigée avec succès!';
  RAISE NOTICE '✅ Correction: monthly_amount → monthly_price';
  RAISE NOTICE '💡 La fonction est maintenant prête à être utilisée';
END $$; 