-- ============================================================================
-- SCRIPT DE DONNÉES DE TEST POUR BRAPRIME
-- ============================================================================
-- Ce script insère des données de test pour rendre la page d'accueil dynamique
-- Exécutez ce script après le script principal supabase-schema.sql

-- ============================================================================
-- DONNÉES DE TEST POUR LES COMMERCES
-- ============================================================================

-- Insérer des commerces de test
INSERT INTO businesses (name, description, business_type_id, category_id, cover_image, logo, rating, review_count, delivery_time, delivery_fee, address, phone, email, opening_hours, cuisine_type, latitude, longitude, is_active, is_open) VALUES
('Le Petit Baoulé', 'Restaurant traditionnel guinéen avec les meilleurs plats locaux', 1, 1, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.8, 124, '25-35 min', 15000, 'Kaloum, Conakry', '+224 621 100 001', 'contact@petitbaoule.gn', '7h-23h', 'Cuisine Guinéenne', 9.5370, -13.6785, true, true),

('Café Conakry', 'Café moderne avec pâtisseries et boissons chaudes', 2, 2, 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.6, 89, '20-30 min', 12000, 'Almamya, Conakry', '+224 621 100 002', 'contact@cafeconakry.gn', '6h-22h', 'Café', 9.5370, -13.6785, true, true),

('Marché Central', 'Marché traditionnel avec produits frais et locaux', 3, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.4, 67, '30-45 min', 8000, 'Marché Central, Conakry', '+224 621 100 003', 'contact@marchecentral.gn', '6h-18h', 'Marché', 9.5370, -13.6785, true, true),

('Super Marché Alpha', 'Supermarché moderne avec produits importés et locaux', 4, 4, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.7, 156, '35-50 min', 20000, 'Ratoma, Conakry', '+224 621 100 004', 'contact@alphamarket.gn', '8h-21h', 'Supermarché', 9.5370, -13.6785, true, true),

('Pharmacie Santé Plus', 'Pharmacie avec médicaments et produits de santé', 5, 7, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.9, 203, '15-25 min', 10000, 'Dixinn, Conakry', '+224 621 100 005', 'contact@santeplus.gn', '24h/24', 'Pharmacie', 9.5370, -13.6785, true, true),

('Électronique Pro', 'Magasin d''électronique avec smartphones et ordinateurs', 6, 8, 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.5, 78, '45-60 min', 25000, 'Matam, Conakry', '+224 621 100 006', 'contact@electroniquepro.gn', '9h-19h', 'Électronique', 9.5370, -13.6785, true, true),

('Beauté Élégance', 'Salon de beauté et institut esthétique', 7, 11, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.8, 145, '40-55 min', 18000, 'Matoto, Conakry', '+224 621 100 007', 'contact@beautelegance.gn', '8h-20h', 'Beauté', 9.5370, -13.6785, true, true),

