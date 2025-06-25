-- Script de test complet pour le système de notifications
-- Ce script teste toutes les fonctionnalités du système de notifications

-- 1. Vérifier que la table notifications existe et a la bonne structure
SELECT 
  'Table notifications' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

-- 2. Vérifier que les triggers existent
SELECT 
  'Trigger order status change' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_order_status_change') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

SELECT 
  'Trigger reservation status change' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_reservation_status_change') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

SELECT 
  'Trigger table assignment' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_table_assignment') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

SELECT 
  'Trigger new order' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_new_order') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

SELECT 
  'Trigger new reservation' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_new_reservation') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

-- 3. Vérifier que les fonctions existent
SELECT 
  'Function create_notification' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

SELECT 
  'Function notify_order_status_change' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_order_status_change') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

SELECT 
  'Function notify_reservation_status_change' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_reservation_status_change') 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

-- 4. Test de création manuelle d'une notification
-- Note: Remplacez '00000000-0000-0000-0000-000000000000' par un vrai user_id
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  notification_id UUID;
BEGIN
  -- Test de création d'une notification
  SELECT create_notification(
    test_user_id,
    'system',
    'Test de notification',
    'Ceci est un test du système de notifications.',
    'medium',
    '{"test": true, "timestamp": "2024-12-15"}'
  ) INTO notification_id;
  
  RAISE NOTICE 'Notification créée avec ID: %', notification_id;
  
  -- Vérifier que la notification a été créée
  IF EXISTS (SELECT 1 FROM notifications WHERE id = notification_id) THEN
    RAISE NOTICE 'Test de création de notification: PASS';
  ELSE
    RAISE NOTICE 'Test de création de notification: FAIL';
  END IF;
  
  -- Nettoyer
  DELETE FROM notifications WHERE id = notification_id;
END $$;

-- 5. Test des triggers de commandes (si des données de test existent)
-- Note: Ce test nécessite des données de test dans les tables orders et businesses
DO $$
DECLARE
  test_order_id UUID;
  test_business_id INTEGER;
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  initial_count INTEGER;
  final_count INTEGER;
BEGIN
  -- Compter les notifications initiales
  SELECT COUNT(*) INTO initial_count FROM notifications WHERE user_id = test_user_id;
  
  -- Chercher une commande existante pour le test
  SELECT id, business_id INTO test_order_id, test_business_id 
  FROM orders 
  WHERE user_id = test_user_id 
  LIMIT 1;
  
  IF test_order_id IS NOT NULL THEN
    -- Mettre à jour le statut pour déclencher le trigger
    UPDATE orders SET status = 'confirmed' WHERE id = test_order_id;
    
    -- Compter les notifications finales
    SELECT COUNT(*) INTO final_count FROM notifications WHERE user_id = test_user_id;
    
    IF final_count > initial_count THEN
      RAISE NOTICE 'Test trigger commande: PASS (notifications créées: %)', final_count - initial_count;
    ELSE
      RAISE NOTICE 'Test trigger commande: FAIL (aucune notification créée)';
    END IF;
  ELSE
    RAISE NOTICE 'Test trigger commande: SKIP (aucune commande de test trouvée)';
  END IF;
END $$;

-- 6. Test des triggers de réservations (si des données de test existent)
DO $$
DECLARE
  test_reservation_id UUID;
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  initial_count INTEGER;
  final_count INTEGER;
BEGIN
  -- Compter les notifications initiales
  SELECT COUNT(*) INTO initial_count FROM notifications WHERE user_id = test_user_id;
  
  -- Chercher une réservation existante pour le test
  SELECT id INTO test_reservation_id 
  FROM reservations 
  WHERE user_id = test_user_id 
  LIMIT 1;
  
  IF test_reservation_id IS NOT NULL THEN
    -- Mettre à jour le statut pour déclencher le trigger
    UPDATE reservations SET status = 'confirmed' WHERE id = test_reservation_id;
    
    -- Compter les notifications finales
    SELECT COUNT(*) INTO final_count FROM notifications WHERE user_id = test_user_id;
    
    IF final_count > initial_count THEN
      RAISE NOTICE 'Test trigger réservation: PASS (notifications créées: %)', final_count - initial_count;
    ELSE
      RAISE NOTICE 'Test trigger réservation: FAIL (aucune notification créée)';
    END IF;
  ELSE
    RAISE NOTICE 'Test trigger réservation: SKIP (aucune réservation de test trouvée)';
  END IF;
END $$;

-- 7. Test de la fonction de notification promotionnelle
DO $$
DECLARE
  initial_count INTEGER;
  final_count INTEGER;
BEGIN
  -- Compter les notifications initiales
  SELECT COUNT(*) INTO initial_count FROM notifications WHERE type = 'promotion';
  
  -- Créer une notification promotionnelle
  PERFORM create_promotional_notification(
    'Offre spéciale test',
    'Ceci est un test de notification promotionnelle.',
    'low',
    '{"test": true, "promo_code": "TEST123"}'
  );
  
  -- Compter les notifications finales
  SELECT COUNT(*) INTO final_count FROM notifications WHERE type = 'promotion';
  
  IF final_count > initial_count THEN
    RAISE NOTICE 'Test notification promotionnelle: PASS (notifications créées: %)', final_count - initial_count;
  ELSE
    RAISE NOTICE 'Test notification promotionnelle: FAIL (aucune notification créée)';
  END IF;
END $$;

-- 8. Vérifier les performances des requêtes
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM notifications 
WHERE user_id = '00000000-0000-0000-0000-000000000000' 
  AND is_read = false 
ORDER BY created_at DESC 
LIMIT 10;

-- 9. Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'notifications'
ORDER BY indexname;

-- 10. Vérifier les politiques RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- 11. Statistiques des notifications
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = false) as unread,
  COUNT(*) FILTER (WHERE is_read = true) as read
FROM notifications 
GROUP BY type 
ORDER BY total DESC;

-- 12. Nettoyage des notifications de test (optionnel)
-- DELETE FROM notifications WHERE data->>'test' = 'true';

-- 13. Résumé des tests
SELECT 
  'SYSTÈME DE NOTIFICATIONS' as section,
  'Tests terminés' as status,
  NOW() as timestamp; 