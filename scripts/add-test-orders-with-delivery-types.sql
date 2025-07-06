-- Script pour ajouter des commandes de test avec différents types de livraison
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier les businesses existants
SELECT '=== BUSINESSES EXISTANTS ===' as info;
SELECT id, name, owner_id FROM businesses LIMIT 5;

-- 2. Vérifier les utilisateurs existants
SELECT '=== UTILISATEURS EXISTANTS ===' as info;
SELECT id, name, email FROM user_profiles WHERE role_id = 1 LIMIT 5; -- customers

-- 3. Ajouter des commandes ASAP (livraison rapide)
SELECT '=== AJOUT COMMANDES ASAP ===' as info;
INSERT INTO orders (
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  grand_total,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  delivery_type,
  available_for_drivers,
  estimated_delivery_time,
  created_at
) VALUES 
-- Commande ASAP 1
(
  (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  'Restaurant Test',
  '[{"name": "Pizza Margherita", "price": 15000, "quantity": 2, "special_instructions": "Sans fromage"}]',
  'pending',
  30000,
  2000,
  32000,
  '123 Rue de la Paix, Conakry',
  'Sonner à l''interphone',
  'cash',
  'pending',
  'asap',
  true,
  (NOW() + INTERVAL '45 minutes'),
  NOW()
),
-- Commande ASAP 2
(
  (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  'Restaurant Test',
  '[{"name": "Burger Classic", "price": 12000, "quantity": 1}, {"name": "Frites", "price": 3000, "quantity": 1}]',
  'confirmed',
  15000,
  2000,
  17000,
  '456 Avenue de la Liberté, Conakry',
  'Livrer au 2ème étage',
  'mobile_money',
  'completed',
  'asap',
  true,
  (NOW() + INTERVAL '30 minutes'),
  (NOW() - INTERVAL '2 hours')
),
-- Commande ASAP 3
(
  (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  'Restaurant Test',
  '[{"name": "Salade César", "price": 8000, "quantity": 1, "special_instructions": "Sans croûtons"}]',
  'preparing',
  8000,
  2000,
  10000,
  '789 Boulevard de la République, Conakry',
  'Appeler avant de livrer',
  'cash',
  'pending',
  'asap',
  false,
  (NOW() + INTERVAL '25 minutes'),
  NOW()
);

-- 4. Ajouter des commandes programmées (scheduled)
SELECT '=== AJOUT COMMANDES PROGRAMMÉES ===' as info;
INSERT INTO orders (
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  grand_total,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  delivery_type,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end,
  available_for_drivers,
  estimated_delivery_time,
  created_at
) VALUES 
-- Commande programmée 1 (pour aujourd'hui)
(
  (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  'Restaurant Test',
  '[{"name": "Poulet Braisé", "price": 18000, "quantity": 1}, {"name": "Attieke", "price": 2000, "quantity": 1}]',
  'pending',
  20000,
  2000,
  22000,
  '321 Rue du Commerce, Conakry',
  'Livraison pour le déjeuner',
  'cash',
  'pending',
  'scheduled',
  (NOW() + INTERVAL '2 hours'),
  (NOW() + INTERVAL '2 hours'),
  (NOW() + INTERVAL '2 hours 30 minutes'),
  true,
  (NOW() + INTERVAL '2 hours 15 minutes'),
  NOW()
),
-- Commande programmée 2 (pour demain)
(
  (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  'Restaurant Test',
  '[{"name": "Poisson Braisé", "price": 22000, "quantity": 1}, {"name": "Riz", "price": 1500, "quantity": 1}]',
  'confirmed',
  23500,
  2000,
  25500,
  '654 Avenue des Nations, Conakry',
  'Livraison pour le dîner',
  'mobile_money',
  'completed',
  'scheduled',
  (NOW() + INTERVAL '1 day + 6 hours'),
  (NOW() + INTERVAL '1 day + 6 hours'),
  (NOW() + INTERVAL '1 day + 6 hours 30 minutes'),
  true,
  (NOW() + INTERVAL '1 day + 6 hours 15 minutes'),
  (NOW() - INTERVAL '1 day')
),
-- Commande programmée 3 (pour ce weekend)
(
  (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  'Restaurant Test',
  '[{"name": "Mafé", "price": 16000, "quantity": 2}, {"name": "Fonio", "price": 3000, "quantity": 1}]',
  'pending',
  35000,
  2000,
  37000,
  '987 Rue de la Plage, Conakry',
  'Livraison pour le weekend',
  'cash',
  'pending',
  'scheduled',
  (NOW() + INTERVAL '3 days + 12 hours),
  (NOW() + INTERVAL '3 days + 12 hours),
  (NOW() + INTERVAL '3 days + 12 hours 30 minutes),
  false,
  (NOW() + INTERVAL '3 days + 12 hours 15 minutes),
  NOW()
);

-- 5. Vérifier les commandes créées
SELECT '=== COMMANDES CRÉÉES ===' as info;
SELECT 
  id,
  business_name,
  delivery_type,
  status,
  grand_total,
  delivery_address,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end,
  available_for_drivers,
  estimated_delivery_time,
  created_at
FROM orders 
WHERE business_id = (SELECT id FROM businesses LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;

-- 6. Statistiques des types de livraison
SELECT '=== STATISTIQUES TYPES DE LIVRAISON ===' as info;
SELECT 
  delivery_type,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
  AVG(grand_total) as average_order_value
FROM orders 
WHERE business_id = (SELECT id FROM businesses LIMIT 1)
GROUP BY delivery_type;

-- 7. Message de confirmation
SELECT '✅ Commandes de test avec types de livraison créées avec succès!' as message;
SELECT '📋 Vérifiez l''interface partenaire pour voir les nouveaux filtres' as info;
SELECT '🔧 Les commandes ASAP et programmées sont maintenant visibles' as features; 