-- Script de données de test pour les partenaires
-- Ce script ajoute des données de test pour tester le dashboard partenaire

-- 1. Insérer des types de business
INSERT INTO business_types (id, name, description, icon, is_active) VALUES
(1, 'Restaurant', 'Restaurants et établissements de restauration', '🍽️', true),
(2, 'Café', 'Cafés et bars', '☕', true),
(3, 'Épicerie', 'Épiceries et magasins d''alimentation', '🛒', true),
(4, 'Supermarket', 'Supermarchés et hypermarchés', '🏪', true),
(5, 'Pharmacie', 'Pharmacies et parapharmacies', '💊', true),
(6, 'Électronique', 'Magasins d''électronique et informatique', '📱', true),
(7, 'Beauté', 'Salons de beauté et cosmétiques', '💄', true),
(8, 'Autre', 'Autres types de commerces', '🏪', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insérer des rôles utilisateur
INSERT INTO user_roles (id, name, description, permissions) VALUES
(1, 'customer', 'Client', '["read_own_profile", "create_orders", "read_own_orders"]'),
(2, 'partner', 'Partenaire', '["read_own_profile", "manage_business", "read_business_orders", "update_order_status"]'),
(3, 'admin', 'Administrateur', '["read_all_profiles", "manage_all_businesses", "read_all_orders", "manage_system"]')
ON CONFLICT (id) DO NOTHING;

-- 3. Insérer des utilisateurs de test (partenaires)
-- Note: Ces utilisateurs doivent exister dans auth.users
-- Vous devrez créer ces comptes via l'interface d'inscription ou via le dashboard Supabase

-- 4. Insérer des profils utilisateur pour les partenaires
-- Remplacez les UUID par les vrais IDs des utilisateurs créés dans auth.users
INSERT INTO user_profiles (id, name, email, role_id, phone_number, is_active, created_at, updated_at) VALUES
-- Partenaire 1: Restaurant Le Petit Conakry
('550e8400-e29b-41d4-a716-446655440001', 'Mamadou Diallo', 'mamadou@lepetitconakry.com', 2, '+224 623 456 789', true, NOW(), NOW()),
-- Partenaire 2: Café Central
('550e8400-e29b-41d4-a716-446655440002', 'Fatou Camara', 'fatou@cafecentral.com', 2, '+224 624 567 890', true, NOW(), NOW()),
-- Partenaire 3: Épicerie du Marché
('550e8400-e29b-41d4-a716-446655440003', 'Ibrahima Bah', 'ibrahima@epicerie.com', 2, '+224 625 678 901', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role_id = EXCLUDED.role_id,
  phone_number = EXCLUDED.phone_number,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 5. Insérer des businesses
INSERT INTO businesses (
  name, description, business_type_id, address, phone, email,
  opening_hours, cuisine_type, owner_id, is_active, is_open,
  rating, review_count, delivery_time, delivery_fee, created_at, updated_at
) VALUES
-- Restaurant Le Petit Conakry
(
  'Le Petit Conakry',
  'Restaurant traditionnel guinéen proposant une cuisine authentique et savoureuse. Spécialités locales et plats du terroir.',
  1,
  '15 Rue du Port, Kaloum, Conakry',
  '+224 623 456 789',
  'contact@lepetitconakry.com',
  'Lun-Dim: 11h00-23h00',
  'Cuisine Guinéenne',
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  4.7,
  45,
  '30-45 min',
  2000,
  NOW(),
  NOW()
),
-- Café Central
(
  'Café Central',
  'Café moderne au cœur de Conakry, proposant des boissons chaudes, des pâtisseries et des snacks légers.',
  2,
  '8 Avenue de la République, Kaloum, Conakry',
  '+224 624 567 890',
  'contact@cafecentral.com',
  'Lun-Sam: 07h00-22h00, Dim: 08h00-20h00',
  'Café & Pâtisserie',
  '550e8400-e29b-41d4-a716-446655440002',
  true,
  true,
  4.5,
  32,
  '20-30 min',
  1500,
  NOW(),
  NOW()
),
-- Épicerie du Marché
(
  'Épicerie du Marché',
  'Épicerie de proximité proposant des produits frais, des denrées de base et des produits d''entretien.',
  3,
  '25 Rue du Marché, Almamya, Conakry',
  '+224 625 678 901',
  'contact@epicerie.com',
  'Lun-Dim: 06h00-22h00',
  'Épicerie',
  '550e8400-e29b-41d4-a716-446655440003',
  true,
  true,
  4.3,
  28,
  '15-25 min',
  1000,
  NOW(),
  NOW()
)
ON CONFLICT (owner_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  business_type_id = EXCLUDED.business_type_id,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  opening_hours = EXCLUDED.opening_hours,
  cuisine_type = EXCLUDED.cuisine_type,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  delivery_time = EXCLUDED.delivery_time,
  delivery_fee = EXCLUDED.delivery_fee,
  updated_at = NOW();

-- 6. Insérer des catégories de menu pour le restaurant
INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
('Entrées', 'Entrées et apéritifs', 1, true, 1),
('Plats Principaux', 'Plats traditionnels guinéens', 1, true, 2),
('Accompagnements', 'Riz, manioc, plantains', 1, true, 3),
('Boissons', 'Boissons fraîches et chaudes', 1, true, 4),
('Desserts', 'Desserts traditionnels', 1, true, 5)
ON CONFLICT (business_id, name) DO NOTHING;

-- 7. Insérer des articles de menu pour le restaurant
INSERT INTO menu_items (
  name, description, price, image, category_id, business_id,
  is_available, is_featured, preparation_time, allergens, nutritional_info
) VALUES
-- Entrées
('Salade de Tomates', 'Salade fraîche de tomates locales avec oignons et huile d''arachide', 5000, '/images/salade-tomates.jpg', 1, 1, true, true, 10, '["arachides"]', '{"calories": 120, "proteines": 3, "glucides": 8}'),
('Beignets de Poisson', 'Beignets de poisson frais avec sauce piquante', 8000, '/images/beignets-poisson.jpg', 1, 1, true, false, 15, '["poisson", "gluten"]', '{"calories": 280, "proteines": 15, "glucides": 25}'),

-- Plats principaux
('Poulet Yassa', 'Poulet mariné dans une sauce yassa traditionnelle avec oignons', 15000, '/images/poulet-yassa.jpg', 2, 1, true, true, 25, '["poulet"]', '{"calories": 450, "proteines": 35, "glucides": 12}'),
('Mafé de Bœuf', 'Ragoût de bœuf dans une sauce à base d''arachide et d''épices', 18000, '/images/mafe-boeuf.jpg', 2, 1, true, true, 30, '["bœuf", "arachides"]', '{"calories": 520, "proteines": 40, "glucides": 15}'),
('Poisson Braisé', 'Poisson frais braisé avec épices et herbes aromatiques', 20000, '/images/poisson-braise.jpg', 2, 1, true, false, 20, '["poisson"]', '{"calories": 380, "proteines": 45, "glucides": 8}'),

-- Accompagnements
('Riz Basmati', 'Riz basmati parfumé cuit à la vapeur', 3000, '/images/riz-basmati.jpg', 3, 1, true, false, 15, '[]', '{"calories": 200, "proteines": 4, "glucides": 45}'),
('Manioc Bouilli', 'Manioc frais bouilli, spécialité locale', 2500, '/images/manioc-bouilli.jpg', 3, 1, true, false, 20, '[]', '{"calories": 180, "proteines": 2, "glucides": 42}'),
('Plantains Frits', 'Plantains mûrs frits à l''huile de palme', 4000, '/images/plantains-frits.jpg', 3, 1, true, true, 12, '[]', '{"calories": 320, "proteines": 3, "glucides": 65}'),

-- Boissons
('Bissap', 'Boisson traditionnelle à base d''hibiscus', 1500, '/images/bissap.jpg', 4, 1, true, true, 5, '[]', '{"calories": 80, "proteines": 0, "glucides": 20}'),
('Gingembre', 'Boisson rafraîchissante au gingembre', 1200, '/images/gingembre.jpg', 4, 1, true, false, 5, '[]', '{"calories": 60, "proteines": 0, "glucides": 15}'),
('Thé à la Menthe', 'Thé vert à la menthe fraîche', 1000, '/images/the-menthe.jpg', 4, 1, true, false, 5, '[]', '{"calories": 40, "proteines": 0, "glucides": 10}'),

-- Desserts
('Fruit de la Passion', 'Fruit de la passion frais du jardin', 2000, '/images/fruit-passion.jpg', 5, 1, true, true, 5, '[]', '{"calories": 100, "proteines": 2, "glucides": 25}'),
('Banane Flambée', 'Banane flambée au rhum avec glace vanille', 3500, '/images/banane-flambee.jpg', 5, 1, true, false, 10, '["lait", "gluten"]', '{"calories": 280, "proteines": 4, "glucides": 45}')
ON CONFLICT (business_id, name) DO NOTHING;

-- 8. Insérer des commandes de test
INSERT INTO orders (
  id, user_id, business_id, items, status, total, delivery_fee, grand_total,
  delivery_address, delivery_instructions, payment_method, payment_status,
  created_at, updated_at
) VALUES
-- Commande 1: En attente
(
  'ord_001', '550e8400-e29b-41d4-a716-446655440004', 1,
  '[{"name": "Poulet Yassa", "quantity": 2, "price": 15000}, {"name": "Riz Basmati", "quantity": 1, "price": 3000}]',
  'pending', 33000, 2000, 35000,
  '12 Rue de la Paix, Kaloum, Conakry',
  'Appeler avant de livrer',
  'mobile_money',
  'pending',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
-- Commande 2: Confirmée
(
  'ord_002', '550e8400-e29b-41d4-a716-446655440005', 1,
  '[{"name": "Mafé de Bœuf", "quantity": 1, "price": 18000}, {"name": "Plantains Frits", "quantity": 1, "price": 4000}]',
  'confirmed', 22000, 2000, 24000,
  '8 Avenue de la République, Kaloum, Conakry',
  NULL,
  'card',
  'paid',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes'
),
-- Commande 3: En préparation
(
  'ord_003', '550e8400-e29b-41d4-a716-446655440006', 1,
  '[{"name": "Poisson Braisé", "quantity": 1, "price": 20000}, {"name": "Manioc Bouilli", "quantity": 1, "price": 2500}, {"name": "Bissap", "quantity": 2, "price": 1500}]',
  'preparing', 25500, 2000, 27500,
  '25 Rue du Marché, Almamya, Conakry',
  'Livrer à l''entrée principale',
  'mobile_money',
  'paid',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '15 minutes'
),
-- Commande 4: Prête
(
  'ord_004', '550e8400-e29b-41d4-a716-446655440007', 1,
  '[{"name": "Salade de Tomates", "quantity": 1, "price": 5000}, {"name": "Beignets de Poisson", "quantity": 1, "price": 8000}, {"name": "Gingembre", "quantity": 1, "price": 1200}]',
  'ready', 14200, 2000, 16200,
  '15 Boulevard de la Côte, Kaloum, Conakry',
  NULL,
  'cash',
  'pending',
  NOW() - INTERVAL '20 minutes',
  NOW() - INTERVAL '5 minutes'
),
-- Commande 5: Livrée
(
  'ord_005', '550e8400-e29b-41d4-a716-446655440008', 1,
  '[{"name": "Poulet Yassa", "quantity": 1, "price": 15000}, {"name": "Riz Basmati", "quantity": 1, "price": 3000}, {"name": "Fruit de la Passion", "quantity": 1, "price": 2000}]',
  'delivered', 20000, 2000, 22000,
  '10 Rue de la Liberté, Kaloum, Conakry',
  'Livrer au 2ème étage',
  'card',
  'paid',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours'
),
-- Commande 6: Annulée
(
  'ord_006', '550e8400-e29b-41d4-a716-446655440009', 1,
  '[{"name": "Mafé de Bœuf", "quantity": 2, "price": 18000}]',
  'cancelled', 36000, 2000, 38000,
  '5 Rue de la République, Kaloum, Conakry',
  NULL,
  'mobile_money',
  'refunded',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '3 hours'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Insérer des profils utilisateur pour les clients (pour les commandes)
INSERT INTO user_profiles (id, name, email, role_id, phone_number, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Aissatou Diallo', 'aissatou@email.com', 1, '+224 626 789 012', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Moussa Camara', 'moussa@email.com', 1, '+224 627 890 123', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Fatoumata Bah', 'fatoumata@email.com', 1, '+224 628 901 234', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Ousmane Barry', 'ousmane@email.com', 1, '+224 629 012 345', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Mariama Keita', 'mariama@email.com', 1, '+224 630 123 456', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Ibrahima Sow', 'ibrahima@email.com', 1, '+224 631 234 567', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Insérer des avis de test
INSERT INTO reviews (
  user_id, business_id, order_id, rating, comment, is_verified, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655440008', 1, 'ord_005', 5, 'Excellent service et nourriture délicieuse !', true, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440004', 1, 'ord_001', 4, 'Très bon rapport qualité-prix', false, NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440005', 1, 'ord_002', 5, 'Livraison rapide et plat savoureux', true, NOW() - INTERVAL '30 minutes')
ON CONFLICT (user_id, business_id, order_id) DO NOTHING;

-- 11. Insérer des notifications de test
INSERT INTO notifications (
  user_id, business_id, title, message, type, is_read, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 'Nouvelle commande', 'Commande #ord_001 reçue - Poulet Yassa x2, Riz Basmati x1', 'order', false, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440001', 1, 'Commande confirmée', 'Commande #ord_002 confirmée et en préparation', 'order_update', false, NOW() - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440001', 1, 'Avis reçu', 'Nouvel avis 5 étoiles de Mariama Keita', 'review', false, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'Nouvelle commande', 'Commande #ord_007 reçue - Café Latte x1, Croissant x1', 'order', false, NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440003', 3, 'Nouvelle commande', 'Commande #ord_008 reçue - Produits d''entretien', 'order', false, NOW() - INTERVAL '30 minutes')
ON CONFLICT (user_id, business_id, title, created_at) DO NOTHING;

-- Afficher un résumé des données insérées
SELECT 
  'Résumé des données de test' as info,
  (SELECT COUNT(*) FROM businesses) as businesses_count,
  (SELECT COUNT(*) FROM menu_items) as menu_items_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM reviews) as reviews_count,
  (SELECT COUNT(*) FROM notifications) as notifications_count;

-- Afficher les businesses créés
SELECT 
  b.id,
  b.name,
  b.business_type_id,
  bt.name as business_type,
  b.address,
  b.phone,
  b.is_open,
  b.rating,
  b.review_count
FROM businesses b
JOIN business_types bt ON b.business_type_id = bt.id
ORDER BY b.id;

-- Afficher les commandes par statut
SELECT 
  status,
  COUNT(*) as count,
  SUM(grand_total) as total_revenue
FROM orders
GROUP BY status
ORDER BY count DESC; 