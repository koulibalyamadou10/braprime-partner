-- Script pour permettre à un chauffeur d'avoir plusieurs commandes en cours
-- Date: $(date)
-- Description: Modifie le schéma pour permettre la gestion de plusieurs commandes par chauffeur

-- 1. Supprimer la colonne current_order_id de la table drivers
-- Cette colonne limite un chauffeur à une seule commande à la fois
ALTER TABLE public.drivers DROP COLUMN IF EXISTS current_order_id;

-- 2. Ajouter une contrainte de clé étrangère sur orders.driver_id
-- Cela garantit l'intégrité référentielle entre orders et drivers
ALTER TABLE public.orders 
ADD CONSTRAINT orders_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;

-- 3. Créer un index sur driver_id pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);

-- 4. Créer un index sur le statut des commandes pour optimiser les requêtes de commandes actives
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 5. Créer un index composite pour les commandes actives d'un chauffeur
CREATE INDEX IF NOT EXISTS idx_orders_driver_status ON public.orders(driver_id, status);

-- 6. Créer une vue pour les commandes actives par chauffeur
CREATE OR REPLACE VIEW public.driver_active_orders AS
SELECT 
    d.id as driver_id,
    d.name as driver_name,
    d.phone as driver_phone,
    d.vehicle_type,
    d.vehicle_plate,
    d.current_location,
    COUNT(o.id) as active_orders_count,
    ARRAY_AGG(o.id) as active_order_ids,
    ARRAY_AGG(o.business_name) as business_names,
    ARRAY_AGG(o.delivery_address) as delivery_addresses,
    ARRAY_AGG(o.estimated_delivery) as estimated_deliveries
FROM public.drivers d
LEFT JOIN public.orders o ON d.id = o.driver_id 
    AND o.status IN ('picked_up', 'preparing', 'ready', 'confirmed')
WHERE d.is_active = true
GROUP BY d.id, d.name, d.phone, d.vehicle_type, d.vehicle_plate, d.current_location;

-- 7. Créer une fonction pour obtenir les commandes actives d'un chauffeur
CREATE OR REPLACE FUNCTION public.get_driver_active_orders(driver_uuid uuid)
RETURNS TABLE (
    order_id uuid,
    business_name varchar,
    delivery_address text,
    estimated_delivery timestamp with time zone,
    status varchar,
    grand_total integer,
    customer_phone varchar,
    delivery_instructions text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.business_name,
        o.delivery_address,
        o.estimated_delivery,
        o.status,
        o.grand_total,
        up.phone_number as customer_phone,
        o.delivery_instructions
    FROM public.orders o
    LEFT JOIN public.user_profiles up ON o.user_id = up.id
    WHERE o.driver_id = driver_uuid 
        AND o.status IN ('picked_up', 'preparing', 'ready', 'confirmed')
    ORDER BY o.estimated_delivery ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer une fonction pour assigner une commande à un chauffeur
CREATE OR REPLACE FUNCTION public.assign_order_to_driver(
    order_uuid uuid,
    driver_uuid uuid
)
RETURNS boolean AS $$
DECLARE
    driver_exists boolean;
    order_exists boolean;
    order_status varchar;
BEGIN
    -- Vérifier que le chauffeur existe et est actif
    SELECT EXISTS(SELECT 1 FROM public.drivers WHERE id = driver_uuid AND is_active = true) INTO driver_exists;
    IF NOT driver_exists THEN
        RAISE EXCEPTION 'Chauffeur non trouvé ou inactif';
    END IF;

    -- Vérifier que la commande existe
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE id = order_uuid) INTO order_exists;
    IF NOT order_exists THEN
        RAISE EXCEPTION 'Commande non trouvée';
    END IF;

    -- Vérifier le statut de la commande
    SELECT status INTO order_status FROM public.orders WHERE id = order_uuid;
    IF order_status NOT IN ('confirmed', 'preparing', 'ready') THEN
        RAISE EXCEPTION 'La commande ne peut pas être assignée avec le statut: %', order_status;
    END IF;

    -- Assigner la commande au chauffeur
    UPDATE public.orders 
    SET 
        driver_id = driver_uuid,
        driver_name = (SELECT name FROM public.drivers WHERE id = driver_uuid),
        driver_phone = (SELECT phone FROM public.drivers WHERE id = driver_uuid),
        updated_at = now()
    WHERE id = order_uuid;

    -- Mettre à jour le statut de la commande si elle était 'confirmed'
    IF order_status = 'confirmed' THEN
        UPDATE public.orders 
        SET status = 'preparing', updated_at = now()
        WHERE id = order_uuid;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer une fonction pour libérer un chauffeur d'une commande
CREATE OR REPLACE FUNCTION public.unassign_order_from_driver(order_uuid uuid)
RETURNS boolean AS $$
DECLARE
    order_status varchar;
