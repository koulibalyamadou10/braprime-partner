-- ============================================================================
-- SCRIPT POUR AJOUTER DES COMMANDES DE TEST ASSIGNÉES AUX LIVREURS
-- ============================================================================
-- Ce script ajoute des commandes de test avec des livreurs assignés

-- ============================================================================
-- 1. VÉRIFIER LES LIVREURS DISPONIBLES
-- ============================================================================

SELECT 
    id,
    name,
    business_id,
    is_active
FROM drivers 
WHERE is_active = true
LIMIT 5;

-- ============================================================================
-- 2. AJOUTER DES COMMANDES DE TEST ASSIGNÉES AUX LIVREURS
-- ============================================================================

-- Insérer des commandes de test avec des livreurs assignés
INSERT INTO orders (
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    business_id,
    driver_id,
    status,
    total,
    grand_total,
    created_at,
    updated_at
)
SELECT 
    'Client Test ' || i,
    '+224 123 456 ' || LPAD(i::text, 3, '0'),
    'client' || i || '@test.com',
    'Adresse de livraison ' || i || ', Conakry',
    d.business_id,
    d.id,
    CASE 
        WHEN i % 5 = 0 THEN 'delivered'
        WHEN i % 5 = 1 THEN 'out_for_delivery'
        WHEN i % 5 = 2 THEN 'ready'
        WHEN i % 5 = 3 THEN 'preparing'
        ELSE 'confirmed'
    END,
    15000 + (i * 1000),
    16000 + (i * 1000),
    NOW() - INTERVAL '1 day' * (i % 30),
    NOW() - INTERVAL '1 day' * (i % 30)
FROM drivers d
CROSS JOIN generate_series(1, 10) i
WHERE d.is_active = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. AJOUTER DES AVIS POUR LES COMMANDES LIVRÉES
-- ============================================================================

-- Mettre à jour les commandes livrées avec des avis
UPDATE orders 
SET 
    driver_rating = CASE 
        WHEN random() > 0.3 THEN 4 + (random() * 1)::int
        ELSE 3 + (random() * 1)::int
    END,
    driver_comment = CASE 
        WHEN random() > 0.5 THEN 'Excellent service, très ponctuel!'
        WHEN random() > 0.3 THEN 'Bon service, livraison rapide'
        WHEN random() > 0.2 THEN 'Service correct'
        ELSE 'Livraison un peu lente mais correcte'
    END,
    delivered_at = created_at + INTERVAL '30 minutes' + (random() * INTERVAL '30 minutes')
WHERE status = 'delivered' 
AND driver_id IS NOT NULL
AND driver_rating IS NULL;

-- ============================================================================
-- 4. VÉRIFIER LES RÉSULTATS
-- ============================================================================

-- Vérifier les commandes avec livreurs
SELECT 
    'ORDERS WITH DRIVERS' as info,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as orders_with_driver,
    COUNT(CASE WHEN driver_id IS NULL THEN 1 END) as orders_without_driver
FROM orders;

-- Vérifier les commandes par statut
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as with_driver
FROM orders 
GROUP BY status 
ORDER BY count DESC;

-- Vérifier les commandes d'un livreur spécifique
SELECT 
    d.name as driver_name,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'out_for_delivery' THEN 1 END) as in_delivery_orders,
    AVG(o.driver_rating) as avg_rating
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id
WHERE d.is_active = true
GROUP BY d.id, d.name
ORDER BY total_orders DESC;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Commandes de test ajoutées avec succès!';
    RAISE NOTICE 'Les livreurs ont maintenant des commandes assignées.';
    RAISE NOTICE 'Vous pouvez maintenant tester la page de détails des livreurs.';
END $$; 