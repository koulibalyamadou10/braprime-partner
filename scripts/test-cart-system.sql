-- ============================================================================
-- SCRIPT DE TEST POUR LE SYSTÈME DE PANIER
-- ============================================================================
-- Ce script teste que les tables cart et cart_items fonctionnent correctement

-- ============================================================================
-- VÉRIFICATION DES TABLES
-- ============================================================================

-- Vérifier que les tables existent
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'cart' THEN '✅ Table cart existe'
        WHEN table_name = 'cart_items' THEN '✅ Table cart_items existe'
        ELSE '❌ Table inattendue: ' || table_name
    END as status
FROM information_schema.tables 
WHERE table_name IN ('cart', 'cart_items')
AND table_schema = 'public';

-- ============================================================================
-- VÉRIFICATION DES FONCTIONS
-- ============================================================================

-- Vérifier que les fonctions existent
SELECT 
    routine_name,
    CASE 
        WHEN routine_name = 'calculate_cart_total' THEN '✅ Fonction calculate_cart_total existe'
        WHEN routine_name = 'get_cart_item_count' THEN '✅ Fonction get_cart_item_count existe'
        WHEN routine_name = 'clear_user_cart' THEN '✅ Fonction clear_user_cart existe'
        ELSE '❌ Fonction inattendue: ' || routine_name
    END as status
FROM information_schema.routines 
WHERE routine_name IN ('calculate_cart_total', 'get_cart_item_count', 'clear_user_cart')
AND routine_schema = 'public';

-- ============================================================================
-- VÉRIFICATION DE LA VUE
-- ============================================================================

-- Vérifier que la vue cart_details existe
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'cart_details' THEN '✅ Vue cart_details existe'
        ELSE '❌ Vue inattendue: ' || table_name
    END as status
FROM information_schema.views 
WHERE table_name = 'cart_details'
AND table_schema = 'public';

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

-- Vérifier les politiques RLS sur cart
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN tablename = 'cart' THEN '✅ Politique RLS sur cart: ' || policyname
        ELSE '❌ Politique inattendue: ' || policyname
    END as status
FROM pg_policies 
WHERE tablename = 'cart';

-- Vérifier les politiques RLS sur cart_items
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN tablename = 'cart_items' THEN '✅ Politique RLS sur cart_items: ' || policyname
        ELSE '❌ Politique inattendue: ' || policyname
    END as status
FROM pg_policies 
WHERE tablename = 'cart_items';

-- ============================================================================
-- TEST DES FONCTIONS (AVEC DES DONNÉES DE TEST)
-- ============================================================================

-- Créer un utilisateur de test (si nécessaire)
-- INSERT INTO auth.users (id, email) VALUES ('test-user-123', 'test@example.com') ON CONFLICT DO NOTHING;

-- Créer un panier de test
INSERT INTO cart (id, user_id, business_id, business_name, delivery_method) 
VALUES (
    'test-cart-123',
    'test-user-123', 
    1, 
    'Restaurant Test', 
    'delivery'
) ON CONFLICT (user_id) DO NOTHING;

-- Ajouter des articles de test
INSERT INTO cart_items (cart_id, menu_item_id, name, price, quantity) 
VALUES 
    ('test-cart-123', 1, 'Pizza Margherita', 15000, 2),
    ('test-cart-123', 2, 'Salade César', 8000, 1)
ON CONFLICT DO NOTHING;

-- Tester les fonctions
SELECT 
    'Test calculate_cart_total' as test_name,
    calculate_cart_total('test-cart-123') as result,
    CASE 
        WHEN calculate_cart_total('test-cart-123') = 38000 THEN '✅ Fonction calculate_cart_total fonctionne'
        ELSE '❌ Fonction calculate_cart_total ne fonctionne pas'
    END as status;

SELECT 
    'Test get_cart_item_count' as test_name,
    get_cart_item_count('test-cart-123') as result,
    CASE 
        WHEN get_cart_item_count('test-cart-123') = 3 THEN '✅ Fonction get_cart_item_count fonctionne'
        ELSE '❌ Fonction get_cart_item_count ne fonctionne pas'
    END as status;

-- Tester la vue cart_details
SELECT 
    'Test vue cart_details' as test_name,
    cart_id,
    user_id,
    business_name,
    total,
    item_count,
    CASE 
        WHEN total = 38000 AND item_count = 3 THEN '✅ Vue cart_details fonctionne'
        ELSE '❌ Vue cart_details ne fonctionne pas'
    END as status
FROM cart_details 
WHERE cart_id = 'test-cart-123';

-- ============================================================================
-- NETTOYAGE DES DONNÉES DE TEST
-- ============================================================================

-- Supprimer les données de test
DELETE FROM cart_items WHERE cart_id = 'test-cart-123';
DELETE FROM cart WHERE id = 'test-cart-123';

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🧪 Tests du système de panier terminés!';
    RAISE NOTICE '📋 Vérifiez les résultats ci-dessus pour confirmer que tout fonctionne.';
END $$; 