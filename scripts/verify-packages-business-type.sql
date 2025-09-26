-- ============================================================================
-- SCRIPT DE VÉRIFICATION DU TYPE DE BUSINESS "PACKAGES"
-- ============================================================================
-- Ce script vérifie que le type "packages" existe avec l'ID 64

-- Vérifier si le type "packages" existe
SELECT 'Vérification du type packages:' as info;
SELECT 
    id,
    name,
    icon,
    color,
    description
FROM business_types 
WHERE name = 'packages' OR id = 64;

-- Si le type n'existe pas, le créer
DO $$
BEGIN
  -- Vérifier si le type "packages" existe
  IF NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'packages' OR id = 64) THEN
    -- Créer le type "packages" avec l'ID 64
    INSERT INTO business_types (id, name, icon, color, description, features) 
    VALUES (
      64, 
      'packages', 
      'Package', 
      '#F1948A', 
      'Services de livraison de colis et packages', 
      '["package_management", "delivery_tracking", "customer_notifications", "analytics"]'
    );
    
    RAISE NOTICE '✅ Type "packages" créé avec l''ID 64!';
  ELSE
    RAISE NOTICE 'ℹ️ Le type "packages" existe déjà.';
  END IF;
END $$;

-- Afficher tous les types de business après vérification
SELECT 'Types de business disponibles:' as info;
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- Vérifier spécifiquement le type packages
SELECT 'Type packages vérifié:' as info;
SELECT 
    id,
    name,
    icon,
    color,
    description
FROM business_types 
WHERE name = 'packages' OR id = 64;
