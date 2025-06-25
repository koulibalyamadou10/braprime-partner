-- Script pour corriger les politiques RLS de menu_items
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- SCRIPT POUR CONFIGURER LES POLITIQUES RLS POUR LES TABLES DE MENU
-- ============================================================================
-- Ce script configure les politiques de sécurité pour permettre aux partenaires
-- de gérer leurs propres catégories et articles de menu

-- ============================================================================
-- POLITIQUES POUR menu_categories
-- ============================================================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Partners can view their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Partners can create their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Partners can update their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Partners can delete their own menu categories" ON menu_categories;

-- Activer RLS sur menu_categories
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux partenaires de voir leurs propres catégories
CREATE POLICY "Partners can view their own menu categories" ON menu_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de créer leurs propres catégories
CREATE POLICY "Partners can create their own menu categories" ON menu_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de modifier leurs propres catégories
CREATE POLICY "Partners can update their own menu categories" ON menu_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de supprimer leurs propres catégories
CREATE POLICY "Partners can delete their own menu categories" ON menu_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- POLITIQUES POUR menu_items
-- ============================================================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Partners can view their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can create their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can update their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can delete their own menu items" ON menu_items;

-- Activer RLS sur menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux partenaires de voir leurs propres articles
CREATE POLICY "Partners can view their own menu items" ON menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de créer leurs propres articles
CREATE POLICY "Partners can create their own menu items" ON menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de modifier leurs propres articles
CREATE POLICY "Partners can update their own menu items" ON menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de supprimer leurs propres articles
CREATE POLICY "Partners can delete their own menu items" ON menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- POLITIQUES POUR LES CLIENTS (lecture publique)
-- ============================================================================

-- Politique pour permettre aux clients de voir les articles des commerces actifs
CREATE POLICY "Customers can view active business menu items" ON menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.is_active = true 
            AND b.is_open = true
        )
    );

-- Politique pour permettre aux clients de voir les catégories des commerces actifs
CREATE POLICY "Customers can view active business menu categories" ON menu_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.is_active = true 
            AND b.is_open = true
        )
        AND menu_categories.is_active = true
    );

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES
-- ============================================================================

-- Afficher les politiques créées
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
WHERE tablename IN ('menu_items', 'menu_categories')
ORDER BY tablename, policyname;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Politiques RLS configurées avec succès pour les tables de menu!';
    RAISE NOTICE 'Les partenaires peuvent maintenant gérer leurs catégories et articles.';
    RAISE NOTICE 'Les clients peuvent voir les menus des commerces actifs.';
END $$; 