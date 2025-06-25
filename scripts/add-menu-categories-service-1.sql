-- Script pour ajouter des catégories de menu au service ID 1
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- AJOUT DE CATÉGORIES DE MENU POUR LE SERVICE ID 1
-- ============================================================================

-- Vérifier d'abord si le service ID 1 existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE id = 1) THEN
    RAISE EXCEPTION 'Le service avec l''ID 1 n''existe pas dans la table businesses';
  END IF;
END $$;

-- Supprimer les catégories existantes pour le service ID 1 (optionnel)
-- Décommentez la ligne suivante si vous voulez remplacer toutes les catégories existantes
-- DELETE FROM menu_categories WHERE business_id = 1;

-- Insérer de nouvelles catégories de menu pour le service ID 1
INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
-- Catégories principales
('Entrées', 'Entrées et apéritifs pour commencer votre repas', 1, true, 1),
('Plats Principaux', 'Nos plats principaux traditionnels et modernes', 1, true, 2),
('Accompagnements', 'Riz, légumes et autres accompagnements', 1, true, 3),
('Boissons', 'Boissons fraîches, chaudes et alcoolisées', 1, true, 4),
('Desserts', 'Desserts et pâtisseries maison', 1, true, 5),
('Spécialités', 'Nos plats signature et spécialités du chef', 1, true, 6),
('Salades', 'Salades fraîches et composées', 1, true, 7),
('Soupes', 'Soupes traditionnelles et modernes', 1, true, 8);

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================

-- Afficher les catégories créées
SELECT 
  'Catégories de menu créées pour le service ID 1:' as info;

SELECT 
  id,
  name,
  description,
  sort_order,
  is_active,
  created_at
FROM menu_categories 
WHERE business_id = 1 
ORDER BY sort_order;

-- Compter le nombre total de catégories
SELECT 
  'Nombre total de catégories:' as info,
  COUNT(*) as total_categories
FROM menu_categories 
WHERE business_id = 1;

-- ============================================================================
-- SCRIPT POUR AJOUTER DES ARTICLES DE MENU (OPTIONNEL)
-- ============================================================================

-- Si vous voulez aussi ajouter des articles de menu, décommentez le code suivant :

/*
-- Insérer des articles de menu pour les nouvelles catégories
INSERT INTO menu_items (name, description, price, image, category_id, business_id, is_popular, is_available, preparation_time) VALUES
-- Entrées
('Salade de Tomates', 'Salade fraîche de tomates locales avec oignons et huile d''arachide', 5000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Entrées' LIMIT 1), 1, true, true, 10),

('Fataya', 'Beignets frits fourrés à la viande épicée', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Entrées' LIMIT 1), 1, true, true, 15),

-- Plats Principaux
('Poulet Yassa', 'Poulet mariné avec oignons et sauce moutarde, servi avec riz', 6000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Plats Principaux' LIMIT 1), 1, true, true, 25),

('Thieboudienne', 'Riz traditionnel avec poisson et légumes', 5500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Plats Principaux' LIMIT 1), 1, true, true, 30),

-- Boissons
('Jus de Gingembre', 'Boisson rafraîchissante à base de gingembre frais', 1500, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Boissons' LIMIT 1), 1, true, true, 5),

('Bissap', 'Jus d''hibiscus traditionnel', 1200, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
 (SELECT id FROM menu_categories WHERE business_id = 1 AND name = 'Boissons' LIMIT 1), 1, true, true, 3);

-- Vérifier les articles créés
SELECT 
  'Articles de menu créés:' as info;

SELECT 
  mi.id,
  mi.name,
  mi.price,
  mc.name as category_name,
  mi.is_popular,
  mi.is_available
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1
ORDER BY mc.sort_order, mi.name;
*/

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

SELECT 
  'Script exécuté avec succès !' as status,
  'Les catégories de menu ont été ajoutées au service ID 1.' as message; 