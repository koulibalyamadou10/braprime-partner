-- Script pour corriger les permissions RLS pour les subscriptions en temps réel
-- Ce script permet aux utilisateurs de s'abonner aux changements de leurs commandes

-- 1. Vérifier et corriger les politiques RLS pour la table orders
DO $$ 
BEGIN
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "orders_select_policy" ON orders;
    DROP POLICY IF EXISTS "orders_update_policy" ON orders;
    DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
    
    -- Créer une politique de sélection qui permet aux utilisateurs de voir leurs propres commandes
    CREATE POLICY "orders_select_policy" ON orders
        FOR SELECT USING (
            auth.uid() = user_id OR
            auth.uid() IN (
                SELECT owner_id FROM businesses WHERE id = orders.business_id
            ) OR
            auth.uid() IN (
                SELECT user_id FROM user_profiles WHERE role_id = 4
            )
        );
    
    -- Créer une politique de mise à jour pour les partenaires et admins
    CREATE POLICY "orders_update_policy" ON orders
        FOR UPDATE USING (
            auth.uid() IN (
                SELECT owner_id FROM businesses WHERE id = orders.business_id
            ) OR
            auth.uid() IN (
                SELECT user_id FROM user_profiles WHERE role_id = 4
            )
        );
    
    -- Créer une politique d'insertion pour les clients
    CREATE POLICY "orders_insert_policy" ON orders
        FOR INSERT WITH CHECK (
            auth.uid() = user_id
        );
    
    RAISE NOTICE 'Politiques RLS pour orders mises à jour avec succès';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la mise à jour des politiques RLS: %', SQLERRM;
END $$;

-- 2. Vérifier que RLS est activé sur la table orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Créer une fonction pour tester les permissions
CREATE OR REPLACE FUNCTION test_order_permissions(order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier si l'utilisateur actuel peut accéder à cette commande
    RETURN EXISTS (
        SELECT 1 FROM orders 
        WHERE id = order_id AND (
            user_id = auth.uid() OR
            auth.uid() IN (
                SELECT owner_id FROM businesses WHERE id = orders.business_id
            ) OR
            auth.uid() IN (
                SELECT user_id FROM user_profiles WHERE role_id = 4
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer une vue pour les commandes avec permissions
CREATE OR REPLACE VIEW user_orders_with_permissions AS
SELECT 
    o.*,
    CASE 
        WHEN auth.uid() = o.user_id THEN 'owner'
        WHEN auth.uid() IN (SELECT owner_id FROM businesses WHERE id = o.business_id) THEN 'business_owner'
        WHEN auth.uid() IN (SELECT user_id FROM user_profiles WHERE role_id = 4) THEN 'admin'
        ELSE 'none'
    END as access_level
FROM orders o
WHERE (
    auth.uid() = o.user_id OR
    auth.uid() IN (SELECT owner_id FROM businesses WHERE id = o.business_id) OR
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE role_id = 4)
);

-- 5. Créer une fonction pour obtenir les commandes avec vérification de permissions
CREATE OR REPLACE FUNCTION get_user_order(order_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    business_id INTEGER,
    business_name TEXT,
    status TEXT,
    total DECIMAL,
    delivery_fee DECIMAL,
    grand_total DECIMAL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.user_id,
        o.business_id,
        o.business_name,
        o.status,
        o.total,
        o.delivery_fee,
        o.grand_total,
        o.created_at,
        o.updated_at
    FROM orders o
    WHERE o.id = order_id AND (
        auth.uid() = o.user_id OR
        auth.uid() IN (SELECT owner_id FROM businesses WHERE id = o.business_id) OR
        auth.uid() IN (SELECT user_id FROM user_profiles WHERE role_id = 4)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer des triggers pour les notifications automatiques
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer une notification pour l'utilisateur
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority,
        data
    ) VALUES (
        NEW.user_id,
        'order_status',
        'Statut de commande mis à jour',
        format('Votre commande #%s est maintenant %s', 
               substring(NEW.id::text from 1 for 8),
               CASE NEW.status
                   WHEN 'confirmed' THEN 'confirmée'
                   WHEN 'preparing' THEN 'en préparation'
                   WHEN 'ready' THEN 'prête'
                   WHEN 'picked_up' THEN 'en livraison'
                   WHEN 'delivered' THEN 'livrée'
                   ELSE NEW.status
               END
        ),
        'medium',
        jsonb_build_object(
            'order_id', NEW.id,
            'business_name', NEW.business_name,
            'status', NEW.status,
            'total', NEW.grand_total
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS order_status_change_notification ON orders;

-- Créer le trigger
CREATE TRIGGER order_status_change_notification
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_order_status_change();

-- 7. Créer une fonction pour tester les subscriptions
CREATE OR REPLACE FUNCTION test_realtime_subscription(order_id UUID)
RETURNS JSONB AS $$
DECLARE
    order_exists BOOLEAN;
    user_has_access BOOLEAN;
    result JSONB;
BEGIN
    -- Vérifier si la commande existe
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = order_id) INTO order_exists;
    
    -- Vérifier si l'utilisateur a accès
    SELECT test_order_permissions(order_id) INTO user_has_access;
    
    result := jsonb_build_object(
        'order_exists', order_exists,
        'user_has_access', user_has_access,
        'user_id', auth.uid(),
        'can_subscribe', order_exists AND user_has_access
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Afficher un résumé des corrections
DO $$
BEGIN
    RAISE NOTICE '=== CORRECTIONS DES SUBSCRIPTIONS TEMPS RÉEL ===';
    RAISE NOTICE '✅ Politiques RLS mises à jour pour orders';
    RAISE NOTICE '✅ Fonction test_order_permissions créée';
    RAISE NOTICE '✅ Vue user_orders_with_permissions créée';
    RAISE NOTICE '✅ Fonction get_user_order créée';
    RAISE NOTICE '✅ Trigger de notification créé';
    RAISE NOTICE '✅ Fonction test_realtime_subscription créée';
    RAISE NOTICE '';
    RAISE NOTICE 'Pour tester une subscription:';
    RAISE NOTICE 'SELECT test_realtime_subscription(''order-id-here'');';
    RAISE NOTICE '';
    RAISE NOTICE 'Pour vérifier les permissions:';
    RAISE NOTICE 'SELECT test_order_permissions(''order-id-here'');';
END $$; 