BEGIN
    -- Vérifier que la commande existe
    IF NOT EXISTS(SELECT 1 FROM public.orders WHERE id = order_uuid) THEN
        RAISE EXCEPTION 'Commande non trouvée';
    END IF;

    -- Récupérer le statut actuel
    SELECT status INTO order_status FROM public.orders WHERE id = order_uuid;

    -- Libérer la commande
    UPDATE public.orders 
    SET 
        driver_id = NULL,
        driver_name = NULL,
        driver_phone = NULL,
        updated_at = now()
    WHERE id = order_uuid;

    -- Remettre le statut à 'confirmed' si la commande était en préparation
    IF order_status IN ('preparing', 'ready') THEN
        UPDATE public.orders 
        SET status = 'confirmed', updated_at = now()
        WHERE id = order_uuid;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 10. Créer une fonction pour obtenir les statistiques d'un chauffeur
CREATE OR REPLACE FUNCTION public.get_driver_stats(driver_uuid uuid)
RETURNS TABLE (
    total_deliveries integer,
    total_earnings numeric,
    average_rating numeric,
    active_orders_count integer,
    completed_today integer,
    earnings_today numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.total_deliveries,
        d.total_earnings,
        d.rating as average_rating,
        COALESCE(active_orders.count, 0) as active_orders_count,
        COALESCE(today_deliveries.count, 0) as completed_today,
        COALESCE(today_earnings.amount, 0) as earnings_today
    FROM public.drivers d
    LEFT JOIN (
        SELECT COUNT(*) as count
        FROM public.orders 
        WHERE driver_id = driver_uuid 
            AND status IN ('picked_up', 'preparing', 'ready', 'confirmed')
    ) active_orders ON true
    LEFT JOIN (
        SELECT COUNT(*) as count
        FROM public.orders 
        WHERE driver_id = driver_uuid 
            AND status = 'delivered'
            AND DATE(actual_delivery) = CURRENT_DATE
    ) today_deliveries ON true
    LEFT JOIN (
        SELECT COALESCE(SUM(grand_total), 0) as amount
        FROM public.orders 
        WHERE driver_id = driver_uuid 
            AND status = 'delivered'
            AND DATE(actual_delivery) = CURRENT_DATE
    ) today_earnings ON true
    WHERE d.id = driver_uuid;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer des triggers pour maintenir la cohérence des données

-- Trigger pour mettre à jour les statistiques du chauffeur après livraison
CREATE OR REPLACE FUNCTION public.update_driver_stats_after_delivery()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE public.drivers 
        SET 
            total_deliveries = total_deliveries + 1,
            total_earnings = total_earnings + NEW.grand_total,
            updated_at = now()
        WHERE id = NEW.driver_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_stats
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_driver_stats_after_delivery();

-- 12. Créer des politiques RLS pour la sécurité

-- Politique pour que les chauffeurs ne voient que leurs propres commandes
CREATE POLICY "Drivers can view their own orders" ON public.orders
    FOR SELECT USING (
        driver_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.drivers 
            WHERE id = auth.uid() AND business_id = orders.business_id
        )
    );

-- Politique pour que les partenaires voient les commandes de leurs chauffeurs
CREATE POLICY "Partners can view their drivers orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE owner_id = auth.uid() AND id = orders.business_id
        )
    );

-- 13. Insérer des données de test (optionnel - à commenter en production)
/*
-- Exemple d'utilisation des nouvelles fonctions
-- Assigner une commande à un chauffeur
SELECT public.assign_order_to_driver('order-uuid-here', 'driver-uuid-here');

-- Obtenir les commandes actives d'un chauffeur
SELECT * FROM public.get_driver_active_orders('driver-uuid-here');

-- Obtenir les statistiques d'un chauffeur
SELECT * FROM public.get_driver_stats('driver-uuid-here');

-- Libérer une commande d'un chauffeur
SELECT public.unassign_order_from_driver('order-uuid-here');
*/

-- 14. Créer des commentaires pour la documentation
COMMENT ON VIEW public.driver_active_orders IS 'Vue des commandes actives par chauffeur';
COMMENT ON FUNCTION public.get_driver_active_orders(uuid) IS 'Fonction pour obtenir les commandes actives d''un chauffeur';
COMMENT ON FUNCTION public.assign_order_to_driver(uuid, uuid) IS 'Fonction pour assigner une commande à un chauffeur';
COMMENT ON FUNCTION public.unassign_order_from_driver(uuid) IS 'Fonction pour libérer une commande d''un chauffeur';
COMMENT ON FUNCTION public.get_driver_stats(uuid) IS 'Fonction pour obtenir les statistiques d''un chauffeur';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Script exécuté avec succès!';
    RAISE NOTICE 'Le schéma a été modifié pour permettre plusieurs commandes par chauffeur.';
    RAISE NOTICE 'Nouvelles fonctionnalités disponibles:';
    RAISE NOTICE '- assign_order_to_driver(order_id, driver_id)';
    RAISE NOTICE '- unassign_order_from_driver(order_id)';
    RAISE NOTICE '- get_driver_active_orders(driver_id)';
    RAISE NOTICE '- get_driver_stats(driver_id)';
    RAISE NOTICE '- Vue: driver_active_orders';
END $$; 