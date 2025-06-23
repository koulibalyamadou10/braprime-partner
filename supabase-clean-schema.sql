-- Script de nettoyage complet de la base de données BraPrime
-- À exécuter AVANT le nouveau schéma pour éviter les conflits
-- ⚠️ ATTENTION : Ce script supprime TOUTES les données existantes

-- Supprimer tous les triggers en premier
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;

-- Supprimer les fonctions personnalisées
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Supprimer toutes les tables dans l'ordre correct (éviter les erreurs de contraintes)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les extensions si elles ne sont plus nécessaires
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Nettoyer les politiques RLS (Row Level Security)
-- Note: Les politiques seront automatiquement supprimées avec les tables

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Nettoyage de la base de données terminé. Toutes les tables et données ont été supprimées.';
    RAISE NOTICE 'Vous pouvez maintenant exécuter le nouveau schéma supabase-schema-fixed.sql';
END $$; 