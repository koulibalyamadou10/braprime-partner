-- Script pour vérifier et corriger les types de plans d'abonnement
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les plans existants
SELECT 
  'Plans existants' as test_type,
  id,
  plan_type,
  name,
  monthly_price,
  duration_months
FROM subscription_plans
ORDER BY duration_months;

-- 2. Vérifier le type de données plan_type
SELECT 
  'Type de données plan_type' as test_type,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND column_name = 'plan_type';

-- 3. Vérifier les valeurs possibles du type enum
SELECT 
  'Valeurs enum possibles' as test_type,
  enumlabel
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = (
    SELECT udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'plan_type'
  )
);

-- 4. Créer les plans s'ils n'existent pas
DO $$
BEGIN
  -- Plan 1 mois
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type::text = '1_month') THEN
    INSERT INTO subscription_plans (
      plan_type,
      name,
      description,
      duration_months,
      price,
      monthly_price,
      savings_percentage,
      features
    ) VALUES (
      '1_month'::subscription_plan_type,
      '1 Mois',
      'Formule flexible pour tester nos services',
      1,
      200000,
      200000,
      0,
      '["Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]'::jsonb
    );
    RAISE NOTICE '✅ Plan 1 mois créé';
  ELSE
    RAISE NOTICE '✅ Plan 1 mois existe déjà';
  END IF;

  -- Plan 3 mois
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type::text = '3_months') THEN
    INSERT INTO subscription_plans (
      plan_type,
      name,
      description,
      duration_months,
      price,
      monthly_price,
      savings_percentage,
      features
    ) VALUES (
      '3_months'::subscription_plan_type,
      '3 Mois',
      'Formule recommandée pour les commerces établis',
      3,
      450000,
      150000,
      25,
      '["Tout du plan 1 mois", "Économie de 25%", "Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]'::jsonb
    );
    RAISE NOTICE '✅ Plan 3 mois créé';
  ELSE
    RAISE NOTICE '✅ Plan 3 mois existe déjà';
  END IF;

  -- Plan 6 mois
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type::text = '6_months') THEN
    INSERT INTO subscription_plans (
      plan_type,
      name,
      description,
      duration_months,
      price,
      monthly_price,
      savings_percentage,
      features
    ) VALUES (
      '6_months'::subscription_plan_type,
      '6 Mois',
      'Formule économique pour les commerces confirmés',
      6,
      700000,
      116667,
      41.7,
      '["Tout du plan 3 mois", "Économie de 41,7%", "Visibilité continue sur l''application BraPrime", "Accès à des centaines d''utilisateurs actifs", "Service de livraison écoresponsable", "Plateforme moderne 100% guinéenne", "Support client", "Gestion de base du menu", "Commandes en ligne", "Notifications par SMS"]'::jsonb
    );
    RAISE NOTICE '✅ Plan 6 mois créé';
  ELSE
    RAISE NOTICE '✅ Plan 6 mois existe déjà';
  END IF;
END $$;

-- 5. Vérifier les plans après création
SELECT 
  'Plans après création' as test_type,
  id,
  plan_type,
  name,
  monthly_price,
  duration_months
FROM subscription_plans
ORDER BY duration_months;

-- 6. Test de conversion de types
DO $$
DECLARE
  v_plan_record record;
BEGIN
  RAISE NOTICE '🧪 Test de recherche de plans...';
  
  -- Test avec différents formats
  SELECT * INTO v_plan_record
  FROM subscription_plans 
  WHERE plan_type::text = '1_month'
  LIMIT 1;
  
  IF v_plan_record IS NOT NULL THEN
    RAISE NOTICE '✅ Plan trouvé: % (type: %)', v_plan_record.name, v_plan_record.plan_type;
  ELSE
    RAISE NOTICE '❌ Plan 1_month non trouvé';
  END IF;
  
  -- Test avec format alternatif
  SELECT * INTO v_plan_record
  FROM subscription_plans 
  WHERE plan_type::text = '1-month'
  LIMIT 1;
  
  IF v_plan_record IS NOT NULL THEN
    RAISE NOTICE '✅ Plan trouvé avec format alternatif: % (type: %)', v_plan_record.name, v_plan_record.plan_type;
  ELSE
    RAISE NOTICE '❌ Plan 1-month non trouvé';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
END $$;

-- 7. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Vérification des plans d''abonnement terminée!';
  RAISE NOTICE '📋 Les plans sont maintenant disponibles pour les demandes';
  RAISE NOTICE '💡 Les types de plans sont correctement configurés';
END $$; 