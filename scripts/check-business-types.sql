-- ============================================================================
-- SCRIPT DE VÉRIFICATION DE LA TABLE BUSINESS_TYPES
-- ============================================================================
-- Ce script affiche le contenu de la table business_types pour diagnostiquer les icônes

-- ============================================================================
-- AFFICHAGE DU CONTENU COMPLET
-- ============================================================================

-- Afficher toutes les colonnes de la table business_types
SELECT 
    id,
    name,
    icon,
    color,
    description,
    created_at,
    updated_at
FROM business_types 
ORDER BY id;

-- ============================================================================
-- STATISTIQUES SIMPLES
-- ============================================================================

-- Compter les types d'icônes
SELECT 
    CASE 
        WHEN icon IS NULL THEN 'NULL'
        WHEN icon = '' THEN 'VIDE'
        WHEN icon IN ('Utensils', 'Coffee', 'ShoppingBasket', 'ShoppingCart', 'Package', 'Gift', 'Pill', 'Tv', 'Briefcase', 'Apple', 'FileText', 'Shirt', 'BookOpen', 'Flower', 'Dog', 'Sparkles', 'Hammer', 'Dumbbell', 'Gamepad2', 'Home', 'Bike', 'Baby', 'Wine', 'Scissors', 'Car', 'Wrench', 'Store', 'Heart', 'Zap', 'Camera', 'Music', 'Palette', 'Globe', 'Shield', 'Truck', 'MapPin', 'Calendar', 'Users', 'Settings', 'Star', 'Award', 'Target', 'TrendingUp', 'Cake', 'Eye', 'Smartphone', 'Monitor', 'Headphones', 'Key') THEN 'Lucide Icons'
        ELSE 'Autres'
    END as icon_type,
    COUNT(*) as count
FROM business_types 
GROUP BY icon_type
ORDER BY count DESC;

-- ============================================================================
-- DÉTAIL DES ICÔNES
-- ============================================================================

-- Afficher les icônes Lucide
SELECT 
    id,
    name,
    icon,
    color
FROM business_types 
WHERE icon IN ('Utensils', 'Coffee', 'ShoppingBasket', 'ShoppingCart', 'Package', 'Gift', 'Pill', 'Tv', 'Briefcase', 'Apple', 'FileText', 'Shirt', 'BookOpen', 'Flower', 'Dog', 'Sparkles', 'Hammer', 'Dumbbell', 'Gamepad2', 'Home', 'Bike', 'Baby', 'Wine', 'Scissors', 'Car', 'Wrench', 'Store', 'Heart', 'Zap', 'Camera', 'Music', 'Palette', 'Globe', 'Shield', 'Truck', 'MapPin', 'Calendar', 'Users', 'Settings', 'Star', 'Award', 'Target', 'TrendingUp', 'Cake', 'Eye', 'Smartphone', 'Monitor', 'Headphones', 'Key')
ORDER BY name;

-- Afficher les autres types d'icônes
SELECT 
    id,
    name,
    icon,
    color
FROM business_types 
WHERE icon NOT IN ('Utensils', 'Coffee', 'ShoppingBasket', 'ShoppingCart', 'Package', 'Gift', 'Pill', 'Tv', 'Briefcase', 'Apple', 'FileText', 'Shirt', 'BookOpen', 'Flower', 'Dog', 'Sparkles', 'Hammer', 'Dumbbell', 'Gamepad2', 'Home', 'Bike', 'Baby', 'Wine', 'Scissors', 'Car', 'Wrench', 'Store', 'Heart', 'Zap', 'Camera', 'Music', 'Palette', 'Globe', 'Shield', 'Truck', 'MapPin', 'Calendar', 'Users', 'Settings', 'Star', 'Award', 'Target', 'TrendingUp', 'Cake', 'Eye', 'Smartphone', 'Monitor', 'Headphones', 'Key')
AND icon IS NOT NULL 
AND icon != ''
ORDER BY name;

-- ============================================================================
-- VÉRIFICATION DES COULEURS
-- ============================================================================

-- Afficher les couleurs utilisées
SELECT 
    color,
    COUNT(*) as count
FROM business_types 
GROUP BY color
ORDER BY count DESC;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================

-- Résumé général
SELECT 
    COUNT(*) as total_business_types,
    COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as with_icons,
    COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as without_icons,
    COUNT(CASE WHEN color IS NOT NULL AND color != '' THEN 1 END) as with_colors,
    COUNT(CASE WHEN color IS NULL OR color = '' THEN 1 END) as without_colors
FROM business_types;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Vérification de la table business_types terminée!';
    RAISE NOTICE '📊 Consultez les résultats ci-dessus pour diagnostiquer les icônes.';
    RAISE NOTICE '🎯 Les icônes Lucide sont prêtes pour l''utilisation avec le composant React.';
END $$; 

-- Script pour vérifier les business_types disponibles
SELECT 'Business Types disponibles:' as info;
SELECT id, name FROM business_types ORDER BY id;

-- Vérifier les demandes existantes
SELECT 'Demandes existantes:' as info;
SELECT 
  id,
  business_type,
  business_name,
  user_email,
  created_at
FROM requests 
WHERE type = 'partner' AND status = 'pending'
ORDER BY created_at DESC; 