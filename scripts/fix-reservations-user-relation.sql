-- ============================================================================
-- SCRIPT DE CORRECTION DES RELATIONS DE RÉSERVATIONS
-- ============================================================================
-- Ce script ajoute les contraintes de clé étrangère manquantes pour les réservations
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- AJOUT DES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour user_id dans reservations
-- Cette contrainte lie reservations.user_id à user_profiles.id
ALTER TABLE reservations 
ADD CONSTRAINT reservations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour user_id dans orders
-- Cette contrainte lie orders.user_id à user_profiles.id
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour user_id dans reviews
-- Cette contrainte lie reviews.user_id à user_profiles(id) ON DELETE SET NULL
ALTER TABLE reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Ajouter la contrainte de clé étrangère pour user_id dans notifications
-- Cette contrainte lie notifications.user_id à user_profiles(id) ON DELETE CASCADE
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour user_id dans user_addresses
-- Cette contrainte lie user_addresses.user_id à user_profiles(id) ON DELETE CASCADE
ALTER TABLE user_addresses 
ADD CONSTRAINT user_addresses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- VÉRIFICATION DES CONTRAINTES
-- ============================================================================

-- Vérifier que toutes les contraintes ont été ajoutées
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('reservations', 'orders', 'reviews', 'notifications', 'user_addresses')
  AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Correction des relations de réservations terminée!';
  RAISE NOTICE 'Contraintes de clé étrangère ajoutées pour:';
  RAISE NOTICE '- reservations.user_id -> user_profiles.id';
  RAISE NOTICE '- orders.user_id -> user_profiles.id';
  RAISE NOTICE '- reviews.user_id -> user_profiles.id';
  RAISE NOTICE '- notifications.user_id -> user_profiles.id';
  RAISE NOTICE '- user_addresses.user_id -> user_profiles.id';
END $$; 