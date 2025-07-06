-- ============================================================================
-- SCRIPT DE CORRECTION COMPLÈTE DE LA TABLE DRIVERS
-- ============================================================================
-- Ce script s'assure que la table drivers a tous les champs nécessaires

-- ============================================================================
-- VÉRIFICATION DE LA STRUCTURE ACTUELLE
-- ============================================================================

SELECT '=== VÉRIFICATION DE LA STRUCTURE ACTUELLE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- ============================================================================
-- CRÉATION DE LA TABLE SI ELLE N'EXISTE PAS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE 'Table drivers n''existe pas. Création...';
        
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
            total_earnings DECIMAL(10,2) DEFAULT 0.0,
            is_verified BOOLEAN DEFAULT false,
            avatar_url TEXT,
            driver_type VARCHAR(20) DEFAULT 'independent',
            documents_count INTEGER DEFAULT 0,
            active_sessions INTEGER DEFAULT 0,
            last_active TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Table drivers créée avec succès';
    ELSE
        RAISE NOTICE 'Table drivers existe déjà';
    END IF;
END $$;

-- ============================================================================
-- AJOUT DE COLONNES MANQUANTES
-- ============================================================================

-- Ajouter driver_type si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'driver_type'
    ) THEN
        ALTER TABLE drivers ADD COLUMN driver_type VARCHAR(20) DEFAULT 'independent';
        RAISE NOTICE '✅ Colonne driver_type ajoutée';
    ELSE
        RAISE NOTICE 'Colonne driver_type existe déjà';
    END IF;
END $$;

-- Ajouter is_verified si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE drivers ADD COLUMN is_verified BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Colonne is_verified ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_verified existe déjà';
    END IF;
END $$;

-- Ajouter documents_count si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'documents_count'
    ) THEN
        ALTER TABLE drivers ADD COLUMN documents_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Colonne documents_count ajoutée';
    ELSE
        RAISE NOTICE 'Colonne documents_count existe déjà';
    END IF;
END $$;

-- Ajouter active_sessions si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'active_sessions'
    ) THEN
        ALTER TABLE drivers ADD COLUMN active_sessions INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Colonne active_sessions ajoutée';
    ELSE
        RAISE NOTICE 'Colonne active_sessions existe déjà';
    END IF;
END $$;

-- Ajouter last_active si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'last_active'
    ) THEN
        ALTER TABLE drivers ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Colonne last_active ajoutée';
    ELSE
        RAISE NOTICE 'Colonne last_active existe déjà';
    END IF;
END $$;

-- Ajouter total_earnings si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'total_earnings'
    ) THEN
        ALTER TABLE drivers ADD COLUMN total_earnings DECIMAL(10,2) DEFAULT 0.0;
        RAISE NOTICE '✅ Colonne total_earnings ajoutée';
    ELSE
        RAISE NOTICE 'Colonne total_earnings existe déjà';
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_drivers_business ON drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_drivers_current_order ON drivers(current_order_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_verified ON drivers(is_verified);
CREATE INDEX IF NOT EXISTS idx_drivers_type ON drivers(driver_type);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);

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
DROP POLICY IF EXISTS "Admins can manage all drivers" ON drivers;

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

-- Politique pour les admins
CREATE POLICY "Admins can manage all drivers" ON drivers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
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
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

SELECT '=== VÉRIFICATION FINALE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

SELECT '✅ Table drivers corrigée avec succès!' as message;
SELECT '🚚 Tous les champs nécessaires sont maintenant disponibles' as message;
SELECT '🔒 Politiques RLS configurées pour les partenaires et admins' as message; 