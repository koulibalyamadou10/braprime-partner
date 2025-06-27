-- ============================================================================
-- SCRIPT POUR CORRIGER LES COLONNES DE TEMPS DE LIVRAISON DANS ORDERS
-- ============================================================================
-- Ce script ajoute les colonnes manquantes pour le calcul du temps de livraison
-- et corrige les problèmes liés à delivery_time

-- ============================================================================
-- 1. VÉRIFIER LA STRUCTURE ACTUELLE DE LA TABLE ORDERS
-- ============================================================================

SELECT 
    'CURRENT ORDERS STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('delivery_time', 'estimated_delivery', 'actual_delivery', 'delivered_at')
ORDER BY column_name;

-- ============================================================================
-- 2. AJOUTER LA COLONNE DELIVERY_TIME SI ELLE N'EXISTE PAS
-- ============================================================================

DO $$
BEGIN
    -- Ajouter delivery_time si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivery_time'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_time INTEGER;
        RAISE NOTICE '✅ Colonne delivery_time ajoutée à la table orders';
    ELSE
        RAISE NOTICE 'Colonne delivery_time existe déjà';
    END IF;
END $$;

-- ============================================================================
-- 3. AJOUTER LA COLONNE DELIVERED_AT SI ELLE N'EXISTE PAS
-- ============================================================================

DO $$
BEGIN
    -- Ajouter delivered_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Colonne delivered_at ajoutée à la table orders';
    ELSE
        RAISE NOTICE 'Colonne delivered_at existe déjà';
    END IF;
END $$;

-- ============================================================================
-- 4. CRÉER UNE FONCTION POUR CALCULER LE TEMPS DE LIVRAISON
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_delivery_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la commande est livrée et qu'on a les timestamps
    IF NEW.status = 'delivered' AND NEW.actual_delivery IS NOT NULL AND NEW.created_at IS NOT NULL THEN
        -- Calculer le temps de livraison en minutes
        NEW.delivery_time := EXTRACT(EPOCH FROM (NEW.actual_delivery - NEW.created_at)) / 60;
        NEW.delivered_at := NEW.actual_delivery;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CRÉER UN TRIGGER POUR CALCULER AUTOMATIQUEMENT LE TEMPS DE LIVRAISON
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_calculate_delivery_time ON orders;
CREATE TRIGGER trigger_calculate_delivery_time
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_delivery_time();

-- ============================================================================
-- 6. METTRE À JOUR LES COMMANDES EXISTANTES
-- ============================================================================

-- Mettre à jour les commandes déjà livrées
UPDATE orders 
SET 
    delivery_time = EXTRACT(EPOCH FROM (actual_delivery - created_at)) / 60,
    delivered_at = actual_delivery
WHERE status = 'delivered' 
AND actual_delivery IS NOT NULL 
AND created_at IS NOT NULL
AND (delivery_time IS NULL OR delivered_at IS NULL);

-- ============================================================================
-- 7. CRÉER UN INDEX POUR LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_delivery_time ON orders(delivery_time);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at);

-- ============================================================================
-- 8. VÉRIFIER LES RÉSULTATS
-- ============================================================================

-- Afficher les statistiques de temps de livraison
SELECT 
    'DELIVERY TIME STATS' as info,
    COUNT(*) as total_delivered_orders,
    AVG(delivery_time) as avg_delivery_time_minutes,
    MIN(delivery_time) as min_delivery_time_minutes,
    MAX(delivery_time) as max_delivery_time_minutes,
    COUNT(CASE WHEN delivery_time <= 30 THEN 1 END) as orders_under_30min,
    COUNT(CASE WHEN delivery_time <= 45 THEN 1 END) as orders_under_45min,
    COUNT(CASE WHEN delivery_time > 60 THEN 1 END) as orders_over_60min
FROM orders 
WHERE status = 'delivered' 
AND delivery_time IS NOT NULL;

-- Afficher quelques exemples de commandes avec temps de livraison
SELECT 
    'SAMPLE ORDERS' as info,
    id,
    business_name,
    status,
    created_at,
    actual_delivery,
    delivery_time,
    delivered_at
FROM orders 
WHERE status = 'delivered' 
AND delivery_time IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECTION DELIVERY_TIME TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Colonne delivery_time ajoutée/calculée';
    RAISE NOTICE '✅ Colonne delivered_at ajoutée';
    RAISE NOTICE '✅ Trigger de calcul automatique créé';
    RAISE NOTICE '✅ Index de performance ajoutés';
    RAISE NOTICE '✅ Données existantes mises à jour';
    RAISE NOTICE '';
    RAISE NOTICE 'Les erreurs de colonne delivery_time devraient';
    RAISE NOTICE 'maintenant être résolues.';
    RAISE NOTICE '';
END $$; 