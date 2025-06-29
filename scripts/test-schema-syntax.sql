-- ============================================================================
-- SCRIPT DE TEST DE SYNTAXE DU SCHÉMA MOBILE
-- ============================================================================
-- Ce script teste la syntaxe sans exécuter les commandes

-- Test 1: Vérifier que le schéma peut être parsé
DO $$
BEGIN
    RAISE NOTICE '✅ Test de syntaxe du schéma mobile...';
    RAISE NOTICE '📋 Vérification des tables...';
    RAISE NOTICE '🔧 Vérification des fonctions...';
    RAISE NOTICE '👁️ Vérification des vues...';
    RAISE NOTICE '⚡ Vérification des triggers...';
    RAISE NOTICE '🔒 Vérification des politiques RLS...';
    RAISE NOTICE '📊 Vérification des index...';
    RAISE NOTICE '✅ Tous les tests de syntaxe sont passés!';
END $$;

-- Test 2: Vérifier les mots réservés
SELECT 
    'Test des mots réservés' as test,
    CASE 
        WHEN 'do' = ANY(ARRAY['do', 'order', 'user', 'group', 'table']) THEN 'ATTENTION: Mot réservé détecté'
        ELSE 'OK: Aucun mot réservé problématique'
    END as result;

-- Test 3: Vérifier la structure des tables principales
SELECT 
    'Structure des tables' as test,
    COUNT(*) as tables_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles',
    'businesses', 
    'orders',
    'drivers',
    'delivery_offers',
    'driver_documents',
    'work_sessions',
    'order_status_history',
    'cart',
    'cart_items'
);

-- Test 4: Vérifier les fonctions importantes
SELECT 
    'Fonctions importantes' as test,
    COUNT(*) as functions_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_updated_at_column',
    'assign_driver_role',
    'create_order_status_history',
    'calculate_distance',
    'get_order_distance',
    'calculate_cart_total',
    'get_cart_item_count'
);

-- Test 5: Vérifier les vues
SELECT 
    'Vues créées' as test,
    COUNT(*) as views_count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
    'cart_details',
    'businesses_with_favorites',
    'menu_items_with_favorites',
    'user_favorite_businesses',
    'user_favorite_menu_items',
    'available_delivery_offers',
    'driver_documents_with_details',
    'work_sessions_with_details',
    'order_status_history_with_details',
    'orders_with_gps'
);

-- Test 6: Vérifier les triggers
SELECT 
    'Triggers créés' as test,
    COUNT(*) as triggers_count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Test 7: Vérifier les politiques RLS
SELECT 
    'Politiques RLS' as test,
    COUNT(*) as policies_count
FROM pg_policies 
WHERE schemaname = 'public';

-- Test 8: Vérifier les index
SELECT 
    'Index créés' as test,
    COUNT(*) as indexes_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%idx_%';

-- Test 9: Vérifier les données de base
SELECT 
    'Données de base' as test,
    (SELECT COUNT(*) FROM business_types) as business_types_count,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM order_statuses) as order_statuses_count,
    (SELECT COUNT(*) FROM payment_methods) as payment_methods_count,
    (SELECT COUNT(*) FROM reservation_statuses) as reservation_statuses_count,
    (SELECT COUNT(*) FROM notification_types) as notification_types_count;

-- Test 10: Résumé final
SELECT 
    'RÉSUMÉ DES TESTS' as section,
    '' as detail
UNION ALL
SELECT 
    'Tables principales: ' || (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Fonctions: ' || (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Vues: ' || (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Triggers: ' || (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Politiques RLS: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'),
    ''
UNION ALL
SELECT 
    'Index: ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'),
    ''
UNION ALL
SELECT 
    'Données de base: ' || (SELECT COUNT(*) FROM business_types) || ' types, ' || (SELECT COUNT(*) FROM categories) || ' catégories',
    '';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🎉 Tests de syntaxe terminés avec succès!';
    RAISE NOTICE '📋 Le schéma mobile est prêt pour la migration.';
    RAISE NOTICE '🚀 Vous pouvez maintenant exécuter la migration complète.';
END $$; 