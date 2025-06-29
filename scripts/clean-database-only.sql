-- ============================================================================
-- SCRIPT DE NETTOYAGE PUR DE LA BASE DE DONNÉES
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
-- ÉTAPE 5: CONFIRMATION
-- ============================================================================

-- Vérification que tout a été supprimé
SELECT 'Base de données nettoyée avec succès!' as status;

-- Afficher les tables restantes (devrait être 0)
SELECT COUNT(*) as tables_restantes
FROM information_schema.tables 
WHERE table_schema = 'public'; 