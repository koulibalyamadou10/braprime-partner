import { useState, useEffect } from 'react';
import { UserProfileService, UserProfile, UserAddress, UpdateProfileData, CreateAddressData } from '@/lib/services/user-profile';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil et les adresses
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [profileResult, addressesResult] = await Promise.all([
        UserProfileService.getCurrentUserProfile(),
        UserProfileService.getUserAddresses()
      ]);

      if (profileResult.error) {
        setError(profileResult.error);
      } else {
        setProfile(profileResult.data);
      }

      if (addressesResult.error) {
        console.error('Erreur lors du chargement des adresses:', addressesResult.error);
      } else {
        setAddresses(addressesResult.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Mettre à jour le profil
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const result = await UserProfileService.updateProfile(data);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      setProfile(result.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de la mise à jour du profil' };
    }
  };

  // Uploader une image de profil
  const uploadProfileImage = async (file: File) => {
    try {
      const result = await UserProfileService.uploadProfileImage(file);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      // Mettre à jour le profil avec la nouvelle image
      const updateResult = await UserProfileService.updateProfile({
        profile_image: result.data
      });

      if (updateResult.error) {
        return { success: false, error: updateResult.error };
      }

      setProfile(updateResult.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de l\'upload de l\'image' };
    }
  };

  // Supprimer l'image de profil
  const deleteProfileImage = async () => {
    if (!profile?.profile_image) {
      return { success: false, error: 'Aucune image de profil à supprimer' };
    }

    try {
      const deleteResult = await UserProfileService.deleteProfileImage(profile.profile_image);
      
      if (deleteResult.error) {
        return { success: false, error: deleteResult.error };
      }

      // Mettre à jour le profil sans image
      const updateResult = await UserProfileService.updateProfile({
        profile_image: null
      });

      if (updateResult.error) {
        return { success: false, error: updateResult.error };
      }

      setProfile(updateResult.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de la suppression de l\'image' };
    }
  };

  // Créer une adresse
  const createAddress = async (data: CreateAddressData) => {
    try {
      const result = await UserProfileService.createAddress(data);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      setAddresses(prev => [result.data!, ...prev]);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de la création de l\'adresse' };
    }
  };

  // Mettre à jour une adresse
  const updateAddress = async (addressId: string, data: Partial<CreateAddressData>) => {
    try {
      const result = await UserProfileService.updateAddress(addressId, data);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      setAddresses(prev => prev.map(addr => 
        addr.id === addressId ? result.data! : addr
      ));
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de la mise à jour de l\'adresse' };
    }
  };

  // Supprimer une adresse
  const deleteAddress = async (addressId: string) => {
    try {
      const result = await UserProfileService.deleteAddress(addressId);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de la suppression de l\'adresse' };
    }
  };

  // Définir une adresse comme défaut
  const setDefaultAddress = async (addressId: string) => {
    try {
      const result = await UserProfileService.setDefaultAddress(addressId);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      // Mettre à jour l'état local
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Erreur lors de la définition de l\'adresse par défaut' };
    }
  };

  // Changer le mot de passe
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const result = await UserProfileService.changePassword(currentPassword, newPassword);
      return result;
    } catch (err) {
      return { success: false, error: 'Erreur lors du changement de mot de passe' };
    }
  };

  // Supprimer le compte
  const deleteAccount = async () => {
    try {
      const result = await UserProfileService.deleteAccount();
      return result;
    } catch (err) {
      return { success: false, error: 'Erreur lors de la suppression du compte' };
    }
  };

  return {
    profile,
    addresses,
    isLoading,
    error,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    changePassword,
    deleteAccount,
    refreshProfile: loadProfile
  };
}; 