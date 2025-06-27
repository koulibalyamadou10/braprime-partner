-- ============================================================================
-- SCRIPT POUR VÉRIFIER LA STRUCTURE DE LA TABLE ORDERS
-- ============================================================================
-- Ce script vérifie la structure réelle de la table orders

-- ============================================================================
-- 1. VÉRIFIER TOUTES LES COLONNES DE LA TABLE ORDERS
-- ============================================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. VÉRIFIER LES COLONNES SPÉCIFIQUES ATTENDUES PAR LE CODE
-- ============================================================================

SELECT 
    'EXPECTED COLUMNS' as info,
    column_name,
    CASE 
        WHEN column_name IN ('id', 'customer_name', 'customer_phone', 'customer_email', 
                           'delivery_address', 'business_id', 'driver_id', 'status', 
                           'total', 'grand_total', 'created_at', 'delivered_at', 
                           'driver_rating', 'driver_comment') 
        THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('id', 'customer_name', 'customer_phone', 'customer_email', 
                   'delivery_address', 'business_id', 'driver_id', 'status', 
                   'total', 'grand_total', 'created_at', 'delivered_at', 
                   'driver_rating', 'driver_comment')
ORDER BY column_name;

-- ============================================================================
-- 3. VÉRIFIER LES COLONNES MANQUANTES
-- ============================================================================

SELECT 
    'MISSING COLUMNS' as info,
    expected_column
FROM (
    VALUES 
        ('customer_name'),
        ('customer_phone'),
        ('customer_email'),
        ('delivery_address'),
        ('driver_id'),
        ('driver_rating'),
        ('driver_comment'),
        ('delivered_at')
) AS expected_columns(expected_column)
WHERE expected_column NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'orders'
);

-- ============================================================================
-- 4. VÉRIFIER LES COLONNES EXISTANTES POUR LES CLIENTS
-- ============================================================================

SELECT 
    'CUSTOMER COLUMNS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name LIKE '%customer%'
ORDER BY column_name;

-- ============================================================================
-- 5. VÉRIFIER LES COLONNES EXISTANTES POUR LES LIVREURS
-- ============================================================================

SELECT 
    'DRIVER COLUMNS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name LIKE '%driver%'
ORDER BY column_name;

-- ============================================================================
-- 6. VÉRIFIER LES COLONNES EXISTANTES POUR LES ADRESSES
-- ============================================================================

SELECT 
    'ADDRESS COLUMNS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name LIKE '%address%'
ORDER BY column_name;

-- ============================================================================
-- 7. AFFICHER UN EXEMPLE DE DONNÉES
-- ============================================================================

SELECT 
    'SAMPLE DATA' as info,
    *
FROM orders 
LIMIT 1;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Structure de la table orders vérifiée!';
    RAISE NOTICE 'Vérifiez les colonnes manquantes ci-dessus.';
    RAISE NOTICE 'Le code attend des colonnes spécifiques qui peuvent ne pas exister.';
END $$; 