-- ============================================================================
-- SCRIPT DE CORRECTION DES POLITIQUES RLS POUR LES IMAGES DE COMMERCES
-- ============================================================================
-- Ce script corrige les politiques RLS pour permettre l'upload d'images
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS EXISTANTES
-- ============================================================================

SELECT '=== POLITIQUES RLS EXISTANTES ===' as info;

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
  AND schemaname = 'storage'
  AND policyname LIKE '%business%';

-- ============================================================================
-- SUPPRESSION DES ANCIENNES POLITIQUES (si elles existent)
-- ============================================================================

DROP POLICY IF EXISTS "Partners can upload their own business images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public business images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can update their own business images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete their own business images" ON storage.objects;

-- ============================================================================
-- CRÉATION DES NOUVELLES POLITIQUES RLS CORRIGÉES
-- ============================================================================

-- Politique pour permettre aux partenaires d'uploader leurs propres images
CREATE POLICY "Partners can upload their own business images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique pour permettre à tous de voir les images publiques des commerces
CREATE POLICY "Anyone can view public business images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-images'
  );

-- Politique pour permettre aux partenaires de mettre à jour leurs propres images
CREATE POLICY "Partners can update their own business images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique pour permettre aux partenaires de supprimer leurs propres images
CREATE POLICY "Partners can delete their own business images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS CRÉÉES
-- ============================================================================

SELECT '=== NOUVELLES POLITIQUES RLS ===' as info;

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

-- ============================================================================
-- VÉRIFICATION DU BUCKET BUSINESS-IMAGES
-- ============================================================================

SELECT '=== VÉRIFICATION DU BUCKET ===' as info;

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'business-images';

-- ============================================================================
-- TEST DE PERMISSIONS (simulation)
-- ============================================================================

SELECT '=== TEST DE PERMISSIONS ===' as info;

-- Vérifier que RLS est activé sur storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Correction des politiques RLS terminée!';
  RAISE NOTICE '✅ Politiques RLS mises à jour pour business-images';
  RAISE NOTICE '✅ Les partenaires peuvent maintenant uploader leurs images';
  RAISE NOTICE '✅ Vérifiez les logs pour confirmer le fonctionnement';
END $$;
