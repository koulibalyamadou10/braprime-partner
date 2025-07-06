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
  static async getDriverDetails(driverId: string, partnerId?: string): Promise<{ driver: DriverDetails | null; error: string | null }> {
    try {
      // Construire la requête
      let query = supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId);

      // Si un partnerId est fourni, vérifier que le driver appartient à ce partenaire
      if (partnerId) {
        query = query.eq('business_id', partnerId);
      }

      const { data: driver, error } = await query.single();

      if (error) {
        console.error('Erreur récupération détails livreur:', error);
        if (error.code === 'PGRST116') {
          return { driver: null, error: 'Livreur non trouvé ou accès non autorisé' };
        }
        return { driver: null, error: error.message };
      }

      // Vérification supplémentaire si un partnerId est fourni
      if (partnerId && driver.business_id !== partnerId) {
        console.error('Tentative d\'accès non autorisé au driver:', driverId, 'par partenaire:', partnerId);
        return { driver: null, error: 'Accès non autorisé à ce livreur' };
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
          user_id,
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

      // Récupérer les informations des clients pour toutes les commandes
      const userIds = [...new Set((orders || []).map(order => order.user_id).filter(Boolean))];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, name, phone_number')
          .in('id', userIds);
        
        if (!profilesError) {
          userProfiles = profiles || [];
        }
      }

      // Transformer les données en format DriverOrder
      const driverOrders: DriverOrder[] = (orders || []).map(order => {
        const userProfile = userProfiles.find(profile => profile.id === order.user_id);
        return {
          id: order.id,
          customer_name: userProfile?.name || 'Client',
          customer_phone: userProfile?.phone_number || '',
          delivery_address: order.delivery_address,
          status: order.status,
          total: order.total,
          grand_total: order.grand_total,
          created_at: order.created_at,
          delivered_at: order.delivered_at,
          driver_rating: order.driver_rating,
          driver_comment: order.driver_comment
        };
      });

      return { orders: driverOrders, error: null };
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
          user_id,
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

      // Récupérer les informations des clients pour les avis
      const userIds = [...new Set((ordersWithReviews || []).map(order => order.user_id).filter(Boolean))];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, name')
          .in('id', userIds);
        
        if (!profilesError) {
          userProfiles = profiles || [];
        }
      }

      // Transformer les données en format DriverReview
      const reviews: DriverReview[] = (ordersWithReviews || []).map(order => {
        const userProfile = userProfiles.find(profile => profile.id === order.user_id);
        return {
          id: order.id,
          order_id: order.id,
          customer_name: userProfile?.name || 'Client',
          rating: order.driver_rating,
          comment: order.driver_comment,
          created_at: order.created_at
        };
      });

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
          user_id,
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

      if (!order) {
        return { order: null, error: null };
      }

      // Récupérer les informations du client
      let customerName = 'Client';
      let customerPhone = '';
      
      if (order.user_id) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('name, phone_number')
          .eq('id', order.user_id)
          .single();
        
        if (!profileError && userProfile) {
          customerName = userProfile.name;
          customerPhone = userProfile.phone_number || '';
        }
      }

      const driverOrder: DriverOrder = {
        id: order.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: order.delivery_address,
        status: order.status,
        total: order.total,
        grand_total: order.grand_total,
        created_at: order.created_at,
        driver_rating: order.driver_rating,
        driver_comment: order.driver_comment
      };

      return { order: driverOrder, error: null };
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