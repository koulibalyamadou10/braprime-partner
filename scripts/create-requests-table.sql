-- Script pour créer la table des demandes
-- Cette table stocke les demandes de partenaires et chauffeurs

-- 1. Vérifier si la table existe déjà
SELECT '=== VÉRIFICATION TABLE ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'requests';

-- 2. Créer la table requests
CREATE TABLE IF NOT EXISTS requests (
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

-- 3. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_type_status ON requests(type, status);

-- 4. Créer la fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_requests_updated_at ON requests;
CREATE TRIGGER trigger_update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_requests_updated_at();

-- 6. Créer les politiques RLS (Row Level Security)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (peuvent voir toutes les demandes)
CREATE POLICY "Admins can view all requests" ON requests
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

-- Politique pour les utilisateurs (peuvent créer leurs propres demandes)
CREATE POLICY "Users can create their own requests" ON requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique pour les utilisateurs (peuvent mettre à jour leurs propres demandes en attente)
CREATE POLICY "Users can update their pending requests" ON requests
    FOR UPDATE USING (
        user_id = auth.uid() AND status = 'pending'
    );

-- 7. Créer une vue pour les statistiques des demandes
CREATE OR REPLACE VIEW requests_stats AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_requests,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_requests,
    COUNT(*) FILTER (WHERE status = 'under_review') as under_review_requests,
    COUNT(*) FILTER (WHERE type = 'partner') as partner_requests,
    COUNT(*) FILTER (WHERE type = 'driver') as driver_requests,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as requests_last_7_days,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as requests_last_30_days
FROM requests;

-- 8. Créer une fonction pour créer une demande
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
    v_user_id UUID;
    v_user_name VARCHAR(100);
    v_user_email VARCHAR(255);
    v_user_phone VARCHAR(20);
    v_request_id UUID;
BEGIN
    -- Récupérer les informations de l'utilisateur connecté
    SELECT id, name, email, phone_number
    INTO v_user_id, v_user_name, v_user_email, v_user_phone
    FROM user_profiles
    WHERE id = auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;
    
    -- Vérifier qu'il n'y a pas déjà une demande en cours
    IF EXISTS (
        SELECT 1 FROM requests 
        WHERE user_id = v_user_id AND status IN ('pending', 'under_review')
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
        v_user_id,
        v_user_name,
        v_user_email,
        v_user_phone,
        p_business_name,
        p_business_type,
        p_business_address,
        p_vehicle_type,
        p_vehicle_plate,
        p_notes
    ) RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$;

-- 9. Donner les permissions nécessaires
GRANT SELECT, INSERT, UPDATE ON requests TO authenticated;
GRANT ALL ON requests TO service_role;
GRANT SELECT ON requests_stats TO authenticated;
GRANT EXECUTE ON FUNCTION create_request TO authenticated;

-- 10. Vérifier que la table a été créée
SELECT '=== TABLE CRÉÉE ===' as info;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;

-- 11. Vérifier les politiques RLS
SELECT '=== POLITIQUES RLS ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'requests';

-- 12. Message de confirmation
SELECT '✅ Table requests créée avec succès!' as message;
SELECT '✅ Politiques RLS configurées!' as message;
SELECT '✅ Fonction create_request créée!' as message; 