import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InternalUsersService, CreateInternalUserData, UpdateInternalUserData, InternalUser } from '@/lib/services/internal-users';
import { supabase } from '@/lib/supabase';

export const useInternalUsers = (businessId: number, currentUserId?: string) => {
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
      if (!currentUserId) {
        throw new Error('ID de l\'utilisateur connecté requis');
      }
      
      const result = await InternalUsersService.createInternalUser({
        ...userData,
        business_id: businessId,
        created_by: currentUserId
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

// verifier si l'utilisateur est interne ou pas
export async function isInternalUser(): Promise<{isInternal: boolean, data: InternalUser | null, user: {}, businessId: number | null, businessData: {} | null, businessType: {} | null}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const { data, error } = await supabase
      .from('profil_internal_user')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);


    if (error) {
      console.error('Erreur dans isInternalUser:', error);
      throw new Error(error.message);
    }

    if( data && data.length > 0 ) {
      // OPTIMISATION: Récupérer le business ET le business_type en UNE SEULE requête avec jointure
      const {data: businesses, error: businessesError} = await supabase
      .from('businesses')
      .select(`
        *,
        business_types!inner(*)
      `)
      .eq('owner_id', data[0].created_by)
      .limit(1);

      if( businessesError ) {
        console.error('Erreur dans isInternalUser:', businessesError);
        throw new Error(businessesError.message);
      }

      if( businesses && businesses.length > 0 ) {
        return {
          isInternal: true, 
          data: data[0], 
          user: user, 
          businessId: businesses[0].id,
          businessData: businesses[0],
          businessType: businesses[0].business_types || null
        }
      }
    
      return {
        isInternal: true, 
        data: data[0], 
        user: user, 
        businessId: data[0].business_id,
        businessData: data[0].business,
        businessType: null
      }
    }

    // OPTIMISATION: Récupérer le business ET le business_type en UNE SEULE requête avec jointure
    console.log('🔍 Recherche business pour owner_id:', user.id);
    const {data: businesses, error: businessesError} = await supabase
      .from('businesses')
      .select(`
        *,
        business_types!inner(*)
      `)
      .eq('owner_id', user.id)
      .limit(1);

    if( businessesError ) {
      console.error('❌ Erreur dans isInternalUser (businesses):', businessesError);
      throw new Error(businessesError.message);
    }

    console.log('📊 Businesses trouvés:', businesses?.length || 0, businesses);

    if( businesses && businesses.length > 0 ) {
      return {
        isInternal: false, 
        data: null, 
        user: user, 
        businessId: businesses[0].id,
        businessData: businesses[0],
        businessType: businesses[0].business_types || null
      }
    }

    return {
      isInternal: false, 
      data: null, 
      user: user, 
      businessId: null, 
      businessData: null,
      businessType: null
    }
  } catch (error) {
    console.error('Erreur dans isInternalUser:', error);
    throw error;
  }
}