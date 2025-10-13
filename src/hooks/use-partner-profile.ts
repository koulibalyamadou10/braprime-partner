import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService, Business } from '@/lib/services/business';
import { useToast } from '@/components/ui/use-toast';

export const usePartnerProfile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // OPTIMISATION: Utiliser React Query avec cache au lieu de useState + useEffect
  const profileQuery = useQuery({
    queryKey: ['partner-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.role !== 'partner') {
        throw new Error('Utilisateur non autorisé');
      }
      
      const { data, error: fetchError } = await BusinessService.getPartnerProfile(currentUser.id);
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      return data;
    },
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 10 * 60 * 1000, // Cache de 10 minutes (le profil change rarement)
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.message === 'Utilisateur non autorisé') {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || 'Erreur lors de la récupération du profil',
        variant: "destructive",
      });
    }
  });

  // Fonction de refetch manuelle (pour compatibilité)
  const fetchProfile = () => {
    return profileQuery.refetch();
  };

  // Mettre à jour le profil
  const updateProfile = async (profileData: Partial<Business>) => {
    if (!currentUser || currentUser.role !== 'partner') {
      toast({
        title: "Erreur",
        description: "Utilisateur non autorisé",
        variant: "destructive",
      });
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { data, error: updateError } = await BusinessService.updatePartnerProfile(
        currentUser.id, 
        profileData
      );
      
      if (updateError) {
        setError(updateError);
        toast({
          title: "Erreur",
          description: updateError,
          variant: "destructive",
        });
        return false;
      } else {
        setProfile(data);
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        });
        return true;
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Upload d'image
  const uploadImage = async (file: File, type: 'logo' | 'cover_image') => {
    if (!currentUser || currentUser.role !== 'partner') {
      console.error('❌ [usePartnerProfile] Utilisateur non autorisé:', currentUser);
      toast({
        title: "Erreur",
        description: "Utilisateur non autorisé",
        variant: "destructive",
      });
      return false;
    }

    console.log('🔍 [usePartnerProfile] Début upload image:', {
      userId: currentUser.id,
      type,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    setIsUploading(true);
    setError(null);

    try {
      const { url, error: uploadError } = await BusinessService.uploadProfileImage(
        currentUser.id,
        file,
        type
      );

      if (uploadError) {
        console.error('❌ [usePartnerProfile] Erreur upload:', uploadError);
        setError(uploadError);
        toast({
          title: "Erreur d'upload",
          description: uploadError,
          variant: "destructive",
        });
        return false;
      } else if (url) {
        console.log('✅ [usePartnerProfile] Upload réussi, mise à jour du profil:', url);
        
        // Mettre à jour le profil avec la nouvelle URL d'image
        const updateData = type === 'logo' ? { logo: url } : { cover_image: url };
        const success = await updateProfile(updateData);
        
        if (success) {
          console.log('✅ [usePartnerProfile] Profil mis à jour avec succès');
          toast({
            title: "Succès",
            description: "Image uploadée avec succès",
          });
        } else {
          console.error('❌ [usePartnerProfile] Échec de la mise à jour du profil');
        }
        return success;
      }
      
      console.error('❌ [usePartnerProfile] Aucune URL retournée');
      return false;
    } catch (err) {
      console.error('❌ [usePartnerProfile] Erreur lors de l\'upload:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload de l\'image';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    profile: profileQuery.data || null,
    isLoading: profileQuery.isLoading,
    isUpdating,
    isUploading,
    error: profileQuery.error ? String(profileQuery.error) : null,
    fetchProfile,
    updateProfile,
    uploadImage,
    // Nouveaux champs pour React Query
    refetch: profileQuery.refetch,
    isFetching: profileQuery.isFetching,
  };
}; 