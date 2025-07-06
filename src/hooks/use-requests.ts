import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RequestsService, CreateRequestData } from '@/lib/services/requests';
import { Request } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useRequests = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer les demandes de l'utilisateur
  const {
    data: requests,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-requests'],
    queryFn: () => RequestsService.getUserRequests(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Vérifier si l'utilisateur a une demande en cours
  const {
    data: hasPendingRequest,
    isLoading: checkingPending
  } = useQuery({
    queryKey: ['user-has-pending-request'],
    queryFn: () => RequestsService.hasPendingRequest(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Obtenir le statut de la demande en cours
  const {
    data: currentRequestStatus,
    isLoading: loadingStatus
  } = useQuery({
    queryKey: ['user-current-request-status'],
    queryFn: () => RequestsService.getCurrentRequestStatus(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Mutation pour créer une demande
  const createRequestMutation = useMutation({
    mutationFn: (data: CreateRequestData) => RequestsService.createRequest(data),
    onSuccess: (result) => {
      if (result.data) {
        toast({
          title: "Demande soumise",
          description: "Votre demande a été soumise avec succès. Nous vous contacterons bientôt.",
        });
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['user-requests'] });
        queryClient.invalidateQueries({ queryKey: ['user-has-pending-request'] });
        queryClient.invalidateQueries({ queryKey: ['user-current-request-status'] });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la soumission de la demande",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création de la demande:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la soumission de la demande",
        variant: "destructive",
      });
    }
  });

  // Mutation pour mettre à jour une demande
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateRequestData> }) =>
      RequestsService.updateRequest(id, updates),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Demande mise à jour",
          description: "Votre demande a été mise à jour avec succès.",
        });
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['user-requests'] });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la mise à jour de la demande",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour de la demande:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la demande",
        variant: "destructive",
      });
    }
  });

  // Mutation pour annuler une demande
  const cancelRequestMutation = useMutation({
    mutationFn: (id: string) => RequestsService.cancelRequest(id),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Demande annulée",
          description: "Votre demande a été annulée avec succès.",
        });
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['user-requests'] });
        queryClient.invalidateQueries({ queryKey: ['user-has-pending-request'] });
        queryClient.invalidateQueries({ queryKey: ['user-current-request-status'] });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'annulation de la demande",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'annulation de la demande:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'annulation de la demande",
        variant: "destructive",
      });
    }
  });

  // Fonctions utilitaires
  const createRequest = (data: CreateRequestData) => {
    createRequestMutation.mutate(data);
  };

  const updateRequest = (id: string, updates: Partial<CreateRequestData>) => {
    updateRequestMutation.mutate({ id, updates });
  };

  const cancelRequest = (id: string) => {
    cancelRequestMutation.mutate(id);
  };

  return {
    // Données
    requests: requests?.data || [],
    hasPendingRequest: hasPendingRequest?.data || false,
    currentRequestStatus: currentRequestStatus?.data,
    
    // États de chargement
    isLoading,
    checkingPending,
    loadingStatus,
    isCreating: createRequestMutation.isPending,
    isUpdating: updateRequestMutation.isPending,
    isCancelling: cancelRequestMutation.isPending,
    
    // Erreurs
    error: error?.message || requests?.error,
    
    // Actions
    createRequest,
    updateRequest,
    cancelRequest,
    refetch,
    
    // Mutations (pour accéder aux états si nécessaire)
    createRequestMutation,
    updateRequestMutation,
    cancelRequestMutation
  };
};

// Hook pour une demande spécifique
export const useRequest = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: request,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-request', id],
    queryFn: () => RequestsService.getRequest(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    request: request?.data,
    isLoading,
    error: error?.message || request?.error
  };
}; 