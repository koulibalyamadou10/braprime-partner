-- Script pour corriger la relation entre orders et user_profiles
-- Ce script ajoute la contrainte de clé étrangère manquante

-- 1. Vérifier si la colonne user_id existe dans la table orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_id'
    ) THEN
        -- Ajouter la colonne user_id si elle n'existe pas
        ALTER TABLE orders ADD COLUMN user_id UUID;
    END IF;
END $$;

-- 2. Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey' 
        AND table_name = 'orders'
    ) THEN
        -- Ajouter la contrainte de clé étrangère
        ALTER TABLE orders 
        ADD CONSTRAINT orders_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Créer un index sur user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 4. Vérifier et corriger les données existantes
-- Mettre à jour les commandes existantes avec des user_id valides si nécessaire
UPDATE orders 
SET user_id = '550e8400-e29b-41d4-a716-446655440004'
WHERE user_id IS NULL AND id = 'ord_001';

UPDATE orders 
SET user_id = '550e8400-e29b-41d4-a716-446655440005'
WHERE user_id IS NULL AND id = 'ord_002';

UPDATE orders 
SET user_id = '550e8400-e29b-41d4-a716-446655440006'
WHERE user_id IS NULL AND id = 'ord_003';

UPDATE orders 
SET user_id = '550e8400-e29b-41d4-a716-446655440007'
WHERE user_id IS NULL AND id = 'ord_004';

UPDATE orders 
SET user_id = '550e8400-e29b-41d4-a716-446655440008'
WHERE user_id IS NULL AND id = 'ord_005';

UPDATE orders 
SET user_id = '550e8400-e29b-41d4-a716-446655440009'
WHERE user_id IS NULL AND id = 'ord_006';

-- 5. Vérifier la structure de la table orders
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 6. Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'orders';

-- 7. Afficher un résumé des corrections
SELECT 
    'Résumé des corrections' as info,
    (SELECT COUNT(*) FROM orders WHERE user_id IS NOT NULL) as orders_with_user_id,
    (SELECT COUNT(*) FROM orders WHERE user_id IS NULL) as orders_without_user_id; 