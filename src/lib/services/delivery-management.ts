import { supabase } from '../supabase';

export interface DeliverySlot {
  day: number;
  start: string;
  end: string;
  active: boolean;
  max_orders: number;
}

export interface DeliveryZone {
  name: string;
  fee: number;
  time: string;
  active: boolean;
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
      // Utiliser la nouvelle fonction PostgreSQL
      const { data, error } = await supabase
        .rpc('check_delivery_slot_availability', {
          business_id_param: businessId,
          preferred_time: preferredTime.toISOString()
        });

      if (error) {
        console.error('Erreur vérification créneau:', error);
        return { available: false, error: error.message };
      }

      if (!data) {
        return { available: false, error: 'Aucun créneau disponible pour cette heure' };
      }

      // Si le créneau est disponible, récupérer les détails du créneau
      if (data) {
        const { data: slots } = await supabase
          .rpc('get_business_delivery_slots', { business_id_param: businessId });

        if (slots && Array.isArray(slots)) {
          const dayOfWeek = preferredTime.getDay();
          const timeString = preferredTime.toTimeString().slice(0, 5);
          
          const matchingSlot = slots.find((slot: any) => 
            slot.day === dayOfWeek &&
            slot.active === true &&
            slot.start <= timeString &&
            slot.end >= timeString
          );

          if (matchingSlot) {
            return {
              available: true,
              slot: {
                day: matchingSlot.day,
                start: matchingSlot.start,
                end: matchingSlot.end,
                active: matchingSlot.active,
                max_orders: matchingSlot.max_orders
              }
            };
          }
        }
      }

      return { available: false, error: 'Créneau non disponible' };
    } catch (error) {
      console.error('Erreur lors de la vérification du créneau:', error);
      return { available: false, error: 'Erreur lors de la vérification du créneau' };
    }
  }

  /**
   * Obtenir les créneaux de livraison d'un business
   */
  static async getBusinessDeliverySlots(businessId: number): Promise<{ slots: DeliverySlot[]; error?: string }> {
    try {
      const { data: slots, error } = await supabase
        .rpc('get_business_delivery_slots', { business_id_param: businessId });

      if (error) {
        console.error('Erreur récupération créneaux:', error);
        return { slots: [], error: error.message };
      }

      if (!slots || !Array.isArray(slots)) {
        return { slots: [] };
      }

      const deliverySlots: DeliverySlot[] = slots.map((slot: any) => ({
        day: slot.day,
        start: slot.start,
        end: slot.end,
        active: slot.active,
        max_orders: slot.max_orders
      }));

      return { slots: deliverySlots };
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      return { slots: [], error: 'Erreur lors de la récupération des créneaux' };
    }
  }

  /**
   * Ajouter un créneau de livraison
   */
  static async addDeliverySlot(
    businessId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean = true,
    maxOrders: number = 10
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('add_delivery_slot', {
          business_id_param: businessId,
          day_of_week_param: dayOfWeek,
          start_time_param: startTime,
          end_time_param: endTime,
          is_active_param: isActive,
          max_orders_param: maxOrders
        });

      if (error) {
        console.error('Erreur ajout créneau:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du créneau:', error);
      return { success: false, error: 'Erreur lors de l\'ajout du créneau' };
    }
  }

  /**
   * Obtenir les zones de livraison d'un business
   */
  static async getBusinessDeliveryZones(businessId: number): Promise<{ zones: DeliveryZone[]; error?: string }> {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('delivery_zones')
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Erreur récupération zones:', error);
        return { zones: [], error: error.message };
      }

      if (!business.delivery_zones || !Array.isArray(business.delivery_zones)) {
        return { zones: [] };
      }

      const deliveryZones: DeliveryZone[] = business.delivery_zones
        .filter((zone: any) => zone.active)
        .map((zone: any) => ({
          name: zone.name,
          fee: zone.fee,
          time: zone.time,
          active: zone.active
        }));

      return { zones: deliveryZones };
    } catch (error) {
      console.error('Erreur lors de la récupération des zones:', error);
      return { zones: [], error: 'Erreur lors de la récupération des zones' };
    }
  }

  /**
   * Mettre à jour les zones de livraison d'un business
   */
  static async updateBusinessDeliveryZones(
    businessId: number,
    zones: DeliveryZone[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ delivery_zones: zones })
        .eq('id', businessId);

      if (error) {
        console.error('Erreur mise à jour zones:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des zones:', error);
      return { success: false, error: 'Erreur lors de la mise à jour des zones' };
    }
  }

  /**
   * Obtenir les informations complètes de livraison d'un business
   */
  static async getBusinessDeliveryInfo(businessId: number): Promise<{
    slots: DeliverySlot[];
    zones: DeliveryZone[];
    maxOrdersPerSlot: number;
    error?: string;
  }> {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('delivery_slots, delivery_zones, max_orders_per_slot')
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Erreur récupération infos livraison:', error);
        return { slots: [], zones: [], maxOrdersPerSlot: 10, error: error.message };
      }

      const slots: DeliverySlot[] = business.delivery_slots?.map((slot: any) => ({
        day: slot.day,
        start: slot.start,
        end: slot.end,
        active: slot.active,
        max_orders: slot.max_orders
      })) || [];

      const zones: DeliveryZone[] = business.delivery_zones?.map((zone: any) => ({
        name: zone.name,
        fee: zone.fee,
        time: zone.time,
        active: zone.active
      })) || [];

      return {
        slots,
        zones,
        maxOrdersPerSlot: business.max_orders_per_slot || 10
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos de livraison:', error);
      return { 
        slots: [], 
        zones: [], 
        maxOrdersPerSlot: 10, 
        error: 'Erreur lors de la récupération des infos de livraison' 
      };
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
  ): Promise<{ orders: any[] | null; error?: string }> {
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