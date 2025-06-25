import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export const UploadService = {
  // Upload une image vers Supabase Storage
  uploadImage: async (file: File, folder: string = 'menu-items'): Promise<UploadResult> => {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload:', error);
        return { url: '', path: '', error: error.message };
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  // Supprimer une image de Supabase Storage
  deleteImage: async (path: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.storage
        .from('business-images')
        .remove([path]);

      if (error) {
        console.error('Erreur suppression:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return { 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  // Redimensionner une image côté client (optionnel)
  resizeImage: async (file: File, maxWidth: number = 800, maxHeight: number = 600): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Redimensionner
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Valider un fichier image
  validateImage: (file: File): { valid: boolean; error?: string } => {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Le fichier doit être une image' };
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'L\'image ne doit pas dépasser 5MB' };
    }

    // Vérifier les formats supportés
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Format non supporté. Utilisez JPG, PNG ou WebP' };
    }

    return { valid: true };
  }
}; 