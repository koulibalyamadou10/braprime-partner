-- Script pour insérer des données de test pour les menus des partenaires
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Insérer des catégories de menu pour le business ID 2 (Le Petit Baoulé)
INSERT INTO menu_categories (name, business_id, sort_order, is_active) VALUES
('Entrées', 2, 1, true),
('Plats Principaux', 2, 2, true),
('Accompagnements', 2, 3, true),
('Boissons', 2, 4, true),
('Desserts', 2, 5, true),
('Spécialités', 2, 6, true);

-- 2. Insérer des articles de menu pour le business ID 2
INSERT INTO menu_items (name, description, price, image, is_popular, category_id, business_id, is_available, preparation_time) VALUES
-- Entrées
('Fataya', 'Beignets frits fourrés à la viande épicée ou au poisson', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 1, 2, true, 15),
('Salade de Fruits de Mer', 'Salade fraîche avec crevettes, calamars et légumes locaux', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 1, 2, true, 10),
('Boulettes de Viande', 'Boulettes de bœuf épicées avec sauce tomate', 2000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 1, 2, true, 20),

-- Plats Principaux
('Poulet Yassa', 'Poulet mariné avec oignons et sauce moutarde, servi avec riz', 6000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 2, 2, true, 25),
('Thieboudienne', 'Riz traditionnel sénégalais avec poisson et légumes', 5500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 2, 2, true, 30),
('Mafé', 'Ragoût de viande avec sauce arachide et légumes', 5000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 2, 2, true, 35),
('Attieke avec Poisson Grillé', 'Semoule de manioc fermentée avec poisson grillé', 6500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 2, 2, true, 25),
('Poulet DG', 'Poulet avec plantains et légumes sautés', 7000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 2, 2, false, 30),

-- Accompagnements
('Riz Basmati', 'Riz parfumé cuit à la vapeur', 1000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 3, 2, true, 15),
('Plantains Frits', 'Bananes plantains frites à l\'huile de palme', 1200, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 3, 2, true, 10),
('Légumes Sautés', 'Mélange de légumes frais sautés', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 3, 2, true, 12),

-- Boissons
('Bissap', 'Jus d\'hibiscus sucré et rafraîchissant', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 4, 2, true, 5),
('Jus de Gingembre', 'Jus de gingembre épicé et rafraîchissant', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 4, 2, true, 5),
('Cocktail de Fruits', 'Mélange de fruits tropicaux frais', 2000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 4, 2, true, 8),
('Thé à la Menthe', 'Thé vert traditionnel avec menthe fraîche', 1000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 4, 2, true, 3),

-- Desserts
('Sombi', 'Pudding de riz sucré au lait de coco', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 5, 2, true, 15),
('Fruits de Saison', 'Assortiment de fruits frais de saison', 2000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 5, 2, true, 5),
('Glace Coco', 'Glace artisanale à la noix de coco', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 5, 2, true, 2),

-- Spécialités
('Poulet Braisé Complet', 'Poulet entier braisé avec épices traditionnelles', 12000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 6, 2, true, 45),
('Plateau de Fruits de Mer', 'Assortiment de fruits de mer frais', 15000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 6, 2, true, 40);

-- 3. Insérer des catégories de menu pour le business ID 3 (Chez Fatou)
INSERT INTO menu_categories (name, business_id, sort_order, is_active) VALUES
('Entrées', 3, 1, true),
('Plats Principaux', 3, 2, true),
('Accompagnements', 3, 3, true),
('Boissons', 3, 4, true),
('Desserts', 3, 5, true);

-- 4. Insérer des articles de menu pour le business ID 3
INSERT INTO menu_items (name, description, price, image, is_popular, category_id, business_id, is_available, preparation_time) VALUES
-- Entrées pour Chez Fatou
('Salade Niçoise', 'Salade traditionnelle avec thon, œufs et légumes', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 7, 3, true, 15),
('Soupe à l\'Oignon', 'Soupe traditionnelle française à l\'oignon gratinée', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 7, 3, true, 20),

