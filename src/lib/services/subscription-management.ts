import { supabase } from '@/lib/supabase';

export interface SubscriptionActionRequest {
  subscription_id: string;
  reason?: string;
  duration_days?: number;
}

export interface SubscriptionActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const SubscriptionManagementService = {
  /**
   * Désactiver définitivement un abonnement
   */
  async deactivateSubscription(request: SubscriptionActionRequest): Promise<SubscriptionActionResponse> {
    try {
      const { data, error } = await supabase
        .rpc('deactivate_subscription', {
          p_subscription_id: request.subscription_id,
          p_reason: request.reason || null
        });

      if (error) {
        console.error('Erreur lors de la désactivation:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Abonnement désactivé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      return {
        success: false,
        error: 'Erreur lors de la désactivation de l\'abonnement'
      };
    }
  },

  /**
   * Réactiver un abonnement
   */
  async reactivateSubscription(request: SubscriptionActionRequest): Promise<SubscriptionActionResponse> {
    try {
      const { data, error } = await supabase
        .rpc('reactivate_subscription', {
          p_subscription_id: request.subscription_id
        });

      if (error) {
        console.error('Erreur lors de la réactivation:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Abonnement réactivé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      return {
        success: false,
        error: 'Erreur lors de la réactivation de l\'abonnement'
      };
    }
  },

  /**
   * Suspendre temporairement un abonnement
   */
  async suspendSubscription(request: SubscriptionActionRequest): Promise<SubscriptionActionResponse> {
    try {
      const { data, error } = await supabase
        .rpc('suspend_subscription', {
          p_subscription_id: request.subscription_id,
          p_duration_days: request.duration_days || 7,
          p_reason: request.reason || null
        });

      if (error) {
        console.error('Erreur lors de la suspension:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: `Abonnement suspendu pour ${request.duration_days || 7} jours`
      };
    } catch (error) {
      console.error('Erreur lors de la suspension:', error);
      return {
        success: false,
        error: 'Erreur lors de la suspension de l\'abonnement'
      };
    }
  },

  /**
   * Obtenir l'historique des actions sur un abonnement
   */
  async getSubscriptionHistory(subscriptionId: string) {
    try {
      const { data, error } = await supabase
        .from('subscription_notifications')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  },

  /**
   * Obtenir les statistiques des abonnements
   */
  async getSubscriptionStats() {
    try {
      const { data, error } = await supabase
        .from('partner_subscriptions')
        .select('status');

      if (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        return {};
      }

      const stats = {
        active: 0,
        pending: 0,
        inactive: 0,
        suspended: 0,
        expired: 0
      };

      data?.forEach(subscription => {
        if (stats.hasOwnProperty(subscription.status)) {
          stats[subscription.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return {};
    }
  }
}; 