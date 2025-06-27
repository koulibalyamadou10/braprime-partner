-- ============================================================================
-- SCRIPT DE CORRECTION FORCÉE DE LA TABLE DRIVERS
-- ============================================================================
-- Ce script force la correction de la table drivers
-- ATTENTION: Ce script supprime et recrée la table drivers

-- ============================================================================
-- ÉTAPE 1: VÉRIFICATION PRÉALABLE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECTION FORCÉE DE LA TABLE DRIVERS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Vérifier si businesses existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
        RAISE EXCEPTION 'La table businesses n''existe pas. Exécutez d''abord supabase-schema.sql';
    ELSE
        RAISE NOTICE '✅ Table businesses existe';
    END IF;
    
    -- Vérifier si drivers existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '⚠️  Table drivers existe - elle sera supprimée et recréée';
    ELSE
        RAISE NOTICE '✅ Table drivers n''existe pas - elle sera créée';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2: SUPPRESSION DE LA TABLE DRIVERS EXISTANTE
-- ============================================================================

-- Supprimer les politiques RLS si elles existent
DROP POLICY IF EXISTS "Partners can view their own drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can create drivers for their business" ON drivers;
DROP POLICY IF EXISTS "Partners can update their own drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can delete their own drivers" ON drivers;

-- Supprimer les triggers si ils existent
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;

-- Supprimer la table drivers
DROP TABLE IF EXISTS drivers CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Table drivers supprimée';
END $$;

-- ============================================================================
-- ÉTAPE 3: CRÉATION DE LA TABLE DRIVERS CORRECTE
-- ============================================================================

CREATE TABLE drivers (
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

DO $$
BEGIN
    RAISE NOTICE '✅ Table drivers créée avec succès';
END $$;

-- ============================================================================
-- ÉTAPE 4: CRÉATION DES INDEX
-- ============================================================================

CREATE INDEX idx_drivers_business ON drivers(business_id);
CREATE INDEX idx_drivers_current_order ON drivers(current_order_id);
CREATE INDEX idx_drivers_active ON drivers(is_active);

DO $$
BEGIN
    RAISE NOTICE '✅ Index créés';
END $$;

-- ============================================================================
-- ÉTAPE 5: ACTIVATION RLS ET POLITIQUES
-- ============================================================================

-- Activer RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
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

DO $$
BEGIN
    RAISE NOTICE '✅ RLS activé et politiques créées';
END $$;

-- ============================================================================
-- ÉTAPE 6: CRÉATION DU TRIGGER
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE '✅ Trigger créé';
END $$;

-- ============================================================================
-- ÉTAPE 7: VÉRIFICATION FINALE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VÉRIFICATION FINALE';
    RAISE NOTICE '========================================';
    
    -- Vérifier la table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '✅ Table drivers existe';
    ELSE
        RAISE NOTICE '❌ Table drivers manquante';
    END IF;
    
    -- Vérifier business_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'business_id'
    ) THEN
        RAISE NOTICE '✅ Colonne business_id existe';
    ELSE
        RAISE NOTICE '❌ Colonne business_id manquante';
    END IF;
    
    -- Vérifier RLS
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'drivers' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS est activé';
    ELSE
        RAISE NOTICE '❌ RLS n''est pas activé';
    END IF;
    
    -- Vérifier les politiques
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drivers'
    ) THEN
        RAISE NOTICE '✅ Politiques RLS existent';
    ELSE
        RAISE NOTICE '❌ Politiques RLS manquantes';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ CORRECTION TERMINÉE AVEC SUCCÈS!';
    RAISE NOTICE '';
END $$; 