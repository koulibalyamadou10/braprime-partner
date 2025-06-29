-- ============================================================================
-- SCRIPT D'INSERTION DES DONNÉES DE BASE
-- ============================================================================
-- À exécuter APRÈS l'application du schéma mobile

-- ============================================================================
-- ÉTAPE 1: CRÉATION DE L'ADMIN INITIAL
-- ============================================================================

-- Générer un UUID pour l'admin
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Insérer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (π
        admin_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@bradelivery.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );

    -- Insérer le profil admin dans user_profiles
    INSERT INTO user_profiles (
        id,
        name,
        email,
        role_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_uuid,
        'Administrateur BraPrime',
        'admin@bradelivery.com',
        4, -- admin role_id
        true,
        NOW(),
        NOW()
    );

    -- Afficher les informations de connexion
    RAISE NOTICE 'Admin créé avec succès!';
    RAISE NOTICE 'UUID: %', admin_uuid;
    RAISE NOTICE 'Email: admin@bradelivery.com';
    RAISE NOTICE 'Mot de passe: admin123';
END $$;

-- ============================================================================
-- ÉTAPE 2: DONNÉES DE BASE
-- ============================================================================

-- Insertion des types de business
INSERT INTO business_types (name, icon, color, description, image_url) VALUES
('restaurant', '🍽️', '#FF6B6B', 'Restaurants et établissements de restauration', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'),
('cafe', '☕', '#4ECDC4', 'Cafés et bars', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'),
('market', '🛒', '#45B7D1', 'Marchés et épiceries', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
('supermarket', '🏪', '#96CEB4', 'Supermarchés et hypermarchés', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'),
('pharmacy', '💊', '#FFEAA7', 'Pharmacies et parapharmacies', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'),
('electronics', '📱', '#DDA0DD', 'Électronique et technologie', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
('beauty', '💄', '#FFB6C1', 'Beauté et cosmétiques', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'),
('hairdressing', '✂️', '#F0E68C', 'Coiffure et salons de beauté', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'),
('hardware', '🔧', '#DEB887', 'Quincaillerie et bricolage', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400'),
('bookstore', '📚', '#8FBC8F', 'Librairies et papeterie', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('document_service', '📄', '#B0C4DE', 'Services de documents et photocopies', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400');

-- Insertion des catégories
INSERT INTO categories (name, icon, color, link, description, is_active) VALUES
('Restaurants', '🍽️', '#FF6B6B', '/restaurants', 'Découvrez les meilleurs restaurants', true),
('Cafés', '☕', '#4ECDC4', '/cafes', 'Cafés et bars de qualité', true),
('Marchés', '🛒', '#45B7D1', '/markets', 'Marchés et épiceries locales', true),
('Supermarchés', '🏪', '#96CEB4', '/supermarkets', 'Supermarchés et hypermarchés', true),
('Pharmacies', '💊', '#FFEAA7', '/pharmacies', 'Pharmacies et parapharmacies', true),
('Électronique', '📱', '#DDA0DD', '/electronics', 'Électronique et technologie', true),
('Beauté', '💄', '#FFB6C1', '/beauty', 'Beauté et cosmétiques', true),
('Coiffure', '✂️', '#F0E68C', '/hairdressing', 'Coiffure et salons de beauté', true),
('Bricolage', '🔧', '#DEB887', '/hardware', 'Quincaillerie et bricolage', true),
('Livres', '📚', '#8FBC8F', '/bookstores', 'Librairies et papeterie', true),
('Services', '📄', '#B0C4DE', '/services', 'Services de documents', true);

-- Insertion des statuts de commande
INSERT INTO order_statuses (name, label, color, icon, description, sort_order) VALUES
('pending', 'En attente', '#FFA500', '⏳', 'En attente de confirmation', 1),
('confirmed', 'Confirmée', '#4CAF50', '✅', 'Commande confirmée', 2),
('preparing', 'En préparation', '#2196F3', '👨‍🍳', 'En préparation', 3),
('ready', 'Prête', '#9C27B0', '📦', 'Prête pour la livraison', 4),
('picked_up', 'Récupérée', '#FF9800', '🚚', 'Récupérée par le livreur', 5),
('delivered', 'Livrée', '#4CAF50', '🎉', 'Livrée', 6),
('cancelled', 'Annulée', '#F44336', '❌', 'Annulée', 7);

-- Insertion des méthodes de paiement
INSERT INTO payment_methods (name, icon, description, is_available) VALUES
('cash', '💵', 'Espèces', true),
('card', '💳', 'Carte bancaire', true),
('mobile_money', '📱', 'Mobile Money', true),
('bank_transfer', '🏦', 'Virement bancaire', true);

-- Insertion des statuts de réservation
INSERT INTO reservation_statuses (name, description, color, icon) VALUES
('pending', 'En attente de confirmation', '#FFA500', '⏳'),
('confirmed', 'Réservation confirmée', '#4CAF50', '✅'),
('cancelled', 'Réservation annulée', '#F44336', '❌'),
('completed', 'Réservation terminée', '#2196F3', '🎉');

-- Insertion des types de notification
INSERT INTO notification_types (name, title, icon, color) VALUES
('order_status', 'Mise à jour de commande', '📦', '#2196F3'),
('delivery_update', 'Mise à jour de livraison', '🚚', '#FF9800'),
('promotion', 'Promotion spéciale', '🎉', '#E91E63'),
('system', 'Notification système', '🔔', '#607D8B'),
('payment', 'Mise à jour de paiement', '💳', '#4CAF50');

-- ============================================================================
-- ÉTAPE 3: CONFIRMATION
-- ============================================================================

-- Vérification que tout est en place
SELECT 'Données de base insérées avec succès!' as status;

-- Afficher les données insérées
SELECT 'Types de business' as table_name, COUNT(*) as count FROM business_types
UNION ALL
SELECT 'Catégories', COUNT(*) FROM categories
UNION ALL
SELECT 'Statuts de commande', COUNT(*) FROM order_statuses
UNION ALL
SELECT 'Méthodes de paiement', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Statuts de réservation', COUNT(*) FROM reservation_statuses
UNION ALL
SELECT 'Types de notification', COUNT(*) FROM notification_types
UNION ALL
SELECT 'Admin créé', COUNT(*) FROM user_profiles WHERE email = 'admin@bradelivery.com'; 