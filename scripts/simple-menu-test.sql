-- Script simple pour tester les articles de menu
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si le business existe
SELECT 'Business ID 1:' as info;
SELECT * FROM businesses WHERE id = 1;

-- 2. Vérifier les articles existants
SELECT 'Articles existants:' as info;
SELECT * FROM menu_items WHERE business_id = 1;

-- 3. Insérer des articles de test simples
INSERT INTO menu_items (name, description, price, business_id, is_available, is_popular) VALUES
  ('Poulet Braisé', 'Poulet braisé aux herbes avec accompagnement', 25000, 1, true, true),
  ('Riz au Poisson', 'Riz cuit avec poisson frais et légumes', 20000, 1, true, true),
  ('Salade César', 'Salade fraîche avec poulet grillé', 15000, 1, true, false),
  ('Tiramisu', 'Dessert italien classique', 8000, 1, true, false),
  ('Jus de Fruits', 'Jus de fruits frais', 3000, 1, true, false)
ON CONFLICT DO NOTHING;

-- 4. Vérifier le résultat
SELECT 'Articles après insertion:' as info;
SELECT 
  id,
  name,
  description,
  price,
  is_available,
  is_popular,
  business_id
FROM menu_items 
WHERE business_id = 1
ORDER BY name; 