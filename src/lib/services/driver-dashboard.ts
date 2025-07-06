import { supabase } from '@/lib/supabase';

export interface DriverOrder {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  business_name: string;
  total_amount: number;
  delivery_fee: number;
  status: string;
  created_at: string;
  estimated_delivery: string;
  actual_delivery?: string;
  items: any[];
}

export interface DriverStats {
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  cancelled_deliveries: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
  active_hours: number;
  on_time_deliveries: number;
  late_deliveries: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  business_id: number;
  business_name: string;
  is_active: boolean;
  current_location?: {
    lat: number;
    lng: number;
  };
  rating: number;
  total_deliveries: number;
  created_at: string;
  updated_at: string;
}

export class DriverDashboardService {
  // Récupérer le profil du livreur connecté
  static async getDriverProfile(): Promise<{ profile: DriverProfile | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { profile: null, error: 'Utilisateur non connecté' };
      }

      // Récupérer directement le driver par user_id
      const { data: profile, error } = await supabase
        .from('drivers')
        .select(`*, businesses!inner(name)`)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur récupération profil livreur:', error);
        return { profile: null, error: error.message };
      }

      const driverProfile: DriverProfile = {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        vehicle_type: profile.vehicle_type,
        vehicle_plate: profile.vehicle_plate,
        business_id: profile.business_id,
        business_name: profile.businesses.name,
        is_active: profile.is_active,
        current_location: profile.current_location,
        rating: profile.rating,
        total_deliveries: profile.total_deliveries,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      return { profile: driverProfile, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil livreur:', error);
      return { profile: null, error: 'Erreur lors de la récupération du profil' };
    }
  }

  // Récupérer les commandes du livreur
  static async getDriverOrders(): Promise<{ orders: DriverOrder[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { orders: [], error: 'Utilisateur non connecté' };
      }

      // Récupérer directement le driver par user_id
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError || !driver) {
        console.error('Erreur récupération driver:', driverError);
        return { orders: [], error: 'Driver non trouvé' };
      }

      // Maintenant récupérer les commandes avec l'ID du driver
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          delivery_address,
          total,
          delivery_fee,
          status,
          created_at,
          estimated_delivery,
          actual_delivery,
          items,
          businesses!inner(name)
        `)
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération commandes livreur:', error);
        return { orders: [], error: error.message };
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

      const driverOrders: DriverOrder[] = (orders || []).map(order => {
        const userProfile = userProfiles.find(profile => profile.id === order.user_id);
        return {
          id: order.id,
          customer_name: userProfile?.name || 'Client',
          customer_address: order.delivery_address,
          customer_phone: userProfile?.phone_number || '',
          business_name: order.businesses.name,
          total_amount: order.total,
          delivery_fee: order.delivery_fee,
          status: order.status,
          created_at: order.created_at,
          estimated_delivery: order.estimated_delivery,
          actual_delivery: order.actual_delivery,
          items: order.items || []
        };
      });

      return { orders: driverOrders, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return { orders: [], error: 'Erreur lors de la récupération des commandes' };
    }
  }

  // Récupérer les statistiques du livreur
  static async getDriverStats(): Promise<{ stats: DriverStats | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { stats: null, error: 'Utilisateur non connecté' };
      }

      // Récupérer les commandes pour calculer les stats
      const { orders, error: ordersError } = await this.getDriverOrders();
      
      if (ordersError) {
        return { stats: null, error: ordersError };
      }

      const totalDeliveries = orders.length;
      const completedDeliveries = orders.filter(o => o.status === 'delivered').length;
      const pendingDeliveries = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(o.status)).length;
      const cancelledDeliveries = orders.filter(o => o.status === 'cancelled').length;
      
      const totalEarnings = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.delivery_fee, 0);

      const onTimeDeliveries = orders.filter(o => {
        if (o.status !== 'delivered' || !o.actual_delivery || !o.estimated_delivery) return false;
        const actual = new Date(o.actual_delivery);
        const estimated = new Date(o.estimated_delivery);
        return actual <= estimated;
      }).length;

      const lateDeliveries = completedDeliveries - onTimeDeliveries;

      const stats: DriverStats = {
        total_deliveries: totalDeliveries,
        completed_deliveries: completedDeliveries,
        pending_deliveries: pendingDeliveries,
        cancelled_deliveries: cancelledDeliveries,
        total_earnings: totalEarnings,
        average_rating: 4.5, // À récupérer depuis les avis
        total_reviews: 0, // À récupérer depuis les avis
        active_hours: 8, // À calculer selon la logique métier
        on_time_deliveries: onTimeDeliveries,
        late_deliveries: lateDeliveries
      };

      return { stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { stats: null, error: 'Erreur lors de la récupération des statistiques' };
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Erreur mise à jour statut commande:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du statut' };
    }
  }

  // Mettre à jour la localisation du livreur
  static async updateLocation(lat: number, lng: number): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      // Récupérer directement le driver par user_id
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError || !driver) {
        return { success: false, error: 'Driver non trouvé' };
      }

      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_location: { lat, lng },
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id);

      if (error) {
        console.error('Erreur mise à jour localisation:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la localisation:', error);
      return { success: false, error: 'Erreur lors de la mise à jour de la localisation' };
    }
  }

  // Accepter une commande
  static async acceptOrder(orderId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      // Récupérer directement le driver par user_id
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError || !driver) {
        return { success: false, error: 'Driver non trouvé' };
      }

      // Mettre à jour la commande avec l'ID du livreur
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          driver_id: driver.id,
          status: 'picked_up',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        return { success: false, error: orderError.message };
      }

      // Mettre à jour le livreur
      const { error: driverUpdateError } = await supabase
        .from('drivers')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id);

      if (driverUpdateError) {
        return { success: false, error: driverUpdateError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la commande:", error);
      return { success: false, error: "Erreur lors de l'acceptation de la commande" };
    }
  }

  // Terminer une commande
  static async completeOrder(orderId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      // Récupérer directement le driver par user_id
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError || !driver) {
        return { success: false, error: 'Driver non trouvé' };
      }

      // Mettre à jour la commande
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          actual_delivery: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        return { success: false, error: orderError.message };
      }

      // Mettre à jour le livreur
      const { error: driverUpdateError } = await supabase
        .from('drivers')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id);

      if (driverUpdateError) {
        return { success: false, error: driverUpdateError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la finalisation de la commande:', error);
      return { success: false, error: 'Erreur lors de la finalisation de la commande' };
    }
  }
} 