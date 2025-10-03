-- ============================================================================
-- SCRIPT DE TEST POUR L'UPLOAD D'IMAGES DE COMMERCES
-- ============================================================================
-- Ce script teste les politiques RLS pour l'upload d'images
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- VÉRIFICATION DE L'ÉTAT ACTUEL
-- ============================================================================

SELECT '=== ÉTAT ACTUEL ===' as info;

-- Vérifier les politiques RLS existantes
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%business%'
ORDER BY policyname;

-- Vérifier le bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'business-images';

-- ============================================================================
-- TEST DE SIMULATION D'UPLOAD
-- ============================================================================

SELECT '=== TEST DE SIMULATION ===' as info;

-- Simuler un utilisateur authentifié (remplacez par un vrai UUID)
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- UUID de test
  test_file_path TEXT := 'business-images/' || test_user_id || '/logo_test.jpg';
BEGIN
  -- Vérifier si le chemin correspond aux politiques
  RAISE NOTICE 'Test du chemin: %', test_file_path;
  RAISE NOTICE 'Premier dossier: %', (string_to_array(test_file_path, '/'))[1];
  RAISE NOTICE 'Deuxième dossier: %', (string_to_array(test_file_path, '/'))[2];
  
  -- Vérifier la structure attendue
  IF (string_to_array(test_file_path, '/'))[1] = 'business-images' THEN
    RAISE NOTICE '✅ Structure de chemin correcte';
  ELSE
    RAISE NOTICE '❌ Structure de chemin incorrecte';
  END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION DES PERMISSIONS
-- ============================================================================

SELECT '=== VÉRIFICATION DES PERMISSIONS ===' as info;

-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Vérifier les rôles autorisés
SELECT 
  policyname,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%business%';

-- ============================================================================
-- DIAGNOSTIC DES PROBLÈMES POTENTIELS
-- ============================================================================

SELECT '=== DIAGNOSTIC ===' as info;

-- Vérifier si le bucket existe et est public
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'business-images') 
    THEN '✅ Bucket business-images existe'
    ELSE '❌ Bucket business-images manquant'
  END as bucket_status;

-- Vérifier si les politiques existent
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname LIKE '%business%'
    ) 
    THEN '✅ Politiques RLS existent'
    ELSE '❌ Politiques RLS manquantes'
  END as policies_status;

-- ============================================================================
-- RECOMMANDATIONS
-- ============================================================================

SELECT '=== RECOMMANDATIONS ===' as info;

DO $$
BEGIN
  RAISE NOTICE '🔍 Pour résoudre les problèmes d''upload:';
  RAISE NOTICE '1. Vérifiez que l''utilisateur est bien authentifié';
  RAISE NOTICE '2. Vérifiez que le chemin suit le format: business-images/{user_id}/{filename}';
  RAISE NOTICE '3. Vérifiez que les politiques RLS sont correctement configurées';
  RAISE NOTICE '4. Vérifiez que le bucket business-images existe et est public';
  RAISE NOTICE '5. Consultez les logs Supabase pour plus de détails';
END $$;
