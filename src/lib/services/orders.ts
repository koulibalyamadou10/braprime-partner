import { supabase } from '@/lib/supabase';
import { EmailService } from './email';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  business_id: number;
  business_name: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  delivery_fee: number;
  tax: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address: string;
  delivery_instructions?: string;
  landmark?: string;
  payment_method: 'cash' | 'card' | 'mobile_money' | 'online';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'out_for_delivery'
  | 'delivered' 
  | 'cancelled';

export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export class OrderService {
  /**
   * Récupérer une commande par ID
   */
  static async getOrderById(orderId: string): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          businesses!inner(name)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        return { order: null, error: error.message };
      }

      if (!data) {
        return { order: null, error: 'Commande non trouvée' };
      }

      const order: Order = {
        id: data.id,
        order_number: data.order_number,
        user_id: data.user_id,
        business_id: data.business_id,
        business_name: data.businesses?.name || 'Commerce',
        items: data.items || [],
        status: data.status,
        total: data.total,
        delivery_fee: data.delivery_fee,
        tax: data.tax,
        grand_total: data.grand_total,
        delivery_method: data.delivery_method,
        delivery_address: data.delivery_address,
        delivery_instructions: data.delivery_instructions,
        landmark: data.landmark,
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        estimated_delivery: data.estimated_delivery,
        actual_delivery: data.actual_delivery,
        driver_id: data.driver_id,
        driver_name: data.driver_name,
        driver_phone: data.driver_phone
      };

      return { order, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return { order: null, error: 'Erreur lors de la récupération de la commande' };
    }
  }

  /**
   * Mettre à jour le statut d'une commande avec notification email
   */
  static async updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    driverInfo?: { name: string; phone: string }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Récupérer la commande actuelle
      const { order: currentOrder, error: fetchError } = await this.getOrderById(orderId);
      if (fetchError || !currentOrder) {
        return { success: false, error: fetchError || 'Commande non trouvée' };
      }

      const oldStatus = currentOrder.status;

      // 2. Mettre à jour le statut
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Ajouter les informations du chauffeur si fournies
      if (driverInfo) {
        updateData.driver_name = driverInfo.name;
        updateData.driver_phone = driverInfo.phone;
      }

      // Mettre à jour estimated_delivery pour certains statuts
      if (newStatus === 'out_for_delivery') {
        updateData.estimated_delivery = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
      }

      if (newStatus === 'delivered') {
        updateData.actual_delivery = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // 3. Récupérer les informations utilisateur
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('id', currentOrder.user_id)
        .single();

      if (userError) {
        console.warn('Erreur lors de la récupération des données utilisateur:', userError);
      }

      // 4. Envoyer l'email de notification de changement de statut
      if (userData && oldStatus !== newStatus) {
        try {
          const statusLabels = {
            pending: 'En attente',
            confirmed: 'Confirmée',
            preparing: 'En préparation',
            ready: 'Prête',
            picked_up: 'Récupérée',
            out_for_delivery: 'En cours de livraison',
            delivered: 'Livrée',
            cancelled: 'Annulée'
          };

          await EmailService.sendOrderStatusUpdate({
            order_id: orderId,
            user_name: userData.name,
            user_email: userData.email,
            business_name: currentOrder.business_name,
            order_number: currentOrder.order_number,
            old_status: oldStatus,
            new_status: newStatus,
            status_label: statusLabels[newStatus] || newStatus,
            estimated_delivery: updateData.estimated_delivery,
            driver_name: driverInfo?.name,
            driver_phone: driverInfo?.phone,
            updated_at: new Date().toISOString()
          });
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi de l\'email de notification:', emailError);
          // Ne pas faire échouer la mise à jour du statut à cause de l'email
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du statut' };
    }
  }

  /**
   * Créer une nouvelle commande avec notification email
   */
  static async createOrder(orderData: any): Promise<{ order: Order | null; error: string | null }> {
    try {
      // 1. Créer la commande
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        return { order: null, error: error.message };
      }

      // 2. Récupérer les informations utilisateur pour l'email
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('id', orderData.user_id)
        .single();

      if (userError) {
        console.warn('Erreur lors de la récupération des données utilisateur:', userError);
      }

      // 3. Envoyer l'email de confirmation de commande
      if (userData) {
        try {
          await EmailService.sendOrderConfirmationEmail(data, userData);
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
          // Ne pas faire échouer la création de commande à cause de l'email
        }
      }

      return { order: data, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return { order: null, error: 'Erreur lors de la création de la commande' };
    }
  }
} 