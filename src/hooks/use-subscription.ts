import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../lib/services/subscription';
import { supabase } from '../lib/supabase';

// Hook pour récupérer les plans d'abonnement
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionService.getSubscriptionPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer l'abonnement actif d'un partenaire
export const usePartnerActiveSubscription = (partnerId: number) => {
  return useQuery({
    queryKey: ['partner-active-subscription', partnerId],
    queryFn: () => subscriptionService.getPartnerActiveSubscription(partnerId),
    enabled: !!partnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour récupérer l'historique des abonnements
export const usePartnerSubscriptionHistory = (partnerId: number) => {
  return useQuery({
    queryKey: ['partner-subscription-history', partnerId],
    queryFn: () => subscriptionService.getPartnerSubscriptionHistory(partnerId),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour créer un abonnement
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      partnerId,
      planId,
      billingInfo,
      paymentInfo
    }: {
      partnerId: number;
      planId: string;
      billingInfo: {
        email?: string;
        phone?: string;
        address?: string;
        tax_id?: string;
      };
      paymentInfo?: {
        method: 'card' | 'mobile_money' | 'bank_transfer';
        cardInfo?: {
          number: string;
          expiry: string;
          cvv: string;
          name: string;
        };
      };
    }) => subscriptionService.createSubscription(partnerId, planId, billingInfo, paymentInfo),
    onSuccess: (data, variables) => {
      // Invalider les requêtes liées aux abonnements
      queryClient.invalidateQueries({ queryKey: ['partner-active-subscription', variables.partnerId] });
      queryClient.invalidateQueries({ queryKey: ['partner-subscription-history', variables.partnerId] });
    },
  });
};

// Hook pour activer un abonnement
export const useActivateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.activateSubscription,
    onSuccess: () => {
      // Invalider toutes les requêtes d'abonnement
      queryClient.invalidateQueries({ queryKey: ['partner-active-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['partner-subscription-history'] });
    },
  });
};

// Hook pour annuler un abonnement
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) =>
      subscriptionService.cancelSubscription(subscriptionId, reason),
    onSuccess: () => {
      // Invalider toutes les requêtes d'abonnement
      queryClient.invalidateQueries({ queryKey: ['partner-active-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['partner-subscription-history'] });
    },
  });
};

// Hook pour renouveler un abonnement
export const useRenewSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, newPlanId }: { subscriptionId: string; newPlanId: string }) =>
      subscriptionService.renewSubscription(subscriptionId, newPlanId),
    onSuccess: () => {
      // Invalider toutes les requêtes d'abonnement
      queryClient.invalidateQueries({ queryKey: ['partner-active-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['partner-subscription-history'] });
    },
  });
};

// Hook pour mettre à jour les informations de facturation
export const useUpdateBillingInfo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      subscriptionId,
      billingInfo
    }: {
      subscriptionId: string;
      billingInfo: {
        email?: string;
        phone?: string;
        address?: string;
        tax_id?: string;
      };
    }) => subscriptionService.updateBillingInfo(subscriptionId, billingInfo),
    onSuccess: () => {
      // Invalider les requêtes d'abonnement
      queryClient.invalidateQueries({ queryKey: ['partner-active-subscription'] });
    },
  });
};

// Hook pour récupérer les paiements d'un abonnement
export const useSubscriptionPayments = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscription-payments', subscriptionId],
    queryFn: () => subscriptionService.getSubscriptionPayments(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour récupérer les factures d'un abonnement
export const useSubscriptionInvoices = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscription-invoices', subscriptionId],
    queryFn: () => subscriptionService.getSubscriptionInvoices(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer les notifications d'un abonnement
export const useSubscriptionNotifications = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscription-notifications', subscriptionId],
    queryFn: () => subscriptionService.getSubscriptionNotifications(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook pour marquer une notification comme lue
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Invalider les requêtes de notifications
      queryClient.invalidateQueries({ queryKey: ['subscription-notifications'] });
    },
  });
};

