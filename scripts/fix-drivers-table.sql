-- ============================================================================
-- SCRIPT DE CORRECTION DE LA TABLE DRIVERS
-- ============================================================================
-- Ce script corrige la table drivers si elle existe mais est incomplète
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- VÉRIFICATION ET CORRECTION DE LA TABLE
-- ============================================================================

-- Vérifier si la table existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE 'Table drivers n''existe pas. Création...';
        
        -- Créer la table drivers complète
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
        
        RAISE NOTICE '✅ Table drivers créée avec succès';
    ELSE
        RAISE NOTICE 'Table drivers existe déjà';
    END IF;
END $$;

-- ============================================================================
-- AJOUT DE COLONNES MANQUANTES
-- ============================================================================

-- Ajouter business_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'business_id'
    ) THEN
        ALTER TABLE drivers ADD COLUMN business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Colonne business_id ajoutée';
    ELSE
        RAISE NOTICE 'Colonne business_id existe déjà';
    END IF;
END $$;

-- Ajouter vehicle_type si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'vehicle_type'
    ) THEN
        ALTER TABLE drivers ADD COLUMN vehicle_type VARCHAR(50);
        RAISE NOTICE '✅ Colonne vehicle_type ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vehicle_type existe déjà';
    END IF;
END $$;

-- Ajouter vehicle_plate si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'vehicle_plate'
    ) THEN
        ALTER TABLE drivers ADD COLUMN vehicle_plate VARCHAR(20);
        RAISE NOTICE '✅ Colonne vehicle_plate ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vehicle_plate existe déjà';
    END IF;
END $$;

-- Ajouter current_location si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'current_location'
    ) THEN
        ALTER TABLE drivers ADD COLUMN current_location JSONB;
        RAISE NOTICE '✅ Colonne current_location ajoutée';
    ELSE
        RAISE NOTICE 'Colonne current_location existe déjà';
    END IF;
END $$;

-- Ajouter current_order_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'current_order_id'
    ) THEN
        ALTER TABLE drivers ADD COLUMN current_order_id UUID;
        RAISE NOTICE '✅ Colonne current_order_id ajoutée';
    ELSE
        RAISE NOTICE 'Colonne current_order_id existe déjà';
    END IF;
END $$;

-- Ajouter rating si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'rating'
    ) THEN
        ALTER TABLE drivers ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.0;
        RAISE NOTICE '✅ Colonne rating ajoutée';
    ELSE
        RAISE NOTICE 'Colonne rating existe déjà';
    END IF;
END $$;

-- Ajouter total_deliveries si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'total_deliveries'
    ) THEN
        ALTER TABLE drivers ADD COLUMN total_deliveries INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Colonne total_deliveries ajoutée';
    ELSE
        RAISE NOTICE 'Colonne total_deliveries existe déjà';
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Créer les index s'ils n'existent pas
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
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que tout est en place
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
    
    RAISE NOTICE '';
    RAISE NOTICE 'Si tous les éléments sont marqués avec ✅,';
    RAISE NOTICE 'la table drivers est maintenant correctement configurée.';
    RAISE NOTICE '';
END $$; 