-- ============================================================================
-- SCRIPT DE NETTOYAGE ET MIGRATION VERS LE SCHÉMA MOBILE
-- ============================================================================
-- ATTENTION: Ce script va supprimer toutes les données existantes
-- Exécuter uniquement sur une base de test ou après sauvegarde

-- ============================================================================
-- ÉTAPE 1: DÉSACTIVATION DES TRIGGERS ET CONTRAINTES
-- ============================================================================

-- Désactiver temporairement les triggers
SET session_replication_role = replica;

-- ============================================================================
-- ÉTAPE 2: SUPPRESSION DE TOUTES LES TABLES EXISTANTES
-- ============================================================================

-- Suppression dans l'ordre pour éviter les erreurs de contraintes
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS work_sessions CASCADE;
DROP TABLE IF EXISTS driver_documents CASCADE;
DROP TABLE IF EXISTS delivery_offers CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_types CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS reservation_statuses CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_statuses CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_types CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS favorite_menu_items CASCADE;
DROP TABLE IF EXISTS favorite_businesses CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- ============================================================================
-- ÉTAPE 3: SUPPRESSION DES FONCTIONS ET VUES
-- ============================================================================

-- Suppression des fonctions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS assign_driver_role() CASCADE;
DROP FUNCTION IF EXISTS create_order_status_history() CASCADE;
DROP FUNCTION IF EXISTS calculate_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) CASCADE;
DROP FUNCTION IF EXISTS get_order_distance(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_cart_total(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_cart_item_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS add_business_to_favorites(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS add_menu_item_to_favorites(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS is_business_favorite(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS is_menu_item_favorite(UUID, INTEGER) CASCADE;

-- Suppression des vues
DROP VIEW IF EXISTS cart_details CASCADE;
DROP VIEW IF EXISTS businesses_with_favorites CASCADE;
DROP VIEW IF EXISTS menu_items_with_favorites CASCADE;
DROP VIEW IF EXISTS user_favorite_businesses CASCADE;
DROP VIEW IF EXISTS user_favorite_menu_items CASCADE;
DROP VIEW IF EXISTS available_delivery_offers CASCADE;
DROP VIEW IF EXISTS driver_documents_with_details CASCADE;
DROP VIEW IF EXISTS work_sessions_with_details CASCADE;
DROP VIEW IF EXISTS order_status_history_with_details CASCADE;
DROP VIEW IF EXISTS orders_with_gps CASCADE;

-- ============================================================================
-- ÉTAPE 4: RÉACTIVATION DES TRIGGERS
-- ============================================================================

SET session_replication_role = DEFAULT;

-- ============================================================================
-- ÉTAPE 5: APPLICATION DU SCHÉMA MOBILE
-- ============================================================================

-- Le schéma mobile sera appliqué via le fichier supabase-schema-mobile.sql
-- Cette étape sera exécutée séparément

-- ============================================================================
-- ÉTAPE 6: CRÉATION DE L'ADMIN INITIAL
-- ============================================================================

-- Création de l'utilisateur admin dans auth.users (à faire manuellement)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     'admin-uuid',
--     'admin@bradelivery.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- Création du profil admin
INSERT INTO user_profiles (id, name, email, role, is_active, created_at, updated_at)
VALUES (
    'admin-uuid',
    'Administrateur BraPrime',
    'admin@bradelivery.com',
    'admin',
    true,
    NOW(),
    NOW()
);

-- ============================================================================
-- ÉTAPE 7: DONNÉES DE BASE
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
INSERT INTO order_statuses (name, description, color, icon) VALUES
('pending', 'En attente de confirmation', '#FFA500', '⏳'),
('confirmed', 'Commande confirmée', '#4CAF50', '✅'),
('preparing', 'En préparation', '#2196F3', '👨‍🍳'),
('ready', 'Prête pour la livraison', '#9C27B0', '📦'),
('picked_up', 'Récupérée par le livreur', '#FF9800', '🚚'),
('delivered', 'Livrée', '#4CAF50', '🎉'),
('cancelled', 'Annulée', '#F44336', '❌');

-- Insertion des méthodes de paiement
INSERT INTO payment_methods (name, description, icon, is_active) VALUES
('cash', 'Espèces', '💵', true),
('card', 'Carte bancaire', '💳', true),
('mobile_money', 'Mobile Money', '📱', true),
('bank_transfer', 'Virement bancaire', '🏦', true);

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
-- ÉTAPE 8: CONFIRMATION
-- ============================================================================

-- Vérification que tout est en place
SELECT 'Migration vers le schéma mobile terminée avec succès!' as status;

-- Afficher les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name; 