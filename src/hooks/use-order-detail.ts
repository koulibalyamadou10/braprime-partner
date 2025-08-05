import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, type Order } from '@/lib/services/orders';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useOrderDetail = (orderId: string) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les détails de la commande
  const orderQuery = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      const { order, error } = await OrderService.getOrderById(orderId);
      if (error) {
        throw new Error(error);
      }
      if (!order) {
        throw new Error('Commande non trouvée');
      }
      // Vérifier que l'utilisateur est autorisé à voir cette commande
      if (order.user_id !== currentUser?.id) {
        throw new Error('Vous n\'êtes pas autorisé à voir cette commande');
      }
      return order;
    },
    enabled: !!orderId && !!currentUser?.id && isAuthenticated,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 10 * 1000, // 10 secondes pour les mises à jour en temps réel
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('non autorisé')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Mutation pour annuler une commande
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await OrderService.cancelOrder(orderId);
      if (error) {
        throw new Error(error);
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès",
      });
      // Invalider et refetch les données
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-customer-orders'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'annulation",
        variant: "destructive"
      });
    }
  });

  // Mutation pour ajouter une évaluation
  const addReviewMutation = useMutation({
    mutationFn: async ({ orderId, rating, review }: { orderId: string; rating: number; review: string }) => {
      const { error } = await OrderService.addCustomerReview(orderId, rating, review);
      if (error) {
        throw new Error(error);
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Évaluation ajoutée",
        description: "Votre évaluation a été enregistrée avec succès",
      });
      // Invalider et refetch les données
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'évaluation",
        variant: "destructive"
      });
    }
  });

  // Fonction pour rafraîchir manuellement
  const refreshOrder = () => {
    queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
  };

  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    error: orderQuery.error,
    isError: orderQuery.isError,
    refetch: orderQuery.refetch,
    refreshOrder,
    cancelOrder: cancelOrderMutation.mutate,
    isCancelling: cancelOrderMutation.isPending,
    addReview: addReviewMutation.mutate,
    isAddingReview: addReviewMutation.isPending,
  };
}; 