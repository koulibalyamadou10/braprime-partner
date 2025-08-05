import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubscriptionManagementService } from '@/lib/services/subscription-management';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useSubscriptionManagement = () => {
  const queryClient = useQueryClient();

  // Récupérer tous les abonnements
  const useSubscriptions = () => {
    return useQuery({
      queryKey: ['subscriptions'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('partner_subscriptions')
          .select(`
            *,
            business:businesses!partner_id(name, email, phone),
            plan:subscription_plans(name, plan_type, price)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        return data || [];
      }
    });
  };

  // Récupérer les statistiques
  const useSubscriptionStats = () => {
    return useQuery({
      queryKey: ['subscription-stats'],
      queryFn: SubscriptionManagementService.getSubscriptionStats
    });
  };

  // Désactiver un abonnement
  const useDeactivateSubscription = () => {
    return useMutation({
      mutationFn: SubscriptionManagementService.deactivateSubscription,
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || 'Abonnement désactivé avec succès');
          queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
          queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
        } else {
          toast.error(data.error || 'Erreur lors de la désactivation');
        }
      },
      onError: (error) => {
        console.error('Erreur lors de la désactivation:', error);
        toast.error('Erreur lors de la désactivation de l\'abonnement');
      }
    });
  };

  // Réactiver un abonnement
  const useReactivateSubscription = () => {
    return useMutation({
      mutationFn: SubscriptionManagementService.reactivateSubscription,
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || 'Abonnement réactivé avec succès');
          queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
          queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
        } else {
          toast.error(data.error || 'Erreur lors de la réactivation');
        }
      },
      onError: (error) => {
        console.error('Erreur lors de la réactivation:', error);
        toast.error('Erreur lors de la réactivation de l\'abonnement');
      }
    });
  };

  // Suspendre un abonnement
  const useSuspendSubscription = () => {
    return useMutation({
      mutationFn: SubscriptionManagementService.suspendSubscription,
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || 'Abonnement suspendu avec succès');
          queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
          queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
        } else {
          toast.error(data.error || 'Erreur lors de la suspension');
        }
      },
      onError: (error) => {
        console.error('Erreur lors de la suspension:', error);
        toast.error('Erreur lors de la suspension de l\'abonnement');
      }
    });
  };

  // Récupérer l'historique d'un abonnement
  const useSubscriptionHistory = (subscriptionId: string) => {
    return useQuery({
      queryKey: ['subscription-history', subscriptionId],
      queryFn: () => SubscriptionManagementService.getSubscriptionHistory(subscriptionId),
      enabled: !!subscriptionId
    });
  };

  return {
    useSubscriptions,
    useSubscriptionStats,
    useDeactivateSubscription,
    useReactivateSubscription,
    useSuspendSubscription,
    useSubscriptionHistory
  };
}; 