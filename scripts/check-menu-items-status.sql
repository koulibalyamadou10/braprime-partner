-- Script pour vérifier le statut is_available des articles de menu
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Vérifier le statut is_available de tous les articles du business ID 1
SELECT 
  'Statut des articles de menu:' as info;
SELECT 
  mi.id,
  mi.name,
  mi.is_available,
  mi.is_popular,
  mc.name as category_name,
  mi.price
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 1
ORDER BY mi.is_available DESC, mc.sort_order, mi.name;

-- Compter les articles par statut
SELECT 
  'Comptage par statut:' as info;
SELECT 
  is_available,
  COUNT(*) as count
FROM menu_items 
WHERE business_id = 1
GROUP BY is_available;

-- Mettre à jour tous les articles pour les rendre disponibles
SELECT 
  'Mise à jour des articles (décommentez pour exécuter):' as info;
-- UPDATE menu_items 
-- SET is_available = true 
-- WHERE business_id = 1; 