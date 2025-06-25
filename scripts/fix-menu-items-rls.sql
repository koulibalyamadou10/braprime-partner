-- Script pour corriger les politiques RLS de menu_items
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- CORRECTION DES POLITIQUES RLS POUR MENU_ITEMS
-- ============================================================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can view menu items" ON menu_items;

-- Créer une politique pour permettre la lecture publique des articles de menu
CREATE POLICY "Anyone can view menu items" ON menu_items
    FOR SELECT USING (true);

-- Vérifier que la politique a été créée
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'menu_items';

-- Test de la requête après correction
SELECT 
    'Test après correction RLS:' as info;
SELECT 
    id,
    name,
    price,
    business_id,
    is_available
FROM menu_items 
WHERE business_id = 1
LIMIT 5; 