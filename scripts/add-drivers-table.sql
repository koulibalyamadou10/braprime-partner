-- ============================================================================
-- SCRIPT POUR AJOUTER LA GESTION DES LIVREURS
-- ============================================================================
-- Ce script crée la table drivers et configure ses politiques RLS
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- CRÉATION DE LA TABLE DRIVERS
-- ============================================================================

-- Créer la table drivers si elle n'existe pas
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    current_location JSONB,
    current_order_id UUID,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les livreurs
CREATE INDEX IF NOT EXISTS idx_drivers_business ON drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_drivers_current_order ON drivers(current_order_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);

-- ============================================================================
-- POLITIQUES RLS
-- ============================================================================

-- Activer RLS sur la table drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Partners can view their own drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can create drivers for their business" ON drivers;
DROP POLICY IF EXISTS "Partners can update their own drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can delete their own drivers" ON drivers;

-- Créer les nouvelles politiques
CREATE POLICY "Partners can view their own drivers" ON drivers
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Partners can create drivers for their business" ON drivers
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Partners can update their own drivers" ON drivers
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Partners can delete their own drivers" ON drivers
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement (si elle n'existe pas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================

-- Insérer quelques livreurs de test si la table est vide
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

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Script de gestion des livreurs exécuté avec succès!';
    RAISE NOTICE 'Table drivers créée avec succès';
    RAISE NOTICE 'Politiques RLS configurées pour les partenaires';
    RAISE NOTICE 'Index et triggers ajoutés pour les performances';
END $$; 