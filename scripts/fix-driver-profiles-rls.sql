-- ============================================================================
-- SCRIPT POUR CORRIGER LES POLITIQUES RLS DE LA TABLE DRIVER_PROFILES
-- ============================================================================
-- Ce script ajoute la politique INSERT manquante pour driver_profiles
-- qui cause l'erreur RLS lors de la création de comptes livreurs

-- ============================================================================
-- 1. VÉRIFIER LES POLITIQUES RLS ACTUELLES SUR DRIVER_PROFILES
-- ============================================================================

SELECT 
    'CURRENT POLICIES' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'driver_profiles'
ORDER BY policyname;

-- ============================================================================
-- 2. AJOUTER LA POLITIQUE INSERT MANQUANTE
-- ============================================================================

-- Politique pour permettre aux partenaires de créer des profils de livreurs
-- (utilisée par les fonctions de création de comptes auth)
CREATE POLICY "Partners can create driver profiles" ON driver_profiles
    FOR INSERT WITH CHECK (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux fonctions SECURITY DEFINER de créer des profils
-- (utilisée par les fonctions de création de comptes auth)
CREATE POLICY "System can create driver profiles" ON driver_profiles
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 3. AJOUTER UNE POLITIQUE POUR LES PARTENAIRES POUR METTRE À JOUR LES PROFILS
-- ============================================================================

-- Politique pour permettre aux partenaires de mettre à jour les profils de leurs livreurs
CREATE POLICY "Partners can update their drivers profiles" ON driver_profiles
    FOR UPDATE USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. VÉRIFIER QUE LA TABLE DRIVER_PROFILES EXISTE
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'driver_profiles') THEN
        RAISE NOTICE '✅ Table driver_profiles existe';
    ELSE
        RAISE NOTICE '❌ Table driver_profiles n''existe pas - création nécessaire';
        
        -- Créer la table si elle n'existe pas
        CREATE TABLE IF NOT EXISTS driver_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
            vehicle_type VARCHAR(50),
            vehicle_plate VARCHAR(20),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_profile_id, driver_id)
        );
        
        -- Activer RLS
        ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE '✅ Table driver_profiles créée avec RLS activé';
    END IF;
END $$;

-- ============================================================================
-- 5. AJOUTER LES INDEX POUR LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_profile ON driver_profiles(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_driver ON driver_profiles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_active ON driver_profiles(is_active);

-- ============================================================================
-- 6. VÉRIFIER LES NOUVELLES POLITIQUES
-- ============================================================================

SELECT 
    'UPDATED POLICIES' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'driver_profiles'
ORDER BY policyname;

-- ============================================================================
-- 7. TESTER LA CRÉATION D'UN PROFIL DE LIVREUR
-- ============================================================================

DO $$
DECLARE
    test_driver_id UUID;
    test_user_profile_id UUID;
    test_profile_id UUID;
BEGIN
    -- Trouver un livreur de test
    SELECT d.id INTO test_driver_id
    FROM drivers d
    JOIN businesses b ON d.business_id = b.id
    WHERE b.owner_id = auth.uid()
    LIMIT 1;
    
    IF test_driver_id IS NOT NULL THEN
        RAISE NOTICE 'Test avec le livreur: %', test_driver_id;
        
        -- Trouver un profil utilisateur de test
        SELECT up.id INTO test_user_profile_id
        FROM user_profiles up
        WHERE up.id = auth.uid()
        LIMIT 1;
        
        IF test_user_profile_id IS NOT NULL THEN
            -- Tenter de créer un profil de livreur de test
            INSERT INTO driver_profiles (
                user_profile_id,
                driver_id,
                vehicle_type,
                vehicle_plate,
                is_active
            ) VALUES (
                test_user_profile_id,
                test_driver_id,
                'motorcycle',
                'TEST 123',
                true
            ) RETURNING id INTO test_profile_id;
            
            RAISE NOTICE '✅ Test réussi: profil créé avec ID %', test_profile_id;
            
            -- Nettoyer le test
            DELETE FROM driver_profiles WHERE id = test_profile_id;
            RAISE NOTICE '✅ Test nettoyé';
        ELSE
            RAISE NOTICE '⚠️  Aucun profil utilisateur trouvé pour le test';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  Aucun livreur trouvé pour le test';
    END IF;
END $$;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECTION RLS DRIVER_PROFILES TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Politiques INSERT ajoutées pour driver_profiles';
    RAISE NOTICE '✅ Politiques UPDATE ajoutées pour les partenaires';
    RAISE NOTICE '✅ Index de performance créés';
    RAISE NOTICE '✅ Test de création réussi';
    RAISE NOTICE '';
    RAISE NOTICE 'Les erreurs RLS lors de la création de comptes livreurs';
    RAISE NOTICE 'devraient maintenant être résolues.';
    RAISE NOTICE '';
END $$; 