-- ============================================================================
-- SCRIPT DE VÉRIFICATION DES IDs DES BUSINESS_TYPES
-- ============================================================================
-- Ce script vérifie les IDs réels des types de business dans la base de données

-- Afficher tous les business_types avec leurs IDs
SELECT 
    'Business Types existants:' as info;

SELECT 
    id,
    name,
    icon,
    color,
    description,
    created_at
FROM business_types 
ORDER BY id;

-- Compter le nombre total de business_types
SELECT 
    'Nombre total de business_types:' as info,
    COUNT(*) as total_count
FROM business_types;

-- Vérifier s'il y a des business_types avec des noms spécifiques
SELECT 
    'Recherche par noms:' as info;

SELECT 
    id,
    name,
    icon
FROM business_types 
WHERE name IN (
    'restaurant', 'Restaurant',
    'cafe', 'Café', 
    'market', 'Marché',
    'supermarket', 'Supermarché',
    'pharmacy', 'Pharmacie',
    'electronics', 'Électronique',
    'beauty', 'Beauté',
    'hairdressing', 'Coiffure',
    'hardware', 'Bricolage',
    'bookstore', 'Librairie',
    'document_service', 'Services de Documents'
)
ORDER BY name; 