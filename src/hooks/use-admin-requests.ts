import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminRequestsService } from '@/lib/services/admin-requests';
import { Request, RequestStats, RequestFilters } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useAdminRequests = (filters: RequestFilters = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer toutes les demandes
  const {
    data: requests,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-requests', filters],
    queryFn: () => AdminRequestsService.getRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer les statistiques
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['admin-requests-stats'],
    queryFn: () => AdminRequestsService.getRequestStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ 
      id, 
      status, 
      admin_notes 
    }: { 
      id: string; 
      status: 'approved' | 'rejected' | 'under_review'; 
      admin_notes?: string;
    }) => AdminRequestsService.updateRequestStatus(id, status, admin_notes),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "Statut mis à jour",
          description: `La demande a été ${variables.status === 'approved' ? 'approuvée' : variables.status === 'rejected' ? 'rejetée' : 'mise en révision'}`,
        });
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
        queryClient.invalidateQueries({ queryKey: ['admin-requests-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la mise à jour du statut",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer une demande
  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => AdminRequestsService.deleteRequest(id),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Demande supprimée",
          description: "La demande a été supprimée avec succès",
        });
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
        queryClient.invalidateQueries({ queryKey: ['admin-requests-stats'] });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la suppression",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la demande",
        variant: "destructive",
      });
    }
  });

  // Mutation pour ajouter des notes admin
  const addNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => 
      AdminRequestsService.addAdminNotes(id, notes),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Notes ajoutées",
          description: "Les notes ont été ajoutées avec succès",
        });
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'ajout des notes",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'ajout des notes:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout des notes",
        variant: "destructive",
      });
    }
  });

  // Fonctions utilitaires
  const updateStatus = (id: string, status: 'approved' | 'rejected' | 'under_review', admin_notes?: string) => {
    updateStatusMutation.mutate({ id, status, admin_notes });
  };

  const deleteRequest = (id: string) => {
    deleteRequestMutation.mutate(id);
  };

  const addNotes = (id: string, notes: string) => {
    addNotesMutation.mutate({ id, notes });
  };

  return {
    // Données
    requests: requests?.data || [],
    stats: stats?.data,
    
    // États de chargement
    isLoading,
    statsLoading,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteRequestMutation.isPending,
    isAddingNotes: addNotesMutation.isPending,
    
    // Erreurs
    error: error?.message || requests?.error,
    
    // Actions
    updateStatus,
    deleteRequest,
    addNotes,
    refetch,
    
    // Mutations (pour accéder aux états si nécessaire)
    updateStatusMutation,
    deleteRequestMutation,
    addNotesMutation
  };
};

// Hook pour une demande spécifique
export const useAdminRequest = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: request,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-request', id],
    queryFn: () => AdminRequestsService.getRequest(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    request: request?.data,
    isLoading,
    error: error?.message || request?.error
  };
}; 