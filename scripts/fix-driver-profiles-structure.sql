-- ============================================================================
-- SCRIPT POUR CORRIGER LA STRUCTURE DE LA TABLE DRIVER_PROFILES
-- ============================================================================
-- Ce script corrige l'incohérence dans la structure de driver_profiles
-- et standardise sur la version correcte avec user_profile_id

-- ============================================================================
-- 1. VÉRIFIER LA STRUCTURE ACTUELLE
-- ============================================================================

-- Vérifier la structure actuelle de la table
SELECT 
    'CURRENT STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'driver_profiles'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. SAUVEGARDER LES DONNÉES EXISTANTES
-- ============================================================================

-- Créer une table temporaire pour sauvegarder les données
CREATE TEMP TABLE temp_driver_profiles AS
SELECT * FROM driver_profiles;

-- ============================================================================
-- 3. SUPPRIMER LA TABLE EXISTANTE
-- ============================================================================

-- Supprimer les triggers et politiques existants
DROP TRIGGER IF EXISTS trigger_assign_driver_role ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can view their own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can update their own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Partners can view their drivers profiles" ON driver_profiles;
DROP POLICY IF EXISTS "Partners can create driver profiles" ON driver_profiles;
DROP POLICY IF EXISTS "System can create driver profiles" ON driver_profiles;
DROP POLICY IF EXISTS "Partners can update their drivers profiles" ON driver_profiles;

-- Supprimer la table
DROP TABLE IF EXISTS driver_profiles CASCADE;

-- ============================================================================
-- 4. CRÉER LA TABLE AVEC LA BONNE STRUCTURE
-- ============================================================================

-- Créer la table driver_profiles avec la structure correcte
CREATE TABLE driver_profiles (
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

-- ============================================================================
-- 5. CRÉER LES INDEX
-- ============================================================================

CREATE INDEX idx_driver_profiles_user_profile ON driver_profiles(user_profile_id);
CREATE INDEX idx_driver_profiles_driver ON driver_profiles(driver_id);
CREATE INDEX idx_driver_profiles_active ON driver_profiles(is_active);

-- ============================================================================
-- 6. RESTAURER LES DONNÉES
-- ============================================================================

-- Restaurer les données en adaptant la structure
INSERT INTO driver_profiles (
    id,
    user_profile_id,
    driver_id,
    vehicle_type,
    vehicle_plate,
    is_active,
    created_at,
    updated_at
)
SELECT 
    dp.id,
    -- Si l'ancienne structure avait user_id, le convertir en user_profile_id
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'temp_driver_profiles' 
                     AND column_name = 'user_id') THEN
            dp.user_id
        ELSE
            dp.user_profile_id
    END as user_profile_id,
    dp.driver_id,
    -- Récupérer vehicle_type et vehicle_plate depuis la table drivers
    d.vehicle_type,
    d.vehicle_plate,
    COALESCE(dp.is_active, true),
    COALESCE(dp.created_at, NOW()),
    COALESCE(dp.updated_at, NOW())
FROM temp_driver_profiles dp
JOIN drivers d ON dp.driver_id = d.id;

-- ============================================================================
-- 7. ACTIVER RLS ET CRÉER LES POLITIQUES
-- ============================================================================

-- Activer RLS
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les livreurs voient leur propre profil
CREATE POLICY "Drivers can view their own profile" ON driver_profiles
    FOR SELECT USING (
        user_profile_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Politique pour que les livreurs mettent à jour leur propre profil
CREATE POLICY "Drivers can update their own profile" ON driver_profiles
    FOR UPDATE USING (
        user_profile_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Politique pour que les partenaires voient les profils de leurs livreurs
CREATE POLICY "Partners can view their drivers profiles" ON driver_profiles
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de créer des profils de livreurs
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
CREATE POLICY "System can create driver profiles" ON driver_profiles
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre aux partenaires de mettre à jour les profils
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
-- 8. CRÉER LE TRIGGER POUR ASSIGNER LE RÔLE DRIVER
-- ============================================================================

-- Fonction pour assigner automatiquement le rôle 'driver'
CREATE OR REPLACE FUNCTION assign_driver_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le rôle dans user_profiles
    UPDATE user_profiles 
    SET role_id = (SELECT id FROM user_roles WHERE name = 'driver')
    WHERE id = NEW.user_profile_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour assigner automatiquement le rôle driver
CREATE TRIGGER trigger_assign_driver_role
    AFTER INSERT ON driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_driver_role();

-- ============================================================================
-- 9. VÉRIFIER LA CORRECTION
-- ============================================================================

-- Vérifier la nouvelle structure
SELECT 
    'NEW STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'driver_profiles'
ORDER BY ordinal_position;

-- Vérifier les données restaurées
SELECT 
    'RESTORED DATA' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_profiles
FROM driver_profiles;

-- Vérifier les relations
SELECT 
    'RELATIONS' as info,
    dp.id as profile_id,
    dp.user_profile_id,
    dp.driver_id,
    dp.vehicle_type,
    up.name as user_name,
    d.name as driver_name,
    b.name as business_name
FROM driver_profiles dp
JOIN user_profiles up ON dp.user_profile_id = up.id
JOIN drivers d ON dp.driver_id = d.id
JOIN businesses b ON d.business_id = b.id
ORDER BY dp.created_at DESC
LIMIT 5;

-- ============================================================================
-- 10. NETTOYER
-- ============================================================================

-- Supprimer la table temporaire
DROP TABLE temp_driver_profiles;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'STRUCTURE DRIVER_PROFILES CORRIGÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Table driver_profiles recréée avec la bonne structure';
    RAISE NOTICE '✅ Données restaurées et adaptées';
    RAISE NOTICE '✅ RLS et politiques recréées';
    RAISE NOTICE '✅ Trigger pour assigner le rôle driver créé';
    RAISE NOTICE '';
    RAISE NOTICE 'La relation est maintenant:';
    RAISE NOTICE 'auth.users → user_profiles → driver_profiles → drivers';
    RAISE NOTICE '';
END $$; 