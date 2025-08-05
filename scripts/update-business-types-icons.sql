-- ============================================================================
-- SCRIPT DE MISE À JOUR DES ICÔNES BUSINESS_TYPES
-- ============================================================================
-- Ce script remplace les emojis par les noms d'icônes Lucide correspondants

-- Afficher les données actuelles avant mise à jour
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- ============================================================================
-- MISE À JOUR DES ICÔNES EMOJI VERS LUCIDE
-- ============================================================================

-- Mise à jour des icônes emoji vers les noms Lucide
UPDATE business_types 
SET icon = CASE 
    -- Restaurants et alimentation
    WHEN icon = '🍽️' THEN 'Utensils'
    WHEN icon = '☕' THEN 'Coffee'
    WHEN icon = '🛒' THEN 'ShoppingBasket'
    WHEN icon = '🏪' THEN 'ShoppingCart'
    WHEN icon = '📦' THEN 'Package'
    WHEN icon = '🎁' THEN 'Gift'
    WHEN icon = '💊' THEN 'Pill'
    WHEN icon = '📺' THEN 'Tv'
    WHEN icon = '💼' THEN 'Briefcase'
    WHEN icon = '🍎' THEN 'Apple'
    WHEN icon = '📄' THEN 'FileText'
    WHEN icon = '👕' THEN 'Shirt'
    WHEN icon = '📖' THEN 'BookOpen'
    WHEN icon = '🌸' THEN 'Flower'
    WHEN icon = '🐕' THEN 'Dog'
    WHEN icon = '✨' THEN 'Sparkles'
    WHEN icon = '🔨' THEN 'Hammer'
    WHEN icon = '🏋️' THEN 'Dumbbell'
    WHEN icon = '🎮' THEN 'Gamepad2'
    WHEN icon = '🏠' THEN 'Home'
    WHEN icon = '🚲' THEN 'Bike'
    WHEN icon = '👶' THEN 'Baby'
    WHEN icon = '🍷' THEN 'Wine'
    WHEN icon = '✂️' THEN 'Scissors'
    WHEN icon = '🚗' THEN 'Car'
    WHEN icon = '🔧' THEN 'Wrench'
    WHEN icon = '❤️' THEN 'Heart'
    WHEN icon = '⚡' THEN 'Zap'
    WHEN icon = '📷' THEN 'Camera'
    WHEN icon = '🎵' THEN 'Music'
    WHEN icon = '🎨' THEN 'Palette'
    WHEN icon = '🌍' THEN 'Globe'
    WHEN icon = '🛡️' THEN 'Shield'
    WHEN icon = '🚚' THEN 'Truck'
    WHEN icon = '📍' THEN 'MapPin'
    WHEN icon = '📅' THEN 'Calendar'
    WHEN icon = '👥' THEN 'Users'
    WHEN icon = '⚙️' THEN 'Settings'
    WHEN icon = '⭐' THEN 'Star'
    WHEN icon = '🏆' THEN 'Award'
    WHEN icon = '🎯' THEN 'Target'
    WHEN icon = '📈' THEN 'TrendingUp'
    WHEN icon = '🎂' THEN 'Cake'
    WHEN icon = '👁️' THEN 'Eye'
    WHEN icon = '📱' THEN 'Smartphone'
    WHEN icon = '🖥️' THEN 'Monitor'
    WHEN icon = '🎧' THEN 'Headphones'
    WHEN icon = '🔑' THEN 'Key'
    
    -- Noms alternatifs vers noms Lucide
    WHEN icon = 'restaurant' THEN 'Utensils'
    WHEN icon = 'cafe' THEN 'Coffee'
    WHEN icon = 'market' THEN 'ShoppingBasket'
    WHEN icon = 'supermarket' THEN 'ShoppingCart'
    WHEN icon = 'pharmacy' THEN 'Pill'
    WHEN icon = 'electronics' THEN 'Tv'
    WHEN icon = 'beauty' THEN 'Sparkles'
    WHEN icon = 'hairdressing' THEN 'Scissors'
    WHEN icon = 'hardware' THEN 'Hammer'
    WHEN icon = 'bookstore' THEN 'BookOpen'
    WHEN icon = 'document_service' THEN 'FileText'
    WHEN icon = 'gym' THEN 'Dumbbell'
    WHEN icon = 'gaming' THEN 'Gamepad2'
    WHEN icon = 'automotive' THEN 'Car'
    WHEN icon = 'pet' THEN 'Dog'
    WHEN icon = 'florist' THEN 'Flower'
    WHEN icon = 'jewelry' THEN 'Sparkles'
    WHEN icon = 'clothing' THEN 'Shirt'
    WHEN icon = 'furniture' THEN 'Home'
    WHEN icon = 'sports' THEN 'Dumbbell'
    WHEN icon = 'entertainment' THEN 'Music'
    WHEN icon = 'travel' THEN 'Globe'
    WHEN icon = 'security' THEN 'Shield'
    WHEN icon = 'logistics' THEN 'Truck'
    WHEN icon = 'location' THEN 'MapPin'
    WHEN icon = 'schedule' THEN 'Calendar'
    WHEN icon = 'team' THEN 'Users'
    WHEN icon = 'configuration' THEN 'Settings'
    WHEN icon = 'rating' THEN 'Star'
    WHEN icon = 'achievement' THEN 'Award'
    WHEN icon = 'goal' THEN 'Target'
    WHEN icon = 'growth' THEN 'TrendingUp'
    WHEN icon = 'celebration' THEN 'Cake'
    WHEN icon = 'view' THEN 'Eye'
    WHEN icon = 'mobile' THEN 'Smartphone'
    WHEN icon = 'computer' THEN 'Monitor'
    WHEN icon = 'audio' THEN 'Headphones'
    WHEN icon = 'access' THEN 'Key'
    
    -- Garder les noms Lucide existants
    WHEN icon IN ('Utensils', 'Coffee', 'ShoppingBasket', 'ShoppingCart', 'Package', 'Gift', 'Pill', 'Tv', 'Briefcase', 'Apple', 'FileText', 'Shirt', 'BookOpen', 'Flower', 'Dog', 'Sparkles', 'Hammer', 'Dumbbell', 'Gamepad2', 'Home', 'Bike', 'Baby', 'Wine', 'Scissors', 'Car', 'Wrench', 'Store', 'Heart', 'Zap', 'Camera', 'Music', 'Palette', 'Globe', 'Shield', 'Truck', 'MapPin', 'Calendar', 'Users', 'Settings', 'Star', 'Award', 'Target', 'TrendingUp', 'Cake', 'Eye', 'Smartphone', 'Monitor', 'Headphones', 'Key') THEN icon
    
    -- Fallback pour les icônes non reconnues
    ELSE 'Utensils'