('Coiffure Moderne', 'Salon de coiffure professionnel', 8, 13, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', 4.6, 92, '35-50 min', 15000, 'Kaloum, Conakry', '+224 621 100 008', 'contact@coiffuremoderne.gn', '8h-19h', 'Coiffure', 9.5370, -13.6785, true, true);

-- ============================================================================
-- DONNÉES DE TEST POUR LES CATÉGORIES DE MENU
-- ============================================================================

-- Insérer des catégories de menu pour le restaurant
INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
('Plats Principaux', 'Nos meilleurs plats traditionnels', 1, true, 1),
('Entrées', 'Entrées et apéritifs', 1, true, 2),
('Boissons', 'Boissons fraîches et chaudes', 1, true, 3),
('Desserts', 'Desserts et pâtisseries', 1, true, 4),
('Cafés', 'Cafés et boissons chaudes', 2, true, 1),
('Pâtisseries', 'Pâtisseries fraîches', 2, true, 2),
('Boissons Fraîches', 'Jus et boissons fraîches', 2, true, 3);

-- ============================================================================
-- DONNÉES DE TEST POUR LES ARTICLES DE MENU
-- ============================================================================

-- Insérer des articles de menu pour le restaurant
INSERT INTO menu_items (name, description, price, image, category_id, business_id, is_popular, is_available, allergens, nutritional_info, preparation_time, sort_order) VALUES
('Poulet Yassa', 'Poulet mariné avec oignons, citron et épices, servi avec du riz', 60000, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1, 1, true, true, '["gluten"]', '{"calories": 450, "protein": 35, "carbs": 25}', 25, 1),

('Mafé de Bœuf', 'Ragoût de bœuf aux arachides et légumes', 75000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1, 1, true, true, '["arachides"]', '{"calories": 520, "protein": 40, "carbs": 30}', 30, 2),

('Thiéboudienne', 'Riz au poisson avec légumes', 55000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1, 1, false, true, '["poisson"]', '{"calories": 480, "protein": 25, "carbs": 45}', 20, 3),

('Salade de Fruits', 'Salade de fruits frais de saison', 15000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 2, 1, false, true, '[]', '{"calories": 120, "protein": 2, "carbs": 25}', 10, 1),

('Café Touba', 'Café traditionnel avec épices', 5000, 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, 2, true, true, '[]', '{"calories": 5, "protein": 0, "carbs": 1}', 5, 1),

('Cappuccino', 'Cappuccino italien avec mousse de lait', 8000, 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, 2, true, true, '["lait"]', '{"calories": 120, "protein": 8, "carbs": 12}', 8, 2),

('Croissant', 'Croissant au beurre frais', 3000, 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 6, 2, true, true, '["gluten", "lait"]', '{"calories": 280, "protein": 6, "carbs": 30}', 3, 1),

('Pain au Chocolat', 'Pain au chocolat artisanal', 3500, 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 6, 2, false, true, '["gluten", "lait", "chocolat"]', '{"calories": 320, "protein": 7, "carbs": 35}', 3, 2);

-- ============================================================================
-- DONNÉES DE TEST POUR LES AVIS (sans références utilisateur)
-- ============================================================================

-- Insérer des avis de test sans références utilisateur
INSERT INTO reviews (user_name, business_id, rating, comment, is_verified) VALUES
('Mamadou Diallo', 1, 5, 'Excellent service et nourriture délicieuse !', true),

('Fatou Camara', 2, 4, 'Café très bon et livraison rapide', true),

('Ibrahima Barry', 1, 5, 'Le meilleur restaurant de Conakry !', true),

('Aissatou Bah', 5, 5, 'Pharmacie très professionnelle et service impeccable', true),

('Ousmane Diallo', 3, 4, 'Produits frais et prix compétitifs', true),

('Mariama Camara', 4, 5, 'Supermarché moderne avec tout ce qu''il faut', true),

('Souleymane Keita', 6, 4, 'Équipements de qualité et service technique', true),

('Fanta Touré', 7, 5, 'Beauté Élégance offre un service exceptionnel', true);

-- ============================================================================
-- DONNÉES DE TEST POUR LES COMMANDES (sans références utilisateur)
-- ============================================================================

-- Insérer des commandes de test sans références utilisateur
INSERT INTO orders (business_id, business_name, items, status, total, delivery_fee, tax, grand_total, delivery_method, delivery_address, payment_method, payment_status, estimated_delivery) VALUES
(1, 'Le Petit Baoulé', '[{"id": 1, "name": "Poulet Yassa", "price": 60000, "quantity": 2}]', 'delivered', 120000, 15000, 21600, 156600, 'delivery', 'Kaloum, Conakry', 'cash', 'paid', NOW() + INTERVAL '30 minutes'),

(2, 'Café Conakry', '[{"id": 5, "name": "Café Touba", "price": 5000, "quantity": 1}, {"id": 7, "name": "Croissant", "price": 3000, "quantity": 2}]', 'delivered', 11000, 12000, 1980, 24980, 'delivery', 'Dixinn, Conakry', 'cash', 'paid', NOW() + INTERVAL '25 minutes'),

(1, 'Le Petit Baoulé', '[{"id": 2, "name": "Mafé de Bœuf", "price": 75000, "quantity": 1}]', 'preparing', 75000, 15000, 13500, 103500, 'delivery', 'Kaloum, Conakry', 'cash', 'pending', NOW() + INTERVAL '35 minutes'),

(3, 'Marché Central', '[{"id": 1, "name": "Fruits frais", "price": 25000, "quantity": 1}]', 'delivered', 25000, 8000, 4500, 37500, 'delivery', 'Ratoma, Conakry', 'cash', 'paid', NOW() + INTERVAL '40 minutes'),

(4, 'Super Marché Alpha', '[{"id": 1, "name": "Produits d''épicerie", "price": 45000, "quantity": 1}]', 'delivered', 45000, 20000, 8100, 73100, 'delivery', 'Matam, Conakry', 'cash', 'paid', NOW() + INTERVAL '45 minutes');

-- ============================================================================
-- DONNÉES DE TEST POUR LES NOTIFICATIONS (sans références utilisateur)
-- ============================================================================

-- Insérer des notifications de test sans références utilisateur
INSERT INTO notifications (type, title, message, priority, is_read, data) VALUES
('order_status', 'Commande confirmée', 'Votre commande chez Le Petit Baoulé a été confirmée', 'medium', false, '{"order_id": "sample-order-1"}'),

('delivery_update', 'Livraison en cours', 'Votre commande est en cours de livraison', 'high', false, '{"order_id": "sample-order-2"}'),

('promotion', 'Offre spéciale', '20% de réduction sur votre prochaine commande', 'low', true, '{"discount": 20}'),

('system', 'Bienvenue sur BraPrime', 'Découvrez nos meilleurs restaurants et commerces', 'low', false, '{"welcome": true}');

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Données de test BraPrime insérées avec succès!';
  RAISE NOTICE 'Commerces, menus, commandes et avis créés.';
  RAISE NOTICE 'La page d''accueil affichera maintenant des données dynamiques.';
  RAISE NOTICE 'Note: Les utilisateurs et livreurs nécessitent une authentification Supabase.';
END $$; 