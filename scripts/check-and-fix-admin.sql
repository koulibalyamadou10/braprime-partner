-- Script simple pour vérifier et corriger le rôle admin
-- Remplacez 'votre-email@example.com' par votre email

-- 1. Vérifier les rôles disponibles
SELECT 'RÔLES DISPONIBLES:' as info;
SELECT id, name FROM user_roles ORDER BY id;

-- 2. Vérifier votre profil actuel
SELECT 'VOTRE PROFIL ACTUEL:' as info;
SELECT 
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'votre-email@example.com'; -- REMPLACEZ PAR VOTRE EMAIL

-- 3. Corriger le rôle vers admin (ID 3 selon le schéma)
UPDATE user_profiles 
SET role_id = 3 
WHERE email = 'votre-email@example.com'; -- REMPLACEZ PAR VOTRE EMAIL

-- 4. Vérifier la correction
SELECT 'APRÈS CORRECTION:' as info;
SELECT 
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'votre-email@example.com'; -- REMPLACEZ PAR VOTRE EMAIL 