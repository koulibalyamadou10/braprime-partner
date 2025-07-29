-- Script pour tester la signature de la fonction create_partner_subscription
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier toutes les versions de la fonction
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'create_partner_subscription'
ORDER BY proname;

-- 2. Tester l'appel de la fonction avec les bons paramètres
DO $$
DECLARE
  v_result uuid;
  v_test_partner_id integer := 1;
  v_test_plan_id uuid := '00000000-0000-0000-0000-000000000000';
  v_test_email varchar := 'test@example.com';
  v_test_phone varchar := '+1234567890';
  v_test_address text := 'Test Address';
  v_test_tax_id varchar := 'TAX123';
BEGIN
  -- Essayer d'appeler la fonction
  BEGIN
    v_result := create_partner_subscription(
      v_test_partner_id,
      v_test_plan_id,
      v_test_email,
      v_test_phone,
      v_test_address,
      v_test_tax_id
    );
    RAISE NOTICE 'Fonction appelée avec succès! Résultat: %', v_result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''appel: %', SQLERRM;
  END;
END $$;

-- 3. Vérifier si la table subscription_plans existe et contient des données
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'subscription_plans';

-- 4. Vérifier les données de test dans subscription_plans
SELECT id, plan_type, name, price FROM subscription_plans LIMIT 5;

-- 5. Vérifier si la table partner_subscriptions existe
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'partner_subscriptions'; 