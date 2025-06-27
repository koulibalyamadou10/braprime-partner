-- ============================================================================
-- SCRIPT DE DIAGNOSTIC POUR LES COMMANDES DES LIVREURS
-- ============================================================================
-- Ce script vérifie l'état des commandes et leur association avec les livreurs

-- ============================================================================
-- 1. VÉRIFIER LES LIVREURS EXISTANTS
-- ============================================================================

SELECT 
    'DRIVERS TABLE' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM drivers;

-- ============================================================================
-- 2. VÉRIFIER LES COMMANDES AVEC DRIVER_ID
-- ============================================================================

SELECT 
    'ORDERS WITH DRIVER' as info,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as orders_with_driver,
    COUNT(CASE WHEN driver_id IS NULL THEN 1 END) as orders_without_driver
FROM orders;

-- ============================================================================
-- 3. VÉRIFIER LES COMMANDES PAR STATUT
-- ============================================================================

SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as with_driver,
    COUNT(CASE WHEN driver_id IS NULL THEN 1 END) as without_driver
FROM orders 
GROUP BY status 
ORDER BY count DESC;

-- ============================================================================
-- 4. VÉRIFIER LES COMMANDES D'UN LIVREUR SPÉCIFIQUE
-- ============================================================================

-- Remplacer 'DRIVER_ID_HERE' par l'ID d'un livreur existant
SELECT 
    o.id,
    o.customer_name,
    o.status,
    o.driver_id,
    o.created_at,
    o.total,
    o.grand_total
FROM orders o
WHERE o.driver_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- 5. VÉRIFIER LES POLITIQUES RLS SUR LA TABLE ORDERS
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- ============================================================================
-- 6. VÉRIFIER LES RELATIONS ENTRE BUSINESSES ET DRIVERS
-- ============================================================================

SELECT 
    b.id as business_id,
    b.name as business_name,
    COUNT(d.id) as driver_count,
    COUNT(CASE WHEN d.is_active = true THEN 1 END) as active_drivers
FROM businesses b
LEFT JOIN drivers d ON b.id = d.business_id
GROUP BY b.id, b.name
ORDER BY driver_count DESC;

-- ============================================================================
-- 7. TESTER LA REQUÊTE DE COMMANDES D'UN LIVREUR
-- ============================================================================

-- Cette requête simule ce que fait le service DriverDetailsService.getDriverOrders
-- Remplacez 'DRIVER_ID_HERE' par un ID de livreur valide
SELECT 
    o.id,
    o.customer_name,
    o.customer_phone,
    o.delivery_address,
    o.status,
    o.total,
    o.grand_total,
    o.created_at,
    o.delivered_at,
    o.driver_rating,
    o.driver_comment
FROM orders o
WHERE o.driver_id = 'DRIVER_ID_HERE'  -- Remplacez par un vrai ID
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Diagnostic des commandes des livreurs terminé!';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier le problème.';
END $$; 