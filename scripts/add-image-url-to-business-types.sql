-- Script pour ajouter la colonne image_url à la table business_types
-- Ce script est compatible avec les bases de données existantes

-- Ajouter la colonne image_url si elle n'existe pas déjà
DO $$ 
BEGIN
    -- Vérifier si la colonne existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'business_types' 
        AND column_name = 'image_url'
    ) THEN
        -- Ajouter la colonne image_url
        ALTER TABLE business_types 
        ADD COLUMN image_url VARCHAR(500);
        
        RAISE NOTICE 'Colonne image_url ajoutée à la table business_types';
    ELSE
        RAISE NOTICE 'La colonne image_url existe déjà dans la table business_types';
    END IF;
END $$;

-- Mettre à jour les types de business existants avec des images par défaut
-- Ces images peuvent être remplacées par des URLs personnalisées plus tard
UPDATE business_types 
SET image_url = CASE 
    WHEN name = 'Restaurant' THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    WHEN name = 'Café' THEN 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop'
    WHEN name = 'Boulangerie' THEN 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
    WHEN name = 'Pizzeria' THEN 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    WHEN name = 'Sushi' THEN 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    WHEN name = 'Fast Food' THEN 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    WHEN name = 'Glacier' THEN 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
    WHEN name = 'Bar' THEN 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'
END
WHERE image_url IS NULL;

-- Afficher les types de business mis à jour
SELECT id, name, image_url FROM business_types ORDER BY id;

-- Vérifier que la colonne a été ajoutée correctement
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'business_types' 
AND column_name = 'image_url'; 