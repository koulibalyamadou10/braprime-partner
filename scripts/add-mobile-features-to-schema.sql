-- ============================================================================
-- AJOUT DES FONCTIONNALITÉS MOBILE MANQUANTES
-- ============================================================================
-- Ce script ajoute les fonctionnalités du schéma React Native Driver App
-- à notre schéma BraPrime existant

-- ============================================================================
-- TABLES POUR LE SYSTÈME D'OFFRES DE LIVRAISON
-- ============================================================================

-- Table des offres de livraison (pour les chauffeurs)
CREATE TABLE IF NOT EXISTS delivery_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, expired
    offered_amount DECIMAL(10,2) NOT NULL,
    estimated_duration INTEGER, -- en minutes
    estimated_distance DECIMAL(8,2), -- en km
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES POUR LES DOCUMENTS DES CHAUFFEURS
-- ============================================================================

-- Table des documents des chauffeurs
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- license, registration, insurance, etc.
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    expiry_date DATE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES POUR LES SESSIONS DE TRAVAIL
-- ============================================================================

-- Table des sessions de travail des chauffeurs
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    total_distance DECIMAL(8,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, paused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE POUR L'HISTORIQUE DES STATUTS DE COMMANDE
-- ============================================================================

-- Table des statuts de commande (historique détaillé)
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_by UUID, -- driver_id ou business_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AMÉLIORATIONS DE LA TABLE ORDERS
-- ============================================================================

-- Ajouter des colonnes manquantes à la table orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_coordinates JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_coordinates JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_pickup_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_pickup_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- AMÉLIORATIONS DE LA TABLE DRIVERS
-- ============================================================================

-- Ajouter des colonnes manquantes à la table drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================================
-- INDEX POUR LES NOUVELLES TABLES
-- ============================================================================

-- Index pour les offres de livraison
CREATE INDEX IF NOT EXISTS idx_delivery_offers_status ON delivery_offers(status);
CREATE INDEX IF NOT EXISTS idx_delivery_offers_driver ON delivery_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_offers_expires ON delivery_offers(expires_at);
CREATE INDEX IF NOT EXISTS idx_delivery_offers_order ON delivery_offers(order_id);

-- Index pour les documents des chauffeurs
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON driver_documents(document_type);

-- Index pour les sessions de travail
CREATE INDEX IF NOT EXISTS idx_work_sessions_driver ON work_sessions(driver_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON work_sessions(status);
CREATE INDEX IF NOT EXISTS idx_work_sessions_start_time ON work_sessions(start_time);

-- Index pour l'historique des statuts
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Index pour les nouvelles colonnes orders
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_time ON orders(estimated_pickup_time);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_time ON orders(estimated_delivery_time);

-- ============================================================================
-- TRIGGERS POUR LES NOUVELLES TABLES
-- ============================================================================

-- Triggers pour updated_at
CREATE TRIGGER update_delivery_offers_updated_at BEFORE UPDATE ON delivery_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_documents_updated_at BEFORE UPDATE ON driver_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_sessions_updated_at BEFORE UPDATE ON work_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'CMD-' || LPAD(CAST(nextval('order_number_seq') AS TEXT), 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Séquence pour les numéros de commande
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger pour générer automatiquement le numéro de commande
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Fonction pour mettre à jour les statistiques du chauffeur
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE drivers 
        SET 
            total_deliveries = total_deliveries + 1,
            total_earnings = total_earnings + COALESCE(NEW.delivery_fee, 0)
        WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour les statistiques
CREATE TRIGGER update_driver_stats_trigger AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_driver_stats();

-- Fonction pour créer automatiquement un historique de statut
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_status_history (order_id, status, description, created_by)
    VALUES (NEW.id, NEW.status, 'Statut mis à jour', NEW.driver_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer l'historique des statuts
CREATE TRIGGER create_order_status_history_trigger AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- ============================================================================
-- VUES UTILES POUR L'APP MOBILE
-- ============================================================================

-- Vue pour les commandes avec toutes les informations
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
    o.*,
    b.name as business_name,
    b.address as business_address,
    b.phone as business_phone,
    b.email as business_email,
    up.name as customer_name,
    up.phone_number as customer_phone,
    up.email as customer_email,
    d.name as driver_name,
    d.phone as driver_phone,
    d.email as driver_email
FROM orders o
LEFT JOIN businesses b ON o.business_id = b.id
LEFT JOIN user_profiles up ON o.user_id = up.id
LEFT JOIN drivers d ON o.driver_id = d.id;

-- Vue pour les statistiques des chauffeurs
CREATE OR REPLACE VIEW driver_statistics AS
SELECT 
    d.id,
    d.name,
    d.email,
    d.phone,
    d.rating,
    d.total_deliveries,
    d.total_earnings,
    COUNT(o.id) as current_month_deliveries,
    SUM(o.delivery_fee) as current_month_earnings,
    AVG(o.delivery_fee) as average_delivery_fee
FROM drivers d
LEFT JOIN orders o ON d.id = o.driver_id 
    AND o.status = 'delivered' 
    AND o.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY d.id, d.name, d.email, d.phone, d.rating, d.total_deliveries, d.total_earnings;

-- Vue pour les offres de livraison disponibles
CREATE OR REPLACE VIEW available_delivery_offers AS
SELECT 
    do.*,
    o.order_number,
    o.pickup_address,
    o.delivery_address,
    o.total_amount,
    b.name as business_name,
    b.address as business_address,
    up.name as customer_name,
    up.phone_number as customer_phone
FROM delivery_offers do
JOIN orders o ON do.order_id = o.id
JOIN businesses b ON o.business_id = b.id
JOIN user_profiles up ON o.user_id = up.id
WHERE do.status = 'pending' AND do.expires_at > NOW();

-- ============================================================================
-- POLITIQUES RLS POUR LES NOUVELLES TABLES
-- ============================================================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE delivery_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour les offres de livraison
CREATE POLICY "Drivers can view available offers" ON delivery_offers FOR SELECT USING (status = 'pending');
CREATE POLICY "Drivers can accept offers" ON delivery_offers FOR UPDATE USING (driver_id::text = auth.uid()::text);

-- Politiques pour les documents des chauffeurs
CREATE POLICY "Drivers can view own documents" ON driver_documents FOR SELECT USING (driver_id::text = auth.uid()::text);
CREATE POLICY "Drivers can update own documents" ON driver_documents FOR UPDATE USING (driver_id::text = auth.uid()::text);

-- Politiques pour les sessions de travail
CREATE POLICY "Drivers can view own sessions" ON work_sessions FOR SELECT USING (driver_id::text = auth.uid()::text);
CREATE POLICY "Drivers can update own sessions" ON work_sessions FOR UPDATE USING (driver_id::text = auth.uid()::text);

-- Politiques pour l'historique des statuts
CREATE POLICY "Users can view order history" ON order_status_history FOR SELECT USING (true);

-- ============================================================================
-- DONNÉES D'EXEMPLE POUR LES NOUVELLES TABLES
-- ============================================================================

-- Insérer des documents de test pour les chauffeurs
INSERT INTO driver_documents (driver_id, document_type, document_number, file_url, status) 
SELECT 
    d.id,
    'license',
    'LIC-' || LPAD(d.id::text, 6, '0'),
    'https://example.com/documents/license.pdf',
    'approved'
FROM drivers d
LIMIT 5;

-- Insérer des sessions de travail de test
INSERT INTO work_sessions (driver_id, start_time, end_time, total_earnings, total_deliveries, status)
SELECT 
    d.id,
    NOW() - INTERVAL '8 hours',
    NOW(),
    150.00,
    5,
    'completed'
FROM drivers d
LIMIT 3;

-- ============================================================================
-- COMMENTAIRES FINAUX
-- ============================================================================

/*
Ce script ajoute les fonctionnalités suivantes du schéma React Native :

1. **Système d'offres de livraison** : Permet aux chauffeurs de faire des offres
2. **Gestion des documents** : Documents des chauffeurs (permis, assurance, etc.)
3. **Sessions de travail** : Suivi des heures de travail et gains
4. **Historique des statuts** : Traçabilité complète des commandes
5. **Améliorations des commandes** : Coordonnées GPS, temps estimés
6. **Statistiques avancées** : Vues pour les analyses
7. **Sécurité renforcée** : Politiques RLS pour toutes les nouvelles tables

Ces ajouts rendent notre schéma compatible avec les besoins d'une app mobile
React Native tout en conservant la compatibilité avec l'app web existante.
*/ 