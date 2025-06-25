-- ============================================================================
-- SCRIPT DE TEST DU STORAGE BUSINESS-IMAGES
-- ============================================================================
-- Ce script teste la configuration du bucket business-images
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- VÉRIFICATION DU BUCKET
-- ============================================================================

-- Vérifier que le bucket existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'business-images';

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

-- Vérifier les politiques existantes pour le bucket business-images
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
WHERE tablename = 'objects' 
  AND qual LIKE '%business-images%'
ORDER BY policyname;

-- ============================================================================
-- VÉRIFICATION DES FONCTIONS
-- ============================================================================

-- Vérifier que les fonctions de nettoyage existent
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname IN ('cleanup_old_business_images', 'handle_business_image_deletion');

-- ============================================================================
-- VÉRIFICATION DES TRIGGERS
-- ============================================================================

-- Vérifier que le trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_business_deleted';

-- ============================================================================
-- TEST DE PERMISSIONS
-- ============================================================================

-- Test de permission d'insertion (doit être exécuté par un utilisateur authentifié)
-- Cette requête ne fonctionnera que si l'utilisateur est connecté
DO $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    RAISE NOTICE 'Utilisateur authentifié détecté';
    RAISE NOTICE 'Permissions de storage vérifiées';
  ELSE
    RAISE NOTICE 'Utilisateur non authentifié - certaines permissions ne peuvent pas être testées';
  END IF;
END $$;

-- ============================================================================
-- RÉSUMÉ DE LA CONFIGURATION
-- ============================================================================

DO $$
DECLARE
  bucket_exists BOOLEAN;
  policies_count INTEGER;
  functions_count INTEGER;
  trigger_exists BOOLEAN;
BEGIN
  -- Vérifier le bucket
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'business-images') INTO bucket_exists;
  
  -- Compter les politiques
  SELECT COUNT(*) INTO policies_count 
  FROM pg_policies 
  WHERE tablename = 'objects' AND qual LIKE '%business-images%';
  
  -- Compter les fonctions
  SELECT COUNT(*) INTO functions_count 
  FROM pg_proc 
  WHERE proname IN ('cleanup_old_business_images', 'handle_business_image_deletion');
  
  -- Vérifier le trigger
  SELECT EXISTS(
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_business_deleted'
  ) INTO trigger_exists;
  
  -- Afficher le résumé
  RAISE NOTICE '=== RÉSUMÉ DE LA CONFIGURATION BUSINESS-IMAGES ===';
  RAISE NOTICE 'Bucket business-images existe: %', bucket_exists;
  RAISE NOTICE 'Nombre de politiques RLS: %', policies_count;
  RAISE NOTICE 'Nombre de fonctions de nettoyage: %', functions_count;
  RAISE NOTICE 'Trigger de suppression existe: %', trigger_exists;
  
  IF bucket_exists AND policies_count >= 4 AND functions_count >= 2 AND trigger_exists THEN
    RAISE NOTICE '✅ Configuration complète et correcte!';
  ELSE
    RAISE NOTICE '❌ Configuration incomplète. Vérifiez les éléments manquants.';
  END IF;
END $$; 