-- Plats Principaux pour Chez Fatou
('Steak Frites', 'Steak de bœuf grillé avec frites maison', 8000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 8, 3, true, 25),
('Coq au Vin', 'Poulet mijoté dans du vin rouge avec légumes', 7500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 8, 3, true, 35),
('Ratatouille', 'Légumes du sud mijotés à l\'huile d\'olive', 4500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 8, 3, true, 30),

-- Accompagnements pour Chez Fatou
('Frites Maison', 'Pommes de terre frites fraîches', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 9, 3, true, 15),
('Légumes Vapeur', 'Légumes frais cuits à la vapeur', 1200, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 9, 3, true, 10),

-- Boissons pour Chez Fatou
('Vin Rouge', 'Verre de vin rouge de la maison', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 10, 3, true, 2),
('Vin Blanc', 'Verre de vin blanc de la maison', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 10, 3, true, 2),
('Eau Minérale', 'Eau minérale naturelle', 800, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 10, 3, true, 1),

-- Desserts pour Chez Fatou
('Crème Brûlée', 'Crème vanille avec caramel croquant', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 11, 3, true, 10),
('Tarte Tatin', 'Tarte aux pommes caramélisées', 3500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 11, 3, true, 15);

-- 5. Insérer des catégories de menu pour le business ID 4 (Pizza Express)
INSERT INTO menu_categories (name, business_id, sort_order, is_active) VALUES
('Pizzas', 4, 1, true),
('Pâtes', 4, 2, true),
('Salades', 4, 3, true),
('Boissons', 4, 4, true),
('Desserts', 4, 5, true);

-- 6. Insérer des articles de menu pour le business ID 4
INSERT INTO menu_items (name, description, price, image, is_popular, category_id, business_id, is_available, preparation_time) VALUES
-- Pizzas
('Margherita', 'Sauce tomate, mozzarella, basilic frais', 4500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 12, 4, true, 20),
('Pepperoni', 'Sauce tomate, mozzarella, pepperoni', 5500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 12, 4, true, 20),
('Quatre Fromages', 'Mozzarella, gorgonzola, parmesan, ricotta', 6000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 12, 4, true, 25),
('Végétarienne', 'Sauce tomate, mozzarella, légumes frais', 5000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 12, 4, true, 22),

-- Pâtes
('Spaghetti Carbonara', 'Spaghetti avec œufs, pancetta, parmesan', 4000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 13, 4, true, 15),
('Penne Arrabbiata', 'Penne avec sauce tomate épicée', 3500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 13, 4, true, 12),
('Fettuccine Alfredo', 'Fettuccine avec sauce crème et parmesan', 4500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 13, 4, true, 18),

-- Salades
('Salade César', 'Laitue, croûtons, parmesan, sauce césar', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 14, 4, true, 10),
('Salade Caprese', 'Tomates, mozzarella, basilic, huile d\'olive', 3500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 14, 4, true, 8),

-- Boissons
('Coca-Cola', 'Soda classique', 1000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 15, 4, true, 2),
('Limonade', 'Limonade fraîche maison', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 15, 4, true, 5),
('Vin Rouge', 'Verre de vin rouge italien', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 15, 4, true, 2),

-- Desserts
('Tiramisu', 'Dessert italien classique au café', 3500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 16, 4, true, 10),
('Panna Cotta', 'Crème italienne avec coulis de fruits rouges', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', false, 16, 4, true, 8);

-- Vérification des données insérées
SELECT 'Catégories de menu créées:' as info;
SELECT COUNT(*) as total_categories FROM menu_categories;

SELECT 'Articles de menu créés:' as info;
SELECT COUNT(*) as total_items FROM menu_items;

SELECT 'Articles par business:' as info;
SELECT 
  b.name as business_name,
  COUNT(mi.id) as menu_items_count
FROM businesses b
LEFT JOIN menu_items mi ON b.id = mi.business_id
GROUP BY b.id, b.name
ORDER BY b.id; 