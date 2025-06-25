import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService, Business } from '@/lib/services/business';
import { useToast } from '@/components/ui/use-toast';

export const usePartnerProfile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le profil partenaire
  const fetchProfile = async () => {
    if (!currentUser || currentUser.role !== 'partner') {
      setError('Utilisateur non autorisé');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await BusinessService.getPartnerProfile(currentUser.id);
      
      if (fetchError) {
        setError(fetchError);
        toast({
          title: "Erreur",
          description: fetchError,
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la récupération du profil';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      toast({
        title: "Erreur",
        description: "Utilisateur non autorisé",
        variant: "destructive",
      });
      return false;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { url, error: uploadError } = await BusinessService.uploadProfileImage(
        currentUser.id,
        file,
        type
      );

      if (uploadError) {
        setError(uploadError);
        toast({
          title: "Erreur",
          description: uploadError,
          variant: "destructive",
        });
        return false;
      } else if (url) {
        // Mettre à jour le profil avec la nouvelle URL d'image
        const updateData = type === 'logo' ? { logo: url } : { cover_image: url };
        const success = await updateProfile(updateData);
        
        if (success) {
          toast({
            title: "Succès",
            description: "Image uploadée avec succès",
          });
        }
        return success;
      }
      return false;
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'upload de l\'image';
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

  // Charger le profil au montage du composant
  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  return {
    profile,
    isLoading,
    isUpdating,
    isUploading,
    error,
    fetchProfile,
    updateProfile,
    uploadImage,
  };
}; 