-- Script pour créer uniquement la table requests
-- Ce script crée la table de base sans les éléments avancés

-- 1. Vérifier si la table existe déjà
SELECT '=== VÉRIFICATION TABLE EXISTANTE ===' as info;
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

-- 3. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_reviewed_by ON requests(reviewed_by);

-- 4. Vérifier que la table a été créée
SELECT '=== TABLE CRÉÉE ===' as info;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;

-- 5. Vérifier les contraintes
SELECT '=== CONTRAINTES ===' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'requests'::regclass
ORDER BY conname;

-- 6. Vérifier les index
SELECT '=== INDEX ===' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'requests'
ORDER BY indexname;

-- 7. Message de confirmation
SELECT '✅ Table requests créée avec succès!' as message;
SELECT '📊 Structure:' as info;
SELECT 
    'Colonnes' as element,
    COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'requests'
UNION ALL
SELECT 
    'Index' as element,
    COUNT(*) as count
FROM pg_indexes
WHERE tablename = 'requests'
UNION ALL
SELECT 
    'Contraintes' as element,
    COUNT(*) as count
FROM pg_constraint
WHERE conrelid = 'requests'::regclass; 