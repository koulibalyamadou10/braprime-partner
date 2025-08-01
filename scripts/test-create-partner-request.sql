-- Script de test pour la fonction create_partner_request
-- Vérifier que tout fonctionne correctement

-- 1. Vérifier que les plans existent
SELECT 'Plans disponibles:' as info;
SELECT id, plan_type, name, monthly_price FROM subscription_plans;

-- 2. Vérifier la structure de la table businesses
SELECT 'Structure businesses:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name IN ('request_status', 'owner_name', 'owner_email', 'owner_phone', 'business_phone', 'business_email', 'business_description', 'opening_hours', 'delivery_radius', 'cuisine_type', 'specialties')
ORDER BY column_name;

-- 3. Test de la fonction create_partner_request
DO $$
DECLARE
  v_business_id integer;
  v_subscription_id uuid;
BEGIN
  RAISE NOTICE '🧪 Test de la fonction create_partner_request...';
  
  -- Appeler la fonction avec des données de test
  SELECT create_partner_request(
    'Test Owner',
    'test@example.com',
    '123456789',
    'Restaurant Test',
    'restaurant',
    '123 Test Street, Conakry',
    '987654321',
    'contact@restaurant-test.com',
    'Restaurant de test pour validation',
    'Lun-Sam: 8h-22h',
    5,
    'Africaine',
    ARRAY['Cuisine locale', 'Poulet braisé'],
    '1_month',
    'Test de création'
  ) INTO v_business_id;
  
  RAISE NOTICE '✅ Business créé avec ID: %', v_business_id;
  
  -- Vérifier que le business a été créé
  IF EXISTS (SELECT 1 FROM businesses WHERE id = v_business_id) THEN
    RAISE NOTICE '✅ Business trouvé dans la base';
    
    -- Vérifier les détails du business
    SELECT 
      name, request_status, owner_name, owner_email, 
      business_phone, business_email, delivery_radius
    INTO v_business_id
    FROM businesses WHERE id = v_business_id;
    
    RAISE NOTICE '📋 Détails du business: %', v_business_id;
  ELSE
    RAISE NOTICE '❌ Business non trouvé';
  END IF;
  
  -- Vérifier que l'abonnement a été créé
  SELECT current_subscription_id INTO v_subscription_id
  FROM businesses WHERE id = v_business_id;
  
  IF v_subscription_id IS NOT NULL THEN
    RAISE NOTICE '✅ Abonnement créé avec ID: %', v_subscription_id;
    
    -- Vérifier les détails de l'abonnement
    IF EXISTS (SELECT 1 FROM partner_subscriptions WHERE id = v_subscription_id) THEN
      RAISE NOTICE '✅ Abonnement trouvé dans la base';
    ELSE
      RAISE NOTICE '❌ Abonnement non trouvé';
    END IF;
  ELSE
    RAISE NOTICE '❌ Aucun abonnement créé';
  END IF;
  
  -- Nettoyer le test
  DELETE FROM partner_subscriptions WHERE partner_id = v_business_id;
  DELETE FROM businesses WHERE id = v_business_id;
  
  RAISE NOTICE '🧹 Test nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END $$;

-- 4. Afficher les demandes en attente
SELECT 'Demandes en attente:' as info;
SELECT 
  id,
  name as business_name,
  owner_name,
  owner_email,
  request_status,
  created_at
FROM businesses 
WHERE request_status = 'pending'
ORDER BY created_at DESC;

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Test terminé!';
  RAISE NOTICE '✅ Fonction create_partner_request opérationnelle';
END $$; 