-- ============================================================================
-- SCRIPT DE CONFIGURATION DU STORAGE SUPABASE POUR BRAPRIME
-- ============================================================================
-- Ce script configure le bucket de storage pour les images de profil
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- CRÉATION DU BUCKET AVATARS
-- ============================================================================

-- Créer le bucket pour les avatars (si il n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLITIQUES RLS POUR LE STORAGE
-- ============================================================================

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres images
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profile-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique pour permettre aux utilisateurs de voir toutes les images publiques
CREATE POLICY "Anyone can view public avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres images
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profile-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profile-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- ============================================================================
-- FONCTION POUR NETTOYER LES ANCIENNES IMAGES
-- ============================================================================

-- Fonction pour supprimer automatiquement les anciennes images de profil
CREATE OR REPLACE FUNCTION cleanup_old_profile_images()
RETURNS void AS $$
BEGIN
  -- Supprimer les images de profil qui ne sont plus référencées dans user_profiles
  DELETE FROM storage.objects 
  WHERE bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = 'profile-images'
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE profile_image LIKE '%' || (storage.foldername(name))[2] || '%'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER POUR NETTOYER LES IMAGES LORS DE LA SUPPRESSION D'UN PROFIL
-- ============================================================================

-- Fonction pour supprimer les images lors de la suppression d'un profil
CREATE OR REPLACE FUNCTION handle_profile_image_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer les images de profil de l'utilisateur supprimé
  DELETE FROM storage.objects 
  WHERE bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = 'profile-images'
    AND (storage.foldername(name))[2] = OLD.id::text;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour supprimer les images lors de la suppression d'un profil
DROP TRIGGER IF EXISTS on_profile_deleted ON user_profiles;
CREATE TRIGGER on_profile_deleted
  AFTER DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profile_image_deletion();

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Configuration du storage Supabase terminée!';
  RAISE NOTICE 'Bucket "avatars" créé avec succès.';
  RAISE NOTICE 'Politiques RLS configurées pour la sécurité.';
  RAISE NOTICE 'Fonctions de nettoyage automatique ajoutées.';
END $$; 