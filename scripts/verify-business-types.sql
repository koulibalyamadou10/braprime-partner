-- SCRIPT DE VÉRIFICATION ET CRÉATION DES TYPES DE BUSINESS
-- Ce script vérifie si les types de business existent et les crée si nécessaire

-- Vérifier si la table business_types existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'business_types') THEN
    RAISE EXCEPTION 'La table business_types n''existe pas!';
  END IF;
END $$;

-- Afficher les types de business existants
SELECT 'Types de business existants:' as info;
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- Vérifier si tous les types nécessaires existent
DO $$
DECLARE
  required_types TEXT[] := ARRAY['Restaurant', 'Café', 'Marché', 'Supermarché', 'Pharmacie', 'Électronique', 'Beauté', 'Autre'];
  missing_types TEXT[] := ARRAY[]::TEXT[];
  type_name TEXT;
BEGIN
  -- Vérifier chaque type requis
  FOREACH type_name IN ARRAY required_types
  LOOP
    IF NOT EXISTS (SELECT 1 FROM business_types WHERE name = type_name) THEN
      missing_types := array_append(missing_types, type_name);
    END IF;
  END LOOP;

  -- Afficher les types manquants
  IF array_length(missing_types, 1) > 0 THEN
    RAISE NOTICE 'Types manquants: %', array_to_string(missing_types, ', ');
    
    -- Créer les types manquants
    IF 'Restaurant' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Restaurant', '🍽️', '#FF6B6B', 'Restaurants et établissements de restauration', '["menu_management", "delivery", "reservations", "analytics"]');
    END IF;
    
    IF 'Café' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Café', '☕', '#4ECDC4', 'Cafés et établissements de boissons', '["menu_management", "delivery", "analytics"]');
    END IF;
    
    IF 'Marché' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Marché', '🛒', '#45B7D1', 'Marchés et épiceries locales', '["inventory_management", "delivery", "analytics"]');
    END IF;
    
    IF 'Supermarché' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Supermarché', '🏪', '#96CEB4', 'Supermarchés et grandes surfaces', '["inventory_management", "delivery", "analytics", "loyalty_program"]');
    END IF;
    
    IF 'Pharmacie' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Pharmacie', '💊', '#FFEAA7', 'Pharmacies et parapharmacies', '["inventory_management", "delivery", "prescription_management"]');
    END IF;
    
    IF 'Électronique' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Électronique', '📱', '#DDA0DD', 'Magasins d''électronique et technologie', '["inventory_management", "delivery", "warranty_management"]');
    END IF;
    
    IF 'Beauté' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Beauté', '💄', '#FFB6C1', 'Salons de beauté et cosmétiques', '["appointment_booking", "delivery", "loyalty_program"]');
    END IF;
    
    IF 'Autre' = ANY(missing_types) THEN
      INSERT INTO business_types (name, icon, color, description, features) 
      VALUES ('Autre', '🏢', '#A8E6CF', 'Autres types de commerces', '["basic_management", "delivery"]');
    END IF;
    
    RAISE NOTICE 'Types manquants créés avec succès!';
  ELSE
    RAISE NOTICE '✅ Tous les types de business sont présents!';
  END IF;
END $$;

-- Afficher le résultat final
SELECT 'Types de business après vérification:' as info;
SELECT id, name, icon, color FROM business_types ORDER BY id;

-- Compter le total
SELECT 
  'Total des types de business:' as info,
  COUNT(*) as total
FROM business_types; 