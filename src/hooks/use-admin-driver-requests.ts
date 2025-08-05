import { AdminDriverRequestsService, DriverRequestFilters } from '@/lib/services/admin-driver-requests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAdminDriverRequests = (filters: DriverRequestFilters = {}) => {
  const queryClient = useQueryClient();

  // Récupérer les demandes de chauffeurs
  const {
    data: requests = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-driver-requests', filters],
    queryFn: () => AdminDriverRequestsService.getDriverRequests(filters),
    staleTime: 30000, // 30 secondes
  });

  // Récupérer les statistiques
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['admin-driver-request-stats'],
    queryFn: () => AdminDriverRequestsService.getDriverRequestStats(),
    staleTime: 60000, // 1 minute
  });

  // Mutation pour approuver une demande
  const approveMutation = useMutation({
    mutationFn: ({ driverId, adminNotes }: { driverId: string; adminNotes?: string }) =>
      AdminDriverRequestsService.approveDriverRequest(driverId, adminNotes),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Demande de chauffeur approuvée avec succès');
        queryClient.invalidateQueries({ queryKey: ['admin-driver-requests'] });
        queryClient.invalidateQueries({ queryKey: ['admin-driver-request-stats'] });
      } else {
        toast.error(result.error || 'Erreur lors de l\'approbation');
      }
    },
    onError: (error) => {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  });

  // Mutation pour rejeter une demande
  const rejectMutation = useMutation({
    mutationFn: ({ driverId, reason }: { driverId: string; reason: string }) =>
      AdminDriverRequestsService.rejectDriverRequest(driverId, reason),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Demande de chauffeur rejetée avec succès');
        queryClient.invalidateQueries({ queryKey: ['admin-driver-requests'] });
        queryClient.invalidateQueries({ queryKey: ['admin-driver-request-stats'] });
      } else {
        toast.error(result.error || 'Erreur lors du rejet');
      }
    },
    onError: (error) => {
      console.error('Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet');
    }
  });

  // Mutation pour créer un compte chauffeur
  const createAccountMutation = useMutation({
    mutationFn: (driverId: string) => AdminDriverRequestsService.createDriverAccount(driverId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Compte chauffeur créé avec succès');
        queryClient.invalidateQueries({ queryKey: ['admin-driver-requests'] });
        queryClient.invalidateQueries({ queryKey: ['admin-driver-request-stats'] });
      } else {
        toast.error(result.error || 'Erreur lors de la création du compte');
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la création du compte:', error);
      toast.error('Erreur lors de la création du compte');
    }
  });

  // Mutation pour supprimer une demande
  const deleteMutation = useMutation({
    mutationFn: (driverId: string) => AdminDriverRequestsService.deleteDriverRequest(driverId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Demande de chauffeur supprimée avec succès');
        queryClient.invalidateQueries({ queryKey: ['admin-driver-requests'] });
        queryClient.invalidateQueries({ queryKey: ['admin-driver-request-stats'] });
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  return {
    // Données
    requests,
    stats,
    isLoading,
    statsLoading,
    error,
    statsError,

    // Actions
    approveRequest: approveMutation.mutate,
    rejectRequest: rejectMutation.mutate,
    createDriverAccount: createAccountMutation.mutate,
    deleteRequest: deleteMutation.mutate,

    // États de chargement
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCreatingAccount: createAccountMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Utilitaires
    refetch
  };
}; 