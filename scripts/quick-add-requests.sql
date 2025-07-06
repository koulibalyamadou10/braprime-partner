-- Script rapide pour ajouter des demandes de test
-- Version simplifiée pour tests rapides

-- Ajouter 3 demandes de partenaires
INSERT INTO requests (type, user_id, user_name, user_email, user_phone, business_name, business_type, business_address, notes, status, created_at) VALUES
('partner', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Restaurant Test', 'restaurant@test.com', '+224111111111', 'Restaurant Test', 'Restaurant', 'Adresse Test', 'Demande de test', 'pending', NOW()),
('partner', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Café Test', 'cafe@test.com', '+224222222222', 'Café Test', 'Café', 'Adresse Test', 'Demande de test', 'pending', NOW()),
('partner', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Supermarché Test', 'super@test.com', '+224333333333', 'Super Test', 'Supermarché', 'Adresse Test', 'Demande de test', 'approved', NOW());

-- Ajouter 3 demandes de chauffeurs
INSERT INTO requests (type, user_id, user_name, user_email, user_phone, vehicle_type, vehicle_plate, notes, status, created_at) VALUES
('driver', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Chauffeur Moto', 'moto@test.com', '+224444444444', 'motorcycle', 'GN-TEST-1', 'Demande de test', 'pending', NOW()),
('driver', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Chauffeur Voiture', 'voiture@test.com', '+224555555555', 'car', 'GN-TEST-2', 'Demande de test', 'under_review', NOW()),
('driver', (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1), 'Chauffeur Vélo', 'velo@test.com', '+224666666666', 'bike', NULL, 'Demande de test', 'rejected', NOW());

-- Vérifier les demandes ajoutées
SELECT 'Demandes ajoutées:' as info;
SELECT type, user_name, status, created_at FROM requests ORDER BY created_at DESC LIMIT 6; 