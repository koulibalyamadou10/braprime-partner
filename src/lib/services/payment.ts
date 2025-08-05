import { supabase } from '@/lib/supabase';

export interface PaymentRequest {
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  phone_number: string;
  order_number: string;
  business_name: string;
  customer_name: string;
  customer_email: string;
}

export interface PaymentResponse {
  success: boolean;
  pay_id?: string;
  payment_url?: string;
  message?: string;
  data?: {
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    payment_url: string;
  };
  error?: string;
  required?: string[];
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    id: string;
    order_id: string;
    pay_id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    created_at: string;
    updated_at: string;
    gateway_response: {
      status: string;
      pay_id: string;
      date: string;
      amount: number;
    };
  };
  source?: string;
  error?: string;
}

export class PaymentService {
  private static API_BASE_URL = import.meta.env.VITE_API_URL || 'https://braprime-backend.vercel.app';

  /**
   * Créer une URL de paiement via Lengo Pay
   */
  static async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/payments/lengo-pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur de paiement',
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  static async checkPaymentStatus(params: {
    pay_id?: string;
    order_id?: string;
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaymentStatusResponse> {
    try {
      console.log('PaymentService: checkPaymentStatus called with params:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.pay_id) queryParams.append('pay_id', params.pay_id);
      if (params.order_id) queryParams.append('order_id', params.order_id);
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const url = `${this.API_BASE_URL}/api/payments/status?${queryParams.toString()}`;
      console.log('PaymentService: Making request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('PaymentService: Response status:', response.status);
      console.log('PaymentService: Response ok:', response.ok);

      const data = await response.json();
      console.log('PaymentService: Response data:', data);
      
      return data;
    } catch (error) {
      console.error('PaymentService: Error checking payment status:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur de paiement',
      };
    }
  }

  /**
   * Enregistrer un paiement dans la base de données locale
   */
  static async savePaymentToDatabase(paymentData: {
    order_id: string;
    pay_id: string;
    amount: number;
    method: string;
    status: string;
    gateway_response?: Record<string, unknown>;
  }) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          order_id: paymentData.order_id,
          amount: paymentData.amount,
          method: paymentData.method,
          status: paymentData.status,
          transaction_id: paymentData.pay_id,
          gateway_response: paymentData.gateway_response || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'enregistrement du paiement:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      return { success: false, error: 'Erreur de base de données' };
    }
  }

  /**
   * Mettre à jour le statut d'un paiement
   */
  static async updatePaymentStatus(payId: string, status: string, gatewayResponse?: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: status,
          gateway_response: gatewayResponse || {},
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', payId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du paiement:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      return { success: false, error: 'Erreur de base de données' };
    }
  }

  /**
   * Récupérer l'historique des paiements d'un utilisateur
   */
  static async getUserPaymentHistory(userId: string, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            business_name,
            items
          )
        `)
        .eq('orders.user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return { success: false, error: 'Erreur de base de données' };
    }
  }

  /**
   * Formater le montant pour l'affichage
   */
  static formatAmount(amount: number, currency: string = 'GNF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Obtenir le label du statut de paiement
   */
  static getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      success: 'Réussi',
      failed: 'Échoué',
      cancelled: 'Annulé',
      refunded: 'Remboursé',
      initiated: 'Initiated',
      SUCCESS: 'Réussi',
      FAILED: 'Échoué',
      INITIATED: 'Initiated',
    };
    return statusMap[status] || status;
  }

  /**
   * Obtenir la couleur du badge de statut
   */
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800',
      initiated: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      INITIATED: 'bg-blue-100 text-blue-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }
} 