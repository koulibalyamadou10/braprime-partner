-- ============================================================================
-- SCRIPT DE CONFIGURATION COMPLÈTE RLS POUR BRAPRIME
-- ============================================================================
-- Ce script configure toutes les politiques RLS manquantes pour toutes les tables

-- ============================================================================
-- CONFIGURATION RLS POUR USER_PROFILES
-- ============================================================================

-- Activer RLS sur user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Créer les politiques
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- CONFIGURATION RLS POUR USER_ADDRESSES
-- ============================================================================

-- Activer RLS sur user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can create their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON user_addresses;

-- Créer les politiques
CREATE POLICY "Users can view their own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CONFIGURATION RLS POUR BUSINESSES
-- ============================================================================

-- Activer RLS sur businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Partners can manage their own businesses" ON businesses;

-- Créer les politiques
CREATE POLICY "Anyone can view active businesses" ON businesses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage their own businesses" ON businesses
  FOR ALL USING (auth.uid() = owner_id);

-- ============================================================================
-- CONFIGURATION RLS POUR ORDERS
-- ============================================================================

-- Activer RLS sur orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Partners can view their business orders" ON orders;

-- Créer les politiques
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can view their business orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = orders.business_id 
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- CONFIGURATION RLS POUR RESERVATIONS
-- ============================================================================

-- Activer RLS sur reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON reservations;
DROP POLICY IF EXISTS "Partners can view their business reservations" ON reservations;

-- Créer les politiques
CREATE POLICY "Users can view their own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can view their business reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = reservations.business_id 
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- CONFIGURATION RLS POUR REVIEWS
-- ============================================================================

-- Activer RLS sur reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- Créer les politiques
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CONFIGURATION RLS POUR NOTIFICATIONS
-- ============================================================================

-- Activer RLS sur notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Créer les politiques
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- CONFIGURATION RLS POUR PAYMENTS
-- ============================================================================

-- Activer RLS sur payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON payments;

-- Créer les politiques
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = payments.order_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = payments.order_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- RAPPORT FINAL
-- ============================================================================

DO $$
DECLARE
  total_policies INTEGER;
BEGIN
  -- Compter toutes les politiques créées
  SELECT COUNT(*) INTO total_policies 
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Afficher le rapport
  RAISE NOTICE '=== RAPPORT DE CONFIGURATION RLS COMPLÈTE ===';
  RAISE NOTICE 'Total des politiques RLS créées: %', total_policies;
  RAISE NOTICE 'Tables configurées:';
  RAISE NOTICE '- user_profiles';
  RAISE NOTICE '- user_addresses';
  RAISE NOTICE '- businesses';
  RAISE NOTICE '- orders';
  RAISE NOTICE '- reservations';
  RAISE NOTICE '- reviews';
  RAISE NOTICE '- notifications';
  RAISE NOTICE '- payments';
  RAISE NOTICE 'Configuration RLS terminée avec succès!';
END $$; 