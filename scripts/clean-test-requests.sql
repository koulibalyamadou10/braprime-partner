-- Script pour nettoyer les demandes de test
-- ATTENTION: Ce script supprime toutes les demandes de test

-- 1. Vérifier les demandes avant suppression
SELECT '=== DEMANDES AVANT SUPPRESSION ===' as info;
SELECT COUNT(*) as total_demandes FROM requests;

-- 2. Supprimer les demandes de test (avec emails contenant @test.com)
SELECT '=== SUPPRESSION DEMANDES TEST ===' as info;
DELETE FROM requests 
WHERE user_email LIKE '%@test.com%' 
   OR user_email LIKE '%@example.com%'
   OR business_name LIKE '%Test%'
   OR user_name LIKE '%Test%';

-- 3. Vérifier les demandes restantes
SELECT '=== DEMANDES RESTANTES ===' as info;
SELECT COUNT(*) as demandes_restantes FROM requests;

-- 4. Afficher les demandes restantes
SELECT '=== LISTE DEMANDES RESTANTES ===' as info;
SELECT 
    id,
    type,
    user_name,
    business_name,
    vehicle_type,
    status,
    created_at
FROM requests 
ORDER BY created_at DESC;

-- 5. Message de confirmation
SELECT '✅ Demandes de test supprimées avec succès!' as message; 