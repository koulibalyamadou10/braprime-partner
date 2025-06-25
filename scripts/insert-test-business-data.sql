-- Script pour insérer des données de test pour les commerces
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Insérer des commerces de test
INSERT INTO businesses (id, name, description, cover_image, logo, cuisine_type, rating, review_count, delivery_time, delivery_fee, address, phone, opening_hours, is_popular) VALUES
(1, 'Le Petit Baoulé', 'Découvrez les saveurs authentiques de la cuisine guinéenne traditionnelle au Petit Baoulé. Nos plats sont préparés avec des ingrédients frais et locaux par nos chefs expérimentés.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Cuisine Guinéenne', 4.8, 124, '25-35 min', 15000, 'Rue KA-003, Quartier Almamya, Kaloum, Conakry', '+224 621 23 45 67', '10:00 - 22:00', true),
(2, 'Maquis du Bonheur', 'Le Maquis du Bonheur vous propose une cuisine africaine authentique dans une ambiance chaleureuse et conviviale.', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Grill Africain', 4.6, 89, '30-45 min', 20000, 'Avenue de la République, Dixinn, Conakry', '+224 621 34 56 78', '11:00 - 23:00', true),
(3, 'Café Conakry', 'Un café moderne avec une sélection de boissons chaudes et froides, ainsi que des pâtisseries fraîches.', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Café & Brunch', 4.3, 64, '20-30 min', 12000, 'Boulevard du Commerce, Almamya, Conakry', '+224 621 45 67 89', '07:00 - 20:00', false),
(4, 'Boulangerie Madina', 'Boulangerie artisanale proposant du pain frais, des viennoiseries et des pâtisseries traditionnelles.', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Boulangerie', 4.5, 76, '15-25 min', 10000, 'Rue de la Paix, Madina, Conakry', '+224 621 56 78 90', '06:00 - 19:00', true),
(5, 'Le Nil', 'Restaurant libanais authentique proposant une cuisine du Moyen-Orient raffinée et savoureuse.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Cuisine Libanaise', 4.7, 118, '30-40 min', 25000, 'Avenue des Nations Unies, Ratoma, Conakry', '+224 621 67 89 01', '12:00 - 23:00', true),
(6, 'Poulet Express', 'Spécialiste du poulet frit et grillé, servi avec des accompagnements frais et délicieux.', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Poulet Frit', 4.4, 92, '25-35 min', 15000, 'Route de Donka, Matoto, Conakry', '+224 621 78 90 12', '11:00 - 22:00', false);

-- 2. Insérer des catégories de menu pour le commerce ID 2 (Maquis du Bonheur)
INSERT INTO menu_categories (name, business_id, sort_order) VALUES
('Populaires', 2, 1),
('Entrées', 2, 2),
('Plats Principaux', 2, 3),
('Accompagnements', 2, 4),
('Boissons', 2, 5),
('Desserts', 2, 6);

-- 3. Insérer des articles de menu pour le commerce ID 2
INSERT INTO menu_items (name, description, price, image, is_popular, category_id, business_id, is_available) VALUES
-- Plats populaires
('Poulet Yassa', 'Poulet mariné avec oignons, citron et épices, servi avec du riz', 60000, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 3, 2, true),
('Sauce Arachide', 'Ragoût traditionnel à base de pâte d''arachide avec viande et légumes', 55000, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 3, 2, true),
('Alloco', 'Bananes plantains frites servies avec une sauce épicée', 20000, 'https://images.unsplash.com/photo-1599955085847-adb6d06de96b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 4, 2, true),

-- Entrées
('Salade d''Avocat', 'Avocat frais avec tomates, oignons et vinaigrette', 25000, 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 2, 2, true),
('Soupe de Poisson', 'Soupe traditionnelle de poisson avec légumes frais', 30000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 2, 2, true),

-- Plats principaux
('Mafé de Bœuf', 'Ragoût de bœuf à la sauce arachide avec légumes', 65000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 3, 2, true),
('Poulet DG', 'Poulet avec plantains et légumes sautés', 70000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 3, 2, true),
('Poisson Braisé', 'Poisson frais braisé aux épices locales', 80000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 3, 2, true),

-- Accompagnements
('Riz au Gras', 'Riz cuit avec tomates, oignons et épices', 30000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 4, 2, true),
('Foutou', 'Purée de bananes plantains et igname', 25000, 'https://images.unsplash.com/photo-1599955085847-adb6d06de96b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 4, 2, true),
('Attieke', 'Semoule de manioc fermentée', 20000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 4, 2, true),

-- Boissons
('Jus de Gingembre', 'Boisson rafraîchissante à base de gingembre frais', 15000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 5, 2, true),
('Bissap', 'Jus d''hibiscus traditionnel', 12000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 5, 2, true),
('Coca-Cola', 'Boisson gazeuse', 8000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 5, 2, true),
('Eau minérale', 'Eau minérale 50cl', 5000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 5, 2, true),

-- Desserts
('Fruit de la Passion', 'Fruit frais de la passion', 10000, 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 6, 2, true),
('Ananas Frais', 'Ananas frais coupé', 12000, 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 6, 2, true);

-- 4. Insérer des catégories pour le commerce ID 1 (Le Petit Baoulé)
INSERT INTO menu_categories (name, business_id, sort_order) VALUES
('Populaires', 1, 1),
('Entrées', 1, 2),
('Plats Principaux', 1, 3),
('Accompagnements', 1, 4),
('Boissons', 1, 5);

-- 5. Insérer des articles pour le commerce ID 1
INSERT INTO menu_items (name, description, price, image, is_popular, category_id, business_id, is_available) VALUES
('Poulet Braisé', 'Poulet braisé aux épices locales avec accompagnement', 45000, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 7, 1, true),
('Sauce Graine', 'Sauce à base de graines de palme avec viande', 50000, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 9, 1, true),
('Salade Composée', 'Salade fraîche avec légumes de saison', 20000, 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 8, 1, true),
('Riz Basmati', 'Riz basmati parfumé', 25000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 10, 1, true),
('Jus d''Orange', 'Jus d''orange frais pressé', 10000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 11, 1, true);

-- Vérifier les données insérées
SELECT 'Commerces insérés:' as info;
SELECT id, name, cuisine_type, rating FROM businesses ORDER BY id;

SELECT 'Catégories insérées:' as info;
SELECT id, name, business_id FROM menu_categories ORDER BY business_id, sort_order;

SELECT 'Articles insérés:' as info;
SELECT id, name, price, business_id, category_id FROM menu_items ORDER BY business_id, category_id; 