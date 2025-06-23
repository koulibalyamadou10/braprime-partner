-- Script de correction des politiques RLS pour BraPrime
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les politiques existantes
SELECT 'Politiques existantes' as check_type, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Supprimer les anciennes politiques pour les recréer proprement
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

DROP POLICY IF EXISTS "Anyone can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Partners can manage their own restaurants" ON restaurants;

DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can manage menu items for their restaurants" ON menu_items;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Partners can view orders for their restaurants" ON orders;
DROP POLICY IF EXISTS "Partners can update orders for their restaurants" ON orders;

DROP POLICY IF EXISTS "Users can manage their own addresses" ON user_addresses;

DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON reservations;
DROP POLICY IF EXISTS "Partners can view reservations for their restaurants" ON reservations;
DROP POLICY IF EXISTS "Partners can update reservations for their restaurants" ON reservations;

-- 3. Recréer les politiques avec une meilleure gestion des erreurs

-- Politiques pour la table users
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour la table restaurants
CREATE POLICY "Anyone can view active restaurants" ON restaurants 
FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage their own restaurants" ON restaurants 
FOR ALL USING (partner_id = auth.uid());

-- Politiques pour la table menu_items
CREATE POLICY "Anyone can view available menu items" ON menu_items 
FOR SELECT USING (is_available = true);

CREATE POLICY "Partners can manage menu items for their restaurants" ON menu_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = menu_items.restaurant_id 
    AND restaurants.partner_id = auth.uid()
  )
);

-- Politiques pour la table orders (CORRIGÉES)
CREATE POLICY "Users can view their own orders" ON orders 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own orders" ON orders 
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders" ON orders 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Partners can view orders for their restaurants" ON orders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = orders.restaurant_id 
    AND restaurants.partner_id = auth.uid()
  )
);

CREATE POLICY "Partners can update orders for their restaurants" ON orders 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = orders.restaurant_id 
    AND restaurants.partner_id = auth.uid()
  )
);

-- Politiques pour la table user_addresses
CREATE POLICY "Users can manage their own addresses" ON user_addresses 
FOR ALL USING (user_id = auth.uid());

-- Politiques pour la table reservations
CREATE POLICY "Users can view their own reservations" ON reservations 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reservations" ON reservations 
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reservations" ON reservations 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Partners can view reservations for their restaurants" ON reservations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = reservations.restaurant_id 
    AND restaurants.partner_id = auth.uid()
  )
);

CREATE POLICY "Partners can update reservations for their restaurants" ON reservations 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = reservations.restaurant_id 
    AND restaurants.partner_id = auth.uid()
  )
);

-- 4. Vérifier que RLS est activé sur toutes les tables
SELECT 'RLS Status' as check_type, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Vérifier les nouvelles politiques
SELECT 'Nouvelles politiques' as check_type, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Test de connexion (à exécuter après s'être connecté)
-- SELECT 'Test auth.uid()' as check_type, auth.uid() as current_user_id;

-- 7. Vérifier les données de test
SELECT 'Test data' as check_type, 
       'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Test data', 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'Test data', 'orders', COUNT(*) FROM orders; 