import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  plan_type: '1_month' | '3_months' | '6_months' | '12_months';
  name: string;
  description: string;
  duration_months: number;
  price: number;
  monthly_price: number;
  savings_percentage: number;
  features: string[];
  is_active: boolean;
}

export interface PartnerSubscription {
  id: string;
  partner_id: number;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  total_paid: number;
  monthly_amount: number;
  savings_amount: number;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
  business?: {
    id: number;
    name: string;
  };
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  amount: number;
  payment_method: 'card' | 'bank_transfer' | 'mobile_money' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transaction_reference?: string;
  payment_date?: string;
  processed_date?: string;
  failure_reason?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  payment_id?: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  due_date: string;
  paid_date?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionNotification {
  id: string;
  subscription_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

// Service pour les plans d'abonnement
export const subscriptionService = {
  // Récupérer tous les plans d'abonnement
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('duration_months', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des plans:', error);
      toast.error('Erreur lors du chargement des plans d\'abonnement');
      return [];
    }
  },

  // Vérifier l'accès partenaire et les besoins d'abonnement
  async checkPartnerAccess(businessId: number): Promise<{
    canAccess: boolean;
    reason?: string;
    requiresSubscription?: boolean;
    subscription?: PartnerSubscription | null;
    business?: Record<string, unknown>;
  }> {
    try {
      // Récupérer le business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError || !business) {
        return {
          canAccess: false,
          reason: 'Business non trouvé'
        };
      }

      // Vérifier si le business nécessite un abonnement
      if (business.requires_subscription) {
        // Récupérer l'abonnement actif
        const { data: subscription, error: subscriptionError } = await supabase
          .from('partner_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('partner_id', businessId)
          .eq('status', 'active')
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Erreur lors de la récupération de l\'abonnement:', subscriptionError);
        }

        // Si pas d'abonnement actif
        if (!subscription) {
          return {
            canAccess: false,
            reason: 'Abonnement requis',
            requiresSubscription: true,
            business
          };
        }

        // Vérifier si l'abonnement n'est pas expiré
        if (new Date(subscription.end_date) < new Date()) {
          return {
            canAccess: false,
            reason: 'Abonnement expiré',
            requiresSubscription: true,
            subscription,
            business
          };
        }

        // Accès autorisé
        return {
          canAccess: true,
          subscription,
          business
        };
      }

      // Si pas de subscription requise, accès autorisé
      return {
        canAccess: true,
        business
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'accès:', error);
      return {
        canAccess: false,
        reason: 'Erreur de vérification'
      };
    }
  },

  // Récupérer l'abonnement actif d'un partenaire
  async getPartnerActiveSubscription(partnerId: number): Promise<PartnerSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('partner_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*),
          business:businesses(id, name)
        `)
        .eq('partner_id', partnerId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      return null;
    }
  },

  // Récupérer l'historique des abonnements d'un partenaire
  async getPartnerSubscriptionHistory(partnerId: number): Promise<PartnerSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('partner_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*),
          business:businesses(id, name)
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
      return [];
    }
  },

  // Créer un nouvel abonnement
  async createSubscription(
    partnerId: number,
    planId: string,
    billingInfo: {
      email?: string;
      phone?: string;
      address?: string;
      tax_id?: string;
    },
    paymentInfo?: {
      method: 'card' | 'mobile_money' | 'bank_transfer';
      cardInfo?: {
        number: string;
        expiry: string;
        cvv: string;
        name: string;
      };
    }
  ): Promise<string | null> {
    try {
      // Simulation du processus de paiement
      if (paymentInfo) {
        // Ici on simulerait l'appel à l'API de paiement
        console.log('Simulation de paiement:', paymentInfo);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulation d'un succès de paiement (90% de chance)
        const paymentSuccess = Math.random() > 0.1;
        if (!paymentSuccess) {
          throw new Error('Paiement échoué');
        }
      }

      console.log('Création d\'abonnement avec:', { partnerId, planId, billingInfo });

      const { data, error } = await supabase
        .rpc('create_partner_subscription', {
          p_plan_id: planId
        });

      if (error) {
        console.error('Erreur Supabase:', error);
        if (error.code === '42501') {
          throw new Error('Erreur de permissions. Vérifiez que vous êtes connecté et avez les droits nécessaires.');
        }
        throw error;
      }
      
      console.log('Abonnement créé avec ID:', data);
      
      // Activer automatiquement le business après création de l'abonnement
      if (data) {
        try {
          const { data: activationResult, error: activationError } = await supabase
            .rpc('activate_business_after_subscription', {
              p_subscription_id: data
            });
          
          if (activationError) {
            console.error('Erreur lors de l\'activation du business:', activationError);
          } else {
            console.log('Business activé automatiquement:', activationResult);
          }
        } catch (activationError) {
          console.error('Erreur lors de l\'activation automatique:', activationError);
        }
      }
      
      toast.success('Abonnement créé avec succès');
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      toast.error('Erreur lors de la création de l\'abonnement');
      return null;
    }
  },

  // Activer un abonnement
  async activateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('activate_subscription', {
          p_subscription_id: subscriptionId
        });

      if (error) throw error;
      
      toast.success('Abonnement activé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'abonnement:', error);
      toast.error('Erreur lors de l\'activation de l\'abonnement');
      return false;
    }
  },

  // Activer un abonnement en attente
  async activatePendingSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('partner_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('status', 'pending');

      if (error) throw error;
      
      toast.success('Abonnement activé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'abonnement:', error);
      toast.error('Erreur lors de l\'activation de l\'abonnement');
      return false;
    }
  },

  // Récupérer les paiements d'un abonnement
  async getSubscriptionPayments(subscriptionId: string): Promise<SubscriptionPayment[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      return [];
    }
  },

  // Récupérer les factures d'un abonnement
  async getSubscriptionInvoices(subscriptionId: string): Promise<SubscriptionInvoice[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_invoices')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      return [];
    }
  },

  // Récupérer les notifications d'abonnement
  async getSubscriptionNotifications(subscriptionId: string): Promise<SubscriptionNotification[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_notifications')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  },

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscription_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      return false;
    }
  },

  // Mettre à jour les informations de facturation
  async updateBillingInfo(
    subscriptionId: string,
    billingInfo: {
      email?: string;
      phone?: string;
      address?: string;
      tax_id?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('partner_subscriptions')
        .update({
          billing_email: billingInfo.email,
          billing_phone: billingInfo.phone,
          billing_address: billingInfo.address,
          tax_id: billingInfo.tax_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast.success('Informations de facturation mises à jour');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations:', error);
      toast.error('Erreur lors de la mise à jour des informations');
      return false;
    }
  },

  // Annuler un abonnement
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('partner_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast.success('Abonnement annulé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      toast.error('Erreur lors de l\'annulation de l\'abonnement');
      return false;
    }
  },

  // Renouveler un abonnement
  async renewSubscription(subscriptionId: string, newPlanId: string): Promise<boolean> {
    try {
      // Récupérer le plan actuel et le nouveau plan
      const { data: currentSub } = await supabase
        .from('partner_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      const { data: newPlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .single();

      if (!currentSub || !newPlan) {
        throw new Error('Données manquantes pour le renouvellement');
      }

      // Créer un nouvel abonnement
      const newSubscriptionId = await this.createSubscription(
        currentSub.partner_id,
        newPlanId,
        {
          email: currentSub.billing_email,
          phone: currentSub.billing_phone,
          address: currentSub.billing_address,
          tax_id: currentSub.tax_id
        }
      );

      if (!newSubscriptionId) {
        throw new Error('Erreur lors de la création du nouvel abonnement');
      }

      // Annuler l'ancien abonnement
      await this.cancelSubscription(subscriptionId);

      toast.success('Abonnement renouvelé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error);
      toast.error('Erreur lors du renouvellement de l\'abonnement');
      return false;
    }
  }
}; 