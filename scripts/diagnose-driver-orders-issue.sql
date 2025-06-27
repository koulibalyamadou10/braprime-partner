-- ============================================================================
-- SCRIPT DE DIAGNOSTIC COMPLET POUR LES COMMANDES DES LIVREURS
-- ============================================================================
-- Ce script diagnostique tous les aspects du problème

-- ============================================================================
-- 1. VÉRIFIER L'UTILISATEUR CONNECTÉ
-- ============================================================================

SELECT 
    'CURRENT USER' as info,
    auth.uid() as user_id,
    auth.role() as user_role;

-- ============================================================================
-- 2. VÉRIFIER LES BUSINESSES DE L'UTILISATEUR
-- ============================================================================

SELECT 
    'USER BUSINESSES' as info,
    id,
    name,
    owner_id
FROM businesses 
WHERE owner_id = auth.uid();

-- ============================================================================
-- 3. VÉRIFIER LES LIVREURS DES BUSINESSES DE L'UTILISATEUR
-- ============================================================================

SELECT 
    'USER DRIVERS' as info,
    d.id,
    d.name,
    d.business_id,
    d.is_active,
    b.name as business_name
FROM drivers d
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid()
ORDER BY d.name;

-- ============================================================================
-- 4. VÉRIFIER LES COMMANDES AVEC LIVREURS ASSIGNÉS
-- ============================================================================

SELECT 
    'ORDERS WITH DRIVERS' as info,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as orders_with_driver,
    COUNT(CASE WHEN driver_id IS NULL THEN 1 END) as orders_without_driver
FROM orders;

-- ============================================================================
-- 5. VÉRIFIER LES COMMANDES DES LIVREURS DE L'UTILISATEUR
-- ============================================================================

SELECT 
    'USER DRIVER ORDERS' as info,
    d.name as driver_name,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'out_for_delivery' THEN 1 END) as in_delivery_orders,
    COUNT(CASE WHEN o.status = 'ready' THEN 1 END) as ready_orders,
    AVG(o.driver_rating) as avg_rating
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid()
GROUP BY d.id, d.name
ORDER BY total_orders DESC;

-- ============================================================================
-- 6. TESTER LA REQUÊTE EXACTE DU SERVICE
-- ============================================================================

-- Test de la requête que fait DriverDetailsService.getDriverOrders
-- Remplacez 'DRIVER_ID_HERE' par un vrai ID de livreur
SELECT 
    'SERVICE QUERY TEST' as info,
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
WHERE o.driver_id IN (
    SELECT d.id 
    FROM drivers d 
    JOIN businesses b ON d.business_id = b.id 
    WHERE b.owner_id = auth.uid()
)
ORDER BY o.created_at DESC
LIMIT 5;

-- ============================================================================
-- 7. VÉRIFIER LES POLITIQUES RLS SUR ORDERS
-- ============================================================================

SELECT 
    'ORDERS RLS POLICIES' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================================================
-- 8. TESTER LES PERMISSIONS RLS
-- ============================================================================

-- Test si l'utilisateur peut voir les commandes de ses livreurs
SELECT 
    'RLS PERMISSION TEST' as info,
    COUNT(*) as accessible_orders
FROM orders o
WHERE o.driver_id IN (
    SELECT d.id 
    FROM drivers d 
    JOIN businesses b ON d.business_id = b.id 
    WHERE b.owner_id = auth.uid()
);

-- ============================================================================
-- 9. VÉRIFIER LA STRUCTURE DE LA TABLE ORDERS
-- ============================================================================

SELECT 
    'ORDERS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('id', 'driver_id', 'business_id', 'status', 'customer_name')
ORDER BY ordinal_position;

-- ============================================================================
-- 10. VÉRIFIER LES INDEX
-- ============================================================================

SELECT 
    'ORDERS INDEXES' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'orders'
AND indexname LIKE '%driver%';

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Diagnostic complet terminé!';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier le problème.';
    RAISE NOTICE 'Si aucune commande n''apparaît, le problème peut être:';
    RAISE NOTICE '1. Aucune commande assignée aux livreurs';
    RAISE NOTICE '2. Permissions RLS incorrectes';
    RAISE NOTICE '3. Colonne driver_id manquante';
    RAISE NOTICE '4. Utilisateur non connecté ou mauvais rôle';
END $$; 