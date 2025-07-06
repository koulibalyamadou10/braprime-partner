-- Script pour tester les types de livraison dans le checkout
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier les commandes récentes avec leurs types de livraison
SELECT '=== COMMANDES RÉCENTES AVEC TYPES DE LIVRAISON ===' as info;
SELECT 
  id,
  business_name,
  delivery_type,
  delivery_method,
  estimated_delivery_time,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end,
  available_for_drivers,
  status,
  grand_total,
  created_at
FROM orders 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Statistiques des types de livraison
SELECT '=== STATISTIQUES DES TYPES DE LIVRAISON ===' as info;
SELECT 
  delivery_type,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
  AVG(grand_total) as average_order_value,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders 
GROUP BY delivery_type
ORDER BY delivery_type;

-- 3. Vérifier les commandes ASAP
SELECT '=== COMMANDES ASAP ===' as info;
SELECT 
  id,
  business_name,
  delivery_type,
  estimated_delivery_time,
  available_for_drivers,
  status,
  grand_total,
  created_at
FROM orders 
WHERE delivery_type = 'asap'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérifier les commandes programmées
SELECT '=== COMMANDES PROGRAMMÉES ===' as info;
SELECT 
  id,
  business_name,
  delivery_type,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end,
  available_for_drivers,
  status,
  grand_total,
  created_at
FROM orders 
WHERE delivery_type = 'scheduled'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Vérifier les commandes disponibles pour les chauffeurs
SELECT '=== COMMANDES DISPONIBLES POUR CHAUFFEURS ===' as info;
SELECT 
  o.id,
  o.business_name,
  o.delivery_type,
  o.estimated_delivery_time,
  o.available_for_drivers,
  o.status,
  o.grand_total,
  o.created_at
FROM orders o
WHERE o.available_for_drivers = true 
  AND o.status IN ('pending', 'confirmed', 'preparing', 'ready')
ORDER BY 
  o.delivery_type DESC, -- ASAP en premier
  o.created_at ASC
LIMIT 10;

-- 6. Vérifier la cohérence des données
SELECT '=== VÉRIFICATION COHÉRENCE ===' as info;
SELECT 
  'Commandes sans delivery_type' as check_type,
  COUNT(*) as count
FROM orders 
WHERE delivery_type IS NULL
UNION ALL
SELECT 
  'Commandes ASAP sans estimated_delivery_time' as check_type,
  COUNT(*) as count
FROM orders 
WHERE delivery_type = 'asap' AND estimated_delivery_time IS NULL
UNION ALL
SELECT 
  'Commandes programmées sans fenêtres' as check_type,
  COUNT(*) as count
FROM orders 
WHERE delivery_type = 'scheduled' 
  AND (scheduled_delivery_window_start IS NULL OR scheduled_delivery_window_end IS NULL);

-- 7. Message de confirmation
SELECT '✅ Test des types de livraison terminé!' as message;
SELECT '📋 Vérifiez que les commandes ont les bons types (asap/scheduled)' as info;
SELECT '🔧 Les commandes ASAP doivent avoir available_for_drivers = true' as note;

-- Script de test pour vérifier les types de livraison dans les commandes
-- Ce script teste la création de commandes avec les types ASAP et Scheduled

-- 1. Vérifier la structure de la table orders
SELECT '=== STRUCTURE TABLE ORDERS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
AND column_name IN ('delivery_type', 'preferred_delivery_time', 'scheduled_delivery_window_start', 'scheduled_delivery_window_end', 'available_for_drivers')
ORDER BY column_name;

-- 2. Vérifier les contraintes sur delivery_type
SELECT '=== CONTRAINTES DELIVERY_TYPE ===' as info;
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND conname LIKE '%delivery_type%';

-- 3. Créer une commande de test ASAP
SELECT '=== TEST COMMANDE ASAP ===' as info;
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  payment_method,
  payment_status,
  delivery_type,
  available_for_drivers
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles LIMIT 1),
  1,
  'Restaurant Test',
  '[{"name": "Pizza Test", "price": 5000, "quantity": 1}]',
  'pending',
  5000,
  2000,
  750,
  7750,
  'delivery',
  '123 Test Street, Conakry',
  'cash',
  'pending',
  'asap',
  true
) RETURNING id, delivery_type, available_for_drivers, created_at;

-- 4. Créer une commande de test Scheduled
SELECT '=== TEST COMMANDE SCHEDULED ===' as info;
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  payment_method,
  payment_status,
  delivery_type,
  available_for_drivers,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles LIMIT 1),
  1,
  'Restaurant Test',
  '[{"name": "Burger Test", "price": 3000, "quantity": 1}]',
  'pending',
  3000,
  2000,
  450,
  5450,
  'delivery',
  '456 Test Avenue, Conakry',
  'cash',
  'pending',
  'scheduled',
  false,
  (NOW() + INTERVAL '2 hours')::timestamp with time zone,
  (NOW() + INTERVAL '1 hour 45 minutes')::timestamp with time zone,
  (NOW() + INTERVAL '2 hours 15 minutes')::timestamp with time zone
) RETURNING id, delivery_type, available_for_drivers, preferred_delivery_time, scheduled_delivery_window_start, scheduled_delivery_window_end;

-- 5. Vérifier les commandes créées
SELECT '=== VÉRIFICATION COMMANDES ===' as info;
SELECT 
  id,
  business_name,
  delivery_type,
  available_for_drivers,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end,
  status,
  total,
  grand_total,
  created_at
FROM orders 
WHERE business_name = 'Restaurant Test'
ORDER BY created_at DESC
LIMIT 5;

-- 6. Test de validation des contraintes
SELECT '=== TEST CONTRAINTES ===' as info;
-- Test avec un type de livraison invalide (doit échouer)
DO $$
BEGIN
  BEGIN
    INSERT INTO orders (
      id, user_id, business_id, business_name, items, status, total, delivery_fee, tax, grand_total,
      delivery_method, delivery_address, payment_method, payment_status, delivery_type
    ) VALUES (
      gen_random_uuid(),
      (SELECT id FROM user_profiles LIMIT 1),
      1, 'Test Invalid', '[{"name": "Test", "price": 1000, "quantity": 1}]',
      'pending', 1000, 0, 150, 1150, 'delivery', 'Test Address',
      'cash', 'pending', 'invalid_type'
    );
    RAISE NOTICE '❌ ERREUR: La contrainte delivery_type n''a pas fonctionné';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE '✅ SUCCÈS: La contrainte delivery_type fonctionne correctement';
  END;
END $$;

-- 7. Nettoyer les données de test
SELECT '=== NETTOYAGE ===' as info;
DELETE FROM orders WHERE business_name = 'Restaurant Test';
SELECT 'Données de test supprimées' as message;

-- 8. Résumé
SELECT '✅ Tests des types de livraison terminés avec succès!' as message; 