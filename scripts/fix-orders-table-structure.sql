-- ============================================================================
-- SCRIPT POUR CORRIGER LA STRUCTURE DE LA TABLE ORDERS
-- ============================================================================
-- Ce script ajoute les colonnes manquantes nécessaires pour le code

-- ============================================================================
-- 1. VÉRIFIER LA STRUCTURE ACTUELLE
-- ============================================================================

SELECT 
    'CURRENT STRUCTURE' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. AJOUTER LES COLONNES MANQUANTES
-- ============================================================================

-- Ajouter customer_name si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
        RAISE NOTICE 'Colonne customer_name ajoutée';
    ELSE
        RAISE NOTICE 'Colonne customer_name existe déjà';
    END IF;
END $$;

-- Ajouter customer_phone si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);
        RAISE NOTICE 'Colonne customer_phone ajoutée';
    ELSE
        RAISE NOTICE 'Colonne customer_phone existe déjà';
    END IF;
END $$;

-- Ajouter customer_email si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
        RAISE NOTICE 'Colonne customer_email ajoutée';
    ELSE
        RAISE NOTICE 'Colonne customer_email existe déjà';
    END IF;
END $$;

-- Ajouter delivery_address si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE 'Colonne delivery_address ajoutée';
    ELSE
        RAISE NOTICE 'Colonne delivery_address existe déjà';
    END IF;
END $$;

-- Ajouter driver_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'driver_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_id UUID REFERENCES drivers(id);
        RAISE NOTICE 'Colonne driver_id ajoutée';
    ELSE
        RAISE NOTICE 'Colonne driver_id existe déjà';
    END IF;
END $$;

-- Ajouter driver_rating si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'driver_rating'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_rating DECIMAL(3, 2);
        RAISE NOTICE 'Colonne driver_rating ajoutée';
    ELSE
        RAISE NOTICE 'Colonne driver_rating existe déjà';
    END IF;
END $$;

-- Ajouter driver_comment si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'driver_comment'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_comment TEXT;
        RAISE NOTICE 'Colonne driver_comment ajoutée';
    ELSE
        RAISE NOTICE 'Colonne driver_comment existe déjà';
    END IF;
END $$;

-- Ajouter delivered_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne delivered_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne delivered_at existe déjà';
    END IF;
END $$;

-- ============================================================================
-- 3. VÉRIFIER LES COLONNES EXISTANTES POUR MIGRER LES DONNÉES
-- ============================================================================

-- Vérifier s'il y a des colonnes alternatives pour les données client
SELECT 
    'ALTERNATIVE CUSTOMER COLUMNS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders'
AND (
    column_name LIKE '%name%' OR 
    column_name LIKE '%phone%' OR 
    column_name LIKE '%email%' OR
    column_name LIKE '%address%'
)
AND column_name NOT IN ('customer_name', 'customer_phone', 'customer_email', 'delivery_address')
ORDER BY column_name;

-- ============================================================================
-- 4. MIGRER LES DONNÉES SI NÉCESSAIRE
-- ============================================================================

-- Si des colonnes alternatives existent, migrer les données
-- Exemple: si 'name' existe, copier vers 'customer_name'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'name'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_name'
    ) THEN
        UPDATE orders SET customer_name = name WHERE customer_name IS NULL;
        RAISE NOTICE 'Données migrées de name vers customer_name';
    END IF;
END $$;

-- Si 'phone' existe, copier vers 'customer_phone'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'phone'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_phone'
    ) THEN
        UPDATE orders SET customer_phone = phone WHERE customer_phone IS NULL;
        RAISE NOTICE 'Données migrées de phone vers customer_phone';
    END IF;
END $$;

-- Si 'email' existe, copier vers 'customer_email'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'email'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_email'
    ) THEN
        UPDATE orders SET customer_email = email WHERE customer_email IS NULL;
        RAISE NOTICE 'Données migrées de email vers customer_email';
    END IF;
END $$;

-- Si 'address' existe, copier vers 'delivery_address'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'address'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
    ) THEN
        UPDATE orders SET delivery_address = address WHERE delivery_address IS NULL;
        RAISE NOTICE 'Données migrées de address vers delivery_address';
    END IF;
END $$;

-- ============================================================================
-- 5. AJOUTER DES DONNÉES DE TEST SI LES COLONNES SONT VIDES
-- ============================================================================

-- Ajouter des données de test pour les commandes existantes sans données client
UPDATE orders 
SET 
    customer_name = COALESCE(customer_name, 'Client ' || id::text),
    customer_phone = COALESCE(customer_phone, '+224 123 456 789'),
    customer_email = COALESCE(customer_email, 'client' || id::text || '@example.com'),
    delivery_address = COALESCE(delivery_address, 'Adresse de livraison ' || id::text || ', Conakry')
WHERE customer_name IS NULL OR customer_phone IS NULL;

-- ============================================================================
-- 6. VÉRIFIER LA STRUCTURE FINALE
-- ============================================================================

SELECT 
    'FINAL STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('id', 'customer_name', 'customer_phone', 'customer_email', 
                   'delivery_address', 'business_id', 'driver_id', 'status', 
                   'total', 'grand_total', 'created_at', 'delivered_at', 
                   'driver_rating', 'driver_comment')
ORDER BY column_name;

-- ============================================================================
-- 7. TESTER LA REQUÊTE DU SERVICE
-- ============================================================================

-- Test de la requête que fait DriverDetailsService.getDriverOrders
SELECT 
    'SERVICE TEST' as info,
    COUNT(*) as orders_count
FROM orders o
WHERE o.driver_id IN (
    SELECT d.id 
    FROM drivers d 
    JOIN businesses b ON d.business_id = b.id 
    WHERE b.owner_id = auth.uid()
);

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Structure de la table orders corrigée avec succès!';
    RAISE NOTICE 'Toutes les colonnes nécessaires ont été ajoutées.';
    RAISE NOTICE 'Les données existantes ont été migrées si possible.';
    RAISE NOTICE 'La page de détails des livreurs devrait maintenant fonctionner.';
END $$; 