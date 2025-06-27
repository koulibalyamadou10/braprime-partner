-- ============================================================================
-- SCRIPT POUR DÉSACTIVER RLS SUR LA TABLE DRIVERS
-- ============================================================================
-- Ce script désactive temporairement la protection RLS sur drivers
-- ATTENTION: Cela supprime la sécurité, à utiliser uniquement pour les tests

-- ============================================================================
-- DÉSACTIVATION RLS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DÉSACTIVATION RLS - TABLE DRIVERS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Vérifier si la table existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '✅ Table drivers trouvée';
    ELSE
        RAISE EXCEPTION 'Table drivers n''existe pas';
    END IF;
END $$;

-- Supprimer toutes les politiques RLS existantes
DROP POLICY IF EXISTS "Partners can view their own drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can create drivers for their business" ON drivers;
DROP POLICY IF EXISTS "Partners can update their own drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can delete their own drivers" ON drivers;

DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS supprimées';
END $$;

-- Désactiver RLS sur la table drivers
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE '✅ RLS désactivé sur la table drivers';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATTENTION: La sécurité RLS est maintenant désactivée!';
    RAISE NOTICE '   Tous les utilisateurs peuvent maintenant accéder à la table drivers.';
    RAISE NOTICE '   Réactivez RLS après les tests avec: scripts/enable-drivers-rls.sql';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Vérifier que RLS est désactivé
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'drivers' AND rowsecurity = false
    ) THEN
        RAISE NOTICE '✅ Vérification: RLS est bien désactivé';
    ELSE
        RAISE NOTICE '❌ Vérification: RLS n''est pas désactivé';
    END IF;
    
    -- Vérifier qu'il n'y a plus de politiques
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drivers'
    ) THEN
        RAISE NOTICE '✅ Vérification: Aucune politique RLS trouvée';
    ELSE
        RAISE NOTICE '❌ Vérification: Des politiques RLS existent encore';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ DÉSACTIVATION TERMINÉE AVEC SUCCÈS!';
    RAISE NOTICE '   Vous pouvez maintenant ajouter des livreurs sans restriction.';
    RAISE NOTICE '';
END $$; 