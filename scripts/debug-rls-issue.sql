-- ============================================================================
-- SCRIPT DE DIAGNOSTIC POUR LES PROBLÈMES RLS
-- ============================================================================
-- Ce script aide à identifier pourquoi les politiques RLS ne fonctionnent pas

-- ============================================================================
-- VÉRIFICATION DE L'UTILISATEUR CONNECTÉ
-- ============================================================================

-- Afficher l'utilisateur actuellement connecté
SELECT 
    'Utilisateur connecté' as info,
    auth.uid() as user_id,
    auth.email() as user_email;

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

-- Vérifier si RLS est activé sur les tables
SELECT 
    'État RLS des tables' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('menu_items', 'menu_categories', 'businesses')
ORDER BY tablename;

-- Afficher toutes les politiques existantes
SELECT 
    'Politiques existantes' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('menu_items', 'menu_categories', 'businesses')
ORDER BY tablename, policyname;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES BUSINESS
-- ============================================================================

-- Vérifier les businesses existants
SELECT 
    'Businesses existants' as info,
    id,
    name,
    owner_id,
    is_active,
    is_open
FROM businesses
ORDER BY id;

-- Vérifier si l'utilisateur connecté a un business
SELECT 
    'Business de l\'utilisateur connecté' as info,
    id,
    name,
    owner_id,
    is_active,
    is_open
FROM businesses
WHERE owner_id = auth.uid();

-- ============================================================================
-- TEST DES POLITIQUES
-- ============================================================================

-- Test de lecture des catégories pour l'utilisateur connecté
SELECT 
    'Test lecture catégories' as info,
    COUNT(*) as categories_count
FROM menu_categories mc
WHERE EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = mc.business_id 
    AND b.owner_id = auth.uid()
);

-- Test de lecture des articles pour l'utilisateur connecté
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
-- CRÉATION D'UN BUSINESS DE TEST SI NÉCESSAIRE
-- ============================================================================

-- Créer un business de test pour l'utilisateur connecté s'il n'en a pas
DO $$
DECLARE
    user_id UUID := auth.uid();
    business_count INTEGER;
BEGIN
    -- Vérifier si l'utilisateur a déjà un business
    SELECT COUNT(*) INTO business_count
    FROM businesses
    WHERE owner_id = user_id;
    
    IF business_count = 0 THEN
        -- Insérer un business de test
        INSERT INTO businesses (
            name, 
            description, 
            business_type_id, 
            category_id,
            cover_image,
            logo,
            delivery_time,
            delivery_fee,
            address,
            phone,
            email,
            opening_hours,
            cuisine_type,
            is_active,
            is_open,
            owner_id
        ) VALUES (
            'Restaurant Test - ' || user_id::text,
            'Business de test pour l''utilisateur',
            1, -- restaurant
            1, -- Restaurants
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            '30-45 min',
            5000,
            '123 Rue Test, Conakry, Guinée',
            'test@braprime.com',
            'Lun-Dim: 8h-22h',
            'Africaine',
            true,
            true,
            user_id
        );
        
        RAISE NOTICE 'Business de test créé pour l''utilisateur %', user_id;
    ELSE
        RAISE NOTICE 'L''utilisateur % a déjà % business(es)', user_id, business_count;
    END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier le business après création
SELECT 
    'Business après création' as info,
    id,
    name,
    owner_id,
    is_active,
    is_open
FROM businesses
WHERE owner_id = auth.uid();

-- Test final des politiques
SELECT 
    'Test final - Lecture catégories' as info,
    COUNT(*) as categories_count
FROM menu_categories mc
WHERE EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = mc.business_id 
    AND b.owner_id = auth.uid()
);

SELECT 
    'Test final - Lecture articles' as info,
    COUNT(*) as items_count
FROM menu_items mi
WHERE EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = mi.business_id 
    AND b.owner_id = auth.uid()
);

-- ============================================================================
-- POLITIQUES TEMPORAIRES POUR DÉBOGUAGE
-- ============================================================================

-- Créer des politiques temporaires plus permissives pour le débogage
-- (À supprimer après résolution du problème)

-- Politique temporaire pour permettre toutes les opérations aux propriétaires de business
DROP POLICY IF EXISTS "Temporary debug policy - menu_items" ON menu_items;
CREATE POLICY "Temporary debug policy - menu_items" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_items.business_id 
            AND b.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Temporary debug policy - menu_categories" ON menu_categories;
CREATE POLICY "Temporary debug policy - menu_categories" ON menu_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.id = menu_categories.business_id 
            AND b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- MESSAGE DE FIN
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Diagnostic RLS terminé!';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier le problème.';
    RAISE NOTICE 'Des politiques temporaires ont été créées pour le débogage.';
END $$; 