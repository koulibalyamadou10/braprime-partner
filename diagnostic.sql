-- Diagnostic de la base de données BraPrime
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les extensions
SELECT 'Extensions' as check_type, extname as name, extversion as version
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 2. Lister toutes les tables
SELECT 'Tables' as check_type, table_name as name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Vérifier la structure de la table restaurants
SELECT 'Restaurants Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'restaurants'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table menu_items
SELECT 'Menu Items Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;

-- 5. Compter les enregistrements
SELECT 'Record Counts' as check_type, 
       'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Record Counts', 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'Record Counts', 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Record Counts', 'users', COUNT(*) FROM users
UNION ALL
SELECT 'Record Counts', 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Record Counts', 'user_addresses', COUNT(*) FROM user_addresses
UNION ALL
SELECT 'Record Counts', 'reservations', COUNT(*) FROM reservations;

-- 6. Vérifier les politiques RLS
SELECT 'RLS Policies' as check_type, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. Vérifier les triggers
SELECT 'Triggers' as check_type, tgname as trigger_name, tgrelid::regclass as table_name, tgtype
FROM pg_trigger
WHERE tgrelid IN (
  SELECT oid FROM pg_class 
  WHERE relname IN ('users', 'restaurants', 'menu_items', 'orders', 'reservations')
);

-- 8. Test de connexion simple
SELECT 'Connection Test' as check_type, 
       CASE 
         WHEN COUNT(*) > 0 THEN '✅ Connexion réussie'
         ELSE '❌ Problème de connexion'
       END as status
FROM categories LIMIT 1; 