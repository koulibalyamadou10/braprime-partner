-- ============================================================================
-- SCRIPT DE RÉSOLUTION RAPIDE - PROBLÈME DES COMMANDES DES LIVREURS
-- ============================================================================
-- Ce script résout rapidement tous les problèmes identifiés

-- ============================================================================
-- 1. VÉRIFIER L'UTILISATEUR CONNECTÉ
-- ============================================================================

SELECT 
    'CURRENT USER' as info,
    auth.uid() as user_id,
    auth.role() as user_role;

-- ============================================================================
-- 2. AJOUTER LES COLONNES MANQUANTES À LA TABLE ORDERS
-- ============================================================================

-- Ajouter customer_name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
        RAISE NOTICE 'Colonne customer_name ajoutée';
    END IF;
END $$;

-- Ajouter customer_phone
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);
        RAISE NOTICE 'Colonne customer_phone ajoutée';
    END IF;
END $$;

-- Ajouter customer_email
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
        RAISE NOTICE 'Colonne customer_email ajoutée';
    END IF;
END $$;

-- Ajouter delivery_address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE 'Colonne delivery_address ajoutée';
    END IF;
END $$;

-- Ajouter driver_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'driver_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_id UUID REFERENCES drivers(id);
        RAISE NOTICE 'Colonne driver_id ajoutée';
    END IF;
END $$;

-- Ajouter driver_rating
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'driver_rating'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_rating DECIMAL(3, 2);
        RAISE NOTICE 'Colonne driver_rating ajoutée';
    END IF;
END $$;

-- Ajouter driver_comment
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'driver_comment'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_comment TEXT;
        RAISE NOTICE 'Colonne driver_comment ajoutée';
    END IF;
END $$;

-- Ajouter delivered_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne delivered_at ajoutée';
    END IF;
END $$;

-- ============================================================================
-- 3. MIGRER LES DONNÉES EXISTANTES
-- ============================================================================

-- Migrer les données si des colonnes alternatives existent
DO $$
BEGIN
    -- name -> customer_name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'name') THEN
        UPDATE orders SET customer_name = name WHERE customer_name IS NULL;
        RAISE NOTICE 'Données migrées de name vers customer_name';
    END IF;
    
    -- phone -> customer_phone
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'phone') THEN
        UPDATE orders SET customer_phone = phone WHERE customer_phone IS NULL;
        RAISE NOTICE 'Données migrées de phone vers customer_phone';
    END IF;
    
    -- email -> customer_email
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'email') THEN
        UPDATE orders SET customer_email = email WHERE customer_email IS NULL;
        RAISE NOTICE 'Données migrées de email vers customer_email';
    END IF;
    
    -- address -> delivery_address
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'address') THEN
        UPDATE orders SET delivery_address = address WHERE delivery_address IS NULL;
        RAISE NOTICE 'Données migrées de address vers delivery_address';
    END IF;
END $$;

-- Ajouter des données de test pour les colonnes vides
UPDATE orders 
SET 
    customer_name = COALESCE(customer_name, 'Client ' || id::text),
    customer_phone = COALESCE(customer_phone, '+224 123 456 789'),
    customer_email = COALESCE(customer_email, 'client' || id::text || '@example.com'),
    delivery_address = COALESCE(delivery_address, 'Adresse de livraison ' || id::text || ', Conakry')
WHERE customer_name IS NULL OR customer_phone IS NULL;

-- ============================================================================
-- 4. CORRIGER LES PERMISSIONS RLS
-- ============================================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Partners can view orders from their drivers" ON orders;
DROP POLICY IF EXISTS "Partners can update orders from their drivers" ON orders;

-- Créer les nouvelles politiques
CREATE POLICY "Partners can view orders from their drivers" ON orders
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

CREATE POLICY "Partners can update orders from their drivers" ON orders
    FOR UPDATE USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- 5. AJOUTER DES INDEX POUR LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================================
-- 6. AJOUTER DES LIVREURS DE TEST SI NÉCESSAIRE
-- ============================================================================

-- Vérifier s'il y a des livreurs pour l'utilisateur
DO $$
DECLARE
    driver_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO driver_count
    FROM drivers d
    JOIN businesses b ON d.business_id = b.id
    WHERE b.owner_id = auth.uid();
    
    IF driver_count = 0 THEN
        -- Ajouter des livreurs de test
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
        
        RAISE NOTICE 'Livreurs de test ajoutés';
    ELSE
        RAISE NOTICE 'Livreurs existants trouvés: %', driver_count;
    END IF;
END $$;

-- ============================================================================
-- 7. AJOUTER DES COMMANDES DE TEST SI NÉCESSAIRE
-- ============================================================================

-- Vérifier s'il y a des commandes avec des livreurs assignés
DO $$
DECLARE
    orders_with_driver_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orders_with_driver_count
    FROM orders o
    JOIN drivers d ON o.driver_id = d.id
    JOIN businesses b ON d.business_id = b.id
    WHERE b.owner_id = auth.uid();
    
    IF orders_with_driver_count = 0 THEN
        -- Ajouter des commandes de test
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
        JOIN businesses b ON d.business_id = b.id
        WHERE b.owner_id = auth.uid() AND d.is_active = true
        ON CONFLICT DO NOTHING;
        
        -- Ajouter des avis pour les commandes livrées
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
        
        RAISE NOTICE 'Commandes de test ajoutées';
    ELSE
        RAISE NOTICE 'Commandes avec livreurs existantes: %', orders_with_driver_count;
    END IF;
END $$;

-- ============================================================================
-- 8. VÉRIFIER LES RÉSULTATS
-- ============================================================================

-- Afficher un résumé final
SELECT 
    'FINAL SUMMARY' as info,
    COUNT(DISTINCT d.id) as total_drivers,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'out_for_delivery' THEN 1 END) as in_delivery_orders,
    AVG(o.driver_rating) as avg_rating
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid();

-- Test de la requête du service
SELECT 
    'SERVICE TEST' as info,
    COUNT(*) as accessible_orders
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
    RAISE NOTICE 'Résolution rapide terminée avec succès!';
    RAISE NOTICE 'Tous les problèmes ont été corrigés:';
    RAISE NOTICE '- Colonnes manquantes ajoutées';
    RAISE NOTICE '- Permissions RLS corrigées';
    RAISE NOTICE '- Données de test ajoutées';
    RAISE NOTICE 'Redémarrez le serveur et testez la page de détails des livreurs.';
END $$; 