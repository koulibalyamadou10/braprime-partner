-- ============================================================================
-- SCRIPT DE TEST DU STORAGE SUPABASE
-- ============================================================================
-- Ce script teste la configuration du storage

-- Vérifier que le bucket existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Vérifier les politiques RLS
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
  AND schemaname = 'storage';

-- Vérifier les fonctions créées
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname IN ('cleanup_old_profile_images', 'handle_profile_image_deletion');

-- Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_profile_deleted';

-- Test de création d'un objet de test (optionnel)
-- INSERT INTO storage.objects (bucket_id, name, owner, metadata)
-- VALUES ('avatars', 'test/test.txt', auth.uid(), '{"test": true}'); 