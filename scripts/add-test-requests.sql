-- Script pour ajouter des demandes de test
-- Ce script ajoute des demandes de partenaires et chauffeurs pour tester le système

-- 1. Vérifier que la table requests existe
SELECT '=== VÉRIFICATION TABLE ===' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'requests';

-- 2. Vérifier les utilisateurs existants pour créer des demandes
SELECT '=== UTILISATEURS DISPONIBLES ===' as info;
SELECT id, name, email, role_id 
FROM user_profiles 
WHERE role_id = 1 
LIMIT 5;

-- 3. Ajouter des demandes de partenaires
SELECT '=== AJOUT DEMANDES PARTENAIRES ===' as info;

-- Demande 1: Restaurant
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
    created_at
) VALUES (
    'partner',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
    'Mamadou Diallo',
    'mamadou.diallo@example.com',
    '+224123456789',
    'Le Gourmet Conakry',
    'Restaurant',
    '123 Avenue de la République, Conakry, Guinée',
    'Restaurant gastronomique spécialisé dans la cuisine locale et internationale. Nous souhaitons rejoindre la plateforme pour élargir notre clientèle.',
    'pending',
    NOW() - INTERVAL '2 days'
);

-- Demande 2: Café
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
    created_at
) VALUES (
    'partner',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1 OFFSET 1),
    'Fatoumata Camara',
    'fatoumata.camara@example.com',
    '+224234567890',
    'Café Central',
    'Café',
    '45 Rue du Commerce, Kaloum, Conakry',
    'Café moderne avec une large gamme de boissons et pâtisseries. Idéal pour les livraisons rapides.',
    'pending',
    NOW() - INTERVAL '1 day'
);

-- Demande 3: Supermarché
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
    created_at
) VALUES (
    'partner',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1 OFFSET 2),
    'Ibrahima Barry',
    'ibrahima.barry@example.com',
    '+224345678901',
    'Super Marché Express',
    'Supermarché',
    '78 Boulevard du Commerce, Dixinn, Conakry',
    'Supermarché de proximité avec produits frais et épicerie. Livraison à domicile demandée.',
    'approved',
    NOW() - INTERVAL '3 days'
);

-- 4. Ajouter des demandes de chauffeurs
SELECT '=== AJOUT DEMANDES CHAUFFEURS ===' as info;

-- Demande 4: Chauffeur moto
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    vehicle_type,
    vehicle_plate,
    notes,
    status,
    created_at
) VALUES (
    'driver',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1 OFFSET 3),
    'Ousmane Keita',
    'ousmane.keita@example.com',
    '+224456789012',
    'motorcycle',
    'GN-1234-AB',
    'Chauffeur expérimenté avec 3 ans d''expérience en livraison. Véhicule en bon état.',
    'pending',
    NOW() - INTERVAL '12 hours'
);

-- Demande 5: Chauffeur voiture
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    vehicle_type,
    vehicle_plate,
    notes,
    status,
    created_at
) VALUES (
    'driver',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1 OFFSET 4),
    'Aissatou Bah',
    'aissatou.bah@example.com',
    '+224567890123',
    'car',
    'GN-5678-CD',
    'Chauffeur professionnel avec permis B. Disponible pour livraisons de gros volumes.',
    'under_review',
    NOW() - INTERVAL '6 hours'
);

-- Demande 6: Chauffeur vélo
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    vehicle_type,
    vehicle_plate,
    notes,
    status,
    created_at
) VALUES (
    'driver',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
    'Moussa Konaté',
    'moussa.konate@example.com',
    '+224678901234',
    'bike',
    NULL,
    'Livraison à vélo pour zones urbaines denses. Écologique et rapide.',
    'rejected',
    NOW() - INTERVAL '1 week'
);

-- 5. Ajouter quelques demandes avec des statuts variés
SELECT '=== AJOUT DEMANDES DIVERSES ===' as info;

-- Demande 7: Partenaire rejeté
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
    admin_notes,
    status,
    reviewed_at,
    created_at
) VALUES (
    'partner',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
    'Kadiatou Sow',
    'kadiatou.sow@example.com',
    '+224789012345',
    'Boutique Mode',
    'Vêtements',
    '12 Rue des Artisans, Conakry',
    'Boutique de vêtements traditionnels et modernes.',
    'Zone de livraison non couverte par nos services actuels.',
    'rejected',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '5 days'
);

-- Demande 8: Chauffeur approuvé
INSERT INTO requests (
    type,
    user_id,
    user_name,
    user_email,
    user_phone,
    vehicle_type,
    vehicle_plate,
    notes,
    admin_notes,
    status,
    reviewed_at,
    created_at
) VALUES (
    'driver',
    (SELECT id FROM user_profiles WHERE role_id = 1 LIMIT 1),
    'Sékou Touré',
    'sekou.toure@example.com',
    '+224890123456',
    'motorcycle',
    'GN-9012-EF',
    'Chauffeur moto disponible 24h/24. Expérience en livraison urgente.',
    'Profil vérifié. Documents en règle. Approuvé pour intégration.',
    'approved',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '3 days'
);

-- 6. Vérifier les demandes ajoutées
SELECT '=== VÉRIFICATION DEMANDES ===' as info;
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

-- 7. Statistiques des demandes
SELECT '=== STATISTIQUES ===' as info;
SELECT 
    COUNT(*) as total_demandes,
    COUNT(CASE WHEN type = 'partner' THEN 1 END) as demandes_partenaires,
    COUNT(CASE WHEN type = 'driver' THEN 1 END) as demandes_chauffeurs,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as en_attente,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approuvees,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejetees,
    COUNT(CASE WHEN status = 'under_review' THEN 1 END) as en_revision
FROM requests;

-- 8. Message de confirmation
SELECT '✅ Demandes de test ajoutées avec succès!' as message;
SELECT '📊 8 demandes créées (4 partenaires, 4 chauffeurs)' as details;
SELECT '🎯 Statuts variés: pending, approved, rejected, under_review' as statuts; 