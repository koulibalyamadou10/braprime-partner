import { supabase } from '@/lib/supabase';

export interface DriverDetails {
  id: string;
  name: string;
  phone: string;
  email?: string;
  business_id: number;
  is_active: boolean;
  current_location?: any;
  current_order_id?: string;
  rating: number;
  total_deliveries: number;
  vehicle_type?: string;
  vehicle_plate?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  status: string;
  total: number;
  grand_total: number;
  created_at: string;
  delivered_at?: string;
  driver_rating?: number;
  driver_comment?: string;
}

export interface DriverReview {
  id: string;
  order_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface DriverStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  averageDeliveryTime: number; // en minutes
  onTimeDeliveries: number;
  lateDeliveries: number;
}

export class DriverDetailsService {
  // Récupérer les détails d'un livreur
  static async getDriverDetails(driverId: string): Promise<{ driver: DriverDetails | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();

      if (error) {
        console.error('Erreur récupération détails livreur:', error);
        return { driver: null, error: error.message };
      }

      return { driver, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du livreur:', error);
      return { driver: null, error: 'Erreur lors de la récupération des détails du livreur' };
    }
  }

  // Récupérer les commandes d'un livreur
  static async getDriverOrders(driverId: string, limit: number = 50): Promise<{ orders: DriverOrder[] | null; error: string | null }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          delivery_address,
          status,
          total,
          grand_total,
          created_at,
          delivered_at,
          driver_rating,
          driver_comment
        `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur récupération commandes livreur:', error);
        return { orders: null, error: error.message };
      }

      return { orders: orders || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes du livreur:', error);
      return { orders: null, error: 'Erreur lors de la récupération des commandes du livreur' };
    }
  }

  // Récupérer les avis d'un livreur
  static async getDriverReviews(driverId: string, limit: number = 20): Promise<{ reviews: DriverReview[] | null; error: string | null }> {
    try {
      // Récupérer les commandes avec des avis pour ce livreur
      const { data: ordersWithReviews, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          driver_rating,
          driver_comment,
          created_at
        `)
        .eq('driver_id', driverId)
        .not('driver_rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur récupération avis livreur:', error);
        return { reviews: null, error: error.message };
      }

      // Transformer les données en format DriverReview
      const reviews: DriverReview[] = (ordersWithReviews || []).map(order => ({
        id: order.id,
        order_id: order.id,
        customer_name: order.customer_name,
        rating: order.driver_rating,
        comment: order.driver_comment,
        created_at: order.created_at
      }));

      return { reviews, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis du livreur:', error);
      return { reviews: null, error: 'Erreur lors de la récupération des avis du livreur' };
    }
  }

  // Récupérer les statistiques d'un livreur
  static async getDriverStats(driverId: string): Promise<{ stats: DriverStats | null; error: string | null }> {
    try {
      // Récupérer toutes les commandes du livreur
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', driverId);

      if (ordersError) {
        console.error('Erreur récupération commandes pour stats:', ordersError);
        return { stats: null, error: ordersError.message };
      }

      const allOrders = orders || [];
      const totalOrders = allOrders.length;
      const completedOrders = allOrders.filter(order => order.status === 'delivered').length;
      const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.grand_total || 0), 0);

      // Calculer la note moyenne
      const ordersWithRating = allOrders.filter(order => order.driver_rating);
      const averageRating = ordersWithRating.length > 0 
        ? ordersWithRating.reduce((sum, order) => sum + (order.driver_rating || 0), 0) / ordersWithRating.length 
        : 0;

      const totalReviews = ordersWithRating.length;

      // Calculer le temps de livraison moyen (simulation)
      const deliveredOrders = allOrders.filter(order => order.status === 'delivered' && order.delivered_at);
      let totalDeliveryTime = 0;
      let onTimeDeliveries = 0;
      let lateDeliveries = 0;

      deliveredOrders.forEach(order => {
        const createdTime = new Date(order.created_at).getTime();
        const deliveredTime = new Date(order.delivered_at).getTime();
        const deliveryTimeMinutes = (deliveredTime - createdTime) / (1000 * 60);
        
        totalDeliveryTime += deliveryTimeMinutes;
        
        // Considérer comme à l'heure si livré en moins de 45 minutes
        if (deliveryTimeMinutes <= 45) {
          onTimeDeliveries++;
        } else {
          lateDeliveries++;
        }
      });

      const averageDeliveryTime = deliveredOrders.length > 0 
        ? totalDeliveryTime / deliveredOrders.length 
        : 0;

      const stats: DriverStats = {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        averageRating,
        totalReviews,
        averageDeliveryTime,
        onTimeDeliveries,
        lateDeliveries
      };

      return { stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du livreur:', error);
      return { stats: null, error: 'Erreur lors de la récupération des statistiques du livreur' };
    }
  }

  // Récupérer la commande actuelle d'un livreur
  static async getCurrentOrder(driverId: string): Promise<{ order: DriverOrder | null; error: string | null }> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          delivery_address,
          status,
          total,
          grand_total,
          created_at,
          driver_rating,
          driver_comment
        `)
        .eq('driver_id', driverId)
        .in('status', ['out_for_delivery', 'picked_up'])
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erreur récupération commande actuelle:', error);
        return { order: null, error: error.message };
      }

      return { order: order || null, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande actuelle:', error);
      return { order: null, error: 'Erreur lors de la récupération de la commande actuelle' };
    }
  }

  // Mettre à jour la position d'un livreur
  static async updateDriverLocation(
    driverId: string, 
    location: { lat: number; lng: number }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_location: location,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur mise à jour position livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      return { success: false, error: 'Erreur lors de la mise à jour de la position' };
    }
  }

  // Libérer un livreur (retirer l'assignation de commande)
  static async releaseDriver(driverId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_order_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur libération livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la libération du livreur:', error);
      return { success: false, error: 'Erreur lors de la libération du livreur' };
    }
  }
} 