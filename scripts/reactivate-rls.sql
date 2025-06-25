-- ============================================================================
-- SCRIPT POUR RÉACTIVER RLS AVEC LES BONNES POLITIQUES
-- ============================================================================
-- Ce script réactive RLS avec des politiques simplifiées et fonctionnelles

-- ============================================================================
-- SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- ============================================================================

-- Supprimer toutes les politiques sur menu_items
DROP POLICY IF EXISTS "Partners can view their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can create their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can update their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Partners can delete their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Customers can view active business menu items" ON menu_items;
DROP POLICY IF EXISTS "Temporary debug policy - menu_items" ON menu_items;

-- Supprimer toutes les politiques sur menu_categories
DROP POLICY IF EXISTS "Partners can view their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Partners can create their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Partners can update their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Partners can delete their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Customers can view active business menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Temporary debug policy - menu_categories" ON menu_categories;

-- ============================================================================
-- RÉACTIVER RLS
-- ============================================================================

-- Réactiver RLS sur menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Réactiver RLS sur menu_categories
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CRÉER DES POLITIQUES SIMPLIFIÉES
-- ============================================================================

-- Politique simple pour menu_items : permettre tout aux propriétaires de business
CREATE POLICY "menu_items_policy" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- Politique simple pour menu_categories : permettre tout aux propriétaires de business
CREATE POLICY "menu_categories_policy" ON menu_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- POLITIQUES POUR LA LECTURE PUBLIQUE (OPTIONNEL)
-- ============================================================================

-- Politique pour permettre la lecture publique des articles des commerces actifs
CREATE POLICY "menu_items_public_read" ON menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.is_active = true 
            AND b.is_open = true
        )
    );

-- Politique pour permettre la lecture publique des catégories des commerces actifs
CREATE POLICY "menu_categories_public_read" ON menu_categories
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
-- VÉRIFICATION
-- ============================================================================

-- Vérifier l'état RLS
SELECT 
    'État RLS après réactivation' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('menu_items', 'menu_categories')
ORDER BY tablename;

-- Afficher les politiques créées
SELECT 
    'Politiques créées' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('menu_items', 'menu_categories')
ORDER BY tablename, policyname;

-- ============================================================================
-- TEST DES POLITIQUES
-- ============================================================================

-- Test de lecture pour l'utilisateur connecté
SELECT 
    'Test lecture catégories' as info,
    COUNT(*) as categories_count
FROM menu_categories mc
WHERE EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = mc.business_id 
    AND b.owner_id = auth.uid()
);

SELECT 
    'Test lecture articles' as info,
    COUNT(*) as items_count
FROM menu_items mi
WHERE EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = mi.business_id 
    AND b.owner_id = auth.uid()
);

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS réactivé avec succès!';
    RAISE NOTICE 'Les politiques simplifiées ont été créées.';
    RAISE NOTICE 'Les partenaires peuvent maintenant gérer leurs menus.';
END $$; 