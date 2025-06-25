-- ============================================================================
-- SCRIPT DE TEST DES RELATIONS DE RÉSERVATIONS
-- ============================================================================
-- Ce script teste que les relations entre les tables fonctionnent correctement
-- Exécutez ce script dans l'éditeur SQL de Supabase après avoir exécuté fix-reservations-user-relation.sql

-- ============================================================================
-- VÉRIFICATION DES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- ============================================================================

-- Vérifier que toutes les contraintes de clé étrangère existent
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('reservations', 'orders', 'reviews', 'notifications', 'user_addresses')
  AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;

-- ============================================================================
-- TEST DE CRÉATION DE DONNÉES
-- ============================================================================

-- Vérifier qu'il y a des utilisateurs dans user_profiles
SELECT COUNT(*) as user_count FROM user_profiles;

-- Vérifier qu'il y a des restaurants dans businesses
SELECT COUNT(*) as business_count FROM businesses;

-- Vérifier qu'il y a des réservations existantes
SELECT COUNT(*) as reservation_count FROM reservations;

-- ============================================================================
-- TEST DE RELATIONS
-- ============================================================================

-- Test de jointure entre reservations et user_profiles
SELECT 
  r.id as reservation_id,
  r.user_id,
  up.name as user_name,
  up.email as user_email,
  r.business_name,
  r.date,
  r.time,
  r.status
FROM reservations r
LEFT JOIN user_profiles up ON r.user_id = up.id
LIMIT 5;

-- Test de jointure entre reservations et businesses
SELECT 
  r.id as reservation_id,
  r.business_id,
  b.name as business_name,
  b.address as business_address,
  r.date,
  r.time,
  r.status
FROM reservations r
LEFT JOIN businesses b ON r.business_id = b.id
LIMIT 5;

-- ============================================================================
-- TEST DE PERFORMANCE
-- ============================================================================

-- Vérifier que les index existent
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('reservations', 'user_profiles', 'businesses')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- TEST DE CONTRAINTES
-- ============================================================================

-- Test d'insertion avec un user_id invalide (doit échouer)
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  test_business_id INTEGER;
BEGIN
  -- Récupérer un business_id valide
  SELECT id INTO test_business_id FROM businesses LIMIT 1;
  
  IF test_business_id IS NOT NULL THEN
    BEGIN
      INSERT INTO reservations (user_id, business_id, business_name, date, time, guests)
      VALUES (test_user_id, test_business_id, 'Test Restaurant', '2024-01-01', '12:00:00', 2);
      RAISE NOTICE '❌ Test échoué: Insertion avec user_id invalide a réussi (ne devrait pas)';
    EXCEPTION
      WHEN foreign_key_violation THEN
        RAISE NOTICE '✅ Test réussi: Contrainte de clé étrangère fonctionne correctement';
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur inattendue: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '⚠️ Impossible de tester: Aucun restaurant trouvé dans la base de données';
  END IF;
END $$;

-- ============================================================================
-- RÉSUMÉ DE LA CONFIGURATION
-- ============================================================================

DO $$
DECLARE
  fk_count INTEGER;
  user_count INTEGER;
  business_count INTEGER;
  reservation_count INTEGER;
BEGIN
  -- Compter les contraintes de clé étrangère
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints 
  WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'
    AND table_name IN ('reservations', 'orders', 'reviews', 'notifications', 'user_addresses')
    AND constraint_name LIKE '%user_id%';
  
  -- Compter les enregistrements
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  SELECT COUNT(*) INTO business_count FROM businesses;
  SELECT COUNT(*) INTO reservation_count FROM reservations;
  
  -- Afficher le résumé
  RAISE NOTICE '=== RÉSUMÉ DES RELATIONS DE RÉSERVATIONS ===';
  RAISE NOTICE 'Contraintes de clé étrangère user_id: %', fk_count;
  RAISE NOTICE 'Utilisateurs dans user_profiles: %', user_count;
  RAISE NOTICE 'Restaurants dans businesses: %', business_count;
  RAISE NOTICE 'Réservations existantes: %', reservation_count;
  
  IF fk_count >= 5 AND user_count > 0 AND business_count > 0 THEN
    RAISE NOTICE '✅ Configuration complète et fonctionnelle!';
  ELSE
    RAISE NOTICE '❌ Configuration incomplète. Vérifiez les éléments manquants.';
  END IF;
END $$; 