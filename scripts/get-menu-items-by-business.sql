-- Récupérer les articles de menu par business ID
-- Exécutez cette requête dans l'éditeur SQL de Supabase

-- Récupérer tous les articles d'un business spécifique
SELECT 
  id,
  name,
  description,
  price,
  image,
  is_popular,
  category_id,
  business_id,
  is_available,
  sort_order,
  created_at
FROM menu_items 
WHERE business_id = 1  -- Remplacez 1 par l'ID du business souhaité
  AND is_available = true
ORDER BY sort_order, name; 