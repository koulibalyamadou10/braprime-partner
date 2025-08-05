import { toast } from 'sonner';

export interface SubscriptionPaymentRequest {
  subscription_id: string;
  amount: number;
  payment_method: 'lengo_pay';
}

export interface SubscriptionPaymentResponse {
  success: boolean;
  pay_id?: string;
  payment_url?: string;
  message?: string;
  data?: {
    subscription_id: string;
    amount: number;
    currency: string;
    status: string;
    payment_url: string;
    pay_id: string;
    business_name: string;
  };
}

export const SubscriptionPaymentService = {
  // Créer un paiement d'abonnement via Lengo Pay
  async createSubscriptionPayment(request: SubscriptionPaymentRequest): Promise<SubscriptionPaymentResponse> {
    try {
      const response = await fetch('https://braprime-backend.vercel.app/api/subscriptions/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création du paiement');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la création du paiement d\'abonnement:', error);
      throw error;
    }
  },

  // Vérifier le statut d'un paiement d'abonnement
  async checkSubscriptionPaymentStatus(payId: string): Promise<{
    success: boolean;
    status: 'pending' | 'success' | 'failed';
    message?: string;
  }> {
    try {
      // Cette fonction peut être utilisée pour vérifier le statut
      // si nécessaire, mais Lengo Pay gère généralement tout automatiquement
      return {
        success: true,
        status: 'pending'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Erreur lors de la vérification'
      };
    }
  },

  // Rediriger vers l'interface de paiement
  redirectToPayment(paymentUrl: string): void {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      toast.error('URL de paiement invalide');
    }
  },

  // Formater le montant pour l'affichage
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}; 