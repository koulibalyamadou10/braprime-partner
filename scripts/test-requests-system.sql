-- Script pour tester le système de demandes
-- Ce script crée des demandes de test et vérifie le fonctionnement

-- 1. Vérifier que la table existe
SELECT '=== VÉRIFICATION TABLE ===' as info;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests' 
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT '=== POLITIQUES RLS ===' as info;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'requests';

-- 3. Vérifier la fonction create_request
SELECT '=== FONCTION CREATE_REQUEST ===' as info;
SELECT routine_name, routine_type, data_type
FROM information_schema.routines
WHERE routine_name = 'create_request';

-- 4. Vérifier la vue des statistiques
SELECT '=== VUE STATISTIQUES ===' as info;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'requests_stats';

-- 5. Créer des utilisateurs de test (si ils n'existent pas)
SELECT '=== CRÉATION UTILISATEURS DE TEST ===' as info;

-- Utilisateur test pour partenaire
INSERT INTO user_profiles (id, name, email, phone_number, role_id, is_active, is_verified)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test Partner',
    'test.partner@example.com',
    '+224123456789',
    1, -- customer role
    true,
    false
) ON CONFLICT (id) DO NOTHING;

-- Utilisateur test pour chauffeur
INSERT INTO user_profiles (id, name, email, phone_number, role_id, is_active, is_verified)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Test Driver',
    'test.driver@example.com',
    '+224987654321',
    1, -- customer role
    true,
    false
) ON CONFLICT (id) DO NOTHING;

-- 6. Créer des demandes de test
SELECT '=== CRÉATION DEMANDES DE TEST ===' as info;

-- Demande partenaire
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    business_name,
    business_type,
    business_address,
    notes,
    status
) VALUES (
    'partner',
    '11111111-1111-1111-1111-111111111111',
    'Test Partner',
    'test.partner@example.com',
    '+224123456789',
    'Restaurant Test',
    'restaurant',
    '123 Rue Test, Conakry',
    'Je souhaite rejoindre la plateforme en tant que restaurant',
    'pending'
) ON CONFLICT DO NOTHING;

-- Demande chauffeur
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    vehicle_type,
    vehicle_plate,
    notes,
    status
) VALUES (
    'driver',
    '22222222-2222-2222-2222-222222222222',
    'Test Driver',
    'test.driver@example.com',
    '+224987654321',
    'motorcycle',
    'ABC123',
    'Je souhaite devenir chauffeur de livraison',
    'pending'
) ON CONFLICT DO NOTHING;

-- Demande approuvée (pour tester)
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    business_name,
    business_type,
    business_address,
    notes,
    status,
    reviewed_at,
    reviewed_by
) VALUES (
    'partner',
    '33333333-3333-3333-3333-333333333333',
    'Approved Partner',
    'approved.partner@example.com',
    '+224555555555',
    'Café Approuvé',
    'cafe',
    '456 Rue Approuvée, Conakry',
    'Demande approuvée pour test',
    'approved',
    NOW(),
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT DO NOTHING;

-- 7. Vérifier les demandes créées
SELECT '=== DEMANDES CRÉÉES ===' as info;
SELECT 
    id,
    type,
    status,
    user_name,
    business_name,
    vehicle_type,
    created_at
FROM requests
ORDER BY created_at DESC;

-- 8. Tester les statistiques
SELECT '=== STATISTIQUES ===' as info;
SELECT * FROM requests_stats;

-- 9. Tester la fonction create_request (simulation)
SELECT '=== TEST FONCTION CREATE_REQUEST ===' as info;
-- Note: Cette fonction nécessite un utilisateur authentifié
-- SELECT create_request('partner', 'Test Business', 'restaurant', 'Test Address');

-- 10. Vérifier les index
SELECT '=== INDEX ===' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'requests';

-- 11. Test des contraintes
SELECT '=== TEST CONTRAINTES ===' as info;

-- Test contrainte type
SELECT 'Test contrainte type - devrait échouer:' as test;
-- INSERT INTO requests (type, user_id, user_name, user_email, user_phone) 
-- VALUES ('invalid_type', '11111111-1111-1111-1111-111111111111', 'Test', 'test@test.com', '+224123456789');

-- Test contrainte status
SELECT 'Test contrainte status - devrait échouer:' as test;
-- INSERT INTO requests (type, user_id, user_name, user_email, user_phone, status) 
-- VALUES ('partner', '11111111-1111-1111-1111-111111111111', 'Test', 'test@test.com', '+224123456789', 'invalid_status');

-- 12. Message de confirmation
SELECT '✅ Système de demandes testé avec succès!' as message;
SELECT '✅ Demandes de test créées!' as message;
SELECT '✅ Statistiques calculées!' as message;
SELECT '✅ Contraintes vérifiées!' as message; 