// Hook pour obtenir l'abonnement actuel de l'utilisateur connecté
export const useCurrentUserSubscription = () => {
  // Utiliser directement une requête pour obtenir le business du partenaire connecté
  const { data: partnerProfile } = useQuery({
    queryKey: ['partner-profile-for-subscription'],
    queryFn: async () => {
      // Récupérer l'utilisateur depuis Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.log('❌ [useCurrentUserSubscription] Aucun utilisateur connecté');
        return null;
      }
      
      console.log('🔍 [useCurrentUserSubscription] Utilisateur connecté:', user.id);
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('❌ [useCurrentUserSubscription] Erreur lors de la récupération du profil partenaire:', error);
        return null;
      }
      
      if (!data) {
        console.log('ℹ️ [useCurrentUserSubscription] Aucun business trouvé pour l\'utilisateur:', user.id);
        return null;
      }
      
      console.log('✅ [useCurrentUserSubscription] Profil partenaire trouvé:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const partnerId = partnerProfile?.id;
  
  console.log('🔍 [useCurrentUserSubscription] PartnerId pour abonnement:', partnerId);
  
  // Récupérer l'abonnement le plus récent (actif ou en attente)
  return useQuery({
    queryKey: ['current-user-subscription', partnerId],
    queryFn: async () => {
      if (!partnerId) {
        console.log('❌ [useCurrentUserSubscription] Pas de partnerId:', partnerId);
        return null;
      }
      
      console.log('🔍 [useCurrentUserSubscription] Recherche abonnement pour partnerId:', partnerId);
      
      // D'abord, essayer de trouver un abonnement lié au business
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('partner_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (subscriptionError) {
        console.error('❌ [useCurrentUserSubscription] Erreur lors de la récupération:', subscriptionError);
        return null;
      }
      
      if (subscriptionData) {
        console.log('✅ [useCurrentUserSubscription] Abonnement trouvé:', subscriptionData);
        return subscriptionData;
      }
      
      console.log('ℹ️ [useCurrentUserSubscription] Aucun abonnement trouvé pour partnerId:', partnerId);
      
      // Si pas d'abonnement lié au business, chercher les abonnements avec partner_id IS NULL
      // qui correspondent à l'email du partenaire
      const { data: nullPartnerSubscriptions, error: nullPartnerError } = await supabase
        .from('partner_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .is('partner_id', null)
        .eq('billing_email', partnerProfile?.email || '')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (nullPartnerError) {
        console.error('❌ [useCurrentUserSubscription] Erreur lors de la récupération des abonnements NULL:', nullPartnerError);
      } else if (nullPartnerSubscriptions) {
        console.log('✅ [useCurrentUserSubscription] Abonnement avec partner_id NULL trouvé:', nullPartnerSubscriptions);
        return {
          ...nullPartnerSubscriptions,
          _pending_link: true // Flag pour indiquer qu'il faut lier au business
        };
      }
      
      // Si pas d'abonnement, essayer de récupérer les informations depuis le business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_email', partnerProfile?.email || '')
        .eq('request_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (businessData && businessData.current_subscription_id) {
        console.log('✅ [useCurrentUserSubscription] Abonnement trouvé dans le business:', businessData.current_subscription_id);
        
        // Récupérer les détails de l'abonnement
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('partner_subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('id', businessData.current_subscription_id)
          .maybeSingle();
          
        if (subscriptionData) {
          return {
            ...subscriptionData,
            _from_request: true // Flag pour indiquer que c'est depuis une demande
          };
        }
      }
      
      return null;
    },
    enabled: !!partnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour vérifier l'accès partenaire et les besoins d'abonnement
export const usePartnerAccessCheck = () => {
  const { data: partnerProfile } = useQuery({
    queryKey: ['partner-profile-for-access-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Erreur lors de la récupération du business:', error);
        return null;
      }
      
      if (!data) {
        console.log('ℹ️ [usePartnerAccessCheck] Aucun business trouvé pour l\'utilisateur:', user.id);
        return null;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const businessId = partnerProfile?.id;
  
  return useQuery({
    queryKey: ['partner-access-check', businessId],
    queryFn: async () => {
      if (!businessId) {
        return {
          canAccess: false,
          reason: 'Business non trouvé',
          requiresSubscription: false
        };
      }
      
      return await subscriptionService.checkPartnerAccess(businessId);
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour obtenir l'historique de l'utilisateur connecté
export const useCurrentUserSubscriptionHistory = () => {
  // Utiliser directement une requête pour obtenir le business du partenaire connecté
  const { data: partnerProfile } = useQuery({
    queryKey: ['partner-profile-for-subscription-history'],
    queryFn: async () => {
      // Récupérer l'utilisateur depuis Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.log('❌ [useCurrentUserSubscriptionHistory] Aucun utilisateur connecté');
        return null;
      }
      
      console.log('🔍 [useCurrentUserSubscriptionHistory] Utilisateur connecté:', user.id);
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('❌ [useCurrentUserSubscriptionHistory] Erreur lors de la récupération du profil partenaire:', error);
        return null;
      }
      
      if (!data) {
        console.log('ℹ️ [useCurrentUserSubscriptionHistory] Aucun business trouvé pour l\'utilisateur:', user.id);
        return null;
      }
      
      console.log('✅ [useCurrentUserSubscriptionHistory] Profil partenaire trouvé:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const partnerId = partnerProfile?.id;
  
  return usePartnerSubscriptionHistory(partnerId);
};

// Hook pour activer un abonnement en attente
export const useActivatePendingSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.activatePendingSubscription,
    onSuccess: () => {
      // Invalider les requêtes d'abonnement
      queryClient.invalidateQueries({ queryKey: ['current-user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['partner-active-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['partner-subscription-history'] });
    },
  });
};

// Utilitaires pour les abonnements
export const subscriptionUtils = {
  // Formater le prix
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  // Formater la date
  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Calculer les jours restants
  getDaysRemaining: (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  // Obtenir le statut coloré
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'suspended':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  // Obtenir le statut traduit
  getStatusLabel: (status: string): string => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'expired':
        return 'Expiré';
      case 'cancelled':
        return 'Annulé';
      case 'pending':
        return 'En attente';
      case 'suspended':
        return 'Suspendu';
      default:
        return status;
    }
  },

  // Vérifier si l'abonnement expire bientôt (moins de 7 jours)
  isExpiringSoon: (endDate: string): boolean => {
    const daysRemaining = subscriptionUtils.getDaysRemaining(endDate);
    return daysRemaining <= 7 && daysRemaining > 0;
  },

  // Vérifier si l'abonnement est expiré
  isExpired: (endDate: string): boolean => {
    const daysRemaining = subscriptionUtils.getDaysRemaining(endDate);
    return daysRemaining === 0;
  },
}; 