-- Script pour ajouter des données de test pour le dashboard admin
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Ajouter des utilisateurs de test (si pas déjà présents)
INSERT INTO user_profiles (id, name, email, phone_number, address, is_active, role_id, created_at)
SELECT 
  gen_random_uuid(),
  'Utilisateur Test ' || i,
  'user' || i || '@test.com',
  '+224' || (600000000 + i),
  'Adresse Test ' || i,
  true,
  (SELECT id FROM user_roles WHERE name = 'customer' LIMIT 1),
  NOW() - INTERVAL '1 day' * (i % 30)
FROM generate_series(1, 50) i
ON CONFLICT (email) DO NOTHING;

-- 2. Ajouter des commerces de test (si pas déjà présents)
INSERT INTO businesses (name, description, address, phone, email, rating, review_count, is_active, is_open, business_type_id, category_id, owner_id, created_at)
SELECT 
  'Commerce Test ' || i,
  'Description du commerce test ' || i,
  'Adresse Commerce ' || i,
  '+224' || (700000000 + i),
  'commerce' || i || '@test.com',
  4.0 + (random() * 1.0),
  floor(random() * 100),
  true,
  true,
  (SELECT id FROM business_types LIMIT 1),
  (SELECT id FROM categories LIMIT 1),
  (SELECT id FROM user_profiles WHERE role_id = (SELECT id FROM user_roles WHERE name = 'partner' LIMIT 1) LIMIT 1),
  NOW() - INTERVAL '1 day' * (i % 30)
FROM generate_series(1, 20) i
ON CONFLICT (name) DO NOTHING;

-- 3. Ajouter des commandes de test
INSERT INTO orders (id, user_id, business_id, items, status, total, delivery_fee, grand_total, payment_method, payment_status, delivery_address, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role_id = (SELECT id FROM user_roles WHERE name = 'customer' LIMIT 1) LIMIT 1),
  (SELECT id FROM businesses LIMIT 1),
  '[{"name": "Produit Test", "price": 5000, "quantity": 1}]',
  CASE (i % 6)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'confirmed'
    WHEN 2 THEN 'preparing'
    WHEN 3 THEN 'ready'
    WHEN 4 THEN 'out_for_delivery'
    ELSE 'delivered'
  END,
  5000 + (random() * 10000),
  1000,
  6000 + (random() * 10000),
  CASE (i % 2) WHEN 0 THEN 'cash' ELSE 'mobile_money' END,
  CASE (i % 3) WHEN 0 THEN 'pending' WHEN 1 THEN 'completed' ELSE 'failed' END,
  'Adresse de livraison test ' || i,
  NOW() - INTERVAL '1 hour' * (i % 168)
FROM generate_series(1, 100) i;

-- 4. Ajouter des livreurs de test
INSERT INTO drivers (id, name, phone, email, is_active, is_verified, rating, total_deliveries, total_earnings, vehicle_type, vehicle_plate, created_at)
SELECT 
  gen_random_uuid(),
  'Livreur Test ' || i,
  '+224' || (800000000 + i),
  'driver' || i || '@test.com',
  true,
  true,
  4.0 + (random() * 1.0),
  floor(random() * 500),
  floor(random() * 1000000),
  CASE (i % 3) WHEN 0 THEN 'moto' WHEN 1 THEN 'voiture' ELSE 'velo' END,
  'ABC' || (100 + i),
  NOW() - INTERVAL '1 day' * (i % 30)
FROM generate_series(1, 15) i
ON CONFLICT (phone) DO NOTHING;

-- 5. Ajouter des sessions de travail actives pour les livreurs
INSERT INTO work_sessions (driver_id, start_time, status, created_at)
SELECT 
  d.id,
  NOW() - INTERVAL '1 hour' * (random() * 8),
  'active',
  NOW() - INTERVAL '1 hour' * (random() * 8)
FROM drivers d
WHERE d.is_active = true
LIMIT 5
ON CONFLICT DO NOTHING;

-- 6. Vérifier les données ajoutées
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
  'businesses' as table_name,
  COUNT(*) as count
FROM businesses
UNION ALL
SELECT 
  'orders' as table_name,
  COUNT(*) as count
FROM orders
UNION ALL
SELECT 
  'drivers' as table_name,
  COUNT(*) as count
FROM drivers
UNION ALL
SELECT 
  'work_sessions' as table_name,
  COUNT(*) as count
FROM work_sessions
WHERE status = 'active'; 