-- ============================================================================
-- SCRIPT COMPLET POUR AJOUTER DES DONNÉES DE TEST
-- ============================================================================
-- Ce script ajoute des données de test complètes pour tester la fonctionnalité

-- ============================================================================
-- 1. AJOUTER DES LIVREURS DE TEST
-- ============================================================================

-- Insérer des livreurs de test pour les businesses existantes
INSERT INTO drivers (name, phone, email, business_id, vehicle_type, vehicle_plate, is_active)
SELECT 
    'Mamadou Diallo',
    '+224 123 456 789',
    'mamadou.diallo@example.com',
    b.id,
    'motorcycle',
    'ABC 123',
    true
FROM businesses b 
WHERE b.owner_id = auth.uid() 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO drivers (name, phone, email, business_id, vehicle_type, vehicle_plate, is_active)
SELECT 
    'Fatoumata Camara',
    '+224 987 654 321',
    'fatoumata.camara@example.com',
    b.id,
    'car',
    'XYZ 789',
    true
FROM businesses b 
WHERE b.owner_id = auth.uid() 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO drivers (name, phone, email, business_id, vehicle_type, vehicle_plate, is_active)
SELECT 
    'Ibrahima Barry',
    '+224 555 123 456',
    'ibrahima.barry@example.com',
    b.id,
    'motorcycle',
    'DEF 456',
    true
FROM businesses b 
WHERE b.owner_id = auth.uid() 
LIMIT 1
ON CONFLICT DO NOTHING;

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
        WHEN i % 6 = 0 THEN 'delivered'
        WHEN i % 6 = 1 THEN 'out_for_delivery'
        WHEN i % 6 = 2 THEN 'ready'
        WHEN i % 6 = 3 THEN 'preparing'
        WHEN i % 6 = 4 THEN 'confirmed'
        ELSE 'pending'
    END,
    15000 + (i * 1000),
    16000 + (i * 1000),
    NOW() - INTERVAL '1 day' * (i % 30),
    NOW() - INTERVAL '1 day' * (i % 30)
FROM drivers d
CROSS JOIN generate_series(1, 15) i
WHERE d.is_active = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. AJOUTER DES AVIS POUR LES COMMANDES LIVRÉES
-- ============================================================================

-- Mettre à jour les commandes livrées avec des avis
UPDATE orders 
SET 
    driver_rating = CASE 
        WHEN random() > 0.2 THEN 4 + (random() * 1)::int
        WHEN random() > 0.1 THEN 3 + (random() * 1)::int
        ELSE 2 + (random() * 1)::int
    END,
    driver_comment = CASE 
        WHEN random() > 0.6 THEN 'Excellent service, très ponctuel! Livraison rapide et soignée.'
        WHEN random() > 0.4 THEN 'Bon service, livreur professionnel et courtois.'
        WHEN random() > 0.2 THEN 'Service correct, livraison dans les délais.'
        ELSE 'Livraison un peu lente mais correcte. Amélioration possible.'
    END,
    delivered_at = created_at + INTERVAL '30 minutes' + (random() * INTERVAL '30 minutes')
WHERE status = 'delivered' 
AND driver_id IS NOT NULL
AND driver_rating IS NULL;

-- ============================================================================
-- 4. AJOUTER DES COMMANDES EN COURS
-- ============================================================================

-- Ajouter quelques commandes en cours de livraison
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
    'Client En Cours ' || i,
    '+224 999 888 ' || LPAD(i::text, 2, '0'),
    'encours' || i || '@test.com',
    'Adresse en cours ' || i || ', Conakry',
    d.business_id,
    d.id,
    'out_for_delivery',
    20000 + (i * 500),
    21000 + (i * 500),
    NOW() - INTERVAL '1 hour' * i,
    NOW() - INTERVAL '1 hour' * i
FROM drivers d
CROSS JOIN generate_series(1, 3) i
WHERE d.is_active = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. VÉRIFIER LES RÉSULTATS
-- ============================================================================

-- Afficher un résumé des données ajoutées
SELECT 
    'SUMMARY' as info,
    COUNT(DISTINCT d.id) as total_drivers,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'out_for_delivery' THEN 1 END) as in_delivery_orders,
    COUNT(CASE WHEN o.status = 'ready' THEN 1 END) as ready_orders,
    AVG(o.driver_rating) as avg_rating
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid();

-- Afficher les détails par livreur
SELECT 
    'DRIVER DETAILS' as info,
    d.name as driver_name,
    d.vehicle_type,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'out_for_delivery' THEN 1 END) as in_delivery_orders,
    AVG(o.driver_rating) as avg_rating,
    COUNT(CASE WHEN o.driver_rating IS NOT NULL THEN 1 END) as total_reviews
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid()
GROUP BY d.id, d.name, d.vehicle_type
ORDER BY total_orders DESC;

-- ============================================================================
-- 6. TESTER LA REQUÊTE DU SERVICE
-- ============================================================================

-- Test de la requête exacte que fait le service
SELECT 
    'SERVICE TEST' as info,
    o.id,
    o.customer_name,
    o.status,
    o.total,
    o.grand_total,
    o.created_at,
    o.driver_rating
FROM orders o
WHERE o.driver_id IN (
    SELECT d.id 
    FROM drivers d 
    JOIN businesses b ON d.business_id = b.id 
    WHERE b.owner_id = auth.uid()
)
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Données de test ajoutées avec succès!';
    RAISE NOTICE 'Vous avez maintenant:';
    RAISE NOTICE '- Des livreurs de test';
    RAISE NOTICE '- Des commandes assignées aux livreurs';
    RAISE NOTICE '- Des avis et notes pour les commandes livrées';
    RAISE NOTICE '- Des commandes en cours de livraison';
    RAISE NOTICE 'La page de détails des livreurs devrait maintenant afficher des données.';
END $$; 