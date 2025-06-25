-- Script simple pour ajouter des catégories de menu au service ID 1
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter des catégories de menu pour le service ID 1
INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
('Entrées', 'Entrées et apéritifs', 1, true, 1),
('Plats Principaux', 'Plats principaux traditionnels', 1, true, 2),
('Accompagnements', 'Riz, légumes et accompagnements', 1, true, 3),
('Boissons', 'Boissons fraîches et chaudes', 1, true, 4),
('Desserts', 'Desserts et pâtisseries', 1, true, 5)
ON CONFLICT (business_id, name) DO NOTHING;

-- Vérifier les catégories ajoutées
SELECT 
  id,
  name,
  sort_order,
  is_active
FROM menu_categories 
WHERE business_id = 1 
ORDER BY sort_order; 