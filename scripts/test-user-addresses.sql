-- Script de test pour vérifier le fonctionnement des adresses utilisateur
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- ============================================================================
-- VÉRIFICATION DE LA STRUCTURE DE LA TABLE
-- ============================================================================

-- Vérifier que la table existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_addresses'
ORDER BY ordinal_position;

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

-- Vérifier les politiques RLS existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_addresses';

-- ============================================================================
-- VÉRIFICATION DES INDEX
-- ============================================================================

-- Vérifier les index existants
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_addresses';

-- ============================================================================
-- VÉRIFICATION DES TRIGGERS
-- ============================================================================

-- Vérifier les triggers existants
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_addresses';

-- ============================================================================
-- TEST DE DONNÉES (à exécuter avec un utilisateur connecté)
-- ============================================================================

-- Note: Ces tests nécessitent d'être connecté en tant qu'utilisateur authentifié

-- 1. Insérer une adresse de test (remplacer 'USER_ID' par un vrai ID utilisateur)
-- INSERT INTO user_addresses (user_id, label, street, city, state, postal_code, country, is_default)
-- VALUES (
--     'USER_ID', -- Remplacer par un vrai ID utilisateur
--     'Domicile',
--     '123 Rue de la Paix',
--     'Conakry',
--     'Kaloum',
--     '001',
--     'Guinée',
--     true
-- );

-- 2. Vérifier que l'adresse a été insérée
-- SELECT * FROM user_addresses WHERE user_id = 'USER_ID';

-- 3. Insérer une deuxième adresse
-- INSERT INTO user_addresses (user_id, label, street, city, state, postal_code, country, is_default)
-- VALUES (
--     'USER_ID', -- Remplacer par un vrai ID utilisateur
--     'Bureau',
--     '456 Avenue du Commerce',
--     'Conakry',
--     'Ratoma',
--     '002',
--     'Guinée',
--     false
-- );

-- 4. Vérifier que les deux adresses existent
-- SELECT * FROM user_addresses WHERE user_id = 'USER_ID' ORDER BY created_at;

-- 5. Tester la mise à jour d'une adresse
-- UPDATE user_addresses 
-- SET is_default = true 
-- WHERE user_id = 'USER_ID' AND label = 'Bureau';

-- 6. Vérifier que seule une adresse est par défaut
-- SELECT * FROM user_addresses WHERE user_id = 'USER_ID' ORDER BY is_default DESC, created_at;

-- ============================================================================
-- VÉRIFICATION DES CONTRAINTES
-- ============================================================================

-- Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
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
    AND tc.table_name = 'user_addresses';

-- ============================================================================
-- STATISTIQUES DE LA TABLE
-- ============================================================================

-- Compter le nombre total d'adresses
SELECT COUNT(*) as total_addresses FROM user_addresses;

-- Compter le nombre d'adresses par utilisateur
SELECT 
    user_id,
    COUNT(*) as address_count,
    COUNT(CASE WHEN is_default = true THEN 1 END) as default_address_count
FROM user_addresses 
GROUP BY user_id
ORDER BY address_count DESC;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

SELECT 
    'Test de vérification terminé' as status,
    'Vérifiez les résultats ci-dessus pour vous assurer que tout fonctionne correctement' as message; 