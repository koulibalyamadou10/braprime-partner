-- ============================================================================
-- SCRIPT DE VÉRIFICATION POST-MIGRATION
-- ============================================================================
-- À exécuter après la migration pour vérifier que tout fonctionne

-- ============================================================================
-- VÉRIFICATION DES TABLES
-- ============================================================================

-- Compter toutes les tables créées
SELECT 
    'Tables créées' as verification,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Lister toutes les tables
SELECT 
    table_name,
    'Table' as type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================================================
-- VÉRIFICATION DES FONCTIONS
-- ============================================================================

-- Compter toutes les fonctions
SELECT 
    'Fonctions créées' as verification,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Lister les fonctions importantes
SELECT 
    routine_name,
    'Fonction' as type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_updated_at_column',
    'assign_driver_role',
    'create_order_status_history',
    'calculate_distance',
    'get_order_distance',
    'calculate_cart_total',
    'get_cart_item_count',
    'add_business_to_favorites',
    'add_menu_item_to_favorites',
    'is_business_favorite',
    'is_menu_item_favorite'
)
ORDER BY routine_name;

-- ============================================================================
-- VÉRIFICATION DES VUES
-- ============================================================================

-- Compter toutes les vues
SELECT 
    'Vues créées' as verification,
    COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public';

-- Lister toutes les vues
SELECT 
    table_name as view_name,
    'Vue' as type
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================================================
-- VÉRIFICATION DES TRIGGERS
-- ============================================================================

-- Compter tous les triggers
SELECT 
    'Triggers créés' as verification,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Lister les triggers importants
SELECT 
    trigger_name,
    event_object_table,
    'Trigger' as type
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES DE BASE
-- ============================================================================

-- Vérifier les types de business
SELECT 
    'Types de business' as verification,
    COUNT(*) as count
FROM business_types;

-- Vérifier les catégories
SELECT 
    'Catégories' as verification,
    COUNT(*) as count
FROM categories;

-- Vérifier les statuts de commande
SELECT 
    'Statuts de commande' as verification,
    COUNT(*) as count
FROM order_statuses;

-- Vérifier les méthodes de paiement
SELECT 
    'Méthodes de paiement' as verification,
    COUNT(*) as count
FROM payment_methods;

-- Vérifier les statuts de réservation
SELECT 
    'Statuts de réservation' as verification,
    COUNT(*) as count
FROM reservation_statuses;

-- Vérifier les types de notification
SELECT 
    'Types de notification' as verification,
    COUNT(*) as count
FROM notification_types;

-- ============================================================================
-- VÉRIFICATION DE L'ADMIN
-- ============================================================================

-- Vérifier que l'admin existe
SELECT 
    'Admin créé' as verification,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OUI'
        ELSE 'NON'
    END as status
FROM user_profiles 
WHERE email = 'admin@bradelivery.com' AND role = 'admin';

-- Afficher les détails de l'admin
SELECT 
    id,
    name,
    email,
    role,
    is_active,
    created_at
FROM user_profiles 
WHERE email = 'admin@bradelivery.com';

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

-- Compter les politiques RLS
SELECT 
    'Politiques RLS' as verification,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- Lister les politiques RLS par table
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- ============================================================================
-- VÉRIFICATION DES INDEX
-- ============================================================================

-- Compter les index
SELECT 
    'Index créés' as verification,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';

-- Lister les index importants
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- TEST DES FONCTIONS GPS
-- ============================================================================

-- Tester la fonction de calcul de distance
SELECT 
    'Test GPS' as verification,
    calculate_distance(48.8566, 2.3522, 43.2965, 5.3698) as distance_paris_marseille;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================

SELECT 'VÉRIFICATION TERMINÉE' as status;

-- Afficher un résumé complet
SELECT 
    'RÉSUMÉ DE LA MIGRATION' as section,
    '' as detail
UNION ALL
SELECT 
    'Tables créées: ' || (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Fonctions créées: ' || (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Vues créées: ' || (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Triggers créés: ' || (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public'),
    ''
UNION ALL
SELECT 
    'Politiques RLS: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'),
    ''
UNION ALL
SELECT 
    'Admin créé: ' || (SELECT CASE WHEN COUNT(*) > 0 THEN 'OUI' ELSE 'NON' END FROM user_profiles WHERE email = 'admin@bradelivery.com'),
    ''
UNION ALL
SELECT 
    'Données de base: ' || (SELECT COUNT(*) FROM business_types) || ' types, ' || (SELECT COUNT(*) FROM categories) || ' catégories',
    ''; 