import { supabase } from '@/lib/supabase';

export interface Driver {
  id: string;
  name: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  business_id?: number;
  is_active: boolean;
  is_available?: boolean;
  vehicle_type?: string;
  vehicle_plate?: string;
  type?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  active_orders_count?: number;
}

export class DriverService {
  // Récupérer tous les livreurs d'un business (disponibles et non disponibles)
  static async getBusinessDrivers(businessId: number): Promise<{ drivers: Driver[] | null; error: string | null }> {
    try {
      console.log(`🔍 Recherche de tous les drivers pour business ${businessId}`);

      // Récupérer tous les drivers du business ou indépendants
      const { data: drivers, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('is_active', { ascending: false })
        .order('is_available', { ascending: false });

      if (error) {
        console.error('Erreur récupération livreurs:', error);
        return { drivers: null, error: error.message };
      }

      // Filtrer pour exclure les drivers d'autres businesses
      const filteredDrivers = (drivers || []).filter(driver => 
        driver.business_id === businessId || driver.business_id === null
      );

      // Calculer le nombre de commandes actives pour chaque chauffeur
      const driversWithActiveOrders = await Promise.all(
        filteredDrivers.map(async (driver) => {
          const { data: activeOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id')
            .eq('driver_id', driver.id)
            .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery']);

          return {
            ...driver,
            phone: driver.phone_number || driver.phone, // Compatibilité avec les deux champs
            active_orders_count: ordersError ? 0 : (activeOrders?.length || 0)
          };
        })
      );

      console.log(`🔍 Tous les drivers pour business ${businessId}:`, driversWithActiveOrders.length);
      console.log('📋 Drivers:', driversWithActiveOrders.map(d => ({ 
        id: d.id, 
        name: d.name, 
        business_id: d.business_id, 
        type: d.business_id === businessId ? 'service' : 'independent',
        is_active: d.is_active,
        is_available: d.is_available,
        active_orders_count: d.active_orders_count,
        vehicle_type: d.vehicle_type
      })));

      return { drivers: driversWithActiveOrders, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
      return { drivers: null, error: 'Erreur lors de la récupération des livreurs' };
    }
  }

  // Récupérer les livreurs disponibles (actifs et avec moins de 3 commandes actives)
  static async getAvailableDrivers(businessId: number): Promise<{ drivers: Driver[] | null; error: string | null }> {
    try {
      console.log(`🔍 Recherche de drivers disponibles pour business ${businessId}`);

      // Récupérer les drivers actifs et disponibles
      const { data: drivers, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .eq('is_active', true)
        .eq('is_available', true)
        .order('is_available', { ascending: false });

      if (error) {
        console.error('Erreur récupération livreurs disponibles:', error);
        return { drivers: null, error: error.message };
      }

      // Filtrer pour exclure les drivers d'autres businesses et calculer les commandes actives
      const driversWithActiveOrders = await Promise.all(
        (drivers || [])
          .filter(driver => driver.business_id === businessId || driver.business_id === null)
          .map(async (driver) => {
            const { data: activeOrders, error: ordersError } = await supabase
              .from('orders')
              .select('id')
              .eq('driver_id', driver.id)
              .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery']);

            return {
              ...driver,
              active_orders_count: ordersError ? 0 : (activeOrders?.length || 0)
            };
          })
      );

      // Filtrer ceux avec moins de 3 commandes actives
      const availableDrivers = driversWithActiveOrders.filter(driver => 
        (driver.active_orders_count || 0) < 3
      );

      console.log(`🔍 Drivers disponibles pour business ${businessId}:`, availableDrivers.length);
      console.log('📋 Drivers disponibles:', availableDrivers.map(d => ({ 
        id: d.id, 
        name: d.name, 
        business_id: d.business_id, 
        type: d.business_id === businessId ? 'service' : 'independent',
        rating: d.rating,
        vehicle_type: d.vehicle_type,
        active_orders_count: d.active_orders_count
      })));

      return { drivers: availableDrivers, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs disponibles:', error);
      return { drivers: null, error: 'Erreur lors de la récupération des livreurs disponibles' };
    }
  }

  // Assigner un livreur à une commande
  static async assignDriverToOrder(driverId: string, orderId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log(`🚗 Assignation du livreur ${driverId} à la commande ${orderId}`);

      // 1. Récupérer les informations de la commande pour les adresses
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('delivery_address, delivery_instructions')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Erreur récupération commande:', orderError);
        return { success: false, error: orderError.message };
      }

      // 2. Créer l'entrée dans driver_orders avec les bonnes colonnes
      const { error: driverOrderError } = await supabase
        .from('driver_orders')
        .insert({
          driver_id: driverId,
          order_id: orderId,
          pickup_address: 'Adresse du restaurant', // Adresse par défaut du restaurant
          delivery_address: order.delivery_address || 'Adresse de livraison',
          delivery_instructions: order.delivery_instructions || '',
          customer_instructions: '',
          estimated_distance: 0,
          actual_distance: 0,
          estimated_duration: 0,
          actual_duration: 0,
          driver_earnings: 0,
          driver_commission_percentage: 15,
          status: 'pending'
        });

      if (driverOrderError) {
        console.error('Erreur création driver_order:', driverOrderError);
        return { success: false, error: driverOrderError.message };
      }

      // 3. Mettre à jour la commande avec le driver_id
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          driver_id: driverId,
          status: 'out_for_delivery',
          available_for_drivers: false
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Erreur mise à jour commande:', orderUpdateError);
        return { success: false, error: orderUpdateError.message };
      }

      console.log(`✅ Livreur ${driverId} assigné avec succès à la commande ${orderId}`);
      return { success: true, error: null };

    } catch (error) {
      console.error('Erreur lors de l\'assignation du livreur:', error);
      return { success: false, error: 'Erreur lors de l\'assignation du livreur' };
    }
  }

  // Libérer un livreur (retirer l'assignation de commande)
  static async releaseDriver(driverId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ 
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

  // Mettre à jour la position d'un livreur
  static async updateDriverLocation(
    driverId: string, 
    location: { lat: number; lng: number }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('driver_profiles')
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

  // Ajouter un livreur
  static async addDriver(driverData: {
    name: string;
    phone: string;
    email?: string;
    business_id: number;
    vehicle_type?: string;
    vehicle_plate?: string;
  }): Promise<{ driver: Driver | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('driver_profiles')
        .insert([{
          ...driverData,
          is_active: true,
          rating: 0,
          total_deliveries: 0,
          total_earnings: 0,
          is_verified: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur ajout livreur:', error);
        return { driver: null, error: error.message };
      }

      return { driver, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error);
      return { driver: null, error: 'Erreur lors de l\'ajout du livreur' };
    }
  }

  // Mettre à jour un livreur
  static async updateDriver(
    driverId: string, 
    updates: Partial<Driver>
  ): Promise<{ driver: Driver | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('driver_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour livreur:', error);
        return { driver: null, error: error.message };
      }

      return { driver, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livreur:', error);
      return { driver: null, error: 'Erreur lors de la mise à jour du livreur' };
    }
  }

  // Supprimer un livreur
  static async deleteDriver(driverId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('Erreur suppression livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur:', error);
      return { success: false, error: 'Erreur lors de la suppression du livreur' };
    }
  }
} 