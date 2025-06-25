-- Script pour ajouter des articles de menu au service ID 1
-- Exécutez ce script dans l'éditeur SQL de Supabase après avoir ajouté les catégories

-- ============================================================================
-- AJOUT D'ARTICLES DE MENU POUR LE SERVICE ID 1
-- ============================================================================

-- Vérifier d'abord si le service ID 1 existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE id = 1) THEN
    RAISE EXCEPTION 'Le service avec l''ID 1 n''existe pas dans la table businesses';
  END IF;
END $$;

-- Vérifier que les catégories existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menu_categories WHERE business_id = 1) THEN
    RAISE EXCEPTION 'Aucune catégorie de menu trouvée pour le service ID 1. Exécutez d''abord le script add-menu-categories-service-1.sql';
  END IF;
END $$;

-- Insérer des articles de menu pour le service ID 1
INSERT INTO menu_items (name, description, price, image, category_id, business_id, is_popular, is_available, preparation_time, allergens, nutritional_info) VALUES

-- ============================================================================
-- ENTREES
-- ============================================================================
('Salade de Tomates', 'Salade fraîche de tomates locales avec oignons et huile d''arachide', 5000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Entrées' LIMIT 1), 1, true, true, 10, '["arachides"]', '{"calories": 120, "proteines": 3, "glucides": 8}'),

('Fataya', 'Beignets frits fourrés à la viande épicée ou au poisson', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Entrées' LIMIT 1), 1, true, true, 15, '["gluten", "poisson"]', '{"calories": 180, "proteines": 8, "glucides": 25}'),

('Boulettes de Viande', 'Boulettes de bœuf épicées avec sauce tomate', 2000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Entrées' LIMIT 1), 1, false, true, 20, '["gluten"]', '{"calories": 220, "proteines": 15, "glucides": 12}'),

-- ============================================================================
-- PLATS PRINCIPAUX
-- ============================================================================
('Poulet Yassa', 'Poulet mariné avec oignons et sauce moutarde, servi avec riz', 6000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Plats Principaux' LIMIT 1), 1, true, true, 25, '["moutarde"]', '{"calories": 450, "proteines": 35, "glucides": 25}'),

('Thieboudienne', 'Riz traditionnel sénégalais avec poisson et légumes', 5500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Plats Principaux' LIMIT 1), 1, true, true, 30, '["poisson"]', '{"calories": 480, "proteines": 25, "glucides": 45}'),

('Mafé', 'Ragoût de viande avec sauce arachide et légumes', 5000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Plats Principaux' LIMIT 1), 1, false, true, 35, '["arachides"]', '{"calories": 520, "proteines": 40, "glucides": 30}'),

('Poulet Braisé', 'Poulet braisé aux épices locales avec accompagnement', 7000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Plats Principaux' LIMIT 1), 1, true, true, 40, '[]', '{"calories": 550, "proteines": 45, "glucides": 20}'),

-- ============================================================================
-- ACCOMPAGNEMENTS
-- ============================================================================
('Riz Basmati', 'Riz basmati parfumé cuit à la vapeur', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Accompagnements' LIMIT 1), 1, true, true, 15, '[]', '{"calories": 200, "proteines": 4, "glucides": 45}'),

('Foutou', 'Purée de bananes plantains et igname', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Accompagnements' LIMIT 1), 1, false, true, 20, '[]', '{"calories": 280, "proteines": 3, "glucides": 65}'),

('Attieke', 'Semoule de manioc fermentée', 2000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Accompagnements' LIMIT 1), 1, false, true, 10, '[]', '{"calories": 180, "proteines": 2, "glucides": 42}'),

-- ============================================================================
-- BOISSONS
-- ============================================================================
('Jus de Gingembre', 'Boisson rafraîchissante à base de gingembre frais', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Boissons' LIMIT 1), 1, true, true, 5, '[]', '{"calories": 80, "proteines": 1, "glucides": 18}'),

('Bissap', 'Jus d''hibiscus traditionnel', 1200, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Boissons' LIMIT 1), 1, true, true, 3, '[]', '{"calories": 60, "proteines": 0, "glucides": 15}'),

('Coca-Cola', 'Boisson gazeuse classique', 1000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Boissons' LIMIT 1), 1, false, true, 2, '[]', '{"calories": 140, "proteines": 0, "glucides": 39}'),

('Eau minérale', 'Eau minérale 50cl', 500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Boissons' LIMIT 1), 1, false, true, 1, '[]', '{"calories": 0, "proteines": 0, "glucides": 0}'),

-- ============================================================================
-- DESSERTS
-- ============================================================================
('Sombi', 'Pudding de riz sucré au lait de coco', 2500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Desserts' LIMIT 1), 1, false, true, 15, '["lait"]', '{"calories": 320, "proteines": 6, "glucides": 55}'),

('Fruits de Saison', 'Assortiment de fruits frais de saison', 2000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Desserts' LIMIT 1), 1, true, true, 5, '[]', '{"calories": 120, "proteines": 2, "glucides": 28}'),

('Glace Coco', 'Glace artisanale à la noix de coco', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Desserts' LIMIT 1), 1, false, true, 2, '["lait"]', '{"calories": 280, "proteines": 4, "glucides": 35}'),

-- ============================================================================
-- SPECIALITES
-- ============================================================================
('Poulet Braisé Complet', 'Poulet entier braisé avec épices traditionnelles', 12000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Spécialités' LIMIT 1), 1, true, true, 45, '[]', '{"calories": 850, "proteines": 75, "glucides": 15}'),

('Plateau de Fruits de Mer', 'Assortiment de fruits de mer frais', 15000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Spécialités' LIMIT 1), 1, false, true, 40, '["poisson", "crustaces"]', '{"calories": 420, "proteines": 45, "glucides": 8}'),

-- ============================================================================
-- SALADES
-- ============================================================================
('Salade Composée', 'Salade fraîche avec légumes de saison', 3500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Salades' LIMIT 1), 1, true, true, 12, '[]', '{"calories": 180, "proteines": 8, "glucides": 15}'),

('Salade Niçoise', 'Salade traditionnelle avec thon, œufs et légumes', 4000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Salades' LIMIT 1), 1, false, true, 15, '["poisson", "oeufs"]', '{"calories": 320, "proteines": 25, "glucides": 12}'),

-- ============================================================================
-- SOUPES
-- ============================================================================
('Soupe à l''Oignon', 'Soupe traditionnelle française à l''oignon gratinée', 3000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Soupes' LIMIT 1), 1, false, true, 20, '["gluten"]', '{"calories": 220, "proteines": 8, "glucides": 25}'),

('Soupe de Poisson', 'Soupe traditionnelle de poisson avec légumes', 3500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Soupes' LIMIT 1), 1, true, true, 25, '["poisson"]', '{"calories": 180, "proteines": 15, "glucides": 8}');

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================

-- Afficher les articles créés par catégorie
SELECT 
  'Articles de menu créés pour le service ID 1:' as info;

SELECT 
  mc.name as category_name,
  COUNT(mi.id) as items_count
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
WHERE mc.business_id = 1
GROUP BY mc.id, mc.name, mc.sort_order
ORDER BY mc.sort_order;

-- Afficher tous les articles avec leurs détails
SELECT 
  'Détails des articles:' as info;

SELECT 
  mi.id,
  mi.name,
  mi.price,
  mc.name as category_name,
  mi.is_popular,
  mi.is_available,
  mi.preparation_time
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1
ORDER BY mc.sort_order, mi.name;

-- Compter le nombre total d'articles
SELECT 
  'Nombre total d''articles:' as info,
  COUNT(*) as total_items
FROM menu_items 
WHERE business_id = 1;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

SELECT 
  'Script exécuté avec succès !' as status,
  'Les articles de menu ont été ajoutés au service ID 1.' as message; 