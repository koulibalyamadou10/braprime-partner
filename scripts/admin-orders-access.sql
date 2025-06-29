-- ============================================================================
-- SCRIPT POUR DONNER L'ACCÈS ADMIN À TOUTES LES COMMANDES
-- ============================================================================
-- Ce script ajoute les politiques RLS nécessaires pour que l'admin puisse
-- voir et gérer toutes les commandes de la plateforme
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- POLITIQUES RLS POUR L'ADMIN SUR LA TABLE ORDERS
-- ============================================================================

-- Activer RLS sur orders si ce n'est pas déjà fait
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique pour que l'admin puisse voir toutes les commandes
CREATE POLICY "Admin can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politique pour que l'admin puisse mettre à jour toutes les commandes
CREATE POLICY "Admin can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politique pour que l'admin puisse insérer des commandes (si nécessaire)
CREATE POLICY "Admin can insert orders" ON orders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politique pour que l'admin puisse supprimer des commandes (si nécessaire)
CREATE POLICY "Admin can delete orders" ON orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- ============================================================================
-- POLITIQUES RLS POUR L'ADMIN SUR LA TABLE DRIVERS
-- ============================================================================

-- Activer RLS sur drivers si ce n'est pas déjà fait
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Politique pour que l'admin puisse voir tous les livreurs
CREATE POLICY "Admin can view all drivers" ON drivers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politique pour que l'admin puisse mettre à jour tous les livreurs
CREATE POLICY "Admin can update all drivers" ON drivers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- ============================================================================
-- POLITIQUES RLS POUR L'ADMIN SUR LA TABLE BUSINESSES
-- ============================================================================

-- Activer RLS sur businesses si ce n'est pas déjà fait
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Politique pour que l'admin puisse voir tous les commerces
CREATE POLICY "Admin can view all businesses" ON businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- ============================================================================
-- FONCTION POUR VÉRIFIER SI UN UTILISATEUR EST ADMIN
-- ============================================================================

-- Fonction helper pour vérifier si l'utilisateur connecté est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN user_roles ur ON up.role_id = ur.id
        WHERE up.id = auth.uid() AND ur.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VUES UTILES POUR L'ADMIN
-- ============================================================================

-- Vue pour toutes les commandes avec informations complètes
CREATE OR REPLACE VIEW admin_orders_view AS
SELECT 
    o.*,
    b.name as business_name,
    b.owner_id as business_owner_id,
    d.name as driver_name,
    d.phone as driver_phone,
    d.vehicle_type as driver_vehicle_type,
    d.rating as driver_rating
FROM orders o
LEFT JOIN businesses b ON o.business_id = b.id
LEFT JOIN drivers d ON o.driver_id = d.id
WHERE is_admin();

-- Vue pour les statistiques des commandes par commerce
CREATE OR REPLACE VIEW admin_business_stats AS
SELECT 
    b.id as business_id,
    b.name as business_name,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
    SUM(o.grand_total) as total_revenue,
    AVG(o.grand_total) as average_order_value
FROM businesses b
LEFT JOIN orders o ON b.id = o.business_id
WHERE is_admin()
GROUP BY b.id, b.name;

-- Vue pour les statistiques des livreurs
CREATE OR REPLACE VIEW admin_driver_stats AS
SELECT 
    d.id as driver_id,
    d.name as driver_name,
    d.phone as driver_phone,
    d.rating as driver_rating,
    d.total_deliveries,
    COUNT(o.id) as current_orders,
    AVG(o.grand_total) as average_order_value
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id AND o.status IN ('out_for_delivery', 'picked_up')
WHERE is_admin()
GROUP BY d.id, d.name, d.phone, d.rating, d.total_deliveries;

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les requêtes admin sur orders
CREATE INDEX IF NOT EXISTS idx_admin_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_admin_orders_business_id ON orders(business_id);

-- Index pour les requêtes admin sur drivers
CREATE INDEX IF NOT EXISTS idx_admin_drivers_business_id ON drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_admin_drivers_active ON drivers(is_active);

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Script d''accès admin aux commandes exécuté avec succès!';
    RAISE NOTICE 'L''admin peut maintenant:';
    RAISE NOTICE '- Voir toutes les commandes de la plateforme';
    RAISE NOTICE '- Assigner des livreurs à toutes les commandes';
    RAISE NOTICE '- Mettre à jour le statut de toutes les commandes';
    RAISE NOTICE '- Voir les statistiques de tous les commerces';
    RAISE NOTICE '- Gérer tous les livreurs';
END $$; 