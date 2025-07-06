-- Script d'installation complet du système de demandes
-- Ce script crée tout le système en une seule exécution

-- 1. Vérifier et corriger les rôles utilisateurs
SELECT '=== ÉTAPE 1: CORRECTION DES RÔLES UTILISATEURS ===' as info;

-- Insérer les rôles manquants
INSERT INTO user_roles (id, name, description) VALUES
(1, 'customer', 'Client final'),
(2, 'partner', 'Propriétaire de commerce'),
(3, 'admin', 'Administrateur système'),
(4, 'driver', 'Chauffeur de livraison')
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description;

-- Vérifier les rôles
SELECT 'Rôles créés:' as info;
SELECT id, name FROM user_roles ORDER BY id;

-- 2. Créer la table des demandes
SELECT '=== ÉTAPE 2: CRÉATION DE LA TABLE DES DEMANDES ===' as info;

-- Créer la table requests
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('partner', 'driver')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    
    -- Informations pour les partenaires
    business_name VARCHAR(100),
    business_type VARCHAR(50),
    business_address TEXT,
    
    -- Informations pour les chauffeurs
    vehicle_type VARCHAR(20),
    vehicle_plate VARCHAR(20),
    
    -- Documents (JSON array)
    documents JSONB DEFAULT '[]',
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES user_profiles(id)
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

-- 3. Activer RLS
SELECT '=== ÉTAPE 3: ACTIVATION RLS ===' as info;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
SELECT '=== ÉTAPE 4: CRÉATION DES POLITIQUES RLS ===' as info;

-- Politique pour les admins (peuvent tout voir et modifier)
CREATE POLICY "Admins can manage all requests" ON requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politique pour les utilisateurs (peuvent voir leurs propres demandes)
CREATE POLICY "Users can view their own requests" ON requests
    FOR SELECT USING (user_id = auth.uid());

-- Politique pour les utilisateurs (peuvent créer des demandes)
CREATE POLICY "Users can create requests" ON requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique pour les utilisateurs (peuvent modifier leurs demandes en attente)
CREATE POLICY "Users can update pending requests" ON requests
    FOR UPDATE USING (
        user_id = auth.uid() AND status = 'pending'
    );

-- 5. Créer la fonction de création de demande
SELECT '=== ÉTAPE 5: CRÉATION DES FONCTIONS ===' as info;

-- Fonction pour créer une demande
CREATE OR REPLACE FUNCTION create_request(
    p_type VARCHAR(20),
    p_business_name VARCHAR(100) DEFAULT NULL,
    p_business_type VARCHAR(50) DEFAULT NULL,
    p_business_address TEXT DEFAULT NULL,
    p_vehicle_type VARCHAR(20) DEFAULT NULL,
    p_vehicle_plate VARCHAR(20) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_request_id UUID;
    current_user_id UUID;
    current_user_name VARCHAR(100);
    current_user_email VARCHAR(255);
    current_user_phone VARCHAR(20);
BEGIN
    -- Récupérer les informations de l'utilisateur connecté
    SELECT 
        auth.uid(),
        up.name,
        up.email,
        up.phone_number
    INTO 
        current_user_id,
        current_user_name,
        current_user_email,
        current_user_phone
    FROM user_profiles up
    WHERE up.id = auth.uid();
    
    -- Vérifier que l'utilisateur est connecté
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non connecté';
    END IF;
    
    -- Vérifier le type de demande
    IF p_type NOT IN ('partner', 'driver') THEN
        RAISE EXCEPTION 'Type de demande invalide: %', p_type;
    END IF;
    
    -- Vérifier qu'il n'y a pas déjà une demande en cours
    IF EXISTS (
        SELECT 1 FROM requests 
        WHERE user_id = current_user_id 
        AND status IN ('pending', 'under_review')
    ) THEN
        RAISE EXCEPTION 'Vous avez déjà une demande en cours';
    END IF;
    
    -- Créer la demande
    INSERT INTO requests (
        type,
        user_id,
        user_name,
        user_email,
        user_phone,
        business_name,
        business_type,
        business_address,
        vehicle_type,
        vehicle_plate,
        notes
    ) VALUES (
        p_type,
        current_user_id,
        current_user_name,
        current_user_email,
        current_user_phone,
        p_business_name,
        p_business_type,
        p_business_address,
        p_vehicle_type,
        p_vehicle_plate,
        p_notes
    ) RETURNING id INTO new_request_id;
    
    RETURN new_request_id;
END;
$$;

-- 6. Créer la vue des statistiques
SELECT '=== ÉTAPE 6: CRÉATION DE LA VUE STATISTIQUES ===' as info;

CREATE OR REPLACE VIEW requests_stats AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN type = 'partner' THEN 1 END) as partner_requests,
    COUNT(CASE WHEN type = 'driver' THEN 1 END) as driver_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_requests,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as requests_last_7_days,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as requests_last_30_days
FROM requests;

-- 7. Créer des demandes de test
SELECT '=== ÉTAPE 7: CRÉATION DES DEMANDES DE TEST ===' as info;

-- Ajouter quelques demandes de test
INSERT INTO requests (type, user_id, user_name, user_email, user_phone, business_name, business_type, business_address, notes, status, created_at) VALUES
('partner', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Restaurant Test', 'restaurant@test.com', '+224111111111', 'Restaurant Test', 'Restaurant', 'Adresse Test', 'Demande de test', 'pending', NOW()),
('partner', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Café Test', 'cafe@test.com', '+224222222222', 'Café Test', 'Café', 'Adresse Test', 'Demande de test', 'approved', NOW()),
('driver', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Chauffeur Test', 'chauffeur@test.com', '+224333333333', 'motorcycle', 'GN-TEST-1', 'Demande de test', 'pending', NOW());

-- 8. Vérification finale
SELECT '=== VÉRIFICATION FINALE ===' as info;

-- Vérifier que tous les rôles existent
SELECT 'Rôles utilisateurs:' as check_type;
SELECT id, name FROM user_roles ORDER BY id;

-- Vérifier que la table requests existe
SELECT 'Table requests créée:' as check_type;
SELECT table_name FROM information_schema.tables WHERE table_name = 'requests';

-- Vérifier les politiques RLS
SELECT 'Politiques RLS:' as check_type;
SELECT policyname FROM pg_policies WHERE tablename = 'requests';

-- Vérifier les demandes de test
SELECT 'Demandes de test:' as check_type;
SELECT type, status, user_name FROM requests ORDER BY created_at DESC;

-- Vérifier les statistiques
SELECT 'Statistiques:' as check_type;
SELECT * FROM requests_stats;

-- 9. Message de confirmation
SELECT '✅ Installation du système de demandes terminée avec succès!' as message;
SELECT '✅ Le système est maintenant prêt à être utilisé.' as details;
SELECT '📊 3 demandes de test créées pour validation' as test_data; 