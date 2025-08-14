-- Script de test pour la table profil_internal_user
-- À exécuter après avoir créé la table

-- 1. Vérifier que la table existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profil_internal_user';

-- 2. Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profil_internal_user'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'profil_internal_user';

-- 4. Vérifier les index
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'profil_internal_user';

-- 5. Insérer des données de test (si des businesses existent)
-- Note: Remplacer les UUID par des valeurs réelles de votre base

-- Vérifier d'abord s'il y a des businesses
SELECT id, name FROM businesses LIMIT 5;

-- Vérifier s'il y a des user_profiles
SELECT id, name, email FROM user_profiles LIMIT 5;

-- 6. Test d'insertion (décommenter et adapter après vérification)
/*
INSERT INTO profil_internal_user (
    user_id,
    business_id,
    name,
    email,
    phone,
    role,
    created_by,
    permissions
) VALUES (
    'uuid-utilisateur-existant', -- Remplacer par un UUID réel
    1, -- Remplacer par un business_id réel
    'Test User',
    'test@business.com',
    '+224 123 456 789',
    'commandes',
    'uuid-createur-existant', -- Remplacer par un UUID réel
    '{"orders_management": true, "order_tracking": true}'
);
*/

-- 7. Vérifier les données insérées
SELECT * FROM profil_internal_user;

-- 8. Test de la contrainte de rôle
-- Ceci devrait échouer avec un rôle invalide
/*
INSERT INTO profil_internal_user (
    user_id,
    business_id,
    name,
    email,
    role,
    created_by
) VALUES (
    'uuid-utilisateur-existant',
    1,
    'Test User 2',
    'test2@business.com',
    'role_invalide', -- Ce rôle n'est pas dans la liste CHECK
    'uuid-createur-existant'
);
*/

-- 9. Test de la contrainte unique business_id + email
-- Ceci devrait échouer si l'email existe déjà pour le même business
/*
INSERT INTO profil_internal_user (
    user_id,
    business_id,
    name,
    email,
    role,
    created_by
) VALUES (
    'uuid-utilisateur-different',
    1, -- Même business_id
    'Test User 3',
    'test@business.com', -- Même email
    'menu',
    'uuid-createur-existant'
);
*/
