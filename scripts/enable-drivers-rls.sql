-- ============================================================================
-- SCRIPT POUR RÉACTIVER RLS SUR LA TABLE DRIVERS
-- ============================================================================
-- Ce script réactive la protection RLS sur drivers
-- À utiliser après les tests pour restaurer la sécurité

-- ============================================================================
-- RÉACTIVATION RLS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RÉACTIVATION RLS - TABLE DRIVERS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Vérifier si la table existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '✅ Table drivers trouvée';
    ELSE
        RAISE EXCEPTION 'Table drivers n''existe pas';
    END IF;
END $$;

-- Activer RLS sur la table drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE '✅ RLS activé sur la table drivers';
END $$;

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
    RAISE NOTICE '✅ Politiques RLS créées';
END $$;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Vérifier que RLS est activé
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'drivers' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ Vérification: RLS est bien activé';
    ELSE
        RAISE NOTICE '❌ Vérification: RLS n''est pas activé';
    END IF;
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'drivers';
    RAISE NOTICE '✅ Vérification: % politique(s) RLS créée(s)', policy_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ RÉACTIVATION TERMINÉE AVEC SUCCÈS!';
    RAISE NOTICE '   La sécurité RLS est maintenant restaurée.';
    RAISE NOTICE '';
END $$; 