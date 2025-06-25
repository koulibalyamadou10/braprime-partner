-- ============================================================================
-- SCRIPT DE VÉRIFICATION DE LA CONFIGURATION DES LIVREURS
-- ============================================================================
-- Ce script vérifie que la table drivers est correctement configurée
-- Exécutez ce script après avoir exécuté add-drivers-table.sql

-- ============================================================================
-- VÉRIFICATION DE LA TABLE
-- ============================================================================

-- Vérifier que la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '✅ Table drivers existe';
    ELSE
        RAISE NOTICE '❌ Table drivers n''existe pas';
    END IF;
END $$;

-- Vérifier les colonnes
DO $$
BEGIN
    -- Vérifier la colonne business_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'business_id'
    ) THEN
        RAISE NOTICE '✅ Colonne business_id existe';
    ELSE
        RAISE NOTICE '❌ Colonne business_id manquante';
    END IF;
    
    -- Vérifier la colonne vehicle_type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'vehicle_type'
    ) THEN
        RAISE NOTICE '✅ Colonne vehicle_type existe';
    ELSE
        RAISE NOTICE '❌ Colonne vehicle_type manquante';
    END IF;
    
    -- Vérifier la colonne vehicle_plate
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'vehicle_plate'
    ) THEN
        RAISE NOTICE '✅ Colonne vehicle_plate existe';
    ELSE
        RAISE NOTICE '❌ Colonne vehicle_plate manquante';
    END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION DES INDEX
-- ============================================================================

-- Vérifier les index
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'drivers' AND indexname = 'idx_drivers_business'
    ) THEN
        RAISE NOTICE '✅ Index idx_drivers_business existe';
    ELSE
        RAISE NOTICE '❌ Index idx_drivers_business manquant';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'drivers' AND indexname = 'idx_drivers_active'
    ) THEN
        RAISE NOTICE '✅ Index idx_drivers_active existe';
    ELSE
        RAISE NOTICE '❌ Index idx_drivers_active manquant';
    END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

-- Vérifier que RLS est activé
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'drivers' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS est activé sur la table drivers';
    ELSE
        RAISE NOTICE '❌ RLS n''est pas activé sur la table drivers';
    END IF;
END $$;

-- Vérifier les politiques
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drivers' AND policyname = 'Partners can view their own drivers'
    ) THEN
        RAISE NOTICE '✅ Politique "Partners can view their own drivers" existe';
    ELSE
        RAISE NOTICE '❌ Politique "Partners can view their own drivers" manquante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drivers' AND policyname = 'Partners can create drivers for their business'
    ) THEN
        RAISE NOTICE '✅ Politique "Partners can create drivers for their business" existe';
    ELSE
        RAISE NOTICE '❌ Politique "Partners can create drivers for their business" manquante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drivers' AND policyname = 'Partners can update their own drivers'
    ) THEN
        RAISE NOTICE '✅ Politique "Partners can update their own drivers" existe';
    ELSE
        RAISE NOTICE '❌ Politique "Partners can update their own drivers" manquante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drivers' AND policyname = 'Partners can delete their own drivers'
    ) THEN
        RAISE NOTICE '✅ Politique "Partners can delete their own drivers" existe';
    ELSE
        RAISE NOTICE '❌ Politique "Partners can delete their own drivers" manquante';
    END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION DES TRIGGERS
-- ============================================================================

-- Vérifier le trigger
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_drivers_updated_at'
    ) THEN
        RAISE NOTICE '✅ Trigger update_drivers_updated_at existe';
    ELSE
        RAISE NOTICE '❌ Trigger update_drivers_updated_at manquant';
    END IF;
END $$;

-- ============================================================================
-- TEST DE FONCTIONNALITÉ
-- ============================================================================

-- Tester l'insertion d'un livreur de test (sera supprimé après)
DO $$
DECLARE
    test_business_id INTEGER;
    test_driver_id UUID;
BEGIN
    -- Récupérer un business de test
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_business_id IS NOT NULL THEN
        -- Insérer un livreur de test
        INSERT INTO drivers (name, phone, email, business_id, vehicle_type, vehicle_plate, is_active)
        VALUES ('Test Driver', '+224 999 999 999', 'test@example.com', test_business_id, 'car', 'TEST 123', true)
        RETURNING id INTO test_driver_id;
        
        RAISE NOTICE '✅ Test d''insertion réussi - ID: %', test_driver_id;
        
        -- Supprimer le livreur de test
        DELETE FROM drivers WHERE id = test_driver_id;
        RAISE NOTICE '✅ Test de suppression réussi';
    ELSE
        RAISE NOTICE '⚠️  Aucun business trouvé pour le test';
    END IF;
END $$;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VÉRIFICATION TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Si tous les éléments sont marqués avec ✅,';
    RAISE NOTICE 'la configuration des livreurs est correcte.';
    RAISE NOTICE '';
    RAISE NOTICE 'Si des éléments sont marqués avec ❌,';
    RAISE NOTICE 'relancez le script add-drivers-table.sql';
    RAISE NOTICE '';
END $$; 