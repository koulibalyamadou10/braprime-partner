-- Script de test pour les notifications
-- Ce script permet de tester la création et la gestion des notifications

-- 1. Vérifier que la table notifications existe
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- 3. Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'notifications';

-- 4. Insérer des notifications de test (remplacer USER_ID par un vrai ID d'utilisateur)
-- Note: Remplacez '00000000-0000-0000-0000-000000000000' par un vrai user_id

-- Notification de commande
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
  ('00000000-0000-0000-0000-000000000000', 'order_status', 'Commande confirmée', 'Votre commande #12345678 a été confirmée et est en cours de préparation.', 'medium', '{"order_id": "12345678", "business_name": "Restaurant Test", "total": 25.50}');

-- Notification de livraison
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
  ('00000000-0000-0000-0000-000000000000', 'delivery_update', 'Livraison en cours', 'Votre commande #12345678 est en cours de livraison. Livreur: Jean Dupont', 'high', '{"order_id": "12345678", "driver_name": "Jean Dupont", "estimated_time": "15-30 minutes"}');

-- Notification de réservation
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
  ('00000000-0000-0000-0000-000000000000', 'reservation', 'Réservation confirmée', 'Votre réservation chez Restaurant Test pour le 15/12/2024 à 19:00 a été confirmée.', 'medium', '{"reservation_id": "res_123", "business_name": "Restaurant Test", "date": "2024-12-15", "time": "19:00", "guests": 4}');

-- Notification de promotion
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
  ('00000000-0000-0000-0000-000000000000', 'promotion', 'Offre spéciale weekend', 'Profitez de 20% de réduction sur votre commande ce weekend avec le code WEEKEND20 !', 'low', '{"promo_code": "WEEKEND20", "discount": 20, "valid_until": "2024-12-16"}');

-- Notification système
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
  ('00000000-0000-0000-0000-000000000000', 'system', 'Profil mis à jour', 'Vos informations de profil ont été mises à jour avec succès.', 'low', '{"profile_updated": true, "updated_fields": ["email", "phone"]}');

-- 5. Vérifier les notifications créées
SELECT 
  id,
  type,
  title,
  message,
  priority,
  is_read,
  created_at,
  data
FROM notifications 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY created_at DESC;

-- 6. Tester le marquage comme lu
UPDATE notifications 
SET is_read = true 
WHERE id = (
  SELECT id 
  FROM notifications 
  WHERE user_id = '00000000-0000-0000-0000-000000000000' 
    AND is_read = false 
  LIMIT 1
);

-- 7. Vérifier les notifications non lues
SELECT 
  COUNT(*) as unread_count
FROM notifications 
WHERE user_id = '00000000-0000-0000-0000-000000000000' 
  AND is_read = false;

-- 8. Tester la suppression d'une notification
DELETE FROM notifications 
WHERE id = (
  SELECT id 
  FROM notifications 
  WHERE user_id = '00000000-0000-0000-0000-000000000000' 
  LIMIT 1
);

-- 9. Vérifier les notifications par type
SELECT 
  type,
  COUNT(*) as count
FROM notifications 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
GROUP BY type
ORDER BY count DESC;

-- 10. Nettoyer les notifications de test (optionnel)
-- DELETE FROM notifications WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 11. Vérifier les performances avec EXPLAIN
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM notifications 
WHERE user_id = '00000000-0000-0000-0000-000000000000' 
  AND is_read = false 
ORDER BY created_at DESC;

-- 12. Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'notifications'; 