END,
updated_at = NOW()
WHERE icon IS NOT NULL;

-- ============================================================================
-- VÉRIFICATION DES RÉSULTATS
-- ============================================================================

-- Afficher les données après mise à jour
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- Compter les types d'icônes
SELECT 
    CASE 
        WHEN icon IN ('Utensils', 'Coffee', 'ShoppingBasket', 'ShoppingCart', 'Package', 'Gift', 'Pill', 'Tv', 'Briefcase', 'Apple', 'FileText', 'Shirt', 'BookOpen', 'Flower', 'Dog', 'Sparkles', 'Hammer', 'Dumbbell', 'Gamepad2', 'Home', 'Bike', 'Baby', 'Wine', 'Scissors', 'Car', 'Wrench', 'Store', 'Heart', 'Zap', 'Camera', 'Music', 'Palette', 'Globe', 'Shield', 'Truck', 'MapPin', 'Calendar', 'Users', 'Settings', 'Star', 'Award', 'Target', 'TrendingUp', 'Cake', 'Eye', 'Smartphone', 'Monitor', 'Headphones', 'Key') THEN 'Lucide Icons'
        ELSE 'Autres'
    END as icon_type,
    COUNT(*) as count
FROM business_types 
GROUP BY icon_type;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Mise à jour des icônes terminée avec succès!';
    RAISE NOTICE '📊 Toutes les icônes emoji ont été converties vers les noms d''icônes Lucide.';
    RAISE NOTICE '🎨 Les icônes sont maintenant prêtes pour l''utilisation avec Lucide React.';
END $$; 