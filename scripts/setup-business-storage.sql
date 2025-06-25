-- ============================================================================
-- SCRIPT DE CONFIGURATION DU STORAGE SUPABASE POUR LES IMAGES DE COMMERCES
-- ============================================================================
-- Ce script configure le bucket de storage pour les images des restaurants/commerces
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- CRÉATION DU BUCKET BUSINESS-IMAGES
-- ============================================================================

-- Créer le bucket pour les images de commerces (si il n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-images',
  'business-images',
  true,
  10485760, -- 10MB en bytes (plus grand pour les images de couverture)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLITIQUES RLS POUR LE STORAGE BUSINESS-IMAGES
-- ============================================================================

-- Politique pour permettre aux partenaires d'uploader leurs propres images
CREATE POLICY "Partners can upload their own business images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
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
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique pour permettre aux partenaires de supprimer leurs propres images
CREATE POLICY "Partners can delete their own business images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- ============================================================================
-- FONCTION POUR NETTOYER LES ANCIENNES IMAGES
-- ============================================================================

-- Fonction pour supprimer automatiquement les anciennes images de commerces
CREATE OR REPLACE FUNCTION cleanup_old_business_images()
RETURNS void AS $$
BEGIN
  -- Supprimer les images de commerces qui ne sont plus référencées dans businesses
  DELETE FROM storage.objects 
  WHERE bucket_id = 'business-images' 
    AND (storage.foldername(name))[1] = 'business-images'
    AND NOT EXISTS (
      SELECT 1 FROM businesses 
      WHERE owner_id::text = (storage.foldername(name))[2]
        AND (logo LIKE '%' || name || '%' OR cover_image LIKE '%' || name || '%')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER POUR NETTOYER LES IMAGES LORS DE LA SUPPRESSION D'UN COMMERCE
-- ============================================================================

-- Fonction pour supprimer les images lors de la suppression d'un commerce
CREATE OR REPLACE FUNCTION handle_business_image_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer les images du commerce supprimé
  DELETE FROM storage.objects 
  WHERE bucket_id = 'business-images' 
    AND (storage.foldername(name))[1] = 'business-images'
    AND (storage.foldername(name))[2] = OLD.owner_id::text;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour supprimer les images lors de la suppression d'un commerce
DROP TRIGGER IF EXISTS on_business_deleted ON businesses;
CREATE TRIGGER on_business_deleted
  AFTER DELETE ON businesses
  FOR EACH ROW EXECUTE FUNCTION handle_business_image_deletion();

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Configuration du storage business-images terminée!';
  RAISE NOTICE 'Bucket "business-images" créé avec succès.';
  RAISE NOTICE 'Politiques RLS configurées pour la sécurité.';
  RAISE NOTICE 'Fonctions de nettoyage automatique ajoutées.';
END $$; 