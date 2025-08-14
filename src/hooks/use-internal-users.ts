import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InternalUsersService, CreateInternalUserData, UpdateInternalUserData, InternalUser } from '@/lib/services/internal-users';

export const useInternalUsers = (businessId: number) => {
  const queryClient = useQueryClient();

  // Récupérer tous les utilisateurs internes
  const {
    data: internalUsers,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['internal-users', businessId],
    queryFn: async () => {
      const result = await InternalUsersService.getBusinessInternalUsers(businessId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Créer un nouvel utilisateur interne
  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<CreateInternalUserData, 'business_id' | 'created_by'>) => {
      const result = await InternalUsersService.createInternalUser({
        ...userData,
        business_id: businessId,
        created_by: 'current_user_id' // À remplacer par l'ID de l'utilisateur connecté
      });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (newUser) => {
      toast.success('Utilisateur interne créé avec succès !');
      // Invalider et rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['internal-users', businessId] });
      // Ajouter le nouvel utilisateur à la liste
      queryClient.setQueryData(['internal-users', businessId], (old: InternalUser[] = []) => {
        return [newUser, ...old];
      });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création : ${error.message}`);
    }
  });

  // Mettre à jour un utilisateur interne
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updateData }: { userId: string; updateData: UpdateInternalUserData }) => {
      const result = await InternalUsersService.updateInternalUser(userId, updateData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedUser) => {
      toast.success('Utilisateur mis à jour avec succès !');
      // Mettre à jour la liste
      queryClient.setQueryData(['internal-users', businessId], (old: InternalUser[] = []) => {
        return old.map(user => user.id === updatedUser.id ? updatedUser : user);
      });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    }
  });

  // Supprimer un utilisateur interne
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await InternalUsersService.deleteInternalUser(userId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      toast.success('Utilisateur supprimé avec succès !');
      // Invalider et rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['internal-users', businessId] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    }
  });

  // Vérifier si un email existe
  const checkEmailExists = async (email: string) => {
    const result = await InternalUsersService.checkEmailExists(email, businessId);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.exists;
  };

  return {
    // Données
    internalUsers: internalUsers || [],
    isLoading,
    error,
    
    // Actions
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    checkEmailExists,
    refetch,
    
    // États des mutations
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    
    // Erreurs des mutations
    createError: createUserMutation.error,
    updateError: updateUserMutation.error,
    deleteError: deleteUserMutation.error
  };
};
