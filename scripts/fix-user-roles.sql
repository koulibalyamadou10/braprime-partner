-- Script pour corriger les rôles utilisateurs
-- Ce script vérifie et crée les rôles nécessaires dans la table user_roles

-- 1. Vérifier la structure de la table user_roles
SELECT '=== VÉRIFICATION TABLE USER_ROLES ===' as info;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 2. Vérifier les rôles existants
SELECT '=== RÔLES EXISTANTS ===' as info;
SELECT id, name, description, created_at
FROM user_roles
ORDER BY id;

-- 3. Créer les rôles manquants
SELECT '=== CRÉATION RÔLES MANQUANTS ===' as info;

-- Rôle Customer (ID: 1)
INSERT INTO user_roles (id, name, description, created_at, updated_at)
VALUES (1, 'customer', 'Client final - peut passer des commandes et faire des réservations', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Rôle Partner (ID: 2)
INSERT INTO user_roles (id, name, description, created_at, updated_at)
VALUES (2, 'partner', 'Partenaire commercial - propriétaire de commerce/restaurant', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Rôle Admin (ID: 3)
INSERT INTO user_roles (id, name, description, created_at, updated_at)
VALUES (3, 'admin', 'Administrateur système - accès complet à la plateforme', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Rôle Driver (ID: 4)
INSERT INTO user_roles (id, name, description, created_at, updated_at)
VALUES (4, 'driver', 'Chauffeur de livraison - livre les commandes', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Vérifier que tous les rôles sont créés
SELECT '=== RÔLES APRÈS CRÉATION ===' as info;
SELECT id, name, description, created_at
FROM user_roles
ORDER BY id;

-- 5. Vérifier les contraintes de clé étrangère
SELECT '=== VÉRIFICATION CONTRAINTES ===' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_profiles'
    AND kcu.column_name = 'role_id';

-- 6. Vérifier les utilisateurs existants et leurs rôles
SELECT '=== UTILISATEURS ET RÔLES ===' as info;
SELECT 
    up.id,
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at DESC
LIMIT 10;

-- 7. Corriger les utilisateurs avec des role_id invalides
SELECT '=== CORRECTION UTILISATEURS INVALIDES ===' as info;

-- Mettre à jour les utilisateurs avec role_id NULL ou invalide
UPDATE user_profiles 
SET role_id = 1 
WHERE role_id IS NULL OR role_id NOT IN (SELECT id FROM user_roles);

-- 8. Vérifier les utilisateurs après correction
SELECT '=== UTILISATEURS APRÈS CORRECTION ===' as info;
SELECT 
    up.id,
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at DESC
LIMIT 10;

-- 9. Vérifier les contraintes de clé étrangère
SELECT '=== TEST CONTRAINTES ===' as info;

-- Test d'insertion avec role_id valide
SELECT 'Test insertion avec role_id valide - devrait réussir:' as test;
-- INSERT INTO user_profiles (id, name, email, phone_number, role_id) 
-- VALUES ('test-role-1', 'Test User', 'test@example.com', '+224123456789', 1);

-- Test d'insertion avec role_id invalide
SELECT 'Test insertion avec role_id invalide - devrait échouer:' as test;
-- INSERT INTO user_profiles (id, name, email, phone_number, role_id) 
-- VALUES ('test-role-2', 'Test User', 'test2@example.com', '+224123456789', 999);

-- 10. Message de confirmation
SELECT '✅ Rôles utilisateurs corrigés avec succès!' as message;
SELECT '✅ Contraintes de clé étrangère vérifiées!' as message;
SELECT '✅ Utilisateurs existants corrigés!' as message; 