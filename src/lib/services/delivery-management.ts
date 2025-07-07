import { supabase } from '../supabase';

export interface DeliverySlot {
  id: number;
  business_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  max_orders_per_slot: number;
}

export interface AvailableOrder {
  id: string;
  order_id: string;
  business_id: number;
  business_name: string;
  delivery_address: string;
  estimated_delivery_time: string;
  delivery_fee: number;
  total_amount: number;
  is_urgent: boolean;
  expires_at: string;
  created_at: string;
}

export class DeliveryManagementService {
  /**
   * Vérifier si un créneau de livraison est disponible
   */
  static async checkDeliverySlotAvailability(
    businessId: number,
    preferredTime: Date
  ): Promise<{ available: boolean; slot?: DeliverySlot; error?: string }> {
    try {
      const dayOfWeek = preferredTime.getDay();
      const timeString = preferredTime.toTimeString().slice(0, 5); // HH:MM

      const { data: slots, error } = await supabase
        .from('delivery_time_slots')
        .select('*')
        .eq('business_id', businessId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .gte('start_time', timeString)
        .lte('end_time', timeString)
        .limit(1);

      if (error) {
        console.error('Erreur vérification créneau:', error);
        return { available: false, error: error.message };
      }

      if (!slots || slots.length === 0) {
        return { available: false, error: 'Aucun créneau disponible pour cette heure' };
      }

      // Vérifier le nombre de commandes dans ce créneau
      const { count: orderCount, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('delivery_type', 'scheduled')
        .gte('preferred_delivery_time', preferredTime.toISOString())
        .lt('preferred_delivery_time', new Date(preferredTime.getTime() + 30 * 60000).toISOString());

      if (countError) {
        console.error('Erreur comptage commandes:', countError);
        return { available: false, error: countError.message };
      }

      const slot = slots[0];
      const isAvailable = (orderCount || 0) < slot.max_orders_per_slot;

      return {
        available: isAvailable,
        slot: isAvailable ? slot : undefined,
        error: isAvailable ? undefined : 'Créneau complet'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du créneau:', error);
      return { available: false, error: 'Erreur lors de la vérification du créneau' };
    }
  }

  /**
   * Gérer le changement de statut d'une commande selon son type de livraison
   */
  static async handleOrderStatusChange(
    orderId: string,
    newStatus: string,
    businessId: number
  ): Promise<{ success: boolean; error?: string; action?: string }> {
    try {
      // Récupérer les informations de la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('delivery_type, status, scheduled_delivery_window_start, scheduled_delivery_window_end')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return { success: false, error: 'Commande non trouvée' };
      }

      // Si la commande devient "ready"
      if (newStatus === 'ready') {
        if (order.delivery_type === 'asap') {
          // ASAP : Assignation obligatoire
          return await this.handleASAPOrder(orderId, businessId);
        } else if (order.delivery_type === 'scheduled') {
          // Scheduled : Ajouter à available_orders pour les chauffeurs
          return await this.handleScheduledOrder(orderId, businessId, order);
        }
      }

      // Si la commande devient "out_for_delivery" (assignée)
      if (newStatus === 'out_for_delivery') {
        // Retirer de available_orders si elle y était
        await this.removeFromAvailableOrders(orderId);
      }

      return { success: true, action: 'status_updated' };
    } catch (error) {
      console.error('Erreur gestion statut commande:', error);
      return { success: false, error: 'Erreur lors de la gestion du statut' };
    }
  }

  /**
   * Gérer une commande ASAP (assignation obligatoire)
   */
  private static async handleASAPOrder(
    orderId: string,
    businessId: number
  ): Promise<{ success: boolean; error?: string; action?: string }> {
    try {
      // Logique d'assignation automatique pour ASAP
      // Ici on pourrait implémenter un algorithme de sélection de chauffeur
      
      // Pour l'instant, on marque comme disponible pour les chauffeurs
      // mais avec priorité haute
      const { error } = await supabase
        .from('available_orders')
        .insert({
          order_id: orderId,
          business_id: businessId,
          business_name: 'Business Name', // À récupérer
          delivery_address: 'Address', // À récupérer
          estimated_delivery_time: new Date(Date.now() + 30 * 60000).toISOString(), // +30 min
          delivery_fee: 0, // À récupérer
          total_amount: 0, // À récupérer
          is_urgent: true, // ASAP = urgent
          expires_at: new Date(Date.now() + 10 * 60000).toISOString() // Expire dans 10 min
        });

      if (error) {
        console.error('Erreur ajout commande ASAP:', error);
        return { success: false, error: error.message };
      }

      return { success: true, action: 'asap_assigned' };
    } catch (error) {
      console.error('Erreur gestion commande ASAP:', error);
      return { success: false, error: 'Erreur lors de la gestion ASAP' };
    }
  }

  /**
   * Gérer une commande programmée (choix des chauffeurs)
   */
  private static async handleScheduledOrder(
    orderId: string,
    businessId: number,
    order: any
  ): Promise<{ success: boolean; error?: string; action?: string }> {
    try {
      // Ajouter à available_orders pour que les chauffeurs puissent choisir
      const { error } = await supabase
        .from('available_orders')
        .insert({
          order_id: orderId,
          business_id: businessId,
          business_name: 'Business Name', // À récupérer
          delivery_address: 'Address', // À récupérer
          estimated_delivery_time: order.scheduled_delivery_window_start,
          delivery_fee: 0, // À récupérer
          total_amount: 0, // À récupérer
          is_urgent: false, // Scheduled = pas urgent
          expires_at: order.scheduled_delivery_window_end
        });

      if (error) {
        console.error('Erreur ajout commande programmée:', error);
        return { success: false, error: error.message };
      }

      return { success: true, action: 'scheduled_available' };
    } catch (error) {
      console.error('Erreur gestion commande programmée:', error);
      return { success: false, error: 'Erreur lors de la gestion programmée' };
    }
  }

  /**
   * Retirer une commande de available_orders
   */
  private static async removeFromAvailableOrders(orderId: string): Promise<void> {
    try {
      await supabase
        .from('available_orders')
        .delete()
        .eq('order_id', orderId);
    } catch (error) {
      console.error('Erreur suppression available_order:', error);
    }
  }

  /**
   * Récupérer les commandes disponibles pour les chauffeurs
   */
  static async getAvailableOrdersForDrivers(
    driverId: string,
    limit: number = 20
  ): Promise<{ orders: AvailableOrder[] | null; error?: string }> {
    try {
      const { data: orders, error } = await supabase
        .from('available_orders')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('is_urgent', { ascending: false }) // ASAP en premier
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Erreur récupération commandes disponibles:', error);
        return { orders: null, error: error.message };
      }

      return { orders: orders || [] };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes disponibles:', error);
      return { orders: null, error: 'Erreur lors de la récupération' };
    }
  }

  /**
   * Accepter une commande par un chauffeur
   */
  static async acceptOrderByDriver(
    orderId: string,
    driverId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Vérifier que la commande est toujours disponible
      const { data: availableOrder, error: checkError } = await supabase
        .from('available_orders')
        .select('*')
        .eq('order_id', orderId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (checkError || !availableOrder) {
        return { success: false, error: 'Commande non disponible' };
      }

      // Mettre à jour la commande avec le chauffeur
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          status: 'out_for_delivery',
          available_for_drivers: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Erreur mise à jour commande:', updateError);
        return { success: false, error: updateError.message };
      }

      // Retirer de available_orders
      await this.removeFromAvailableOrders(orderId);

      return { success: true };
    } catch (error) {
      console.error('Erreur acceptation commande:', error);
      return { success: false, error: 'Erreur lors de l\'acceptation' };
    }
  }
} 