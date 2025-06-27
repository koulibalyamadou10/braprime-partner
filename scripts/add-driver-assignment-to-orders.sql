-- ============================================================================
-- SCRIPT POUR AJOUTER L'ASSIGNATION DE LIVREUR AUX COMMANDES
-- ============================================================================
-- Ce script ajoute les colonnes nécessaires à la table orders pour l'assignation de livreur
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- AJOUT DES COLONNES POUR L'ASSIGNATION DE LIVREUR
-- ============================================================================

-- Ajouter les colonnes pour l'assignation de livreur si elles n'existent pas
DO $$
BEGIN
    -- Ajouter la colonne driver_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'driver_id') THEN
        ALTER TABLE orders ADD COLUMN driver_id UUID REFERENCES drivers(id);
    END IF;

    -- Ajouter la colonne driver_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'driver_name') THEN
        ALTER TABLE orders ADD COLUMN driver_name VARCHAR(100);
    END IF;

    -- Ajouter la colonne driver_phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'driver_phone') THEN
        ALTER TABLE orders ADD COLUMN driver_phone VARCHAR(20);
    END IF;

    -- Ajouter la colonne driver_location si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'driver_location') THEN
        ALTER TABLE orders ADD COLUMN driver_location JSONB;
    END IF;

    -- Ajouter la colonne assigned_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'assigned_at') THEN
        ALTER TABLE orders ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les commandes par livreur
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

-- Index pour les commandes assignées
CREATE INDEX IF NOT EXISTS idx_orders_assigned_at ON orders(assigned_at);

-- Index pour les commandes avec livreur
CREATE INDEX IF NOT EXISTS idx_orders_has_driver ON orders(driver_id) WHERE driver_id IS NOT NULL;

-- ============================================================================
-- TRIGGERS POUR LA GESTION AUTOMATIQUE
-- ============================================================================

-- Fonction pour mettre à jour assigned_at automatiquement
CREATE OR REPLACE FUNCTION update_order_assigned_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Si un livreur est assigné et qu'il n'y en avait pas avant
    IF NEW.driver_id IS NOT NULL AND (OLD.driver_id IS NULL OR OLD.driver_id IS DISTINCT FROM NEW.driver_id) THEN
        NEW.assigned_at = NOW();
    END IF;
    
    -- Si le livreur est retiré
    IF NEW.driver_id IS NULL AND OLD.driver_id IS NOT NULL THEN
        NEW.assigned_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour assigned_at
DROP TRIGGER IF EXISTS update_order_assigned_at_trigger ON orders;
CREATE TRIGGER update_order_assigned_at_trigger 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_order_assigned_at();

-- ============================================================================
-- POLITIQUES RLS MISE À JOUR (si nécessaire)
-- ============================================================================

-- Vérifier si les politiques RLS existent et les mettre à jour si nécessaire
DO $$
BEGIN
    -- Mettre à jour la politique de lecture pour inclure les informations de livreur
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders') THEN
        -- La politique existe déjà, pas besoin de la recréer
        RAISE NOTICE 'Politique RLS existante pour orders - pas de modification nécessaire';
    ELSE
        RAISE NOTICE 'Aucune politique RLS trouvée pour orders - vérifiez la configuration RLS';
    END IF;
END $$;

-- ============================================================================
-- VUES UTILES POUR LA GESTION DES LIVREURS
-- ============================================================================

-- Vue pour les commandes avec informations de livreur
CREATE OR REPLACE VIEW orders_with_driver_info AS
SELECT 
    o.*,
    d.name as driver_full_name,
    d.phone as driver_phone_number,
    d.vehicle_type,
    d.vehicle_plate,
    d.rating as driver_rating,
    d.total_deliveries as driver_total_deliveries
FROM orders o
LEFT JOIN drivers d ON o.driver_id = d.id;

-- Vue pour les livreurs avec leurs commandes actuelles
CREATE OR REPLACE VIEW drivers_with_current_orders AS
SELECT 
    d.*,
    o.id as current_order_id,
    o.customer_name,
    o.delivery_address,
    o.status as order_status,
    o.created_at as order_created_at
FROM drivers d
LEFT JOIN orders o ON d.current_order_id = o.id
WHERE d.is_active = true;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Script d''assignation de livreur aux commandes exécuté avec succès!';
    RAISE NOTICE 'Colonnes ajoutées à la table orders: driver_id, driver_name, driver_phone, driver_location, assigned_at';
    RAISE NOTICE 'Index créés pour les performances';
    RAISE NOTICE 'Triggers configurés pour la gestion automatique';
    RAISE NOTICE 'Vues créées pour faciliter la gestion des livreurs';
END $$; 