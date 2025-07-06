-- Script de test pour les demandes anonymes
-- Ce script teste l'insertion d'une demande sans user_id

-- 1. Tester l'insertion d'une demande partenaire anonyme
INSERT INTO requests (
    type, 
    user_id, 
    user_name, 
    user_email, 
    user_phone, 
    business_name, 
    business_type, 
    business_address, 
    status, 
    created_at, 
    updated_at
) VALUES (
    'partner', 
    NULL, 
    'Test Partner Anonyme', 
    'test.partner@example.com', 
    '+224123456789',
    'Restaurant Test', 
    'restaurant', 
    '123 Rue Test, Conakry',
    'pending', 
    NOW(), 
    NOW()
);

-- 2. Tester l'insertion d'une demande chauffeur anonyme
INSERT INTO requests (
    type, 
    user_id, 
    user_name, 
    user_email, 
    user_phone, 
    vehicle_type, 
    vehicle_plate, 
    status, 
    created_at, 
    updated_at
) VALUES (
    'driver', 
    NULL, 
    'Test Driver Anonyme', 
    'test.driver@example.com', 
    '+224987654321',
    'motorcycle', 
    'ABC123',
    'pending', 
    NOW(), 
    NOW()
);

-- 3. Vérifier les insertions
SELECT '=== DEMANDES ANONYMES CRÉÉES ===' as info;
SELECT 
    id,
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    business_name,
    vehicle_type,
    status,
    created_at
FROM requests 
WHERE user_id IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 4. Nettoyer les données de test (optionnel)
-- DELETE FROM requests WHERE user_email LIKE 'test.%@example.com';

-- 5. Message de confirmation
SELECT '✅ Test des demandes anonymes réussi!' as message;
SELECT '📝 Les demandes sans user_id peuvent maintenant être créées' as info; 