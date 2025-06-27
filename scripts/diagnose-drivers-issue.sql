-- ============================================================================
-- SCRIPT DE DIAGNOSTIC - PROBLÈME TABLE DRIVERS
-- ============================================================================
-- Ce script diagnostique le problème avec la table drivers
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- DIAGNOSTIC COMPLET
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC TABLE DRIVERS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- 1. Vérifier si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '✅ Table drivers existe';
    ELSE
        RAISE NOTICE '❌ Table drivers N''EXISTE PAS';
        RAISE NOTICE '   Solution: Exécuter le script add-drivers-table.sql';
    END IF;
END $$;

-- 2. Si la table existe, vérifier sa structure
DO $$
DECLARE
    col_record RECORD;
    col_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Structure de la table drivers:';
        RAISE NOTICE '----------------------------';
        
        FOR col_record IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'drivers' 
            ORDER BY ordinal_position
        LOOP
            col_count := col_count + 1;
            RAISE NOTICE '%: % % (nullable: %, default: %)', 
                col_count, 
                col_record.column_name, 
                col_record.data_type, 
                col_record.is_nullable, 
                COALESCE(col_record.column_default, 'NULL');
        END LOOP;
        
        RAISE NOTICE '';
        RAISE NOTICE 'Nombre total de colonnes: %', col_count;
    END IF;
END $$;

-- 3. Vérifier spécifiquement business_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'drivers' AND column_name = 'business_id'
        ) THEN
            RAISE NOTICE '✅ Colonne business_id existe';
        ELSE
            RAISE NOTICE '❌ Colonne business_id MANQUANTE';
            RAISE NOTICE '   Solution: Exécuter le script fix-drivers-table.sql';
        END IF;
    END IF;
END $$;

-- 4. Vérifier les contraintes de clé étrangère
DO $$
DECLARE
    fk_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Contraintes de clé étrangère:';
        RAISE NOTICE '-----------------------------';
        
        FOR fk_record IN 
            SELECT 
                tc.constraint_name,
                tc.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = 'drivers'
        LOOP
            RAISE NOTICE 'FK: % -> %.%', 
                fk_record.column_name, 
                fk_record.foreign_table_name, 
                fk_record.foreign_column_name;
        END LOOP;
    END IF;
END $$;

-- 5. Vérifier les index
DO $$
DECLARE
    idx_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Index sur la table drivers:';
        RAISE NOTICE '---------------------------';
        
        FOR idx_record IN 
            SELECT indexname, indexdef
            FROM pg_indexes 
            WHERE tablename = 'drivers'
        LOOP
            RAISE NOTICE 'Index: %', idx_record.indexname;
        END LOOP;
    END IF;
END $$;

-- 6. Vérifier RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'drivers' AND rowsecurity = true
        ) THEN
            RAISE NOTICE '✅ RLS est activé sur drivers';
        ELSE
            RAISE NOTICE '❌ RLS n''est PAS activé sur drivers';
        END IF;
    END IF;
END $$;

-- 7. Vérifier les politiques RLS
DO $$
DECLARE
    policy_record RECORD;
    policy_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Politiques RLS sur drivers:';
        RAISE NOTICE '---------------------------';
        
        FOR policy_record IN 
            SELECT policyname, permissive, roles, cmd, qual
            FROM pg_policies 
            WHERE tablename = 'drivers'
        LOOP
            policy_count := policy_count + 1;
            RAISE NOTICE 'Politique %: % (% %)', 
                policy_count, 
                policy_record.policyname, 
                policy_record.cmd, 
                policy_record.permissive;
        END LOOP;
        
        IF policy_count = 0 THEN
            RAISE NOTICE '❌ Aucune politique RLS trouvée';
        END IF;
    END IF;
END $$;

-- 8. Vérifier les triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Triggers sur drivers:';
        RAISE NOTICE '-------------------';
        
        FOR trigger_record IN 
            SELECT trigger_name, event_manipulation, action_statement
            FROM information_schema.triggers 
            WHERE event_object_table = 'drivers'
        LOOP
            RAISE NOTICE 'Trigger: % (% -> %)', 
                trigger_record.trigger_name, 
                trigger_record.event_manipulation, 
                trigger_record.action_statement;
        END LOOP;
    END IF;
END $$;

-- 9. Vérifier les données existantes
DO $$
DECLARE
    driver_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        SELECT COUNT(*) INTO driver_count FROM drivers;
        RAISE NOTICE '';
        RAISE NOTICE 'Données dans drivers:';
        RAISE NOTICE '-------------------';
        RAISE NOTICE 'Nombre de livreurs: %', driver_count;
        
        IF driver_count > 0 THEN
            RAISE NOTICE 'Exemple de données:';
            RAISE NOTICE '------------------';
            -- Afficher un exemple de livreur
            FOR driver_count IN 
                SELECT name, phone, business_id, vehicle_type 
                FROM drivers 
                LIMIT 3
            LOOP
                RAISE NOTICE 'Livreur: % (tel: %, business: %, véhicule: %)', 
                    driver_count.name, 
                    driver_count.phone, 
                    COALESCE(driver_count.business_id::text, 'NULL'), 
                    COALESCE(driver_count.vehicle_type, 'NULL');
            END LOOP;
        END IF;
    END IF;
END $$;

-- 10. Recommandations
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RECOMMANDATIONS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Vérifier si la table existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        RAISE NOTICE '1. Exécuter: scripts/add-drivers-table.sql';
    ELSE
        -- Vérifier si business_id existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'drivers' AND column_name = 'business_id'
        ) THEN
            RAISE NOTICE '1. Exécuter: scripts/fix-drivers-table.sql';
        ELSE
            RAISE NOTICE '1. La table drivers semble correcte';
        END IF;
    END IF;
    
    RAISE NOTICE '2. Vérifier que les tables businesses et user_profiles existent';
    RAISE NOTICE '3. Vérifier que l''utilisateur connecté a un business associé';
    RAISE NOTICE '4. Vérifier les permissions RLS';
    RAISE NOTICE '';
END $$; 